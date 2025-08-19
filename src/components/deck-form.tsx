
'use client';

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { createDeck } from "@/lib/data"
import { useToast } from "@/hooks/use-toast"

const deckFormSchema = z.object({
  title: z.string().min(2, {
    message: "Judulnya minimal 2 huruf lah.",
  }).max(50, {
    message: "Judulnya jangan panjang-panjang, max 50 huruf.",
  }),
  description: z.string().max(200, {
    message: "Deskripsinya max 200 huruf aja.",
  }).optional(),
})

type DeckFormValues = z.infer<typeof deckFormSchema>

interface DeckFormProps {
  onFormSubmit: () => void;
  setOpen: (open: boolean) => void;
}

export function DeckForm({ onFormSubmit, setOpen }: DeckFormProps) {
  const { toast } = useToast();
  const form = useForm<DeckFormValues>({
    resolver: zodResolver(deckFormSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });
  const { formState } = form;

  async function onSubmit(data: DeckFormValues) {
    try {
      await createDeck({
        title: data.title,
        description: data.description || '',
      });
      toast({
        title: "Deck Dibuat",
        description: `Deck "${data.title}" udah berhasil dibuat. Mantap!`,
      });
      onFormSubmit();
      setOpen(false);
    } catch (error) {
       toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal bikin deck. Coba lagi ntar ya.",
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Judul</FormLabel>
              <FormControl>
                <Input placeholder="Contoh: Kosakata Jepang" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Deskripsi (Opsional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Deskripsi singkat tentang deck-mu"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Batal</Button>
            <Button type="submit" disabled={formState.isSubmitting}>
              {formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Bikin Deck
            </Button>
        </div>
      </form>
    </Form>
  )
}
