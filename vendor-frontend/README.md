# Vendor Frontend - Dashboard de Ventas

Dashboard administrativo para el módulo **Vendor** (ventas). Este frontend se integra con el ecosistema ERP modular:

- **Permit** (servicio transversal): usuarios + (futuro) RBAC + auditoría + notificaciones
- **Vendor Backend**: clientes/órdenes (y temporalmente productos)
- **Inventory Backend** (próximo): catálogo externo + precio base + stock + mapping
- **Shipments Backend** (próximo): tracking/embarques (read-only)

## 🚀 Características

- ✅ Autenticación con NextAuth (GitHub)
- ✅ Layout estilo dashboard (app launcher + notificaciones + user menu)
- ✅ Productos: listado + búsqueda + paginación + CRUD (actual)
- ⏳ Clientes: (placeholder, por completar)
- ⏳ Órdenes: (placeholder, por completar)
- ✅ Usuarios: gestión desde Permit (fuente de verdad)
- ✅ API keys protegidas server-side vía proxies `/app/api/*`
- ✅ Componentes UI con Radix + Shadcn
- ✅ Diseño responsive

## 🛠️ Stack Tecnológico

- **Next.js 15** - Framework React con App Router
- **TypeScript** - Tipado estático
- **Radix UI** - Componentes primitivos accesibles
- **Shadcn UI** - Componentes construidos sobre Radix
- **Tailwind CSS** - Framework de estilos
- **NextAuth.js** - Autenticación
- **Lucide React** - Iconos

## 📦 Instalación

```bash
# Instalar dependencias
bun install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus valores
```

## 🔧 Configuración

### Variables de Entorno

Crea un archivo `.env.local` con las siguientes variables:

```env
# Permit (users, notifications, audit, RBAC)
PERMIT_API_URL=http://localhost:8000

PERMIT_API_KEY=tu-api-key-secreta

# Vendor Backend (clientes/órdenes)
VENDOR_API_URL=http://localhost:8001
VENDOR_API_KEY=tu-api-key-secreta

# Logistics Backend (catálogo externo/precio base/stock/mapping/shipments)
LOGISTIC_API_URL=http://localhost:8004
LOGISTIC_API_KEY=tu-api-key-secreta

# NextAuth
AUTH_GITHUB_ID=tu-github-client-id
AUTH_GITHUB_SECRET=tu-github-client-secret
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=tu-secret-key-aleatoria
```

### Seguridad

- Las API keys viven **solo en el servidor** (Next.js API Routes):
  - `app/api/permit/*` agrega `PERMIT_API_KEY`
  - `app/api/vendor/*` agrega `VENDOR_API_KEY`
  - `app/api/logistic/*` agrega `LOGISTIC_API_KEY`

## 🚀 Desarrollo

```bash
# Ejecutar en modo desarrollo
bun run dev

# La aplicación estará en http://localhost:3000
```

## 📁 Estructura del Proyecto (alto nivel)

```
app/
├── (dashboard)/          # Rutas del dashboard (requieren autenticación)
│   ├── page.tsx         # Dashboard principal
│   ├── users/           # Módulo de usuarios
│   ├── products/        # Productos
│   ├── customers/       # Clientes (placeholder)
│   └── orders/          # Órdenes (placeholder)
├── api/
│   ├── auth/            # NextAuth routes
│   ├── permit/          # Proxy hacia Permit
│   └── vendor/          # Proxy hacia Vendor Backend
└── login/               # Página de login

lib/
├── api.ts               # Cliente público (usa /api/vendor y /api/permit)
├── api-server.ts        # Cliente server-side (server components)
└── auth.ts              # Configuración NextAuth
```

## 🔐 Arquitectura de Seguridad (proxy)

```
Cliente (Browser)
    ↓
Next.js API Routes (/api/permit/*)
    ↓ (verifica NextAuth)
    ↓ (agrega API key server-side)
Backends (Permit / Vendor / Inventory / Shipments)
```

1. El cliente llama a `/api/permit/*` o `/api/vendor/*` (por ejemplo)
2. La ruta API verifica que el usuario esté autenticado con NextAuth
3. La ruta API agrega la API key al header `X-API-Key`
4. La ruta API hace la llamada al backend real
5. El backend valida la API key y responde
6. La respuesta se devuelve al cliente

## 📖 Páginas Disponibles

- `/` - Dashboard principal con estadísticas
- `/users` - Gestión de usuarios
- `/products` - Productos
- `/customers` - Clientes (en progreso)
- `/orders` - Órdenes (en progreso)
- `/login` - Página de login

## 📌 Roadmap / Backlog (resumen)

### Must (V1)
- Clientes (CRUD + historial de órdenes).
- Órdenes con líneas (SKU externo), descuentos, override por línea + reason.
- Pagos manuales por transferencia.
- Visibilidad de embarques/tracking (Shipments).

### Should
- Reportes y exportaciones CSV.
- Auditoría y notificaciones para eventos críticos.

### Could
- Approval workflows (RBAC).
- Reservas de stock y validaciones operativas (fase posterior).

## 🎨 Componentes

Todos los componentes siguen el estilo de Shadcn UI basado en Radix:

- **Tablas**: Con acciones de crear, editar, eliminar
- **Formularios**: Con validación y manejo de errores
- **Dialogs**: Para modales de formularios
- **Cards**: Para mostrar información

## 📝 Licencia

Este proyecto es privado.
