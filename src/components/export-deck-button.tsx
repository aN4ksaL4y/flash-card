
'use client';

import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getCardsForDeck } from '@/lib/data';
import { type Deck, type Card } from '@/lib/types';

interface ExportDeckButtonProps {
  deck: Deck;
}

export function ExportDeckButton({ deck }: ExportDeckButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const cards = await getCardsForDeck(deck.id);
      if (cards.length === 0) {
        toast({
          variant: 'destructive',
          title: 'Export Failed',
          description: 'This deck has no cards to export.',
        });
        return;
      }

      const csvContent = convertToCSV(cards);
      downloadCSV(csvContent, `${deck.title.replace(/\s+/g, '_')}_export.csv`);

      toast({
        title: 'Export Successful',
        description: `${cards.length} cards have been exported to a CSV file.`,
      });
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        variant: 'destructive',
        title: 'Export Failed',
        description: 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setIsExporting(false);
    }
  };
  
  const convertToCSV = (cards: Card[]): string => {
    const headers = ['front', 'back'];
    const escapeCell = (cell: string) => {
        // Escape double quotes by doubling them
        let escaped = cell.replace(/"/g, '""');
        // If the cell contains a comma, newline, or double quote, enclose it in double quotes
        if (escaped.includes(',') || escaped.includes('\n') || escaped.includes('"')) {
            escaped = `"${escaped}"`;
        }
        return escaped;
    };

    const rows = cards.map(card => 
        [escapeCell(card.front), escapeCell(card.back)].join(',')
    );
    
    return [headers.join(','), ...rows].join('\n');
  };

  const downloadCSV = (csvContent: string, fileName: string) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.href) {
      URL.revokeObjectURL(link.href);
    }
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  return (
    <Button variant="outline" onClick={handleExport} disabled={isExporting}>
      {isExporting ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Download className="mr-2 h-4 w-4" />
      )}
      Export to CSV
    </Button>
  );
}
