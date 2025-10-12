import React, { useState, useCallback, useEffect } from 'react';
import { PlayerCard, Card, Rarity, Chest, Page, PlayerCurrencies, CardRole, FixerProgress, CardCooldowns } from './types';
import { RARITY_ORDER, CHESTS } from './constants';
import Header from './components/Header';
import CollectionPage from './components/CollectionPage';
import OpenChestsPage from './components/OpenChestsPage';
import CraftingPage from './components/CraftingPage';
import ShopPage from './components/ShopPage';
import MarketplacePage from './components/MarketplacePage';
import DeveloperPage from './components/DeveloperPage';
import BattlePage from './components/BattlePage';
import FixerContractsPage from './components/FixerContractsPage';
import Modal from './components/Modal';
import * as db from './db';
import { ImageContext } from './context/ImageContext';
import { AudioContext } from './context/AudioContext';
import { UiContext } from './context/UiContext';
import { decodeAudioData } from './utils/audio';
import CheatMenu from './components/CheatMenu';
import AiAssistant from './components/AiAssistant';

const pageToBackgroundKeyMap: { [key in Page]: string } = {
    [Page.Collection]: 'collection',
    [Page.Battle]: 'battle',
    [Page.FixerContracts]: 'contracts',
    [Page.Chests]: 'chests',
    [Page.Crafting]: 'crafting',
    [Page.Shop]: 'shop',
    [Page.Marketplace]: 'marketplace',
    [Page.Developer]: 'developer',
};

