
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
        { "front": "Thank you", "ありがとう" }
    ]
    Here is the content:
    {{{input}}}
  `,
});

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

    // 3. Use AI to parse the CSV text into structured card data
    const { output } = await sheetImportPrompt(csvText);
    return output || [];
  }
);


export async function importFromSheet(url: string): Promise<SheetImportOutput> {
    return importFromSheetFlow(url);
}
