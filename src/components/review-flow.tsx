'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { type Deck, type Card as CardType } from '@/lib/types';
import { updateCardReviewStatus } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { EmptyState } from './empty-state';
import { CheckCircle, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReviewFlowProps {
  deck: Deck;
  initialCards: CardType[];
}

export function ReviewFlow({ deck, initialCards }: ReviewFlowProps) {
  const [cards, setCards] = useState(initialCards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  
  const totalCards = initialCards.length;
  const currentCard = cards[currentIndex];
  
  useEffect(() => {
    if(initialCards.length === 0) {
        setIsComplete(true);
    }
  }, [initialCards]);

  const handleFlip = () => {
    setIsFlipped(true);
  };

  const handleNextCard = (difficulty: 'hard' | 'medium' | 'easy') => {
    updateCardReviewStatus(currentCard.id, difficulty);
    
    if (currentIndex < cards.length - 1) {
      setIsFlipped(false);
      // Timeout to allow the card to flip back before changing content
      setTimeout(() => {
        setCurrentIndex(currentIndex + 1);
      }, 150);
    } else {
      setIsComplete(true);
    }
  };

  if (isComplete) {
    return (
      <main className="flex-1 flex items-center justify-center p-4">
         <EmptyState
            Icon={CheckCircle}
            title={totalCards > 0 ? "Review Complete!" : "Nothing to review!"}
            description={totalCards > 0 ? `You've reviewed all ${totalCards} cards for today.` : `All cards in this deck are up to date. Good job!`}
            action={
                <div className="flex gap-4 justify-center">
                    <Button asChild variant="outline">
                        <Link href={`/decks/${deck.id}`}>Back to Deck</Link>
                    </Button>
                    <Button asChild>
                        <Link href="/">
                            <Home className="mr-2 h-4 w-4" />
                            Go Home
                        </Link>
                    </Button>
                </div>
            }
          />
      </main>
    );
  }

  const progress = ((currentIndex + 1) / totalCards) * 100;

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-4 space-y-6">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-2 text-muted-foreground">
            {currentIndex + 1} of {totalCards}
        </div>
        <Progress value={progress} className="w-full" />
      </div>

      <div className="w-full max-w-2xl h-[400px]" style={{ perspective: '1000px' }}>
        <div
          className={cn('relative w-full h-full transition-transform duration-500')}
          style={{ transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : '' }}
        >
          {/* Front of card */}
          <div className="absolute w-full h-full" style={{ backfaceVisibility: 'hidden' }}>
            <Card className="w-full h-full flex items-center justify-center">
              <CardContent className="p-6">
                <p className="text-3xl text-center font-semibold">{currentCard?.front}</p>
              </CardContent>
            </Card>
          </div>
          {/* Back of card */}
          <div className="absolute w-full h-full" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
            <Card className="w-full h-full flex items-center justify-center bg-secondary">
              <CardContent className="p-6">
                <p className="text-3xl text-center font-semibold text-secondary-foreground">{currentCard?.back}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <div>
        {!isFlipped ? (
          <Button size="lg" onClick={handleFlip}>Flip Card</Button>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            <Button variant="destructive" size="lg" onClick={() => handleNextCard('hard')}>Hard</Button>
            <Button variant="outline" size="lg" onClick={() => handleNextCard('medium')}>Medium</Button>
            <Button variant="default" className="bg-green-500 hover:bg-green-600" size="lg" onClick={() => handleNextCard('easy')}>Easy</Button>
          </div>
        )}
      </div>
    </main>
  );
}
