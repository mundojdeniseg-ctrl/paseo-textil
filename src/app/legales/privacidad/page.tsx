import Link from "next/link";

export const metadata = {
  title: "Política de privacidad — Paseo Textil",
};

export default function PrivacidadPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-16">
      <p className="text-xs font-semibold uppercase tracking-widest text-primary">Legales</p>
      <h1 className="mt-2 text-3xl font-black tracking-tight">Política de privacidad</h1>
      <p className="mt-2 text-sm text-muted-foreground">Última actualización: agosto de 2026.</p>

      <div className="mt-8 flex flex-col gap-6 text-sm leading-relaxed text-foreground">
        <section>
          <h2 className="font-semibold">1. Qué datos recolectamos</h2>
          <p className="mt-2">Según cómo uses el sitio, guardamos:</p>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>Si creás una cuenta: nombre, WhatsApp/teléfono, email y contraseña (la contraseña
              se guarda encriptada, nunca en texto plano).</li>
            <li>Si activás un perfil de negocio: nombre del negocio, teléfono de contacto, mail y
              dirección (todos opcionales salvo nombre y teléfono).</li>
            <li>Foto de perfil y logo, si los subís.</li>
            <li>El contenido que publicás: anuncios, fotos, publicaciones del muro, comentarios y
              mensajes directos.</li>
            <li>Si publicás un anuncio sin cuenta: el nombre y teléfono de contacto que dejás en
              ese anuncio.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-semibold">2. Qué es público y qué es privado</h2>
          <p className="mt-2">
            Los anuncios, las publicaciones del muro (con su foto/video), los comentarios y los
            likes son visibles para cualquiera que entre al sitio. Tu nombre y foto de perfil
            también son públicos. Si activás el perfil público desde &quot;Mi cuenta&quot;, tus
            anuncios y publicaciones se pueden ver agrupados en una página con tu nombre; podés
            desactivarlo cuando quieras. Los mensajes directos solo los ve el remitente y el
            destinatario.
          </p>
        </section>

        <section>
          <h2 className="font-semibold">3. Para qué usamos tus datos</h2>
          <p className="mt-2">
            Para hacer funcionar el sitio: mostrar tus anuncios y publicaciones, permitir que otros
            usuarios te contacten, y para que puedas recuperar el acceso a tu cuenta si olvidás tu
            contraseña. No vendemos tus datos a terceros ni los usamos para publicidad.
          </p>
        </section>

        <section>
          <h2 className="font-semibold">4. Dónde se guarda la información</h2>
          <p className="mt-2">
            El sitio corre sobre infraestructura de Vercel (hosting) y Supabase (base de datos,
            autenticación y almacenamiento de fotos/videos), proveedores externos con sus propias
            políticas de seguridad.
          </p>
        </section>

        <section>
          <h2 className="font-semibold">5. Cookies y sesión</h2>
          <p className="mt-2">
            Usamos únicamente cookies funcionales para mantener tu sesión iniciada. No usamos
            cookies de seguimiento publicitario ni compartimos datos de navegación con redes de
            publicidad.
          </p>
        </section>

        <section>
          <h2 className="font-semibold">6. Tus derechos</h2>
          <p className="mt-2">
            Podés editar tu nombre, teléfono, foto y perfil de negocio en cualquier momento desde
            &quot;Mi cuenta&quot;. Podés borrar un anuncio o publicación cuando quieras. Si querés
            que eliminemos tu cuenta y todos tus datos, escribinos a través de la mensajería del
            sitio una vez logueado.
          </p>
        </section>

        <section>
          <h2 className="font-semibold">7. Cambios</h2>
          <p className="mt-2">
            Esta política puede actualizarse a medida que el sitio crece. Los cambios importantes
            se van a reflejar en esta misma página.
          </p>
        </section>

        <p className="text-xs text-muted-foreground">
          Ver también nuestros{" "}
          <Link href="/legales/terminos" className="text-primary underline">
            términos y condiciones
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
