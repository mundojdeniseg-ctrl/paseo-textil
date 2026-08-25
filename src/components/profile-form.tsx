"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { updateProfileAction, ProfileActionState } from "@/app/cuenta/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function CoverPicker({ currentUrl }: { currentUrl: string | null }) {
  const [preview, setPreview] = useState<string | null>(currentUrl);
  const [removeCover, setRemoveCover] = useState(false);

  return (
    <div>
      <label
        htmlFor="cover"
        className="flex h-28 w-full cursor-pointer items-center justify-center overflow-hidden rounded-2xl border border-dashed border-border bg-muted text-xs text-muted-foreground hover:border-primary"
      >
        {preview && !removeCover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="" className="h-full w-full object-cover" />
        ) : (
          "+ foto de portada (opcional)"
        )}
      </label>
      <input
        id="cover"
        name="cover"
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) setRemoveCover(false);
          setPreview(file ? URL.createObjectURL(file) : currentUrl);
        }}
      />
      {currentUrl && (
        <label className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
          <input
            type="checkbox"
            name="removeCover"
            checked={removeCover}
            onChange={(e) => setRemoveCover(e.target.checked)}
            className="h-3.5 w-3.5 rounded border-border"
          />
          Quitar la foto de portada
        </label>
      )}
    </div>
  );
}

function ImagePicker({
  id,
  name,
  currentUrl,
  emptyLabel,
}: {
  id: string;
  name: string;
  currentUrl: string | null;
  emptyLabel: string;
}) {
  const [preview, setPreview] = useState<string | null>(currentUrl);

  return (
    <div className="flex items-center gap-4">
      <label
        htmlFor={id}
        className="flex h-16 w-16 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-dashed border-border bg-muted text-xs text-muted-foreground hover:border-primary"
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="" className="h-full w-full object-cover" />
        ) : (
          emptyLabel
        )}
      </label>
      <input
        id={id}
        name={name}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          setPreview(file ? URL.createObjectURL(file) : currentUrl);
        }}
      />
    </div>
  );
}

export function ProfileForm({
  displayName,
  phone,
  avatarUrl,
  coverUrl,
  isProfilePublic,
  userId,
}: {
  displayName: string;
  phone: string;
  avatarUrl: string | null;
  coverUrl: string | null;
  isProfilePublic: boolean;
  userId: string;
}) {
  const [state, formAction, pending] = useActionState<ProfileActionState, FormData>(
    updateProfileAction,
    null
  );

  return (
    <form action={formAction} className="flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Datos personales
        </h2>
        <div>
          <Label>Foto de portada</Label>
          <CoverPicker currentUrl={coverUrl} />
        </div>
        <div>
          <Label>Foto de perfil</Label>
          <ImagePicker id="avatar" name="avatar" currentUrl={avatarUrl} emptyLabel="+ foto" />
        </div>
        <div>
          <Label htmlFor="displayName">Nombre y apellido</Label>
          <Input id="displayName" name="displayName" defaultValue={displayName} required />
        </div>
        <div>
          <Label htmlFor="phone">WhatsApp / teléfono</Label>
          <Input id="phone" name="phone" defaultValue={phone} required />
        </div>
        <div className="flex items-center gap-2 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="isProfilePublic"
              defaultChecked={isProfilePublic}
              className="h-4 w-4 rounded border-border"
            />
            Mostrar mi perfil público (otros ven tus publicaciones y anuncios)
          </label>
          <a href={`/usuarios/${userId}`} target="_blank" rel="noreferrer" className="text-primary underline shrink-0">
            Ver mi perfil
          </a>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Tus negocios
        </h2>
        <p className="text-sm text-muted-foreground">
          Cargá el logo y los datos de tu taller, fábrica o marca. Podés agregar más de uno.
        </p>
        <Link href="/cuenta/negocios" className="w-fit text-sm font-semibold text-primary underline">
          Gestionar mis negocios →
        </Link>
      </section>

      {state && (
        <p
          className={`rounded-xl p-3 text-sm ${
            state.ok ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"
          }`}
        >
          {state.message}
        </p>
      )}

      <Button type="submit" disabled={pending} size="lg" className="w-fit rounded-full font-semibold">
        {pending ? "Guardando..." : "Guardar cambios"}
      </Button>
    </form>
  );
}
