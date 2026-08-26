import Link from "next/link";

export const metadata = {
  title: "Términos y condiciones — Paseo Textil",
};

export default function TerminosPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-16">
      <p className="text-xs font-semibold uppercase tracking-widest text-primary">Legales</p>
      <h1 className="mt-2 text-3xl font-black tracking-tight">Términos y condiciones</h1>
      <p className="mt-2 text-sm text-muted-foreground">Última actualización: agosto de 2026.</p>

      <div className="mt-8 flex flex-col gap-6 text-sm leading-relaxed text-foreground">
        <section>
          <h2 className="font-semibold">1. Qué es Paseo Textil</h2>
          <p className="mt-2">
            Paseo Textil (paseotextil.com) es una plataforma online para que talleres, fábricas,
            proveedores e independientes del rubro textil argentino publiquen anuncios, se
            contacten entre sí y compartan novedades en el muro social del sitio. Es un servicio
            gratuito, todavía en etapa temprana.
          </p>
        </section>

        <section>
          <h2 className="font-semibold">2. Publicar anuncios y contenido</h2>
          <p className="mt-2">
            Podés publicar anuncios con o sin crear una cuenta. Al publicar, sos responsable de que
            la información sea veraz (precio, disponibilidad, estado del producto o servicio) y de
            que tengas derecho a ofrecer lo que publicás. No permitimos anuncios de productos
            ilegales, falsificados, ni contenido engañoso, difamatorio o que viole derechos de
            terceros.
          </p>
        </section>

        <section>
          <h2 className="font-semibold">3. Verificación de cuentas y negocios</h2>
          <p className="mt-2">
            Por ahora, Paseo Textil no exige documentación (como CUIT) para crear una cuenta o
            publicar como negocio, para mantener el registro simple mientras el sitio crece. Un
            negocio &quot;verificado&quot; en el futuro podrá pasar por un chequeo adicional, pero
            hoy la ausencia de la insignia no implica que un anuncio sea falso, ni su presencia
            futura una garantía absoluta.
          </p>
        </section>

        <section>
          <h2 className="font-semibold">4. Transacciones entre usuarios</h2>
          <p className="mt-2">
            Paseo Textil es un punto de encuentro: publicás, cotizás y te contactás, pero la compra,
            venta o acuerdo de servicio ocurre directamente entre las partes, fuera de la
            plataforma. No somos parte de esas transacciones, no procesamos pagos ni garantizamos
            el resultado de ningún acuerdo.
          </p>
          <p className="mt-2 rounded-xl bg-muted/60 p-3">
            <strong>Aviso importante:</strong> ni la insignia de &quot;negocio verificado&quot; ni las
            reseñas de otros usuarios son una garantía de que un proveedor vaya a cumplir. Son señales
            que ayudan a decidir, no una certificación. Antes de pagar una seña o el total de un
            pedido, te recomendamos pedir referencias, ver trabajos anteriores y, si podés, empezar con
            un pedido chico antes de uno grande.
          </p>
        </section>

        <section>
          <h2 className="font-semibold">5. El muro y las publicaciones sociales</h2>
          <p className="mt-2">
            El muro es un espacio público del rubro textil: lo que publiques (texto, fotos, videos)
            puede verlo cualquier visitante del sitio, salvo que tu perfil esté configurado como
            privado. Vos conservás los derechos sobre tu contenido; al publicarlo nos das permiso
            para mostrarlo dentro de Paseo Textil.
          </p>
        </section>

        <section>
          <h2 className="font-semibold">6. Conducta esperada</h2>
          <p className="mt-2">
            No está permitido el acoso, spam, contenido ilegal, ni usar la mensajería directa o los
            comentarios para fines distintos a los del sitio. Cualquier publicación o cuenta puede
            reportarse; nos reservamos el derecho de pausar, editar solicitudes de baja o eliminar
            contenido que incumpla estas reglas.
          </p>
        </section>

        <section>
          <h2 className="font-semibold">7. Cambios</h2>
          <p className="mt-2">
            Estos términos pueden actualizarse a medida que el sitio evoluciona. Los cambios
            importantes se van a reflejar en esta misma página.
          </p>
        </section>

        <section>
          <h2 className="font-semibold">8. Contacto</h2>
          <p className="mt-2">
            ¿Consultas sobre estos términos? Escribinos a través de la mensajería del sitio una vez
            que tengas una cuenta creada.
          </p>
        </section>

        <p className="text-xs text-muted-foreground">
          Ver también nuestra{" "}
          <Link href="/legales/privacidad" className="text-primary underline">
            política de privacidad
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
