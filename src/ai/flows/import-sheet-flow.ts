
'use server';
/**
 * @fileOverview Flow to import flashcards from a Google Sheet.
 * 
 * - importFromSheet - A function that takes a Google Sheet fileId, fetches the data, and returns an array of cards.
 * - CardSchema - The Zod schema for a single card (front and back).
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { google } from 'googleapis';

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
        { "front": "Thank you", "back": "ありがとう" }
    ]
    Here is the content:
    {{{input}}}
  `,
});

const importFromSheetFlow = ai.defineFlow(
  {
    name: 'importFromSheetFlow',
    inputSchema: z.string(), // fileId
    outputSchema: SheetImportOutputSchema,
  },
  async (fileId) => {
    // 1. Authenticate with Google.
    // Note: This uses Application Default Credentials.
    // Ensure your environment is authenticated (e.g., via `gcloud auth application-default login`)
    const auth = new google.auth.GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    });
    const authClient = await auth.getClient();
    const drive = google.drive({ version: 'v3', auth: authClient });

    // 2. Fetch the CSV data from Drive
    const response = await drive.files.export(
      { fileId, mimeType: 'text/csv' },
      { responseType: 'stream' }
    );

    // 3. Convert stream to string
    const chunks: any[] = [];
    for await (const chunk of response.data as any) {
        chunks.push(chunk);
    }
    const csvText = Buffer.concat(chunks).toString('utf8');

    if (!csvText) {
      return [];
    }

    // 4. Use AI to parse the CSV text into structured card data
    const { output } = await sheetImportPrompt(csvText);
    return output || [];
  }
);


export async function importFromSheet(fileId: string): Promise<SheetImportOutput> {
    return importFromSheetFlow(fileId);
}
