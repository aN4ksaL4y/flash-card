
import { type Deck, type Card } from './types';
import { sub, add, formatISO } from 'date-fns';
import { db } from './firebase';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  deleteDoc,
  writeBatch,
  query,
  where,
  documentId,
  updateDoc,
} from 'firebase/firestore';


// Note: No more AppData or local storage. All data is in Firestore.

const DECKS_COLLECTION = 'decks';
const CARDS_COLLECTION = 'cards';

// Helper to convert a Firestore snapshot to a typed object
const fromSnapshot = <T extends { id: string }>(snapshot: any): T => {
  const data = snapshot.data();
  return {
    ...data,
    id: snapshot.id,
  } as T;
}

export const initializeData = async () => {
  // Check if there's already data to avoid re-seeding
  const decksSnapshot = await getDocs(collection(db, DECKS_COLLECTION));
  if (!decksSnapshot.empty) {
    return; // Data already exists
  }

  console.log('No data found. Seeding initial data...');

  const today = new Date();
  const seedDecks: Omit<Deck, 'id'>[] = [
    { title: 'Japanese Vocabulary', description: 'Common words and phrases for beginners.' },
    { title: 'React Hooks', description: 'Mastering useState, useEffect, and more.' },
  ];

  const batch = writeBatch(db);
  const deckRefs = [];

  for (const deckData of seedDecks) {
    const deckRef = doc(collection(db, DECKS_COLLECTION));
    batch.set(deckRef, deckData);
    deckRefs.push(deckRef);
  }

  // Commit the decks to get their IDs
  await batch.commit();

  // Now create cards with the new deck IDs
  const cardsBatch = writeBatch(db);
  const seedCards = [
    // Japanese Deck
    { deckId: deckRefs[0].id, front: 'こんにちは', back: 'Hello', nextReviewDate: formatISO(sub(today, { days: 1 })), lastInterval: 1 },
    { deckId: deckRefs[0].id, front: 'ありがとう', back: 'Thank you', nextReviewDate: formatISO(sub(today, { days: 1 })), lastInterval: 1 },
    { deckId: deckRefs[0].id, front: 'はい', back: 'Yes', nextReviewDate: formatISO(add(today, { days: 5 })), lastInterval: 5 },
    // React Deck
    { deckId: deckRefs[1].id, front: 'useState', back: 'A Hook that lets you add React state to function components.', nextReviewDate: formatISO(sub(today, { days: 1 })), lastInterval: 1 },
    { deckId: deckRefs[1].id, front: 'useEffect', back: 'A Hook that lets you perform side effects in function components.', nextReviewDate: formatISO(add(today, { days: 3 })), lastInterval: 3 },
  ];
  
  for (const cardData of seedCards) {
    const cardRef = doc(collection(db, CARDS_COLLECTION));
    cardsBatch.set(cardRef, cardData);
  }

  await cardsBatch.commit();
  console.log('Initial data seeded successfully.');
};

export const getDecks = async (): Promise<Deck[]> => {
  const snapshot = await getDocs(collection(db, DECKS_COLLECTION));
  return snapshot.docs.map(doc => fromSnapshot<Deck>(doc));
};

export const getDeck = async (id: string): Promise<Deck | null> => {
  const docRef = doc(db, DECKS_COLLECTION, id);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? fromSnapshot<Deck>(docSnap) : null;
};

export const createDeck = async (deck: Omit<Deck, 'id'>): Promise<Deck> => {
  const docRef = await addDoc(collection(db, DECKS_COLLECTION), deck);
  return { ...deck, id: docRef.id };
};

export const deleteDeck = async (id: string): Promise<void> => {
    const batch = writeBatch(db);

    // Delete the deck itself
    const deckRef = doc(db, DECKS_COLLECTION, id);
    batch.delete(deckRef);

    // Delete all cards associated with the deck
    const q = query(collection(db, CARDS_COLLECTION), where("deckId", "==", id));
    const cardsSnapshot = await getDocs(q);
    cardsSnapshot.forEach((doc) => {
        batch.delete(doc.ref);
    });

    await batch.commit();
}

export const getCardsForDeck = async (deckId: string): Promise<Card[]> => {
  const q = query(collection(db, CARDS_COLLECTION), where('deckId', '==', deckId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => fromSnapshot<Card>(doc));
};

export const createCard = async (card: Omit<Card, 'id' | 'nextReviewDate' | 'lastInterval'>): Promise<Card> => {
    const newCardData = {
        ...card,
        nextReviewDate: formatISO(new Date()),
        lastInterval: 0,
    };
    const docRef = await addDoc(collection(db, CARDS_COLLECTION), newCardData);
    return { ...newCardData, id: docRef.id };
};

export const createCards = async (deckId: string, cards: { front: string, back: string }[]): Promise<Card[]> => {
    const batch = writeBatch(db);
    const newCards: Card[] = [];

    cards.forEach(card => {
        const newCardData = {
            ...card,
            deckId,
            nextReviewDate: formatISO(new Date()),
            lastInterval: 0,
        };
        const docRef = doc(collection(db, CARDS_COLLECTION));
        batch.set(docRef, newCardData);
        newCards.push({ ...newCardData, id: docRef.id });
    });

    await batch.commit();
    return newCards;
};

export const deleteCard = async (id: string): Promise<void> => {
    await deleteDoc(doc(db, CARDS_COLLECTION, id));
}

export const getReviewCardsForDeck = async (deckId: string): Promise<Card[]> => {
    const today = formatISO(new Date().setHours(0, 0, 0, 0));
    const q = query(
        collection(db, CARDS_COLLECTION),
        where('deckId', '==', deckId),
        where('nextReviewDate', '<=', today)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => fromSnapshot<Card>(doc));
};

export const updateCardReviewStatus = async (cardId: string, difficulty: 'hard' | 'medium' | 'easy'): Promise<void> => {
    const cardRef = doc(db, CARDS_COLLECTION, cardId);
    const cardSnap = await getDoc(cardRef);

    if (!cardSnap.exists()) return;

    const card = fromSnapshot<Card>(cardSnap);
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

    await updateDoc(cardRef, {
        lastInterval: newInterval,
        nextReviewDate: formatISO(add(today, { days: newInterval })),
    });
}
