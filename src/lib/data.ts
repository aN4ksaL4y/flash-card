
import { type Deck, type Card } from './types';
import { sub, add, formatISO } from 'date-fns';
import { db, auth } from './firebase';
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


// Note: All data is in Firestore and scoped to the current user.

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

const getCurrentUserId = () => {
    const user = auth.currentUser;
    if (!user) throw new Error("No authenticated user found.");
    return user.uid;
}

export const initializeData = async (userId: string) => {
  // We are no longer seeding data, but the function is kept
  // in case we want to add other initialization logic in the future.
  const q = query(collection(db, DECKS_COLLECTION), where('ownerId', '==', userId));
  const decksSnapshot = await getDocs(q);
  if (decksSnapshot.empty) {
    console.log(`No data found for user ${userId}. Starting with a blank slate.`);
  }
  return;
};

export const getDecks = async (): Promise<Deck[]> => {
  const userId = getCurrentUserId();
  const q = query(collection(db, DECKS_COLLECTION), where('ownerId', '==', userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => fromSnapshot<Deck>(doc));
};

export const getDeck = async (id: string): Promise<Deck | null> => {
  const userId = getCurrentUserId();
  const docRef = doc(db, DECKS_COLLECTION, id);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists() || docSnap.data().ownerId !== userId) {
    return null; // Or throw an error for unauthorized access
  }
  return fromSnapshot<Deck>(docSnap);
};

export const createDeck = async (deck: Omit<Deck, 'id' | 'ownerId'>): Promise<Deck> => {
  const userId = getCurrentUserId();
  const newDeck = { ...deck, ownerId: userId };
  const docRef = await addDoc(collection(db, DECKS_COLLECTION), newDeck);
  return { ...newDeck, id: docRef.id };
};

export const deleteDeck = async (id: string): Promise<void> => {
    const userId = getCurrentUserId();
    const deckRef = doc(db, DECKS_COLLECTION, id);
    const deckSnap = await getDoc(deckRef);

    if (!deckSnap.exists() || deckSnap.data().ownerId !== userId) {
        throw new Error("Unauthorized to delete this deck.");
    }

    const batch = writeBatch(db);
    batch.delete(deckRef);

    const q = query(collection(db, CARDS_COLLECTION), where("deckId", "==", id));
    const cardsSnapshot = await getDocs(q);
    cardsSnapshot.forEach((doc) => {
        batch.delete(doc.ref);
    });

    await batch.commit();
}

export const getCardsForDeck = async (deckId: string): Promise<Card[]> => {
  const userId = getCurrentUserId();
  const q = query(collection(db, CARDS_COLLECTION), where('deckId', '==', deckId), where('ownerId', '==', userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => fromSnapshot<Card>(doc));
};

export const createCard = async (card: Omit<Card, 'id' | 'ownerId' | 'nextReviewDate' | 'lastInterval'>): Promise<Card> => {
    const userId = getCurrentUserId();
    const newCardData = {
        ...card,
        ownerId: userId,
        nextReviewDate: formatISO(new Date()),
        lastInterval: 0,
    };
    const docRef = await addDoc(collection(db, CARDS_COLLECTION), newCardData);
    return { ...newCardData, id: docRef.id };
};

export const createCards = async (deckId: string, cards: { front: string, back: string }[]): Promise<Card[]> => {
    const userId = getCurrentUserId();
    const batch = writeBatch(db);
    const newCards: Card[] = [];

    cards.forEach(card => {
        const newCardData = {
            ...card,
            deckId,
            ownerId: userId,
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
    // We should verify ownership before deleting
    const userId = getCurrentUserId();
    const cardRef = doc(db, CARDS_COLLECTION, id);
    const cardSnap = await getDoc(cardRef);

    if(!cardSnap.exists() || cardSnap.data().ownerId !== userId) {
      throw new Error("Unauthorized to delete this card.");
    }
    await deleteDoc(cardRef);
}

export const getReviewCardsForDeck = async (deckId: string): Promise<Card[]> => {
    const userId = getCurrentUserId();
    const now = new Date();
    // To ensure we get all cards due up to the very end of the current day,
    // we can set the time to 23:59:59.999
    now.setHours(23, 59, 59, 999);
    
    const q = query(
        collection(db, CARDS_COLLECTION),
        where('deckId', '==', deckId),
        where('ownerId', '==', userId),
        where('nextReviewDate', '<=', formatISO(now))
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
            newInterval = Math.max(3, Math.ceil((card.lastInterval || 1) * 4));
            break;
    }

    await updateDoc(cardRef, {
        lastInterval: newInterval,
        nextReviewDate: formatISO(add(today, { days: newInterval })),
    });
}
