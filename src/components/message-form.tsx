"use client";

import { useActionState, useState } from "react";
import { sendMessageAction, MessageActionState } from "@/app/mensajes/actions";

export function MessageForm({ recipientId, listingId }: { recipientId: string; listingId?: string | null }) {
  const [state, formAction, pending] = useActionState<MessageActionState, FormData>(sendMessageAction, null);

  // Mismo patron que PostComposer/CommentForm: remonta el formulario por key
  // para limpiar el input despues de un envio exitoso.
  const [formKey, setFormKey] = useState(0);
  const [lastHandledState, setLastHandledState] = useState(state);
  if (state !== lastHandledState) {
    setLastHandledState(state);
    if (state?.ok) setFormKey((k) => k + 1);
  }

  return (
    <MessageFormFields
      key={formKey}
      recipientId={recipientId}
      listingId={listingId}
      formAction={formAction}
      pending={pending}
      state={state}
    />
  );
}

function MessageFormFields({
  recipientId,
  listingId,
  formAction,
  pending,
  state,
}: {
  recipientId: string;
  listingId?: string | null;
  formAction: (formData: FormData) => void;
  pending: boolean;
  state: MessageActionState;
}) {
  return (
    <form action={formAction} className="flex flex-col gap-2 border-t border-border p-4">
      <input type="hidden" name="recipientId" value={recipientId} />
      {listingId && <input type="hidden" name="listingId" value={listingId} />}
      <div className="flex items-end gap-2">
        <textarea
          name="body"
          required
          rows={2}
          placeholder="Escribí tu mensaje..."
          className="flex-1 resize-none rounded-2xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
        >
          {pending ? "..." : "Enviar"}
        </button>
      </div>
      {state && !state.ok && <p className="text-xs text-destructive">{state.message}</p>}
    </form>
  );
}
