import React, { useState, useEffect, useMemo, useContext } from 'react';
import { PlayerCard, FixerDistrict, FixerContractsPageProps, CardCooldowns, KillStats } from '../types';
import { FIXER_DISTRICTS } from '../constants';
import * as db from '../db';
import RaidInterface from './RaidInterface';
import CardComponent from './CardComponent';
import { EddyIcon, DataChipIcon } from './IconComponents';
import Modal from './Modal';
import { UiContext } from '../context/UiContext';


const LockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
        <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
    </svg>
);

type RaidStage = 'district_selection' | 'team_selection' | 'in_raid';

interface RaidSummary {
    districtId: string;
    kills: number;
    earnings: { eddies: number, dataChips: number };
    defeatedCardIds: string[];
    killStats: KillStats;
}

const CooldownTimer: React.FC<{ endTime: number }> = ({ endTime }) => {
    const [timeLeft, setTimeLeft] = useState(endTime - Date.now());

    useEffect(() => {
        const interval = setInterval(() => {
            const newTimeLeft = endTime - Date.now();
            if (newTimeLeft <= 0) {
                clearInterval(interval);
            }
            setTimeLeft(newTimeLeft);
        }, 1000);
        return () => clearInterval(interval);
    }, [endTime]);

    if (timeLeft <= 0) {
        return <span className="text-xs text-green-400">Готова</span>;
    }

    const minutes = Math.floor(timeLeft / 60000);
    const seconds = Math.floor((timeLeft % 60000) / 1000).toString().padStart(2, '0');

    return <span className="text-xs text-yellow-400 font-mono">{minutes}:{seconds}</span>;
};


