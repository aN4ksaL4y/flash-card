
'use client';

import { useState, useEffect } from 'react';
import { notFound, useParams } from 'next/navigation';

import { type Deck, type Card as CardType } from '@/lib/types';
import { getDeck, getReviewCardsForDeck } from '@/lib/data';
import { Header } from '@/components/header';
import { ReviewFlow } from '@/components/review-flow';

export default function ReviewPage() {
  const params = useParams<{ deckId: string }>();
  const [deck, setDeck] = useState<Deck | null>(null);
  const [cardsForReview, setCardsForReview] = useState<CardType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (params.deckId) {
      const foundDeck = getDeck(params.deckId);
      if (foundDeck) {
        setDeck(foundDeck);
        setCardsForReview(getReviewCardsForDeck(params.deckId));
      }
      setIsLoading(false);
    }
  }, [params.deckId]);
  
  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Loading review session...</div>
        </main>
      </div>
    );
  }

  if (!deck) {
    notFound();
  }

  return (
    <div className="flex flex-col h-screen bg-secondary/50">
      <Header />
      <ReviewFlow deck={deck} initialCards={cardsForReview} />
    </div>
  );
}
