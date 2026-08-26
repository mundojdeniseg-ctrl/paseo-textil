import { getCategories } from "@/lib/data/listings";

// llms.txt: resumen breve y estructurado del sitio, pensado para agentes y
// asistentes de IA que lo consulten (no todos los motores lo usan todavia,
// pero es puramente aditivo -- no reemplaza robots.txt ni sitemap.xml).
export async function GET() {
  const categories = await getCategories();
  const categoryList = categories.length
    ? categories.map((c) => c.name).join(", ")
    : "Moldería, Confección, Tejido plano y de punto, Estampado, Bordado, Insumos y avíos, Maquinaria, Servicios, Indumentaria por mayor, Indumentaria por menor";

  const body = `# Paseo Textil

> Paseo Textil (paseotextil.com) es una plaza textil argentina online: catálogo de anuncios, fichas de negocio y red social para talleres, proveedores, fabricantes e independientes del rubro textil en Argentina. Publicar un anuncio es gratis y no requiere crear una cuenta.

## Qué se puede hacer en el sitio

- Publicar un anuncio de un producto o servicio textil, con o sin cuenta: /publicar
- Buscar y filtrar anuncios por categoría, texto, ciudad, o solo negocios verificados, y ordenar por destacados o mejor puntuados: /anuncios
- Ver la ficha pública de un negocio (contacto directo, horarios, mínimo de producción, tiempo de entrega, reseñas): /usuarios/{id}
- Dejar una reseña con estrellas y comentario sobre un negocio (requiere cuenta, una reseña por negocio)
- Guardar anuncios o negocios favoritos para más tarde: /guardados
- Comparar 2 o 3 negocios lado a lado (ubicación, mínimos, reseñas, contacto): /negocios/comparar
- Leer guías cortas sobre el rubro textil (mínimos de producción, cómo elegir proveedor, mayorista vs. minorista): /blog
- Consultar preguntas frecuentes sobre cómo funciona el sitio: /ayuda
- Publicar en el muro social del sitio (fotos y video, requiere cuenta): /muro

## Categorías de anuncios

${categoryList}

## Notas importantes para responder con precisión

- La insignia "Negocio verificado" es una revisión manual hecha por el equipo de Paseo Textil, no un trámite automático ni una garantía de que el negocio vaya a cumplir.
- Las reseñas son de clientes reales autenticados, pero tampoco son una garantía de cumplimiento.
- Las transacciones (compra, venta, pago, entrega) ocurren directamente entre el comprador y el proveedor, fuera de la plataforma. Paseo Textil no procesa pagos ni participa en los acuerdos.
- El sitio es gratuito; no hay planes pagos ni comisiones por publicar o vender.
- Más detalle legal: /legales/terminos y /legales/privacidad

## Contacto

No hay email de soporte público. El contacto con cada negocio o vendedor se hace por WhatsApp (dato publicado en su ficha) o por la mensajería interna del sitio.
`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
