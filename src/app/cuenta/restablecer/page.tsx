import Link from "next/link";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { UpdatePasswordForm } from "@/components/auth-form";

export default async function RestablecerPage() {
  let hasSession = false;
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    hasSession = Boolean(user);
  }

  return (
    <div className="mx-auto w-full max-w-md px-4 py-16">
      <p className="text-xs font-semibold uppercase tracking-widest text-primary">Recuperar acceso</p>
      <h1 className="mt-2 text-3xl font-black tracking-tight">Elegí una contraseña nueva</h1>
      <div className="mt-8">
        {hasSession ? (
          <UpdatePasswordForm />
        ) : (
          <div className="flex flex-col gap-3">
            <p className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
              El link venció o ya se usó.
            </p>
            <Link href="/cuenta/olvide-password" className="text-sm text-primary underline">
              Pedir un link nuevo
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
