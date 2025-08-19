
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { type Deck } from '@/lib/types';
import { Book, PlusCircle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { DeckForm } from './deck-form';
import { EmptyState } from './empty-state';
import { getCardsForDeck, deleteDeck } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';

interface DeckListProps {
  decks: Deck[];
  onDecksChange: () => void;
}

export function DeckList({ decks, onDecksChange }: DeckListProps) {
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);
  const [cardCounts, setCardCounts] = useState<Record<string, number>>({});
  const { toast } = useToast();

  useEffect(() => {
    const fetchCardCounts = async () => {
      const counts: Record<string, number> = {};
      for (const deck of decks) {
        const cards = await getCardsForDeck(deck.id);
        counts[deck.id] = cards.length;
      }
      setCardCounts(counts);
    };
    if (decks.length > 0) {
      fetchCardCounts();
    }
  }, [decks]);

  const handleDeleteDeck = async (deckId: string, deckTitle: string) => {
    try {
      await deleteDeck(deckId);
      toast({
        title: "Deck Dihapus",
        description: `Deck "${deckTitle}" sama semua isinya udah kehapus.`,
      });
      onDecksChange();
    } catch (error) {
       toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal ngehapus deck. Coba lagi ntar.",
      });
    }
  };

  if (decks.length === 0) {
    return (
      <EmptyState
        Icon={Book}
        title="Belum Punya Deck Nih"
        description="Yuk, bikin deck pertamamu buat mulai ngapalin."
        action={
          <Dialog open={isCreateDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Bikin Deck Baru
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Bikin Deck Baru</DialogTitle>
                <DialogDescription>
                  Kasih judul sama deskripsi (kalau mau) buat deck barumu.
                </DialogDescription>
              </DialogHeader>
              <DeckForm onFormSubmit={onDecksChange} setOpen={setCreateDialogOpen} />
            </DialogContent>
          </Dialog>
        }
      />
    );
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-foreground font-headline">Deck Punya Lu</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Bikin Deck Baru
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Bikin Deck Baru</DialogTitle>
              <DialogDescription>
                Kasih judul sama deskripsi (kalau mau) buat deck barumu.
              </DialogDescription>
            </DialogHeader>
            <DeckForm onFormSubmit={onDecksChange} setOpen={setCreateDialogOpen} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {decks.map((deck) => (
          <Card key={deck.id} className="flex flex-col hover:shadow-md transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="font-headline truncate">{deck.title}</CardTitle>
              <CardDescription className="h-10 text-ellipsis overflow-hidden">
                {deck.description || 'Gak ada deskripsi.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm text-muted-foreground">
                {cardCounts[deck.id] !== undefined ? `${cardCounts[deck.id]} kartu` : '...'}
              </p>
            </CardContent>
            <CardFooter className="flex justify-between">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-destructive/70 hover:text-destructive hover:bg-destructive/10">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Yakin banget nih?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Ini gak bisa dibalikin loh. Deck
                      <span className="font-semibold"> {deck.title} </span> 
                      sama semua isinya bakal lenyap selamanya.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Gak Jadi</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDeleteDeck(deck.id, deck.title)}>
                      Lanjutin
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <Button asChild>
                <Link href={`/decks/${deck.id}`}>Lihat Deck</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
