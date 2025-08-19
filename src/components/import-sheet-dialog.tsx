
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
        title: 'URL Required',
        description: 'Please enter a Google Sheet URL.',
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
          title: 'Import Successful',
          description: `${importedCards.length} cards were imported into your deck.`,
        });
        onImportComplete();
        setIsOpen(false);
        setSheetUrl('');
      } else {
        // This is the error that was being triggered before
        throw new Error('No cards were found in the sheet. Please ensure the link is for a public sheet and that the format is correct (Column A for front, Column B for back).');
      }
    } catch (error) {
      console.error('Import failed:', error);
      toast({
        variant: 'destructive',
        title: 'Import Failed',
        // Now the more descriptive error message will be shown
        description: error instanceof Error ? error.message : 'An unknown error occurred. Please try again.',
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
          Import from Sheet
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Import from Public Google Sheet</DialogTitle>
          <DialogDescription>
            Paste the URL of a publicly shared Google Sheet. The first column (A) should be the card front, and the second column (B) should be the back.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="sheet-url" className="text-right">
              Sheet URL
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
              Cancel
            </Button>
          </DialogClose>
          <Button onClick={handleImport} disabled={isImporting}>
            {isImporting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Import Cards
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