const App: React.FC = () => {
    const [currentPage, setCurrentPage] = useState<Page>(Page.Collection);
    const [playerCards, setPlayerCards] = useState<PlayerCard[]>([]);
    const [playerCurrencies, setPlayerCurrencies] = useState<PlayerCurrencies>({ eddies: 0, lustGems: 0, dataChips: 0 });
    const [allGameCards, setAllGameCards] = useState<Card[]>([]);
    const [fixerProgress, setFixerProgress] = useState<FixerProgress>({});
    const [cardCooldowns, setCardCooldowns] = useState<CardCooldowns>({});
    
    const [modalContent, setModalContent] = useState<React.ReactNode | null>(null);
    const [customImages, setCustomImages] = useState<Map<number, string>>(new Map());
    const [audioAssets, setAudioAssets] = useState<Map<string, AudioBuffer>>(new Map());
    const [uiAssets, setUiAssets] = useState<Map<string, string>>(new Map());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Initial data loading from IndexedDB
    useEffect(() => {
        const loadGameData = async () => {
            try {
                setLoading(true);
                await db.initDB();
                const [gameCards, pCards, pCurrencies, images, fxProgress, cooldowns, assets, uiAssetsData] = await Promise.all([
                    db.getGameCards(),
                    db.getPlayerCards(),
                    db.getPlayerCurrencies(),
                    db.getAllImages(),
                    db.getFixerProgress(),
                    db.getCardCooldowns(),
                    db.getAllGameAssets(),
                    db.getAllUiAssets(),
                ]);
                setAllGameCards(gameCards);
                setPlayerCards(pCards);
                setPlayerCurrencies(pCurrencies);
                setCustomImages(images);
                setFixerProgress(fxProgress);
                setCardCooldowns(cooldowns);
                setUiAssets(uiAssetsData);
                
                // Decode audio assets
                const decodedAssets = new Map<string, AudioBuffer>();
                for (const [key, data] of assets.entries()) {
                    try {
                        const audioBuffer = await decodeAudioData(data);
                        decodedAssets.set(key, audioBuffer);
                    } catch (audioErr) {
                        console.error(`Failed to decode audio  asset "${key}":`, audioErr);
                    }
                }
                setAudioAssets(decodedAssets);

            } catch (err) {
                console.error("Failed to load game data:", err);
                setError("Не удалось загрузить игровые данные. Попробуйте обновить страницу.");
            } finally {
                setLoading(false);
            }
        };
        loadGameData();
    }, []);

    const handleAddCurrency = useCallback(async (currency: keyof PlayerCurrencies, amount: number) => {
        const newCurrencies = { ...playerCurrencies, [currency]: playerCurrencies[currency] + amount };
        await db.updatePlayerCurrencies(newCurrencies);
        setPlayerCurrencies(newCurrencies);
    }, [playerCurrencies]);

    const addCardsToCollection = async (newCards: Card[]) => {
        const newPlayerCards: PlayerCard[] = newCards.map(card => ({
            ...card,
            instanceId: crypto.randomUUID()
        }));
        await db.addPlayerCards(newPlayerCards);
        setPlayerCards(prev => [...prev, ...newPlayerCards]);
    };
    
    const getRandomCardByRarity = (rarity: Rarity, filter?: { role: CardRole }): Card => {
        let potentialCards = allGameCards.filter(c => c.rarity === rarity);

        if (filter?.role) {
            potentialCards = potentialCards.filter(c => c.role === filter.role);
        }

        if (potentialCards.length === 0) {
            // Fallback: try finding a card of the same rarity without the filter
            let fallbackCards = allGameCards.filter(c => c.rarity === rarity);
             if (fallbackCards.length === 0) {
                 // If still nothing, fallback to any common card
                fallbackCards = allGameCards.filter(c => c.rarity === Rarity.Common);
             }
             // If there was a filter, try to apply it to the common cards
             if(filter?.role) {
                 const filteredFallback = fallbackCards.filter(c => c.role === filter.role);
                 if (filteredFallback.length > 0) {
                    return filteredFallback[Math.floor(Math.random() * filteredFallback.length)];
                 }
             }
            return fallbackCards[Math.floor(Math.random() * fallbackCards.length)];
        }
        return potentialCards[Math.floor(Math.random() * potentialCards.length)];
    };

    const openChest = useCallback(async (chest: Chest) => {
        const { cost, currency, cardCount, rarityChances } = chest;
        if (playerCurrencies[currency] < cost) {
            alert("Недостаточно средств!");
            return;
        }

        const newCurrencies = { ...playerCurrencies, [currency]: playerCurrencies[currency] - cost };
        await db.updatePlayerCurrencies(newCurrencies);
        setPlayerCurrencies(newCurrencies);

        const numCards = Math.floor(Math.random() * (cardCount[1] - cardCount[0] + 1)) + cardCount[0];
        const droppedCards: Card[] = [];

        for (let i = 0; i < numCards; i++) {
            const rand = Math.random();
            let cumulativeChance = 0;
            let chosenRarity: Rarity = Rarity.Common;

            const sortedChances = Object.entries(rarityChances)
                .sort(([rarityA], [rarityB]) => RARITY_ORDER.indexOf(rarityA as Rarity) - RARITY_ORDER.indexOf(rarityB as Rarity));

            for (const [rarity, chance] of sortedChances) {
                cumulativeChance += chance;
                if (rand <= cumulativeChance) {
                    chosenRarity = rarity as Rarity;
                    break;
                }
            }
            droppedCards.push(getRandomCardByRarity(chosenRarity, chest.filter));
        }

        await addCardsToCollection(droppedCards);
        setModalContent(<CollectionPage cards={droppedCards.map(c => ({...c, instanceId: 'modal-preview'}))} isModal={true} />);
    }, [playerCurrencies, allGameCards]);

    const craftCard = useCallback(async (cardId: number) => {
        const cardsToCraft = playerCards.filter(c => c.id === cardId);
        if (cardsToCraft.length < 5) return;

        const sourceCard = cardsToCraft[0];
        const currentRarityIndex = RARITY_ORDER.indexOf(sourceCard.rarity);
        if (currentRarityIndex >= RARITY_ORDER.length - 1) {
            alert("Нельзя улучшить карту максимальной редкости!");
            return;
        }

        const newRarity = RARITY_ORDER[currentRarityIndex + 1];
        const potentialNewCards = allGameCards.filter(c => c.rarity === newRarity);
        if (potentialNewCards.length === 0) {
            alert("Нет карт для создания следующей редкости!");
            return;
        }

        const newCard = potentialNewCards[Math.floor(Math.random() * potentialNewCards.length)];
        const newPlayerCard: PlayerCard = { ...newCard, instanceId: crypto.randomUUID() };
        
        const instanceIdsToRemove = cardsToCraft.slice(0, 5).map(c => c.instanceId);
        
        await db.removePlayerCards(instanceIdsToRemove);
        await db.addPlayerCards([newPlayerCard]);
        
        setPlayerCards(prev => [...prev.filter(c => !instanceIdsToRemove.includes(c.instanceId)), newPlayerCard]);
        
        alert(`Создана карта: ${newCard.name}!`);

    }, [playerCards, allGameCards]);

    const handleImageUpdate = useCallback(async (cardId: number, imageData: string) => {
        await db.setImage(cardId, imageData);
        setCustomImages(prev => new Map(prev).set(cardId, imageData));
    }, []);
    
    const handleAudioAssetUpdate = useCallback(async (key: string, audioData: ArrayBuffer) => {
        await db.setGameAsset(key, audioData);
        try {
            const audioBuffer = await decodeAudioData(audioData);
            setAudioAssets(prev => new Map(prev).set(key, audioBuffer));
        } catch (err) {
            console.error("Failed to decode and update audio asset in state:", err);
        }
    }, []);

    const handleUiAssetUpdate = useCallback(async (key: string, imageData: string) => {
        await db.setUiAsset(key, imageData);
        setUiAssets(prev => new Map(prev).set(key, imageData));
    }, []);
    
    const handleGameCardUpdate = async (card: Card) => {
        await db.saveGameCard(card);
        const updatedCards = await db.getGameCards();
        setAllGameCards(updatedCards);
    };

    const handleDeleteGameCard = async (cardId: number) => {
        await db.deleteGameCard(cardId);
        const updatedCards = await db.getGameCards();
        setAllGameCards(updatedCards);
        // Also remove from player's collection if they own it
        setPlayerCards(prev => prev.filter(pc => pc.id !== cardId));
    };

    const renderPage = () => {
        switch (currentPage) {
            case Page.Collection:
                return <CollectionPage cards={playerCards} />;
            case Page.Battle:
                return <BattlePage 
                    playerCards={playerCards}
                    allGameCards={allGameCards}
                    playerCurrencies={playerCurrencies}
                    setPlayerCurrencies={setPlayerCurrencies}
                />;
            case Page.FixerContracts:
                return <FixerContractsPage 
                    progress={fixerProgress}
                    allGameCards={allGameCards}
                    playerCards={playerCards}
                    playerCurrencies={playerCurrencies}
                    cardCooldowns={cardCooldowns}
                    setPlayerCurrencies={setPlayerCurrencies}
                    setFixerProgress={setFixerProgress}
                    setCardCooldowns={setCardCooldowns}
                />;
            case Page.Chests:
                return <OpenChestsPage onOpenChest={openChest} />;
            case Page.Crafting:
                return <CraftingPage cards={playerCards} onCraft={craftCard} />;
            case Page.Shop:
                return <ShopPage currencies={playerCurrencies} setCurrencies={setPlayerCurrencies} />;
            case Page.Marketplace:
                return <MarketplacePage playerCards={playerCards} setPlayerCards={setPlayerCards} currencies={playerCurrencies} setCurrencies={setPlayerCurrencies} />;
            case Page.Developer:
                return <DeveloperPage 
                            allCards={allGameCards} 
                            onImageUpload={handleImageUpdate}
                            onAudioAssetUpload={handleAudioAssetUpdate}
                            onUiAssetUpload={handleUiAssetUpdate}
                            onSaveCard={handleGameCardUpdate} 
                            onDeleteCard={handleDeleteGameCard}
                        />;
            default:
                return <CollectionPage cards={playerCards} />;
        }
    };
    
    if (loading) {
        return (
            <div className="min-h-screen bg-[color:var(--brand-bg)] flex flex-col items-center justify-center text-gray-300">
                <img src="./logo.png" alt="XCollection Logo" className="h-32 mb-4 animate-pulse" />
                <h1 className="text-3xl font-heading text-shadow-lg text-[color:var(--brand-accent)]">XCollection</h1>
                <p className="text-lg mt-2 font-semibold">Загрузка данных...</p>
            </div>
        )
    }
    
    if(error){
        return <div className="min-h-screen bg-[color:var(--brand-bg)] flex items-center justify-center text-red-400 text-xl">{error}</div>
    }

    const backgroundKey = `background_${pageToBackgroundKeyMap[currentPage]}`;
    const customBackground = uiAssets.get(backgroundKey);

    const backgroundStyle: React.CSSProperties = customBackground
        ? { backgroundImage: `url(${customBackground})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }
        : {
            backgroundImage:
                'linear-gradient(rgba(198, 223, 85, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(198, 223, 85, 0.05) 1px, transparent 1px)',
            backgroundSize: '2rem 2rem',
            backgroundAttachment: 'fixed'
          };

    return (
        <ImageContext.Provider value={customImages}>
            <AudioContext.Provider value={audioAssets}>
                <UiContext.Provider value={uiAssets}>
                    <CheatMenu onAddCurrency={handleAddCurrency} />
                    <div className="min-h-screen bg-[color:var(--brand-bg)] text-gray-200" style={backgroundStyle}>
                        <Header
                            currentPage={currentPage}
                            setCurrentPage={setCurrentPage}
                            eddies={playerCurrencies.eddies}
                            lustGems={playerCurrencies.lustGems}
                            dataChips={playerCurrencies.dataChips}
                        />
                        <main className="p-4 md:p-8">
                            {renderPage()}
                        </main>
                        {modalContent && (
                            <Modal onClose={() => setModalContent(null)}>
                                <h2 className="text-4xl font-heading text-center mb-6 text-[color:var(--brand-accent)]">Новые Карты!</h2>
                                {modalContent}
                            </Modal>
                        )}
                        <AiAssistant />
                    </div>
                </UiContext.Provider>
            </AudioContext.Provider>
        </ImageContext.Provider>
    );
};

export default App;