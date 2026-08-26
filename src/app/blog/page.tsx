import Link from "next/link";
import { BLOG_POSTS } from "@/lib/content/blog-posts";

export const metadata = {
  title: "Blog — Paseo Textil",
  description: "Guías cortas para gente nueva en el rubro textil argentino.",
};

export default function BlogIndexPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-16">
      <p className="text-xs font-semibold uppercase tracking-widest text-primary">Blog</p>
      <h1 className="mt-2 text-3xl font-black tracking-tight">Guías del rubro textil</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Notas cortas para resolver dudas frecuentes antes de publicar o contactar a un proveedor.
      </p>

      <div className="mt-8 flex flex-col gap-4">
        {BLOG_POSTS.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary"
          >
            <h2 className="font-semibold">{post.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{post.excerpt}</p>
            <p className="mt-2 text-xs text-muted-foreground">{post.minutes} min de lectura</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
