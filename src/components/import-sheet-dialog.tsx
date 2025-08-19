
'use client';

import { useState } from 'react';
import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { importFromSheet } from '@/ai/flows/import-sheet-flow';
import { createCards } from '@/lib/data';

const formSchema = z.object({
  sheetUrl: z.string().url({ message: 'Please enter a valid Google Sheet URL.' }),
});

type FormValues = z.infer<typeof formSchema>;

interface ImportSheetDialogProps {
  deckId: string;
  onImportComplete: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function ImportSheetDialog({
  deckId,
  onImportComplete,
  open,
  onOpenChange,
  children,
}: ImportSheetDialogProps) {
  const [isImporting, setIsImporting] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sheetUrl: '',
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsImporting(true);
    try {
      const importedCards = await importFromSheet(data.sheetUrl);
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
        onOpenChange(false);
        form.reset();
      } else {
        throw new Error('No cards were found in the sheet.');
      }
    } catch (error) {
      console.error('Import failed:', error);
      toast({
        variant: 'destructive',
        title: 'Import Failed',
        description:
          error instanceof Error ? error.message : 'An unknown error occurred.',
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Import from Google Sheet</DialogTitle>
          <DialogDescription>
            Paste the URL of your public Google Sheet. The first column should be the card front, and the second column should be the back.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="sheetUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sheet URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://docs.google.com/spreadsheets/..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                disabled={isImporting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isImporting}>
                {isImporting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Import Cards
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