const FixerContractsPage: React.FC<FixerContractsPageProps> = (props) => {
    const { progress, allGameCards, playerCards, playerCurrencies, cardCooldowns, setPlayerCurrencies, setFixerProgress, setCardCooldowns } = props;
    
    const [stage, setStage] = useState<RaidStage>('district_selection');
    const [selectedDistrict, setSelectedDistrict] = useState<FixerDistrict | null>(null);
    const [selectedTeam, setSelectedTeam] = useState<PlayerCard[]>([]);
    const [raidSummary, setRaidSummary] = useState<RaidSummary | null>(null);
    const uiAssets = useContext(UiContext);

    const isDistrictUnlocked = (districtId: string): boolean => {
        const district = FIXER_DISTRICTS.find(d => d.id === districtId);
        if (!district || !district.unlockRequirement) {
            return true;
        }
        const requiredKills = district.unlockRequirement.kills;
        const currentKills = progress[district.unlockRequirement.districtId]?.kills || 0;
        return currentKills >= requiredKills;
    };

    const handleSelectDistrict = (district: FixerDistrict) => {
        setSelectedDistrict(district);
        setStage('team_selection');
    };

    const handleShowRaidSummary = (districtId: string, kills: number, earnings: { eddies: number, dataChips: number }, defeatedCardIds: string[], killStats: KillStats) => {
        setRaidSummary({ districtId, kills, earnings, defeatedCardIds, killStats });
        setStage('district_selection'); // Visually exit raid, modal will cover the screen
    };

    const handleCloseRaidSummary = async () => {
        if (!raidSummary) return;

        const { districtId, kills, earnings, defeatedCardIds } = raidSummary;

        // Update currencies
        const newCurrencies = { 
            ...playerCurrencies, 
            eddies: playerCurrencies.eddies + earnings.eddies,
            dataChips: playerCurrencies.dataChips + earnings.dataChips,
        };
        await db.updatePlayerCurrencies(newCurrencies);
        setPlayerCurrencies(newCurrencies);

        // Update progress
        const newProgress = { ...progress };
        if (!newProgress[districtId]) {
            newProgress[districtId] = { kills: 0 };
        }
        newProgress[districtId].kills += kills;
        await db.updateFixerProgress(newProgress);
        setFixerProgress(newProgress);

        // Set cooldowns for defeated cards
        const newCooldowns: CardCooldowns = { ...cardCooldowns };
        const cooldownDuration = 3 * 60 * 1000; // 3 minutes
        const now = Date.now();
        defeatedCardIds.forEach(id => {
            newCooldowns[id] = now + cooldownDuration;
        });
        await db.updateCardCooldowns(newCooldowns);
        setCardCooldowns(newCooldowns);

        // Reset state
        setRaidSummary(null);
        setSelectedDistrict(null);
        setSelectedTeam([]);
    };


    const toggleCardInTeam = (card: PlayerCard) => {
        const isOnCooldown = (cardCooldowns[card.instanceId] || 0) > Date.now();
        if (isOnCooldown) return;

        setSelectedTeam(prev => {
            const isInTeam = prev.some(c => c.instanceId === card.instanceId);
            if (isInTeam) {
                return prev.filter(c => c.instanceId !== card.instanceId);
            } else if (prev.length < 5) {
                return [...prev, card];
            }
            return prev;
        });
    };

    const handleRemoveCooldown = async (card: PlayerCard) => {
        const cost = 100;
        if (playerCurrencies.eddies < cost) {
            alert("Недостаточно Эдди!");
            return;
        }

        const newCurrencies = { ...playerCurrencies, eddies: playerCurrencies.eddies - cost };
        setPlayerCurrencies(newCurrencies);
        await db.updatePlayerCurrencies(newCurrencies);

        const newCooldowns = { ...cardCooldowns };
        delete newCooldowns[card.instanceId];
        setCardCooldowns(newCooldowns);
        await db.updateCardCooldowns(newCooldowns);
    };

    const availableCards = useMemo(() => {
        return playerCards.filter(c => c.role === 'attack');
    }, [playerCards]);


    const renderContent = () => {
        if (stage === 'in_raid' && selectedDistrict) {
            return <RaidInterface 
                        district={selectedDistrict} 
                        team={selectedTeam}
                        allGameCards={allGameCards}
                        onEndRaid={handleShowRaidSummary} 
                    />;
        }
        
        if (stage === 'team_selection' && selectedDistrict) {
            return (
                <div className="animate-fade-in">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-4xl font-heading text-[color:var(--brand-accent)]">Выбор Команды для Рейда</h2>
                            <p className="text-gray-400">Выберите до 5 атакующих карт для рейда в районе "{selectedDistrict.name}".</p>
                        </div>
                         <button onClick={() => setStage('district_selection')} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 transition">Назад</button>
                    </div>
    
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                        {availableCards.map(card => {
                            const isSelected = selectedTeam.some(c => c.instanceId === card.instanceId);
                            const cooldownEndTime = cardCooldowns[card.instanceId];
                            const isOnCooldown = cooldownEndTime && cooldownEndTime > Date.now();
    
                            return (
                                <div key={card.instanceId} className="relative">
                                    <CardComponent card={card} onClick={() => toggleCardInTeam(card)} className={`${(isSelected || isOnCooldown) ? 'saturate-50' : ''}`} />
                                    {isSelected && <div className="absolute inset-0 bg-black/70 flex items-center justify-center pointer-events-none"><div className="text-teal-400 text-6xl font-black">✓</div></div>}
                                    {isOnCooldown && (
                                        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-center p-2">
                                            <div className="text-lg font-bold text-red-500">Повержена</div>
                                            <CooldownTimer endTime={cooldownEndTime} />
                                            <button onClick={() => handleRemoveCooldown(card)} className="mt-2 text-xs bg-[color:var(--brand-warning)] hover:brightness-110 text-white font-bold py-1 px-2 flex items-center">
                                                <EddyIcon className="w-3 h-3 mr-1" /> 100
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
    
                    {selectedTeam.length > 0 && (
                        <div className="text-center mt-8">
                            <button onClick={() => setStage('in_raid')} className="bg-[color:var(--brand-accent)] hover:bg-[color:var(--brand-warning)] text-black font-bold py-4 px-10 text-2xl animate-pulse">
                                Начать рейд ({selectedTeam.length} карт)
                            </button>
                        </div>
                    )}
                </div>
            );
        }

        // Default: district_selection
        return (
            <div className="animate-fade-in">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-heading text-[color:var(--brand-accent)]">Контракты Фиксера</h2>
                    <p className="text-lg text-gray-400 mt-2">Выберите район для начала рейда и заработка Эдди.</p>
                </div>
    
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    {FIXER_DISTRICTS.map(district => {
                        const isUnlocked = isDistrictUnlocked(district.id);
                        const requiredKills = district.unlockRequirement?.kills || 0;
                        const requiredDistrictName = FIXER_DISTRICTS.find(d => d.id === district.unlockRequirement?.districtId)?.name;
                        const customImageUrl = uiAssets.get(`contract_${district.id}`);
                        const displayImageUrl = customImageUrl || district.imageUrl;
                        
                        return (
                            <div key={district.id} className={`bg-gray-900 border-2 border-gray-700 overflow-hidden transition-all duration-300 ${isUnlocked ? 'hover:border-[color:var(--brand-accent)] hover:scale-105' : 'opacity-60 saturate-50'}`}>
                                <div className="relative h-48">
                                    <img src={displayImageUrl} alt={district.name} className="w-full h-full object-cover"/>
                                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
                                    <h3 className="absolute bottom-4 left-4 text-4xl font-heading text-white">{district.name}</h3>
                                </div>
                                <div className="p-6 flex flex-col flex-grow">
                                    <p className="text-gray-300 mb-4 flex-grow">{district.description}</p>
                                    
                                    <div className="text-sm space-y-2 mb-6">
                                        <div className="flex justify-between items-center bg-black/20 p-2">
                                            <span className="font-bold text-gray-400">Здоровье врагов:</span>
                                            <span className="font-mono text-white">{district.hpRange[0]} - {district.hpRange[1]}</span>
                                        </div>
                                        <div className="flex justify-between items-center bg-black/20 p-2">
                                            <span className="font-bold text-gray-400">Награда (Эдди):</span>
                                            <span className="font-mono text-[color:var(--brand-accent)]">{district.rewardRange[0]} - {district.rewardRange[1]}</span>
                                        </div>
                                    </div>
    
                                    {isUnlocked ? (
                                         <button
                                            onClick={() => handleSelectDistrict(district)}
                                            className="w-full mt-auto bg-[color:var(--brand-warning)] hover:brightness-110 text-white font-bold py-3 px-4 transition-all duration-200 text-lg transform active:scale-95"
                                        >
                                            Выбрать Контракт
                                        </button>
                                    ) : (
                                        <div className="w-full mt-auto bg-gray-800 text-gray-400 font-bold py-3 px-4 text-center border-2 border-dashed border-gray-600">
                                            <div className="flex items-center justify-center mb-1">
                                                <LockIcon />
                                                <span className="ml-2">ЗАБЛОКИРОВАНО</span>
                                            </div>
                                            <p className="text-xs font-normal">
                                                Победить {requiredKills} в районе "{requiredDistrictName}"
                                                ({(progress[district.unlockRequirement!.districtId]?.kills || 0)}/{requiredKills})
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        )
    }

    return (
        <div>
            {renderContent()}
            
            {raidSummary && (
                <Modal onClose={handleCloseRaidSummary}>
                    <h2 className="text-4xl font-heading text-center mb-6 text-[color:var(--brand-accent)]">Итоги Рейда</h2>
                    <div className="space-y-4 text-center">
                        <div className="bg-gray-800 p-4">
                            <p className="text-lg text-gray-400">Всего Уничтожено Врагов</p>
                            <p className="text-4xl font-bold text-white">{raidSummary.kills}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                             <div className="bg-gray-800 p-4">
                                 <p className="text-lg text-gray-400">Заработано Эдди</p>
                                <div className="flex items-center justify-center text-4xl font-bold text-[color:var(--brand-accent)]">
                                    <EddyIcon className="w-8 h-8 mr-2"/>
                                    {raidSummary.earnings.eddies.toLocaleString()}
                                </div>
                            </div>
                            <div className="bg-gray-800 p-4">
                                 <p className="text-lg text-gray-400">Собрано Чипов Данных</p>
                                <div className="flex items-center justify-center text-4xl font-bold text-cyan-400">
                                    <DataChipIcon className="w-8 h-8 mr-2"/>
                                    {raidSummary.earnings.dataChips.toLocaleString()}
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-800 p-4">
                            <h3 className="text-2xl font-bold mb-4 text-gray-300">Статистика Команды</h3>
                            <div className="space-y-2 text-left">
                                {selectedTeam.map(card => (
                                    <div key={card.instanceId} className="flex justify-between items-center bg-gray-700 p-2">
                                        <span className="font-semibold">{card.name}</span>
                                        <span className="font-bold">{raidSummary.killStats[card.instanceId] || 0} убийств</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                         <button onClick={handleCloseRaidSummary} className="mt-4 w-full bg-[color:var(--brand-warning)] hover:brightness-110 text-white font-bold py-3 px-4 transition-all duration-200 text-lg">
                            Вернуться к контрактам
                        </button>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default FixerContractsPage;