// Contenido estatico (sin base de datos): notas cortas para gente que recien
// arranca en el rubro textil. Pensadas para resolver dudas frecuentes antes
// de publicar o contactar a un proveedor en Paseo Textil.

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  minutes: number;
  paragraphs: string[];
};

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "que-es-el-minimo-de-produccion",
    title: "¿Qué es el mínimo de producción?",
    excerpt: "Por qué casi ningún taller te confecciona una sola prenda, y cómo averiguar el mínimo antes de escribir.",
    minutes: 3,
    paragraphs: [
      "El \"mínimo de producción\" es la cantidad más chica de unidades que un taller o fabricante acepta hacerte en un mismo pedido. Existe porque armar una tanda de producción (cortar moldes, preparar máquinas, comprar tela) tiene un costo fijo que no cierra si es para una sola prenda.",
      "En indumentaria es común ver mínimos de 20 a 50 unidades por modelo y talle, aunque varía mucho según el tipo de trabajo: un estampado o bordado puede aceptar cantidades más chicas que una confección completa.",
      "Antes de escribirle a un proveedor, fijate si en su ficha de Paseo Textil aparece el dato de \"mínimo de producción\". Si no lo puso, preguntáselo directo por WhatsApp al principio de la conversación — te ahorra ida y vuelta si tu pedido es más chico de lo que manejan.",
      "Si estás arrancando y necesitás cantidades chicas, buscá proveedores que digan explícitamente \"sin mínimo\" o que trabajen por metro/unidad suelta en vez de por tanda de producción.",
    ],
  },
  {
    slug: "como-encontrar-proveedores-textiles-en-argentina",
    title: "Cómo encontrar proveedores textiles en Argentina",
    excerpt: "Una guía corta para ubicar telas, avíos, maquinaria y talleres de confección sin perder días buscando.",
    minutes: 4,
    paragraphs: [
      "Buscar proveedores textiles a ciegas (Google, grupos de Facebook, recomendaciones sueltas) funciona, pero lleva tiempo y es difícil comparar opciones. Un catálogo centralizado como Paseo Textil te deja filtrar por categoría, ciudad y ver varios proveedores uno al lado del otro.",
      "Definí primero qué necesitás con precisión: no es lo mismo buscar \"tela\" que buscar \"gabardina elastizada 1.50m de ancho\". Cuanto más específico seas en la búsqueda, menos mensajes perdidos vas a mandar.",
      "Mirá la ubicación del proveedor. Si necesitás ver o tocar la tela antes de comprar, un taller en tu misma ciudad o provincia te ahorra costos de envío y tiempos de espera. Si es una compra grande y a distancia, pedí fotos o video del rollo antes de coordinar el pago.",
      "Una vez que encontrás 2 o 3 candidatos, compará: precio, mínimo de producción, tiempo de entrega y si tiene reseñas de otros clientes. Paseo Textil tiene un comparador para poner negocios lado a lado justamente para esto.",
      "Por último, no te quedes con el primer proveedor que te responde. Escribile a varios en simultáneo — es gratis y normal en el rubro, nadie se ofende.",
    ],
  },
  {
    slug: "mayorista-o-minorista-como-elegir",
    title: "Mayorista o minorista: cómo elegir según lo que necesitás",
    excerpt: "La diferencia no es solo el precio — es entender para qué está pensado cada uno.",
    minutes: 3,
    paragraphs: [
      "El precio mayorista está pensado para quien compra para revender o para producir en volumen: suele exigir una cantidad mínima, pero el precio por unidad baja bastante. El precio minorista es para quien compra una cantidad chica para uso propio o para probar antes de encargar más.",
      "Si estás por lanzar una marca o abrir un local, el precio mayorista casi siempre te conviene más — pero solo si podés cubrir el mínimo exigido sin que se te quede stock parado.",
      "Si es tu primera compra a un proveedor nuevo, considerá pagar precio minorista en una cantidad chica primero, aunque salga más caro por unidad. Te sirve para evaluar la calidad y el cumplimiento del proveedor antes de comprometer un pedido grande.",
      "En Paseo Textil vas a ver que muchos anuncios muestran los dos precios juntos (mayorista y minorista) — es justamente para que puedas decidir vos según el volumen que necesitás, sin tener que preguntar.",
    ],
  },
  {
    slug: "como-verificar-un-proveedor-antes-de-pagar",
    title: "Cómo verificar a un proveedor antes de pagar o dejar una seña",
    excerpt: "Paseo Textil conecta gente, pero la transacción es entre ustedes. Estos chequeos bajan el riesgo.",
    minutes: 3,
    paragraphs: [
      "Ni Paseo Textil ni ningún catálogo online puede garantizar que una transacción entre dos personas salga bien — la compra, el pago y la entrega ocurren directamente entre vos y el proveedor. Por eso conviene tomarse dos minutos antes de mandar una seña.",
      "Mirá si el negocio tiene la insignia de \"verificado\". Todavía no es algo automático: lo revisamos a mano, así que no todos los negocios reales la tienen aún, pero si la tiene es una señal extra de confianza.",
      "Leé las reseñas de otros clientes en su ficha, si tiene. Un negocio con varias reseñas con nombre y fecha real pesa mucho más que uno sin ninguna reseña.",
      "Pedí referencias o fotos del trabajo terminado de otros pedidos antes de una compra grande. Si es la primera vez que le comprás a alguien, empezá con un pedido chico para probar antes de encargar en volumen.",
      "Si algo te genera dudas (el proveedor te pide todo el pago por adelantado sin mostrar nada, no tiene forma de contactarlo fuera de un solo número, etc.), confiá en tu instinto y seguí buscando. Hay más de un proveedor para cada cosa.",
    ],
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}
