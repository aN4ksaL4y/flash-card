import { type AppData, type Deck, type Card } from './types';
import { sub, add, formatISO } from 'date-fns';

const STORAGE_KEY = 'flashzen-data';

const getAppData = (): AppData => {
  if (typeof window === 'undefined') {
    return { decks: [], cards: [] };
  }
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : { decks: [], cards: [] };
};

const saveAppData = (data: AppData) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const initializeData = () => {
  if (typeof window === 'undefined') return;
  const existingData = localStorage.getItem(STORAGE_KEY);
  if (!existingData) {
    const today = new Date();
    const seedData: AppData = {
      decks: [
        { id: '1', title: 'Japanese Vocabulary', description: 'Common words and phrases for beginners.' },
        { id: '2', title: 'React Hooks', description: 'Mastering useState, useEffect, and more.' },
      ],
      cards: [
        { id: '101', deckId: '1', front: 'こんにちは', back: 'Hello', nextReviewDate: formatISO(sub(today, { days: 1 })), lastInterval: 1 },
        { id: '102', deckId: '1', front: 'ありがとう', back: 'Thank you', nextReviewDate: formatISO(sub(today, { days: 1 })), lastInterval: 1 },
        { id: '103', deckId: '1', front: 'はい', back: 'Yes', nextReviewDate: formatISO(add(today, { days: 5 })), lastInterval: 5 },
        { id: '201', deckId: '2', front: 'useState', back: 'A Hook that lets you add React state to function components.', nextReviewDate: formatISO(sub(today, { days: 1 })), lastInterval: 1 },
        { id: '202', deckId: '2', front: 'useEffect', back: 'A Hook that lets you perform side effects in function components.', nextReviewDate: formatISO(add(today, { days: 3 })), lastInterval: 3 },
      ],
    };
    saveAppData(seedData);
  }
};

export const getDecks = (): Deck[] => {
  const { decks } = getAppData();
  return decks;
};

export const getDeck = (id: string): Deck | undefined => {
  const { decks } = getAppData();
  return decks.find(d => d.id === id);
};

export const createDeck = (deck: Omit<Deck, 'id'>): Deck => {
  const data = getAppData();
  const newDeck: Deck = { ...deck, id: Date.now().toString() };
  data.decks.push(newDeck);
  saveAppData(data);
  return newDeck;
};

export const deleteDeck = (id: string): void => {
    const data = getAppData();
    data.decks = data.decks.filter(d => d.id !== id);
    data.cards = data.cards.filter(c => c.deckId !== id);
    saveAppData(data);
}

export const getCardsForDeck = (deckId: string): Card[] => {
  const { cards } = getAppData();
  return cards.filter(c => c.deckId === deckId);
};

export const createCard = (card: Omit<Card, 'id' | 'nextReviewDate' | 'lastInterval'>): Card => {
    const data = getAppData();
    const newCard: Card = {
        ...card,
        id: Date.now().toString(),
        nextReviewDate: formatISO(new Date()),
        lastInterval: 0,
    };
    data.cards.push(newCard);
    saveAppData(data);
    return newCard;
};

export const deleteCard = (id: string): void => {
    const data = getAppData();
    data.cards = data.cards.filter(c => c.id !== id);
    saveAppData(data);
}

export const getReviewCardsForDeck = (deckId: string): Card[] => {
  const { cards } = getAppData();
  const today = new Date().setHours(0, 0, 0, 0);
  return cards
    .filter(c => c.deckId === deckId)
    .filter(c => new Date(c.nextReviewDate).setHours(0, 0, 0, 0) <= today);
};

export const updateCardReviewStatus = (cardId: string, difficulty: 'hard' | 'medium' | 'easy'): void => {
    const data = getAppData();
    const cardIndex = data.cards.findIndex(c => c.id === cardId);
    if (cardIndex === -1) return;

    const card = data.cards[cardIndex];
    let newInterval: number;
    const today = new Date();

    switch(difficulty) {
        case 'hard':
            newInterval = 1;
            break;
        case 'medium':
            newInterval = Math.max(2, Math.ceil((card.lastInterval || 1) * 2));
            break;
        case 'easy':
            newInterval = Math.max(3, Math.ceil((card.lastInterval || 1.5) * 4));
            break;
    }

    data.cards[cardIndex] = {
        ...card,
        lastInterval: newInterval,
        nextReviewDate: formatISO(add(today, { days: newInterval })),
    };

    saveAppData(data);
}
