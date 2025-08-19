
'use server';
/**
 * @fileOverview Flow to import flashcards from a Google Sheet.
 * 
 * - importFromSheet - A function that takes a Google Sheet URL, fetches the data, and returns an array of cards.
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

// This prompt is designed to extract structured card data from unstructured text,
// likely pasted or fetched from a CSV or similar format.
const sheetImportPrompt = ai.definePrompt({
  name: 'sheetImportPrompt',
  input: { schema: z.string() },
  output: { schema: SheetImportOutputSchema },
  prompt: `
    You are an expert at data extraction. Your task is to extract flashcard data from the provided text content, which is from a Google Sheet CSV.

    The user will provide text content where each line represents a card. The value before the first comma is the 'front' of the card, and the value after the first comma is the 'back'.

    Extract the front and back for each card.

    Example Input:
    "Hello,こんにちは"
    "Thank you,ありがとう"

    Example Output:
    [
        { "front": "Hello", "back": "こんにちは" },
        { "front": "Thank you", "back": "ありがとう" }
    ]

    Here is the content:
    {{{input}}}
  `,
});

const importFromSheetFlow = ai.defineFlow(
  {
    name: 'importFromSheetFlow',
    inputSchema: z.string().url(),
    outputSchema: SheetImportOutputSchema,
  },
  async (sheetUrl) => {
    // 1. Convert shareable URL to CSV export URL
    const csvUrl = sheetUrl.replace('/edit?usp=sharing', '/export?format=csv');
    
    // 2. Fetch the CSV data
    const response = await fetch(csvUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch Google Sheet: ${response.statusText}`);
    }
    const csvText = await response.text();

    if (!csvText) {
      return [];
    }

    // 3. Use AI to parse the CSV text into structured card data
    const { output } = await sheetImportPrompt(csvText);
    return output || [];
  }
);


export async function importFromSheet(sheetUrl: string): Promise<SheetImportOutput> {
    return importFromSheetFlow(sheetUrl);
}
