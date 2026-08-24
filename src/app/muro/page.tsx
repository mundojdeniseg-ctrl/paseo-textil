import Link from "next/link";
import { getPosts } from "@/lib/data/posts";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { PostComposer } from "@/components/post-composer";
import { PostCard } from "@/components/post-card";
import { Button } from "@/components/ui/button";

export default async function MuroPage() {
  const posts = await getPosts();

  let isLoggedIn = false;
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    isLoggedIn = Boolean(user);
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10">
      <p className="text-xs font-semibold uppercase tracking-widest text-primary">Muro</p>
      <h1 className="mt-2 text-3xl font-black tracking-tight">Lo que se cuenta el rubro textil</h1>
      <p className="mt-2 text-muted-foreground">
        Mostrá tu trabajo, contá novedades, conectá con otros talleres y proveedores.
      </p>

      <div className="mt-6">
        {isLoggedIn ? (
          <PostComposer />
        ) : (
          <div className="rounded-2xl border border-dashed border-border p-6 text-center">
            <p className="font-semibold">Necesitás una cuenta para publicar en el muro.</p>
            <Button
              render={<Link href="/cuenta/registrarse" />}
              nativeButton={false}
              className="mt-3 rounded-full font-semibold"
            >
              Crear cuenta
            </Button>
          </div>
        )}
      </div>

      <div className="mt-8 flex flex-col gap-4">
        {posts.length === 0 ? (
          <p className="text-center text-muted-foreground">Todavía no hay publicaciones. ¡Sé el primero!</p>
        ) : (
          posts.map((post) => <PostCard key={post.id} post={post} />)
        )}
      </div>
    </div>
  );
}
