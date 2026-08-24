# Paseo Textil

La plaza textil argentina online — anuncios, feria virtual y cotización sin trámites.

## Estado actual (MVP en construcción, Fase 1)

Funcionando de punta a punta en local, con datos de prueba (sin base de datos real todavía):

- **Home** (`/`) — hero, buscador, categorías, anuncios recientes, estadísticas.
- **Catálogo** (`/anuncios`) — búsqueda por texto, filtro por categoría.
- **Ficha de anuncio** (`/anuncios/[id]`) — galería, precio mayor/menor/consultar, datos del vendedor, formulario de cotización **sin necesidad de registrarse**.
- **Publicar** (`/publicar`) — publicar un anuncio sin crear cuenta, con opción de "publicar como negocio" (solo pide nombre del negocio, **sin CUIT ni documentación** — decisión de producto para minimizar fricción mientras no haya tráfico).

Todo probado a mano en el navegador (desktop y mobile) y sin errores de TypeScript ni de ESLint.

## Qué falta para que sea un sitio real online (tareas tuyas, ~10-15 min)

Estos dos pasos **no los puedo hacer yo** porque requieren crear cuentas a tu nombre:

### 1. Crear proyecto en Supabase (la base de datos)
1. Andá a [supabase.com](https://supabase.com) y creá una cuenta gratis.
2. Creá un proyecto nuevo (elegí una región cercana, ej. São Paulo).
3. Una vez creado, andá a **Project Settings → API** y copiá:
   - `Project URL`
   - `anon public key`
4. Pegalos en un archivo `.env.local` en la raíz del proyecto (copiá `.env.local.example` y completalo).
5. Andá a **SQL Editor** en Supabase, pegá el contenido completo de [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) y ejecutalo. Esto crea todas las tablas y las categorías iniciales.

### 2. Crear proyecto en Vercel (el hosting)
1. Andá a [vercel.com](https://vercel.com) y creá una cuenta gratis (podés usar tu GitHub).
2. Conectá este proyecto (necesita estar en un repositorio de GitHub — si no tenés uno todavía, avisame y lo armamos juntos).
3. En la configuración del proyecto en Vercel, cargá las mismas variables de entorno del paso 1 (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
4. En **Domains**, agregá `paseotextil.com` y seguí las instrucciones para apuntar el DNS del dominio (esto lo hacés donde compraste el dominio).

Con esos dos pasos hechos, avisame y conecto el código para que use la base de datos real en vez de los datos de prueba — es un cambio acotado, no hay que reescribir nada.

## Cómo correr el proyecto en local

```bash
npm install
npm run dev
```

Abrí http://localhost:3000 — funciona ya mismo con datos de prueba, no hace falta configurar nada.

## Estructura del código

- `src/app/` — páginas (Next.js App Router)
- `src/components/` — componentes de UI reutilizables
- `src/lib/data/` — capa de acceso a datos (hoy lee de memoria, mañana lee de Supabase — el resto de la app no debería cambiar)
- `src/lib/supabase/` — clientes de Supabase, listos para cuando existan las credenciales
- `supabase/migrations/0001_init.sql` — esquema completo de base de datos, listo para ejecutar

## Decisiones de producto ya tomadas

- **Sin verificación fuerte por ahora.** Publicar y crear perfil de negocio es liviano (nombre + contacto), sin pedir documentación. La verificación tipo Poshmark queda para una fase futura, como insignia opcional.
- **Diseño inspirado en Semillero Textil** (tipografía audaz, alto contraste) pero con paleta propia (crema + terracota), no una copia.
- Ver el informe completo de investigación y el plan detallado en `../CEO DENIS AGENTE/investigaciones/sitio-anuncios-textiles/INFORME-COMPLETO.md`.
