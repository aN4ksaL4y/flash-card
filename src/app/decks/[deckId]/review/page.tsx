
'use client';

import { useState, useEffect } from 'react';
import { useParams, notFound } from 'next/navigation';

import { type Deck, type Card as CardType } from '@/lib/types';
import { getDeck, getReviewCardsForDeck } from '@/lib/data';
import { Header } from '@/components/header';
import { ReviewFlow } from '@/components/review-flow';

export default function ReviewPage() {
  const params = useParams<{ deckId: string }>();
  const [deck, setDeck] = useState<Deck | null>(null);
  const [cardsForReview, setCardsForReview] = useState<CardType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const deckId = params.deckId;

  useEffect(() => {
    if (deckId) {
      const fetchReviewData = async () => {
        try {
          const [foundDeck, reviewCards] = await Promise.all([
            getDeck(deckId),
            getReviewCardsForDeck(deckId)
          ]);
          
          if (foundDeck) {
            setDeck(foundDeck);
            setCardsForReview(reviewCards);
          }
        } catch (error) {
          console.error("Failed to fetch review data:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchReviewData();
    }
  }, [deckId]);
  
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
