# Nexus CMS

Multi-tenant CMS con API headless. Editas contenido en el panel, tus websites lo consumen por API.

## Stack
- Next.js 16, TypeScript, Prisma, PostgreSQL, Tailwind v4, shadcn/ui

## Deploy rápido

```bash
# 1. Clonar
git clone <repo-url>
cd api

# 2. Instalar
pnpm install

# 3. Base de datos (crea una DB en neon.tech o railway)
cp .env.example .env
# Edita .env con tu DATABASE_URL de PostgreSQL
pnpm prisma db push
pnpm prisma db seed

# 4. Iniciar local
pnpm dev

# 5. Subir a Vercel
npx vercel --prod
```

## Flujo de trabajo

1. Abres `https://tu-cms.vercel.app/login` → admin / admin123
2. Creas sitios y páginas desde el panel
3. Tu website (The Z, blog, etc.) consume la API:

```js
const data = await fetch("https://tu-cms.vercel.app/api/sites");
const pages = await fetch("https://tu-cms.vercel.app/api/pages?siteId=1");
```

4. Editas contenido → recargas tu web → ves los cambios

## Archivos importantes

| Archivo | Qué hace |
|---------|----------|
| `The Z/` | Sitio web del clan The Z (standalone, desplegado aparte) |
| `The Z/demo-standalone.html` | Página demo auto-contenida (solo cambiar CMS_URL) |
| `The Z/cms-config.js` | Configuración de conexión para The Z |
| `prisma/seed.ts` | Datos iniciales (admin, sitio demo, contenido The Z) |
| `src/proxy.ts` | Seguridad + CORS de la API |

## Variables de entorno

```
DATABASE_URL=postgresql://...
SESSION_SECRET=clave-segura-aleatoria
```
