import React, { useState, useEffect, useCallback, useMemo, useContext, useRef } from 'react';
import { FixerDistrict, Card, RaidInterfaceProps, PlayerCard, KillStats, Rarity } from '../types';
import CardComponent from './CardComponent';
import { EddyIcon, StrengthIcon, DataChipIcon, HealthIcon } from './IconComponents';
import { AudioContext } from '../context/AudioContext';
import { ImageContext } from '../context/ImageContext';
import { playSound } from '../utils/audio';

interface DamageNumber {
    id: number;
    amount: number;
    x: number;
    y: number;
}

interface ClickBurst {
    id: number;
    x: number;
    y: number;
}

interface DroppedChip {
    id: number;
    top: number;
    left: number;
    createdAt: number;
    state: 'spawning' | 'idle' | 'collecting';
}

const RaidHealthBar: React.FC<{ current: number; max: number; }> = ({ current, max }) => (
    <div className="w-full bg-gray-900 h-8 border-2 border-[color:var(--brand-accent)]/50 relative mb-1">
      <div
        className="bg-[color:var(--brand-warning)] h-full transition-all duration-200"
        style={{ width: `${Math.max(0, (current / max) * 100)}%` }}
      />
      <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-lg drop-shadow-md">
        {Math.round(current)} / {max}
      </span>
    </div>
);


