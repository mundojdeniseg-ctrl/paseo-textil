import { SignInForm } from "@/components/auth-form";

export const metadata = {
  title: "Ingresar — Paseo Textil",
};

export default function IngresarPage() {
  return (
    <div className="mx-auto w-full max-w-md px-4 py-16">
      <p className="text-xs font-semibold uppercase tracking-widest text-primary">Ingresar</p>
      <h1 className="mt-2 text-3xl font-black tracking-tight">Ingresá a tu cuenta</h1>
      <div className="mt-8">
        <SignInForm />
      </div>
    </div>
  );
}
