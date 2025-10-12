import { Card, Rarity, Chest, PlayerCard, PlayerCurrencies } from './types';
import { INITIAL_CARDS } from './data/cards';
import { FIXER_DISTRICTS } from './data/contracts';

export { INITIAL_CARDS }; // Re-export for other modules like db.ts
export { FIXER_DISTRICTS }; // Re-export for the new contracts mode

export const RARITY_ORDER: Rarity[] = [Rarity.Common, Rarity.Rare, Rarity.Epic, Rarity.Legendary];

// Updated for cyberpunk theme
export const RARITY_STYLES: { [key in Rarity]: { bg: string; border: string; text: string; shadow: string; ring: string; gem: string; textShadowClass: string; typeIconBg: string; } } = {
  [Rarity.Common]: { bg: 'bg-gray-900/50', border: 'border-gray-600', text: 'text-gray-400', shadow: '', ring: 'ring-gray-500', gem: 'bg-gray-400', textShadowClass: 'text-shadow-none', typeIconBg: 'bg-gray-600' },
  [Rarity.Rare]: { bg: 'bg-black/50', border: 'border-[#c6df55]/50', text: 'text-[#c6df55]', shadow: '', ring: 'ring-[#c6df55]', gem: 'bg-sky-400', textShadowClass: '', typeIconBg: 'bg-[#c6df55]' },
  [Rarity.Epic]: { bg: 'bg-black/50', border: 'border-[#b33e34]', text: 'text-[#b33e34]', shadow: '', ring: 'ring-[#b33e34]', gem: 'bg-purple-400', textShadowClass: 'text-shadow-none', typeIconBg: 'bg-[#b33e34]' },
  [Rarity.Legendary]: { bg: 'bg-black/50', border: 'border-[#c6df55]', text: 'text-[#c6df55]', shadow: 'shadow-[0_0_15px_rgba(198,223,85,0.7)]', ring: 'ring-[#c6df55]', gem: 'bg-amber-400', textShadowClass: '', typeIconBg: 'bg-[#c6df55]' },
};


export const INITIAL_PLAYER_CURRENCIES: PlayerCurrencies = {
  eddies: 1000,
  lustGems: 100,
  dataChips: 0,
};

// Updated initial cards for a better start with the new Raid mode (focus on attack)
export const INITIAL_PLAYER_CARDS: PlayerCard[] = [
    { ...INITIAL_CARDS.find(c => c.id === 218)!, instanceId: crypto.randomUUID() }, // Клинки Богомола
    { ...INITIAL_CARDS.find(c => c.id === 212)!, instanceId: crypto.randomUUID() }, // Ниндзя 'Арасака'
    { ...INITIAL_CARDS.find(c => c.id === 215)!, instanceId: crypto.randomUUID() }, // Офицер 'Макс-Так'
    { ...INITIAL_CARDS.find(c => c.id === 301)!, instanceId: crypto.randomUUID() }, // Головорез 'Мальстрём'
    { ...INITIAL_CARDS.find(c => c.id === 303)!, instanceId: crypto.randomUUID() }, // Охранник 'Арасака'
];

export const CHESTS: Chest[] = [
    {
        id: 'common',
        name: 'Обычный Сундук',
        description: 'Содержит в основном обычные карты с небольшим шансом на что-то получше.',
        cost: 500,
        currency: 'eddies',
        cardCount: [3, 5],
        rarityChances: {
            [Rarity.Common]: 0.75,
            [Rarity.Rare]: 0.20,
            [Rarity.Epic]: 0.04,
            [Rarity.Legendary]: 0.01,
        },
    },
    {
        id: 'premium',
        name: 'Премиум Сундук',
        description: 'Повышенные шансы на получение редких и эпических карт. Гарантированно содержит хотя бы одну редкую карту.',
        cost: 100,
        currency: 'lustGems',
        cardCount: [5, 7],
        rarityChances: {
            [Rarity.Common]: 0.40,
            [Rarity.Rare]: 0.45,
            [Rarity.Epic]: 0.12,
            [Rarity.Legendary]: 0.03,
        },
    },
    {
        id: 'legendary',
        name: 'Легендарный Пак',
        description: 'Очень дорогой, но гарантирует получение эпической или легендарной карты.',
        cost: 500,
        currency: 'lustGems',
        cardCount: [4, 6],
        rarityChances: {
            [Rarity.Common]: 0.10,
            [Rarity.Rare]: 0.50,
            [Rarity.Epic]: 0.30,
            [Rarity.Legendary]: 0.10,
        },
    },
    {
        id: 'attacker_cache',
        name: "Кэш Атакующего",
        description: "Содержит только атакующие карты. Идеально для создания агрессивной колоды.",
        cost: 150,
        currency: 'lustGems',
        cardCount: [4, 4],
        rarityChances: {
            [Rarity.Common]: 0.50,
            [Rarity.Rare]: 0.35,
            [Rarity.Epic]: 0.12,
            [Rarity.Legendary]: 0.03,
        },
        filter: { role: 'attack' }
    },
    {
        id: 'support_pack',
        name: "Пакет Поддержки",
        description: "Содержит только карты поддержки и исцеления. Укрепите свою оборону.",
        cost: 150,
        currency: 'lustGems',
        cardCount: [4, 4],
        rarityChances: {
            [Rarity.Common]: 0.50,
            [Rarity.Rare]: 0.35,
            [Rarity.Epic]: 0.12,
            [Rarity.Legendary]: 0.03,
        },
        filter: { role: 'support' }
    }
];

export const MARKETPLACE_LISTINGS: (PlayerCard & { price: number })[] = [
    { ...INITIAL_CARDS.find(c => c.id === 205)!, instanceId: crypto.randomUUID(), price: 1200 },
    { ...INITIAL_CARDS.find(c => c.id === 218)!, instanceId: crypto.randomUUID(), price: 2500 },
    { ...INITIAL_CARDS.find(c => c.id === 102)!, instanceId: crypto.randomUUID(), price: 8000 },
];
