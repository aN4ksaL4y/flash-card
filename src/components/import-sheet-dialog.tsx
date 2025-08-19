
'use client';

import { useState } from 'react';
import { Loader2, FileUp } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { importFromSheet } from '@/ai/flows/import-sheet-flow';
import { createCards } from '@/lib/data';

interface ImportSheetDialogProps {
  deckId: string;
  onImportComplete: () => void;
}

export function ImportSheetDialog({
  deckId,
  onImportComplete,
}: ImportSheetDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [sheetUrl, setSheetUrl] = useState('');
  const { toast } = useToast();

  const handleImport = async () => {
    if (!sheetUrl) {
      toast({
        variant: 'destructive',
        title: 'URL Wajib Diisi',
        description: 'Masukin URL Google Sheet-nya dong.',
      });
      return;
    }

    setIsImporting(true);
    try {
      const importedCards = await importFromSheet(sheetUrl);
      if (importedCards && importedCards.length > 0) {
        await createCards(
          deckId,
          importedCards.map((c) => ({ front: c.front, back: c.back }))
        );
        toast({
          title: 'Impor Berhasil',
          description: `${importedCards.length} kartu udah diimpor ke deck-mu.`,
        });
        onImportComplete();
        setIsOpen(false);
        setSheetUrl('');
      } else {
        // This is the error that was being triggered before
        throw new Error('Gak ada kartu yang ditemuin di sheet. Pastiin link-nya buat sheet publik dan formatnya bener (Kolom A buat depan, Kolom B buat belakang).');
      }
    } catch (error) {
      console.error('Impor gagal:', error);
      toast({
        variant: 'destructive',
        title: 'Impor Gagal',
        // Now the more descriptive error message will be shown
        description: error instanceof Error ? error.message : 'Waduh, ada error gak dikenal. Coba lagi ntar.',
        duration: 9000, // Show for longer
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <FileUp className="mr-2 h-4 w-4" />
          Impor dari Sheet
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Impor dari Google Sheet Publik</DialogTitle>
          <DialogDescription>
            Tempel URL Google Sheet yang bisa diakses publik. Kolom pertama (A) buat depan kartu, kolom kedua (B) buat belakangnya.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="sheet-url" className="text-right">
              URL Sheet
            </Label>
            <Input
              id="sheet-url"
              value={sheetUrl}
              onChange={(e) => setSheetUrl(e.target.value)}
              placeholder="https://docs.google.com/spreadsheets/d/..."
              className="col-span-3"
              disabled={isImporting}
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="ghost" disabled={isImporting}>
              Batal
            </Button>
          </DialogClose>
          <Button onClick={handleImport} disabled={isImporting}>
            {isImporting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Impor Kartu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
