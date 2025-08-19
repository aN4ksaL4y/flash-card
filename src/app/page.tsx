
'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/header';
import { DeckList } from '@/components/deck-list';
import { type Deck } from '@/lib/types';
import { getDecks, initializeData } from '@/lib/data';

export default function Home() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      await initializeData();
      const fetchedDecks = await getDecks();
      setDecks(fetchedDecks);
      setIsLoading(false);
    };
    fetchData();
  }, []);

  const refreshDecks = async () => {
    setIsLoading(true);
    const fetchedDecks = await getDecks();
    setDecks(fetchedDecks);
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-screen">
        <Header />
        <main className="flex-1 container mx-auto p-4 md:p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-foreground font-headline">Your Decks</h1>
            <div className="h-10 w-36 bg-muted rounded-md animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-card p-6 rounded-lg shadow-sm border border-border h-48 animate-pulse" />
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-8">
        <DeckList decks={decks} onDecksChange={refreshDecks} />
      </main>
    </div>
  );
}
