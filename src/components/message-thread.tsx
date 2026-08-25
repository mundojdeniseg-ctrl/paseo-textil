"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatRelativeDate } from "@/lib/format";
import { Message } from "@/lib/types/domain";

// Se suscribe a mensajes nuevos por Realtime (Postgres Changes) para que el
// chat se sienta fluido: si la otra persona escribe mientras tenes la
// conversacion abierta, aparece solo, sin F5.
export function MessageThread({
  initialMessages,
  currentUserId,
  otherUserId,
}: {
  initialMessages: Message[];
  currentUserId: string;
  otherUserId: string;
}) {
  const [messages, setMessages] = useState(initialMessages);

  // Patron "ajustar estado durante el render" (no en un efecto): cuando el
  // servidor manda mensajes nuevos (por ejemplo, despues de que yo mismo
  // envio uno), se sincroniza el estado local sin el anti-patron de
  // setState sincronico dentro de useEffect.
  const [prevInitialMessages, setPrevInitialMessages] = useState(initialMessages);
  if (initialMessages !== prevInitialMessages) {
    setPrevInitialMessages(initialMessages);
    setMessages(initialMessages);
  }

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`thread-${currentUserId}-${otherUserId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `recipient_id=eq.${currentUserId}`,
        },
        (payload) => {
          const row = payload.new as {
            id: string;
            sender_id: string;
            recipient_id: string;
            listing_id: string | null;
            body: string;
            created_at: string;
            read_at: string | null;
          };
          // El filtro solo acota por destinatario (Realtime no admite dos
          // condiciones a la vez); esta parte deja pasar solo los mensajes
          // que son realmente de esta conversacion puntual.
          if (row.sender_id !== otherUserId) return;

          setMessages((prev) =>
            prev.some((m) => m.id === row.id)
              ? prev
              : [
                  ...prev,
                  {
                    id: row.id,
                    senderId: row.sender_id,
                    recipientId: row.recipient_id,
                    listingId: row.listing_id,
                    body: row.body,
                    createdAt: row.created_at,
                    readAt: row.read_at,
                  },
                ]
          );

          // Ya que la conversacion esta abierta en pantalla, se marca como
          // leido apenas llega en vez de esperar a la proxima visita.
          supabase.from("messages").update({ read_at: new Date().toISOString() }).eq("id", row.id).then();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId, otherUserId]);

  if (messages.length === 0) {
    return (
      <p className="p-4 text-center text-sm text-muted-foreground">Todavía no hay mensajes. Escribí el primero.</p>
    );
  }

  return (
    <div className="flex flex-col gap-2 p-4">
      {messages.map((m) => {
        const isMine = m.senderId === currentUserId;
        return (
          <div key={m.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                isMine ? "bg-primary text-primary-foreground" : "bg-muted"
              }`}
            >
              <p className="whitespace-pre-line leading-snug">{m.body}</p>
              <p
                className={`mt-1 text-right text-[10px] ${
                  isMine ? "text-primary-foreground/70" : "text-muted-foreground"
                }`}
              >
                {formatRelativeDate(m.createdAt)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
