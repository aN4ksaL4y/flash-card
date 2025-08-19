export interface Card {
  id: string;
  deckId: string;
  front: string;
  back: string;
  nextReviewDate: string; // ISO date string
  lastInterval: number; // in days
}

export interface Deck {
  id: string;
  title: string;
  description: string;
}

export interface AppData {
  decks: Deck[];
  cards: Card[];
}
