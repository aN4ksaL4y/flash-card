
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
import { Textarea } from "@/components/ui/textarea"
import { createCard } from "@/lib/data"
import { useToast } from "@/hooks/use-toast"

const cardFormSchema = z.object({
  front: z.string().min(1, { message: "Isi depan kartu gak boleh kosong." }).max(500),
  back: z.string().min(1, { message: "Isi belakang kartu gak boleh kosong." }).max(500),
})

type CardFormValues = z.infer<typeof cardFormSchema>

interface CardFormProps {
  deckId: string;
  onFormSubmit: () => void;
  setOpen: (open: boolean) => void;
}

export function CardForm({ deckId, onFormSubmit, setOpen }: CardFormProps) {
  const { toast } = useToast();
  const form = useForm<CardFormValues>({
    resolver: zodResolver(cardFormSchema),
    defaultValues: {
      front: "",
      back: "",
    },
  })
  const { formState } = form;

  async function onSubmit(data: CardFormValues) {
    try {
      await createCard({
        deckId,
        front: data.front,
        back: data.back,
      });
      toast({
        title: "Kartu Ditambahin",
        description: "Kartu barumu udah masuk ke dalem deck.",
      });
      onFormSubmit();
      setOpen(false);
      form.reset();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal bikin kartu. Coba lagi ntar ya.",
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="front"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Depan</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Isi buat bagian depan kartu"
                  className="resize-y min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="back"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Belakang</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Isi buat bagian belakang kartu"
                  className="resize-y min-h-[100px]"
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
            Tambah Kartu
          </Button>
        </div>
      </form>
    </Form>
  )
}
