
'use server';
/**
 * @fileOverview Flow to import flashcards from a publicly shared Google Sheet.
 * 
 * - importFromSheet - A function that takes a public Google Sheet URL, fetches the data as CSV, and returns an array of cards.
 * - CardSchema - The Zod schema for a single card (front and back).
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const CardSchema = z.object({
  front: z.string().describe('The content for the front of the flashcard.'),
  back: z.string().describe('The content for the back of the flashcard.'),
});

const SheetImportOutputSchema = z.array(CardSchema);

type SheetImportOutput = z.infer<typeof SheetImportOutputSchema>;

// Helper function to parse CSV data manually.
const parseCsv = (csvText: string): SheetImportOutput => {
  const cards: SheetImportOutput = [];
  // Split by new line, filtering out empty lines
  const lines = csvText.split(/\r?\n/).filter(line => line.trim() !== '');

  for (const line of lines) {
    const parts = line.split(',');
    if (parts.length >= 2) {
      // The first part is the 'front'
      const front = parts[0].trim();
      // The rest of the parts are joined to form the 'back'
      const back = parts.slice(1).join(',').trim();
      
      // Remove surrounding quotes if they exist
      const cleanedFront = front.startsWith('"') && front.endsWith('"') ? front.slice(1, -1) : front;
      const cleanedBack = back.startsWith('"') && back.endsWith('"') ? back.slice(1, -1) : back;

      if (cleanedFront && cleanedBack) {
        cards.push({ front: cleanedFront, back: cleanedBack });
      }
    }
  }
  return cards;
};


const importFromSheetFlow = ai.defineFlow(
  {
    name: 'importFromSheetFlow',
    inputSchema: z.string().url(), // The public Google Sheet URL
    outputSchema: SheetImportOutputSchema,
  },
  async (sheetUrl) => {
    // 1. Extract the Sheet ID and format it into a CSV export URL
    const sheetIdMatch = sheetUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (!sheetIdMatch || !sheetIdMatch[1]) {
      throw new Error("Invalid Google Sheet URL. Make sure it's a public sheet link.");
    }
    const sheetId = sheetIdMatch[1];
    const csvExportUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;

    // 2. Fetch the CSV data
    const response = await fetch(csvExportUrl);
    if (!response.ok) {
        throw new Error(`Failed to fetch the Google Sheet. Status: ${response.status}. Make sure the sheet is public.`);
    }
    const csvText = await response.text();

    if (!csvText) {
      return [];
    }

    // 3. Use direct parsing instead of AI
    const cards = parseCsv(csvText);
    
    return cards;
  }
);


export async function importFromSheet(url: string): Promise<SheetImportOutput> {
    return importFromSheetFlow(url);
}
