
'use client';

import { useState, useEffect } from 'react';
import { Loader2, FileUp } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { importFromSheet } from '@/ai/flows/import-sheet-flow';
import { createCards } from '@/lib/data';
import { useAuth } from './auth-provider';
import { firebaseConfig } from '@/lib/firebase';

declare global {
  interface Window {
    google: any;
    gapi: any;
  }
}

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
  const { user } = useAuth();
  const [pickerApiLoaded, setPickerApiLoaded] = useState(false);
  const [gsiToken, setGsiToken] = useState<string | null>(null);

  useEffect(() => {
    const loadApis = () => {
      window.gapi.load('client:picker', () => {
        setPickerApiLoaded(true);
      });
    };

    if (window.gapi) {
      loadApis();
    }
  }, []);

  const handleAuthClick = () => {
    if (window.google) {
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: firebaseConfig.clientId,
        scope: 'https://www.googleapis.com/auth/drive.readonly',
        callback: (tokenResponse: any) => {
          if (tokenResponse && tokenResponse.access_token) {
            setGsiToken(tokenResponse.access_token);
          }
        },
      });
      tokenClient.requestAccessToken();
    }
  };

  useEffect(() => {
    if (gsiToken) {
      createPicker();
    }
  }, [gsiToken]);


  const pickerCallback = async (data: any) => {
    if (data.action === window.google.picker.Action.PICKED) {
      const fileId = data.docs[0].id;
      setIsImporting(true);
      try {
        const importedCards = await importFromSheet(fileId);
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
        } else {
          throw new Error('No cards were found in the sheet or the format was incorrect.');
        }
      } catch (error) {
        console.error('Import failed:', error);
        toast({
          variant: 'destructive',
          title: 'Import Failed',
          description: error instanceof Error ? error.message : 'An unknown error occurred. Make sure the sheet is shared correctly and the format is valid.',
        });
      } finally {
        setIsImporting(false);
        setGsiToken(null); // Reset token after use
      }
    } else if (data.action === window.google.picker.Action.CANCEL) {
        onOpenChange(false);
    }
  };

  const createPicker = () => {
    if (!pickerApiLoaded || !gsiToken || !user) return;

    const view = new window.google.picker.View(window.google.picker.ViewId.SPREADSHEETS);
    view.setMimeTypes("application/vnd.google-apps.spreadsheet");
    
    const picker = new window.google.picker.PickerBuilder()
      .enableFeature(window.google.picker.Feature.NAV_HIDDEN)
      .setAppId(firebaseConfig.appId.split(':')[1]) // Use the numeric app ID
      .setOAuthToken(gsiToken)
      .addView(view)
      .setDeveloperKey(firebaseConfig.apiKey)
      .setCallback(pickerCallback)
      .build();
    picker.setVisible(true);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Import from Google Sheet</DialogTitle>
          <DialogDescription>
            Select a spreadsheet from your Google Drive to import cards. The first column should be the card front, and the second column the back.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center py-4">
          <Button onClick={handleAuthClick} disabled={isImporting || !pickerApiLoaded}>
            {isImporting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FileUp className="mr-2 h-4 w-4" />
            )}
            Choose Google Sheet
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
