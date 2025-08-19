
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
    message: "Title must be at least 2 characters.",
  }).max(50, {
    message: "Title must not be longer than 50 characters.",
  }),
  description: z.string().max(200, {
    message: "Description must not be longer than 200 characters.",
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
        title: "Deck Created",
        description: `The deck "${data.title}" has been successfully created.`,
      });
      onFormSubmit();
      setOpen(false);
    } catch (error) {
       toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create the deck. Please try again.",
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
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Japanese Vocabulary" {...field} />
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
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="A brief description of your deck"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={formState.isSubmitting}>
              {formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Deck
            </Button>
        </div>
      </form>
    </Form>
  )
}
