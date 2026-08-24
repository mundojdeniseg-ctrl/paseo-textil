import { SignUpForm } from "@/components/auth-form";

export default function RegistrarsePage() {
  return (
    <div className="mx-auto w-full max-w-md px-4 py-16">
      <p className="text-xs font-semibold uppercase tracking-widest text-primary">Crear cuenta</p>
      <h1 className="mt-2 text-3xl font-black tracking-tight">Sumate a Paseo Textil</h1>
      <p className="mt-2 text-muted-foreground">
        Con tu cuenta armás tu perfil, gestionás tus anuncios y vas a poder publicar en el muro.
      </p>
      <div className="mt-8">
        <SignUpForm />
      </div>
    </div>
  );
}
