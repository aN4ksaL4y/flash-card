
'use client';

import { type Card as CardType } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
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
import { useToast } from '@/hooks/use-toast';
import { deleteCard } from '@/lib/data';

interface CardListItemProps {
  card: CardType;
  onCardChange: () => void;
}

export function CardListItem({ card, onCardChange }: CardListItemProps) {
  const { toast } = useToast();
  
  const handleDelete = async () => {
    try {
      await deleteCard(card.id);
      toast({
        title: "Card Deleted",
        description: "The card has been removed from the deck.",
      });
      onCardChange();
    } catch (error) {
       toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete the card. Please try again.",
      });
    }
  };
  
  return (
    <Card>
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex-grow grid grid-cols-2 gap-4 items-center">
          <p className="text-foreground pr-4">{card.front}</p>
          <div className="flex items-center">
            <Separator orientation="vertical" className="h-10 mr-4" />
            <p className="text-muted-foreground">{card.back}</p>
          </div>
        </div>
        <div className="flex-shrink-0">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="text-destructive/70 hover:text-destructive hover:bg-destructive/10">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action will permanently delete this card. This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}
