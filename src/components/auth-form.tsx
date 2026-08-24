"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthActionState, signInAction, signUpAction } from "@/app/cuenta/actions";

export function SignUpForm() {
  const [state, formAction, pending] = useActionState<AuthActionState, FormData>(signUpAction, null);

  return (
    <form action={formAction} className="flex flex-col gap-4">
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
        <Label htmlFor="password">Contraseña</Label>
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
