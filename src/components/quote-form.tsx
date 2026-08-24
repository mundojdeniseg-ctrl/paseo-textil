"use client";

import { useActionState } from "react";
import { submitQuoteAction, QuoteActionState } from "@/app/anuncios/[id]/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export function QuoteForm({ listingId }: { listingId: string }) {
  const actionWithId = submitQuoteAction.bind(null, listingId);
  const [state, formAction, pending] = useActionState<QuoteActionState, FormData>(
    actionWithId,
    null
  );

  if (state?.ok) {
    return (
      <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4 text-sm">
        {state.message}
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div>
        <Label htmlFor="requesterName">Tu nombre</Label>
        <Input id="requesterName" name="requesterName" placeholder="Nombre y apellido" required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="requesterEmail">Email</Label>
          <Input id="requesterEmail" name="requesterEmail" type="email" placeholder="opcional" />
        </div>
        <div>
          <Label htmlFor="requesterPhone">WhatsApp</Label>
          <Input id="requesterPhone" name="requesterPhone" placeholder="opcional" />
        </div>
      </div>
      <div>
        <Label htmlFor="message">Qué necesitás</Label>
        <Textarea
          id="message"
          name="message"
          required
          rows={3}
          placeholder="Ej: necesito 30 metros, ¿tenés en stock?"
        />
      </div>
      {state && !state.ok && <p className="text-sm text-destructive">{state.message}</p>}
      <Button type="submit" disabled={pending} className="rounded-full font-semibold">
        {pending ? "Enviando..." : "Pedir cotización — sin registrarte"}
      </Button>
      <p className="text-xs text-muted-foreground">
        No hace falta que crees una cuenta para pedir esta cotización.
      </p>
    </form>
  );
}
