import { notFound } from "next/navigation";
import Link from "next/link";
import { BLOG_POSTS, getBlogPost } from "@/lib/content/blog-posts";
import { articleJsonLd, jsonLdScript } from "@/lib/seo";

export function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return { title: "Blog — Paseo Textil" };
  return {
    title: `${post.title} — Paseo Textil`,
    description: post.excerpt,
    openGraph: { title: post.title, description: post.excerpt, type: "article" },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(articleJsonLd(post))} />
      <Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground">
        ← Volver al blog
      </Link>
      <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-primary">
        {post.minutes} min de lectura
      </p>
      <h1 className="mt-2 text-3xl font-black tracking-tight text-balance">{post.title}</h1>

      <div className="mt-6 flex flex-col gap-4 text-sm leading-relaxed text-foreground">
        {post.paragraphs.map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>

      <div className="mt-10 rounded-2xl border border-border bg-card p-5">
        <p className="text-sm">¿Ya sabés qué necesitás?</p>
        <Link href="/anuncios" className="mt-1 inline-block font-semibold text-primary hover:underline">
          Ver anuncios en Paseo Textil →
        </Link>
      </div>
    </div>
  );
}
