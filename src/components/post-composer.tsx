"use client";

import { useActionState, useRef, useState } from "react";
import { createPostAction, PostActionState } from "@/app/muro/actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const MAX_FILES = 6;

export function PostComposer() {
  const [state, formAction, pending] = useActionState<PostActionState, FormData>(
    createPostAction,
    null
  );

  // Patron "ajustar estado durante el render" (no en un efecto): cuando el
  // action devuelve una publicacion exitosa, se cambia la key del formulario
  // para que React lo remonte de cero (limpia textarea, fotos y el input
  // nativo de archivos sin tocar el DOM a mano).
  const [formKey, setFormKey] = useState(0);
  const [lastHandledState, setLastHandledState] = useState(state);
  if (state !== lastHandledState) {
    setLastHandledState(state);
    if (state?.ok) setFormKey((k) => k + 1);
  }

  return (
    <div>
      <PostComposerForm key={formKey} formAction={formAction} pending={pending} state={state} />
      {lastHandledState?.ok && lastHandledState.message && lastHandledState.message !== "¡Publicado!" && (
        <p className="mt-2 rounded-xl bg-primary/10 p-3 text-sm text-primary">{lastHandledState.message}</p>
      )}
    </div>
  );
}

function PostComposerForm({
  formAction,
  pending,
  state,
}: {
  formAction: (formData: FormData) => void;
  pending: boolean;
  state: PostActionState;
}) {
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function syncInputFiles(list: File[]) {
    const dt = new DataTransfer();
    list.forEach((f) => dt.items.add(f));
    if (fileInputRef.current) fileInputRef.current.files = dt.files;
  }

  function handlePicked(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? []);
    const combined = [...files, ...picked].slice(0, MAX_FILES);
    setFiles(combined);
    syncInputFiles(combined);
  }

  function removeFile(index: number) {
    const updated = files.filter((_, i) => i !== index);
    setFiles(updated);
    syncInputFiles(updated);
  }

  return (
    <form action={formAction} className="rounded-2xl border border-border bg-card p-4">
      <Textarea
        name="body"
        required
        rows={3}
        placeholder="Contale al rubro textil qué estás haciendo, mostrá tu trabajo..."
      />

      {files.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {files.map((file, i) => (
            <div key={`${file.name}-${i}`} className="relative h-20 w-20 overflow-hidden rounded-lg border border-border bg-muted">
              {file.type.startsWith("video/") ? (
                <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                  🎬 video
                </div>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={URL.createObjectURL(file)} alt={`Foto ${i + 1}`} className="h-full w-full object-cover" />
              )}
              <button
                type="button"
                onClick={() => removeFile(i)}
                aria-label="Quitar"
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-background/90 text-xs font-bold shadow"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <input ref={fileInputRef} type="file" name="media" multiple className="hidden" />

      <div className="mt-3 flex items-center justify-between">
        {files.length < MAX_FILES ? (
          <label className="cursor-pointer text-sm font-medium text-primary hover:underline">
            + Agregar foto o video
            <input type="file" accept="image/*,video/*" multiple className="sr-only" onChange={handlePicked} />
          </label>
        ) : (
          <span />
        )}
        <Button type="submit" disabled={pending} className="rounded-full font-semibold">
          {pending ? "Publicando..." : "Publicar"}
        </Button>
      </div>

      {state && !state.ok && (
        <p className="mt-2 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{state.message}</p>
      )}
    </form>
  );
}
