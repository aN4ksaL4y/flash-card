export type MarkdownString = string;

export interface Card {
  id: string;
  deckId: string;
  ownerId: string;
  front: MarkdownString;
  back: MarkdownString;
  nextReviewDate: string; // ISO date string
  lastInterval: number; // in days
}

export interface Deck {
  id: string;
  ownerId: string;
  title: string;
  description: string;
}

export interface AppData {
  decks: Deck[];
  cards: Card[];
}