const RaidInterface: React.FC<RaidInterfaceProps> = ({ district, team, allGameCards, onEndRaid }) => {
    const [currentEnemy, setCurrentEnemy] = useState<Card | null>(null);
    const [maxHp, setMaxHp] = useState(0);
    const [currentHp, setCurrentHp] = useState(0);
    
    const [raidKills, setRaidKills] = useState(0);
    const [raidEddies, setRaidEddies] = useState(0);
    const [raidDataChips, setRaidDataChips] = useState(0);

    const [killStats, setKillStats] = useState<KillStats>({});
    
    const [activeTeam, setActiveTeam] = useState<PlayerCard[]>(team);
    const [defeatedTeam, setDefeatedTeam] = useState<PlayerCard[]>([]);
    const [teamHp, setTeamHp] = useState<Record<string, number>>({});
    const [attackerIndex, setAttackerIndex] = useState(0);
    const [playerAttackCounter, setPlayerAttackCounter] = useState(0);
    
    const [damageNumbers, setDamageNumbers] = useState<DamageNumber[]>([]);
    const [healNumbers, setHealNumbers] = useState<DamageNumber[]>([]);
    const [clickBursts, setClickBursts] = useState<ClickBurst[]>([]);
    const [droppedChips, setDroppedChips] = useState<DroppedChip[]>([]);
    
    const [battleLog, setBattleLog] = useState<string[]>([]);
    const [isGettingHit, setIsGettingHit] = useState(false);
    const [isEnemyDying, setIsEnemyDying] = useState(false);
    
    const [isBoostPanelOpen, setIsBoostPanelOpen] = useState(false);
    const [activeBoost, setActiveBoost] = useState<'heal' | null>(null);

    const audioAssets = useContext(AudioContext);
    const customImages = useContext(ImageContext);
    const [lastHitSoundIndex, setLastHitSoundIndex] = useState<number | null>(null);
    const [lastDeathSoundIndex, setLastDeathSoundIndex] = useState<number | null>(null);
    
    const earningsRef = useRef<HTMLDivElement>(null);
    const [earningsPosition, setEarningsPosition] = useState({ top: 50, right: 50 });

    useEffect(() => {
        if (earningsRef.current) {
            const rect = earningsRef.current.getBoundingClientRect();
            setEarningsPosition({
                top: rect.top + rect.height / 2,
                right: window.innerWidth - (rect.left + rect.width / 2)
            });
        }
    }, []);

    const hitSounds = useMemo(() => {
        return [
            audioAssets.get('hitSound1'),
            audioAssets.get('hitSound2'),
            audioAssets.get('hitSound3'),
            audioAssets.get('hitSound4'),
        ].filter((sound): sound is AudioBuffer => !!sound);
    }, [audioAssets]);

    const deathSounds = useMemo(() => {
        return [
            audioAssets.get('deathSound1'),
            audioAssets.get('deathSound2'),
            audioAssets.get('deathSound3'),
            audioAssets.get('deathSound4'),
        ].filter((sound): sound is AudioBuffer => !!sound);
    }, [audioAssets]);

    const healSound = useMemo(() => audioAssets.get('healSound1'), [audioAssets]);
    
    const addLog = useCallback((message: string) => {
        setBattleLog(prev => [message, ...prev.slice(0, 9)]);
    }, []);
    
    const handleEnemyAttack = useCallback((target: PlayerCard) => {
        if (!currentEnemy) return;

        const enemyDamageMap = {
            [Rarity.Common]: 40,
            [Rarity.Rare]: 80,
            [Rarity.Epic]: 140,
            [Rarity.Legendary]: 220,
        };
        const damage = enemyDamageMap[currentEnemy.rarity] || 40;

        addLog(`💥 "${currentEnemy.name}" контратакует "${target.name}", нанося ${damage} урона!`);
        
        setTeamHp(prevHp => {
            const newHp = (prevHp[target.instanceId] || 0) - damage;
            
            if (newHp <= 0) {
                addLog(`💀 "${target.name}" повержен(а)!`);
                setActiveTeam(prevActive => prevActive.filter(c => c.instanceId !== target.instanceId));
                setDefeatedTeam(prevDefeated => [...prevDefeated, target]);
                setAttackerIndex(0); // Reset index
            }
            
            return { ...prevHp, [target.instanceId]: Math.max(0, newHp) };
        });
    }, [currentEnemy, addLog]);

    const spawnNewEnemy = useCallback(() => {
        setIsEnemyDying(false);
        let potentialEnemies: Card[] = [];
        const rand = Math.random();

        switch(district.id) {
            case 'watson': {
                const commons = allGameCards.filter(c => c.rarity === Rarity.Common && c.role === 'attack');
                const rares = allGameCards.filter(c => c.rarity === Rarity.Rare && c.role === 'attack');
                potentialEnemies = rand < 0.8 ? commons : rares;
                break;
            }
            case 'pacifica': {
                const rares = allGameCards.filter(c => c.rarity === Rarity.Rare && c.role === 'attack');
                const epics = allGameCards.filter(c => c.rarity === Rarity.Epic && c.role === 'attack');
                potentialEnemies = rand < 0.75 ? rares : epics;
                break;
            }
            case 'city_center': {
                const epics = allGameCards.filter(c => c.rarity === Rarity.Epic && c.role === 'attack');
                const legendaries = allGameCards.filter(c => c.rarity === Rarity.Legendary && c.role === 'attack');
                potentialEnemies = rand < 0.85 ? epics : legendaries;
                break;
            }
        }

        if (potentialEnemies.length === 0) {
            potentialEnemies = allGameCards.filter(c => c.rarity === Rarity.Common && c.role === 'attack');
             if (potentialEnemies.length === 0) potentialEnemies = allGameCards;
        }

        const enemyCard = potentialEnemies[Math.floor(Math.random() * potentialEnemies.length)];
        const newMaxHp = Math.floor(Math.random() * (district.hpRange[1] - district.hpRange[0] + 1)) + district.hpRange[0];
        
        setCurrentEnemy(enemyCard);
        setMaxHp(newMaxHp);
        setCurrentHp(newMaxHp);
    }, [allGameCards, district]);

    useEffect(() => {
        addLog(`Рейд в районе "${district.name}" начался!`);
        spawnNewEnemy();
        const initialHp: Record<string, number> = {};
        team.forEach(card => { initialHp[card.instanceId] = card.stats.hp; });
        setTeamHp(initialHp);
    }, [spawnNewEnemy, district.name, addLog, team]);

    const handleEnemyClick = (e: React.MouseEvent) => {
        if (!currentEnemy || currentHp <= 0 || activeTeam.length === 0 || isEnemyDying || activeBoost) return;

        const attacker = activeTeam[attackerIndex];
        const damageDealt = attacker.stats.strength;

        if (hitSounds.length > 0) {
            let nextIndex;
            do { nextIndex = Math.floor(Math.random() * hitSounds.length); } 
            while (hitSounds.length > 1 && nextIndex === lastHitSoundIndex);
            playSound(hitSounds[nextIndex]);
            setLastHitSoundIndex(nextIndex);
        }

        setIsGettingHit(true);
        setTimeout(() => setIsGettingHit(false), 200);

        const newBurst: ClickBurst = { id: Date.now() + Math.random(), x: e.clientX, y: e.clientY };
        setClickBursts(prev => [...prev, newBurst]);
        setTimeout(() => setClickBursts(prev => prev.filter(b => b.id !== newBurst.id)), 300);

        const newHp = currentHp - damageDealt;
        setCurrentHp(newHp);

        const newDamageNumber: DamageNumber = { id: Date.now() + Math.random(), amount: damageDealt, x: e.clientX, y: e.clientY };
        setDamageNumbers(prev => [...prev, newDamageNumber]);
        setTimeout(() => setDamageNumbers(prev => prev.filter(dn => dn.id !== newDamageNumber.id)), 1000);

        const newAttackCounter = playerAttackCounter + 1;
        setPlayerAttackCounter(newAttackCounter);

        if (newHp > 0 && newAttackCounter % 3 === 0) {
            setTimeout(() => handleEnemyAttack(attacker), 300);
        }

        if (activeTeam.length > 1) { // Only cycle if there are other attackers
             setAttackerIndex(prev => (prev + 1) % activeTeam.length);
        }

        if (newHp <= 0) {
            if (deathSounds.length > 0) {
                let nextIndex;
                do { nextIndex = Math.floor(Math.random() * deathSounds.length); } 
                while (deathSounds.length > 1 && nextIndex === lastDeathSoundIndex);
                playSound(deathSounds[nextIndex]);
                setLastDeathSoundIndex(nextIndex);
            }

            const eddyReward = Math.floor(Math.random() * (district.rewardRange[1] - district.rewardRange[0] + 1)) + district.rewardRange[0];
            addLog(`💥 "${attacker.name}" уничтожил(а) "${currentEnemy.name}"!`);
            
            const chipsToDrop = Math.floor(Math.random() * (district.dataChipRange[1] - district.dataChipRange[0] + 1)) + district.dataChipRange[0];
            const newChips: DroppedChip[] = [];
            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const spawnY = rect.top + rect.height * 0.85;

            for (let i = 0; i < chipsToDrop; i++) {
                newChips.push({
                    id: Date.now() + Math.random() + i,
                    top: spawnY + (Math.random() - 0.5) * 60,
                    left: centerX + (Math.random() - 0.5) * 80,
                    createdAt: Date.now(),
                    state: 'spawning',
                });
            }
            setDroppedChips(prev => [...prev, ...newChips]);
            setTimeout(() => {
                setDroppedChips(prev => prev.map(c => newChips.some(nc => nc.id === c.id) ? { ...c, state: 'idle' } : c));
            }, 400);

            setRaidEddies(prev => prev + eddyReward);
            setRaidKills(prev => prev + 1);
            setKillStats(prev => ({ ...prev, [attacker.instanceId]: (prev[attacker.instanceId] || 0) + 1 }));
            
            setIsEnemyDying(true);
            setTimeout(() => spawnNewEnemy(), 500);
        }
    };

    const collectChip = useCallback((chipId: number) => {
        setDroppedChips(prev => {
            const chip = prev.find(c => c.id === chipId);
            if (chip && chip.state !== 'collecting') {
                return prev.map(c => c.id === chipId ? { ...c, state: 'collecting' } : c);
            }
            return prev;
        });
    }, []);

    const finishChipCollection = (chipId: number) => {
        setRaidDataChips(prev => prev + 1);
        setDroppedChips(prev => prev.filter(c => c.id !== chipId));
    };

    useEffect(() => {
        const interval = setInterval(() => {
            const now = Date.now();
            droppedChips.forEach(chip => {
                if (chip.state === 'idle' && now - chip.createdAt > 3000) {
                    collectChip(chip.id);
                }
            });
        }, 500);
        return () => clearInterval(interval);
    }, [droppedChips, collectChip]);
    
    useEffect(() => {
        if (team.length > 0 && activeTeam.length === 0 && !isEnemyDying) {
            addLog("Вся команда повержена. Рейд завершен.");
            const allDefeatedIds = defeatedTeam.map(c => c.instanceId);
            const earnings = { eddies: raidEddies, dataChips: raidDataChips };
            setTimeout(() => onEndRaid(district.id, raidKills, earnings, allDefeatedIds, killStats), 2000);
        }
    }, [activeTeam, team, defeatedTeam, district.id, raidKills, raidEddies, raidDataChips, onEndRaid, addLog, isEnemyDying, killStats]);

    const handleBuyHealBoost = () => {
        if (raidDataChips >= 70) {
            setRaidDataChips(prev => prev - 70);
            setActiveBoost('heal');
            setIsBoostPanelOpen(false);
            addLog("💉 Вы приобрели 'MaxDoc Инъектор'. Выберите цель.");
        }
    };

    const handleCancelBoost = () => {
        if (activeBoost === 'heal') {
            setRaidDataChips(prev => prev + 70);
        }
        setActiveBoost(null);
        addLog("Действие отменено.");
    };

    const handleHealTargetSelect = (targetCard: PlayerCard) => {
        if (activeBoost !== 'heal' || !targetCard) return;

        const currentCardHp = teamHp[targetCard.instanceId];
        const maxCardHp = targetCard.stats.hp;

        if (currentCardHp >= maxCardHp) {
            addLog("Эта карта уже имеет полное здоровье.");
            return;
        }

        const healedAmount = maxCardHp - currentCardHp;
        
        setTeamHp(prev => ({...prev, [targetCard.instanceId]: maxCardHp}));
        setActiveBoost(null);
        
        if (healSound) playSound(healSound);

        addLog(`❤️‍🩹 "${targetCard.name}" полностью исцелен(а)! (+${Math.round(healedAmount)} HP)`);

        const cardElement = document.getElementById(`team-card-${targetCard.instanceId}`);
        const rect = cardElement ? cardElement.getBoundingClientRect() : { top: window.innerHeight / 2, left: window.innerWidth / 2, width: 50, height: 80 };
        
        const newHealNumber: DamageNumber = { 
            id: Date.now() + Math.random(), 
            amount: healedAmount, 
            x: rect.left + rect.width / 2,
            y: rect.top,
        };
        setHealNumbers(prev => [...prev, newHealNumber]);
        setTimeout(() => setHealNumbers(prev => prev.filter(hn => hn.id !== newHealNumber.id)), 1000);
    };

    
    if (!currentEnemy) return <div>Загрузка рейда...</div>;

    const currentAttacker = activeTeam.length > 0 ? activeTeam[attackerIndex] : null;

    return (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] animate-fade-in relative overflow-hidden">
             {damageNumbers.map(dn => (
                <div key={dn.id} className="absolute text-3xl font-black text-[color:var(--brand-accent)] pointer-events-none animate-damage-number" style={{ left: dn.x, top: dn.y, zIndex: 101 }}>-{dn.amount}</div>
            ))}
             {healNumbers.map(hn => (
                <div key={hn.id} className="absolute text-3xl font-black pointer-events-none animate-heal-number" style={{ left: hn.x, top: hn.y, zIndex: 101 }}>+{Math.round(hn.amount)}</div>
            ))}
             {clickBursts.map(burst => (
                <div key={burst.id} className="absolute w-20 h-20 bg-[color:var(--brand-accent)]/50 rounded-full pointer-events-none animate-click-burst" style={{ left: burst.x, top: burst.y, transform: 'translate(-50%, -50%)', zIndex: 102 }}></div>
            ))}
            {droppedChips.map(chip => {
                const style: React.CSSProperties = { position: 'fixed', top: chip.top, left: chip.left, zIndex: 100, };
                if (chip.state === 'collecting') {
                    style.transition = `all 0.7s cubic-bezier(0.5, 0, 1, 0.5)`;
                    style.top = earningsPosition.top;
                    style.right = earningsPosition.right;
                    style.left = 'auto';
                    style.transform = 'scale(0)';
                }
                return (
                    <div key={chip.id} style={style} className={`text-cyan-400 ${chip.state === 'spawning' ? 'animate-chip-spawn' : ''}`} onMouseEnter={() => collectChip(chip.id)} onTransitionEnd={() => finishChipCollection(chip.id)}>
                        <DataChipIcon className="w-6 h-6 drop-shadow-[0_0_5px_rgba(0,255,255,0.8)]" />
                    </div>
                );
            })}
             {isBoostPanelOpen && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-900/90 backdrop-blur-sm border-2 border-[color:var(--brand-accent)] p-6 z-50 w-96 text-center">
                    <h3 className="text-2xl font-heading text-[color:var(--brand-accent)] mb-4">Магазин Бустов</h3>
                    <div className="bg-black/30 p-4 flex justify-between items-center">
                        <div>
                            <p className="font-bold text-lg">MaxDoc Инъектор</p>
                            <p className="text-sm text-gray-400">Полностью восстанавливает HP одной карты.</p>
                        </div>
                        <button 
                            onClick={handleBuyHealBoost}
                            disabled={raidDataChips < 70}
                            className="bg-[color:var(--brand-accent)] text-black font-bold py-2 px-4 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center transform active:scale-95"
                        >
                            70 <DataChipIcon className="w-5 h-5 ml-2 text-cyan-900"/>
                        </button>
                    </div>
                    <button onClick={() => setIsBoostPanelOpen(false)} className="mt-4 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 w-full">Закрыть</button>
                </div>
            )}
            
            <div ref={earningsRef} className="absolute top-0 right-0 bg-black/50 p-4 text-lg text-center border-b-2 border-l-2 border-[color:var(--brand-accent)]/50">
                <div className="font-bold text-gray-300">Добыча в Рейде:</div>
                <div className="flex items-center justify-center font-bold text-2xl text-[color:var(--brand-accent)]"><EddyIcon className="w-6 h-6 mr-2"/> {raidEddies.toLocaleString()}</div>
                <div className="flex items-center justify-center font-bold text-2xl text-cyan-400"><DataChipIcon className="w-6 h-6 mr-2"/> {raidDataChips.toLocaleString()}</div>
                <div className="font-bold text-gray-300 mt-2">Уничтожено:</div>
                <div className="font-bold text-2xl text-white">{raidKills}</div>
            </div>

            <div className="absolute top-0 left-0 bg-black/50 p-4 w-96 border-b-2 border-r-2 border-[color:var(--brand-accent)]/50">
                <h3 className="font-bold text-center text-gray-300 mb-2">Ваша Команда</h3>
                <div className="grid grid-cols-5 gap-2">
                    {team.map(card => {
                        const isDefeated = defeatedTeam.some(c => c.instanceId === card.instanceId);
                        const isActiveAttacker = !isDefeated && currentAttacker?.instanceId === card.instanceId;
                        const hp = teamHp[card.instanceId] || 0;
                        const displayImageUrl = customImages.get(card.id) || card.imageUrl;
                        const isTargetable = activeBoost === 'heal' && !isDefeated && teamHp[card.instanceId] < card.stats.hp;
                        return (
                            <div 
                                key={card.instanceId} 
                                id={`team-card-${card.instanceId}`}
                                onClick={isTargetable ? () => handleHealTargetSelect(card) : undefined}
                                className={`relative transition-all duration-300 aspect-[2/3] ${isDefeated ? 'opacity-20 saturate-0' : ''} ${isTargetable ? 'cursor-pointer card-glow-heal' : ''}`}
                            >
                                <img src={displayImageUrl} className={`w-full h-full object-cover border-2 ${isActiveAttacker ? 'border-[color:var(--brand-accent)]' : 'border-transparent'}`} alt={card.name}/>
                                {!isDefeated && (
                                    <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gray-700">
                                        <div className="h-full bg-[color:var(--brand-warning)] transition-all duration-300" style={{ width: `${(hp / card.stats.hp) * 100}%` }}></div>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
                 {currentAttacker && (
                    <div className="mt-2 text-center bg-black/30 p-2">
                        <p className="text-xs text-gray-400">СЕЙЧАС АТАКУЕТ</p>
                        <p className="font-bold text-white truncate">{currentAttacker.name}</p>
                        <div className="flex items-center justify-center text-[color:var(--brand-accent)] font-bold">
                            <StrengthIcon className="w-4 h-4 mr-1"/> {currentAttacker.stats.strength}
                            <HealthIcon className="w-4 h-4 mr-1 ml-3 text-rose-400"/> {Math.round(teamHp[currentAttacker.instanceId] || 0)}
                        </div>
                    </div>
                )}
            </div>
            
            <div className="absolute bottom-4 left-4 bg-black/50 p-2 w-72 h-36 border-2 border-[color:var(--brand-accent)]/50">
                <div className="h-full text-xs overflow-auto font-mono flex flex-col-reverse text-left">
                    {battleLog.map((msg, i) => <p key={i} className={`p-1 ${i === 0 ? 'text-[color:var(--brand-accent)] bg-white/5' : 'text-gray-400'}`}>{msg}</p>)}
                </div>
            </div>

            <div className="flex flex-col items-center">
                <h2 className="text-4xl font-heading text-white mb-2">Цель: {currentEnemy.name}</h2>
                <p className="text-xl text-gray-400">Район: {district.name}</p>

                <div className="w-full max-w-[250px] mx-auto">
                    <RaidHealthBar current={currentHp} max={maxHp} />

                    <div className={`transition-opacity duration-500 ${activeBoost ? 'opacity-50' : 'cursor-pointer'} ${isEnemyDying ? 'animate-enemy-death' : ''} ${isGettingHit ? 'animate-hit-shake' : ''}`} onClick={handleEnemyClick}>
                        <CardComponent card={currentEnemy} />
                    </div>
                </div>
            </div>

            <div className="flex items-center space-x-4 mt-8">
                {activeBoost ? (
                    <button onClick={handleCancelBoost} className="bg-gray-500 hover:bg-gray-400 text-white font-bold py-3 px-8 text-xl transform active:scale-95">
                        Отмена
                    </button>
                ) : (
                    <button onClick={() => setIsBoostPanelOpen(true)} className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-3 px-8 text-xl transform active:scale-95">
                        Бусты
                    </button>
                )}
                <button onClick={() => {
                    const earnings = { eddies: raidEddies, dataChips: raidDataChips };
                    const allDefeatedIds = defeatedTeam.map(c => c.instanceId);
                    onEndRaid(district.id, raidKills, earnings, allDefeatedIds, killStats);
                }} className="bg-[color:var(--brand-warning)] hover:brightness-110 text-white font-bold py-3 px-8 text-xl transform active:scale-95">
                    Завершить Рейд
                </button>
            </div>
        </div>
    );
};

export default RaidInterface;