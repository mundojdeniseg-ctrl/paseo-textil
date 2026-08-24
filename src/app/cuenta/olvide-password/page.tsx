import { RequestPasswordResetForm } from "@/components/auth-form";

export default function OlvidePasswordPage() {
  return (
    <div className="mx-auto w-full max-w-md px-4 py-16">
      <p className="text-xs font-semibold uppercase tracking-widest text-primary">Recuperar acceso</p>
      <h1 className="mt-2 text-3xl font-black tracking-tight">¿Olvidaste tu contraseña?</h1>
      <p className="mt-2 text-muted-foreground">
        Ingresá el email de tu cuenta y te mandamos un link para elegir una nueva.
      </p>
      <div className="mt-8">
        <RequestPasswordResetForm />
      </div>
    </div>
  );
}
