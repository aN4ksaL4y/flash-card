
'use client';

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, Controller } from "react-hook-form"
import * as z from "zod"
import { Loader2, Bold, Italic, Link, Code } from "lucide-react";
import React, { useRef } from 'react';

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

const FormattingToolbar = ({ textareaRef, onValueChange }: { textareaRef: React.RefObject<HTMLTextAreaElement>, onValueChange: (value: string) => void }) => {
  const insertMarkdown = (syntax: 'bold' | 'link' | 'code') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    let markdown = '';

    switch (syntax) {
      case 'bold':
        markdown = `**${selectedText || 'teks tebal'}**`;
        break;
      case 'link':
        markdown = `[${selectedText || 'teks link'}](url)`;
        break;
      case 'code':
        markdown = `\`${selectedText || 'kode'}\``;
        break;
    }

    const newValue = textarea.value.substring(0, start) + markdown + textarea.value.substring(end);
    onValueChange(newValue);

    // Move cursor after the inserted markdown
    setTimeout(() => {
        textarea.focus();
        textarea.selectionStart = textarea.selectionEnd = start + markdown.length;
    }, 0);
  };

  return (
    <div className="flex items-center gap-1 rounded-t-md border border-b-0 border-input bg-transparent p-1">
      <Button type="button" variant="outline" size="icon" className="h-7 w-7" onClick={() => insertMarkdown('bold')}><Bold className="h-4 w-4" /></Button>
      <Button type="button" variant="outline" size="icon" className="h-7 w-7" onClick={() => insertMarkdown('link')}><Link className="h-4 w-4" /></Button>
      <Button type="button" variant="outline" size="icon" className="h-7 w-7" onClick={() => insertMarkdown('code')}><Code className="h-4 w-4" /></Button>
    </div>
  );
};


export function CardForm({ deckId, onFormSubmit, setOpen }: CardFormProps) {
  const { toast } = useToast();
  const form = useForm<CardFormValues>({
    resolver: zodResolver(cardFormSchema),
    defaultValues: {
      front: "",
      back: "",
    },
  });

  const frontTextareaRef = useRef<HTMLTextAreaElement>(null);
  const backTextareaRef = useRef<HTMLTextAreaElement>(null);
  
  const { formState, control, setValue } = form;

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
        <Controller
          control={control}
          name="front"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Depan</FormLabel>
              <FormattingToolbar textareaRef={frontTextareaRef} onValueChange={(v) => setValue('front', v)} />
              <FormControl>
                <Textarea
                  {...field}
                  ref={frontTextareaRef}
                  placeholder="Isi buat bagian depan kartu"
                  className="resize-y min-h-[100px] rounded-t-none"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Controller
          control={control}
          name="back"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Belakang</FormLabel>
              <FormattingToolbar textareaRef={backTextareaRef} onValueChange={(v) => setValue('back', v)} />
              <FormControl>
                <Textarea
                  {...field}
                  ref={backTextareaRef}
                  placeholder="Isi buat bagian belakang kartu"
                  className="resize-y min-h-[100px] rounded-t-none"
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
