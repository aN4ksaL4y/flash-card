
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, BookOpen, Layers, PlusCircle,FileUp } from 'lucide-react';

import { type Deck, type Card as CardType } from '@/lib/types';
import { getDeck, getCardsForDeck } from '@/lib/data';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { CardForm } from '@/components/card-form';
import { CardListItem } from '@/components/card-list-item';
import { EmptyState } from '@/components/empty-state';
import { ImportSheetDialog } from '@/components/import-sheet-dialog';

export default function DeckPage({ params }: { params: { deckId: string } }) {
  const [deck, setDeck] = useState<Deck | null>(null);
  const [cards, setCards] = useState<CardType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);
  const [isImportDialogOpen, setImportDialogOpen] = useState(false);
  
  useEffect(() => {
    const foundDeck = getDeck(params.deckId);
    if (foundDeck) {
      setDeck(foundDeck);
      setCards(getCardsForDeck(params.deckId));
    }
    setIsLoading(false);
  }, [params.deckId]);

  const refreshCards = () => {
    if (deck) {
      setCards(getCardsForDeck(deck.id));
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!deck) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-8">
        <div className="mb-8">
          <Button asChild variant="ghost" className="mb-4">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Decks
            </Link>
          </Button>
          <div className="md:flex justify-between items-start">
            <div>
                <h1 className="text-4xl font-bold font-headline text-foreground">{deck.title}</h1>
                <p className="mt-2 text-lg text-muted-foreground">{deck.description}</p>
            </div>
            <div className="flex gap-2 mt-4 md:mt-0">
                <Dialog open={isCreateDialogOpen} onOpenChange={setCreateDialogOpen}>
                  <DialogTrigger asChild>
                      <Button variant="outline">
                          <PlusCircle className="mr-2 h-4 w-4" />
                          Add Card
                      </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                      <DialogTitle>Add New Card</DialogTitle>
                      <DialogDescription>
                          Enter the front and back content for your new card.
                      </DialogDescription>
                      </DialogHeader>
                      <CardForm
                          deckId={deck.id}
                          onFormSubmit={refreshCards}
                          setOpen={setCreateDialogOpen}
                      />
                  </DialogContent>
                </Dialog>
                
                <ImportSheetDialog
                  deckId={deck.id}
                  onImportComplete={refreshCards}
                  open={isImportDialogOpen}
                  onOpenChange={setImportDialogOpen}
                >
                  <Button variant="outline">
                    <FileUp className="mr-2 h-4 w-4" />
                    Import from Sheet
                  </Button>
                </ImportSheetDialog>

                {cards.length > 0 && (
                <Button asChild>
                    <Link href={`/decks/${deck.id}/review`}>
                    <BookOpen className="mr-2 h-4 w-4" />
                    Review Deck
                    </Link>
                </Button>
                )}
            </div>
          </div>
        </div>

        {cards.length > 0 ? (
          <div className="space-y-4">
            {cards.map((card) => (
              <CardListItem key={card.id} card={card} onCardChange={refreshCards} />
            ))}
          </div>
        ) : (
          <EmptyState
            Icon={Layers}
            title="No Cards in This Deck"
            description="Add your first card to start building your deck."
            action={
                <Dialog open={isCreateDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogTrigger asChild>
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add First Card
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                    <DialogTitle>Add New Card</DialogTitle>
                    <DialogDescription>
                        Enter the front and back content for your new card.
                    </DialogDescription>
                    </DialogHeader>
                    <CardForm
                        deckId={deck.id}
                        onFormSubmit={refreshCards}
                        setOpen={setCreateDialogOpen}
                    />
                </DialogContent>
                </Dialog>
            }
          />
        )}
      </main>
    </div>
  );
}
