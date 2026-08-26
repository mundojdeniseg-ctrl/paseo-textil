import type { ReactNode } from "react";
import Link from "next/link";
import { faqPageJsonLd, jsonLdScript } from "@/lib/seo";

export const metadata = {
  title: "Centro de ayuda — Paseo Textil",
  description: "Cómo funciona Paseo Textil: publicar, verificación, reseñas, guardados y más.",
};

const FAQS: { question: string; answer: ReactNode; answerText: string }[] = [
  {
    question: "¿Cómo publico un anuncio?",
    answer: (
      <>
        Entrá a{" "}
        <Link href="/publicar" className="text-primary underline">
          Publicar anuncio
        </Link>
        , completá los datos de tu producto o servicio y las fotos. No hace falta crear una cuenta para
        publicar, aunque si tenés una cuenta podés editar y gestionar tus anuncios más fácil después.
      </>
    ),
    answerText:
      "Entrá a Publicar anuncio, completá los datos de tu producto o servicio y las fotos. No hace falta crear una cuenta para publicar, aunque si tenés una cuenta podés editar y gestionar tus anuncios más fácil después.",
  },
  {
    question: "¿Cómo se verifica un negocio?",
    answer:
      "Por ahora la verificación es manual: el equipo de Paseo Textil revisa el negocio a mano y le agrega la insignia \"Negocio verificado\" si le parece un negocio real y de confianza. No es un trámite que hagas vos — si tenés un negocio activo con buena actividad, puede que te contactemos, o podés escribirnos para pedirlo.",
    answerText:
      "Por ahora la verificación es manual: el equipo de Paseo Textil revisa el negocio a mano y le agrega la insignia \"Negocio verificado\" si le parece un negocio real y de confianza. No es un trámite que hagas vos.",
  },
  {
    question: "¿Cómo dejo una reseña?",
    answer:
      "Entrá a la ficha del negocio (tocá el nombre del negocio desde cualquier anuncio, o buscalo en su perfil), iniciá sesión si todavía no lo hiciste, y vas a ver un formulario con estrellas y un espacio para comentar. Solo podés dejar una reseña por negocio, pero podés editarla después si cambiás de opinión.",
    answerText:
      "Entrá a la ficha del negocio, iniciá sesión si todavía no lo hiciste, y vas a ver un formulario con estrellas y un espacio para comentar. Solo podés dejar una reseña por negocio, pero podés editarla después.",
  },
  {
    question: "¿Cómo guardo un anuncio o negocio para verlo después?",
    answer: (
      <>
        Tocá el ícono ☆ que aparece en cualquier anuncio o en la ficha de un negocio. Después lo vas a
        encontrar en{" "}
        <Link href="/guardados" className="text-primary underline">
          Mis guardados
        </Link>
        . Hace falta tener una cuenta.
      </>
    ),
    answerText:
      "Tocá el ícono de estrella que aparece en cualquier anuncio o en la ficha de un negocio. Después lo vas a encontrar en Mis guardados. Hace falta tener una cuenta.",
  },
  {
    question: "¿Cómo comparo dos o tres negocios?",
    answer:
      "En la ficha de cada negocio hay un botón \"Comparar\". Marcalo en dos o tres negocios y va a aparecer una barra abajo de la pantalla con un link para ver la comparación lado a lado (ubicación, mínimos, tiempos de entrega, reseñas y más).",
    answerText:
      "En la ficha de cada negocio hay un botón \"Comparar\". Marcalo en dos o tres negocios y va a aparecer una barra abajo de la pantalla con un link para ver la comparación lado a lado.",
  },
  {
    question: "¿Qué significa \"mínimo de producción\" o \"acepta moldes propios\"?",
    answer: (
      <>
        Son datos opcionales que cada negocio puede cargar en su ficha para ahorrarte preguntas por
        WhatsApp. Si te quedan dudas sobre estos términos, tenemos una nota completa en el{" "}
        <Link href="/blog/que-es-el-minimo-de-produccion" className="text-primary underline">
          blog
        </Link>
        .
      </>
    ),
    answerText:
      "El mínimo de producción es la cantidad más chica de unidades que un taller o fabricante acepta hacer en un mismo pedido. \"Acepta moldes propios\" indica si el negocio puede confeccionar con un molde que vos ya tenés, en vez de solo con los suyos. Son datos opcionales que cada negocio carga en su ficha.",
  },
  {
    question: "¿Paseo Textil garantiza a los proveedores o las transacciones?",
    answer: (
      <>
        No. Paseo Textil es un punto de encuentro: la compra, venta o acuerdo de servicio ocurre
        directamente entre vos y el proveedor, fuera de la plataforma. Antes de pagar o dejar una seña, te
        recomendamos pedir referencias, ver reseñas y leer nuestra nota sobre{" "}
        <Link href="/blog/como-verificar-un-proveedor-antes-de-pagar" className="text-primary underline">
          cómo verificar a un proveedor
        </Link>
        . Más detalle en los{" "}
        <Link href="/legales/terminos" className="text-primary underline">
          términos y condiciones
        </Link>
        .
      </>
    ),
    answerText:
      "No. Paseo Textil es un punto de encuentro: la compra, venta o acuerdo de servicio ocurre directamente entre el comprador y el proveedor, fuera de la plataforma. Ni la insignia de verificado ni las reseñas son una garantía de cumplimiento.",
  },
  {
    question: "¿Cómo reporto un anuncio o publicación inapropiada?",
    answer:
      "Vas a encontrar un link \"Reportar\" debajo de cada anuncio o publicación del muro. Contanos brevemente qué está mal y lo revisamos.",
    answerText:
      "Vas a encontrar un link \"Reportar\" debajo de cada anuncio o publicación del muro. Contanos brevemente qué está mal y lo revisamos.",
  },
];

export default function AyudaPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(faqPageJsonLd(FAQS))} />
      <p className="text-xs font-semibold uppercase tracking-widest text-primary">Ayuda</p>
      <h1 className="mt-2 text-3xl font-black tracking-tight">Centro de ayuda</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Preguntas frecuentes sobre cómo funciona Paseo Textil. Si no encontrás lo que buscás, escribinos
        por la mensajería del sitio.
      </p>

      <div className="mt-8 flex flex-col gap-3">
        {FAQS.map((faq) => (
          <details key={faq.question} className="group rounded-2xl border border-border bg-card p-4 open:pb-4">
            <summary className="cursor-pointer list-none font-semibold marker:content-none">
              <span className="flex items-center justify-between gap-3">
                {faq.question}
                <span className="text-muted-foreground transition-transform group-open:rotate-45">+</span>
              </span>
            </summary>
            <div className="mt-3 text-sm leading-relaxed text-muted-foreground">{faq.answer}</div>
          </details>
        ))}
      </div>
    </div>
  );
}
