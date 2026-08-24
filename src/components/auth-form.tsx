"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AuthActionState,
  signInAction,
  signUpAction,
  PasswordResetActionState,
  requestPasswordResetAction,
  updatePasswordAction,
} from "@/app/cuenta/actions";

export function SignUpForm() {
  const [state, formAction, pending] = useActionState<AuthActionState, FormData>(signUpAction, null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <label
          htmlFor="avatar"
          className="flex h-16 w-16 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-dashed border-border bg-muted text-xs text-muted-foreground hover:border-primary"
        >
          {avatarPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarPreview} alt="" className="h-full w-full object-cover" />
          ) : (
            "+ foto"
          )}
        </label>
        <input
          id="avatar"
          name="avatar"
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0];
            setAvatarPreview(file ? URL.createObjectURL(file) : null);
          }}
        />
        <p className="text-sm text-muted-foreground">
          Foto de perfil <span className="block text-xs">Opcional, la podés agregar después.</span>
        </p>
      </div>
      <div>
        <Label htmlFor="displayName">Nombre y apellido</Label>
        <Input id="displayName" name="displayName" required placeholder="Tu nombre completo" />
      </div>
      <div>
        <Label htmlFor="phone">WhatsApp / teléfono</Label>
        <Input id="phone" name="phone" required placeholder="+54 9 ..." />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required placeholder="tu@email.com" />
      </div>
      <div>
        <Label htmlFor="password">Contraseña</Label>
        <Input id="password" name="password" type="password" required minLength={6} placeholder="Mínimo 6 caracteres" />
      </div>
      {state && !state.ok && (
        <p className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{state.message}</p>
      )}
      <Button type="submit" disabled={pending} size="lg" className="rounded-full font-semibold">
        {pending ? "Creando cuenta..." : "Crear cuenta"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        ¿Ya tenés cuenta? <Link href="/cuenta/ingresar" className="text-primary underline">Ingresá</Link>
      </p>
    </form>
  );
}

export function SignInForm() {
  const [state, formAction, pending] = useActionState<AuthActionState, FormData>(signInAction, null);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required placeholder="tu@email.com" />
      </div>
      <div>
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Contraseña</Label>
          <Link href="/cuenta/olvide-password" className="text-xs text-primary underline">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
        <Input id="password" name="password" type="password" required placeholder="Tu contraseña" />
      </div>
      {state && !state.ok && (
        <p className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{state.message}</p>
      )}
      <Button type="submit" disabled={pending} size="lg" className="rounded-full font-semibold">
        {pending ? "Ingresando..." : "Ingresar"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        ¿Todavía no tenés cuenta?{" "}
        <Link href="/cuenta/registrarse" className="text-primary underline">
          Creá una
        </Link>
      </p>
    </form>
  );
}

export function RequestPasswordResetForm() {
  const [state, formAction, pending] = useActionState<PasswordResetActionState, FormData>(
    requestPasswordResetAction,
    null
  );

  if (state?.ok) {
    return <p className="rounded-xl bg-primary/10 p-3 text-sm text-primary">{state.message}</p>;
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required placeholder="tu@email.com" />
      </div>
      {state && !state.ok && (
        <p className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{state.message}</p>
      )}
      <Button type="submit" disabled={pending} size="lg" className="rounded-full font-semibold">
        {pending ? "Enviando..." : "Mandarme el link"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        <Link href="/cuenta/ingresar" className="text-primary underline">
          Volver a ingresar
        </Link>
      </p>
    </form>
  );
}

export function UpdatePasswordForm() {
  const [state, formAction, pending] = useActionState<PasswordResetActionState, FormData>(
    updatePasswordAction,
    null
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div>
        <Label htmlFor="password">Contraseña nueva</Label>
        <Input id="password" name="password" type="password" required minLength={6} placeholder="Mínimo 6 caracteres" />
      </div>
      {state && !state.ok && (
        <p className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{state.message}</p>
      )}
      <Button type="submit" disabled={pending} size="lg" className="rounded-full font-semibold">
        {pending ? "Guardando..." : "Guardar contraseña"}
      </Button>
    </form>
  );
}
