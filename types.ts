import React from 'react';

export enum Rarity {
  Common = 'Обычная',
  Rare = 'Редкая',
  Epic = 'Эпическая',
  Legendary = 'Легендарная',
}

export interface CardStats {
  strength: number;
  healing: number;
  hp: number;
}

export type CardRole = 'attack' | 'support';
export type SpecialEffect = 'skip_turn' | 'steal_card' | 'enhance_next_attack' | 'second_heart';

export interface Card {
  id: number;
  name: string;
  rarity: Rarity;
  imageUrl: string;
  effect: string;
  role: CardRole;
  stats: CardStats;
  specialEffect?: SpecialEffect;
  effectValue?: number;
}

export interface PlayerCard extends Card {
  instanceId: string; // Unique ID for each specific card instance a player owns
}

export interface PlayerCurrencies {
  eddies: number;
  lustGems: number;
  dataChips: number;
}

export interface PlayerState {
  cards: PlayerCard[];
  currencies: PlayerCurrencies;
}

export enum Page {
  Collection = 'Коллекция',
  Battle = 'Бой',
  FixerContracts = 'Контракты',
  Chests = 'Сундуки',
  Crafting = 'Крафт',
  Shop = 'Магазин',
  Marketplace = 'Рынок',
  Developer = 'Разработка'
}

export interface Chest {
    id: string;
    name: string;
    description: string;
    cost: number;
    currency: keyof PlayerCurrencies;
    cardCount: [number, number]; // min, max cards
    rarityChances: { [key in Rarity]?: number };
    filter?: { role: CardRole };
}

// Map of instanceId to cooldown end timestamp
export type CardCooldowns = { [instanceId: string]: number };
export type KillStats = { [instanceId: string]: number };


// --- Fixer Contracts ---
export interface FixerDistrict {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  hpRange: [number, number];
  rewardRange: [number, number]; // eddies
  dataChipRange: [number, number]; // data chips per kill
  unlockRequirement?: {
    districtId: string;
    kills: number;
  };
}

export interface FixerProgress {
  [districtId: string]: {
    kills: number; 
  };
}

export interface FixerContractsPageProps {
  progress: FixerProgress;
  allGameCards: Card[];
  playerCards: PlayerCard[];
  playerCurrencies: PlayerCurrencies;
  cardCooldowns: CardCooldowns;
  setPlayerCurrencies: React.Dispatch<React.SetStateAction<PlayerCurrencies>>;
  setFixerProgress: React.Dispatch<React.SetStateAction<FixerProgress>>;
  setCardCooldowns: React.Dispatch<React.SetStateAction<CardCooldowns>>;
}

export interface RaidInterfaceProps {
  district: FixerDistrict;
  team: PlayerCard[];
  allGameCards: Card[];
  onEndRaid: (districtId: string, kills: number, earnings: { eddies: number, dataChips: number }, defeatedCardIds: string[], killStats: KillStats) => void;
}

export interface CheatMenuProps {
  onAddCurrency: (currency: keyof PlayerCurrencies, amount: number) => void;
}