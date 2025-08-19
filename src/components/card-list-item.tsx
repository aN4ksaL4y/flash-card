
'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
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
        title: "Kartu Dihapus",
        description: "Kartu tadi udah dibuang dari deck.",
      });
      onCardChange();
    } catch (error) {
       toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal ngehapus kartu. Coba lagi ntar.",
      });
    }
  };
  
  return (
    <Card>
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex-grow grid grid-cols-2 gap-4 items-center prose prose-sm max-w-none">
          <div className="text-foreground pr-4">
             <ReactMarkdown remarkPlugins={[remarkGfm]}>{card.front}</ReactMarkdown>
          </div>
          <div className="flex items-center">
            <Separator orientation="vertical" className="h-10 mr-4" />
            <div className="text-muted-foreground">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{card.back}</ReactMarkdown>
            </div>
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
                <AlertDialogTitle>Yakin nih?</AlertDialogTitle>
                <AlertDialogDescription>
                  Tindakan ini bakal ngehapus kartu ini permanen. Gak bisa dibalikin lagi.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Gak Jadi</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>Hapus</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}
