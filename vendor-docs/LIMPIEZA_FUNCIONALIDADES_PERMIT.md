# Limpieza de Funcionalidades de Permit

## Resumen

Este documento lista todas las funcionalidades, componentes y archivos relacionados con **Permit** que deben ser removidos de `vendor-frontend`, ya que pertenecen a un sistema diferente (gestión de permisos y recursos humanos) y no forman parte del sistema **Vendor** (gestión de productos y ventas).

## Funcionalidades a Remover

### 1. Páginas del Dashboard

#### ❌ Remover completamente:
- `app/(dashboard)/absences/` - Gestión de ausentismos
- `app/(dashboard)/assignments/` - Asignaciones de roles y permisos
- `app/(dashboard)/audit/` - Auditoría del sistema
- `app/(dashboard)/notifications/` - Sistema de notificaciones
- `app/(dashboard)/org-chart/` - Organigrama organizacional
- `app/(dashboard)/performance/` - Evaluaciones de desempeño
- `app/(dashboard)/permissions/` - Gestión de permisos
- `app/(dashboard)/rbac/` - Control de acceso basado en roles
- `app/(dashboard)/resources/` - Gestión de recursos
- `app/(dashboard)/roles/` - Gestión de roles

#### ✅ Mantener:
- `app/(dashboard)/products/` - Gestión de productos
- `app/(dashboard)/customers/` - Gestión de clientes
- `app/(dashboard)/orders/` - Gestión de órdenes
- `app/(dashboard)/users/` - Gestión de usuarios del sistema (NO roles/permisos)

### 2. APIs a Remover

#### ❌ Remover completamente:
- `app/api/permit/available/` - Recursos disponibles
- `app/api/permit/leave-requests/` - Solicitudes de ausencia
- `app/api/permit/leave-types/` - Tipos de ausencia
- `app/api/permit/org-chart/` - Organigrama
- `app/api/permit/permissions/` - Permisos
- `app/api/permit/resources/` - Recursos
- `app/api/permit/role-permissions/` - Asignación de permisos a roles
- `app/api/permit/roles/` - Roles
- `app/api/permit/user-roles/` - Asignación de roles a usuarios
- `app/api/permit/v1/audit-logs/` - Logs de auditoría
- `app/api/permit/v1/notifications/` - Notificaciones
- `app/api/permit/v1/performance/` - Evaluaciones de performance

#### ✅ Mantener:
- `app/api/permit/vendor/products/` - Productos
- `app/api/permit/vendor/customers/` - Clientes
- `app/api/permit/vendor/orders/` - Órdenes
- `app/api/permit/users/` - Usuarios del sistema (sin roles/permisos)

### 3. Componentes a Remover

#### ❌ Remover completamente:
- `components/notifications/` - Componentes de notificaciones
- `components/permission-guard.tsx` - Guard de permisos
- `components/app-launcher.tsx` - Si está relacionado con permit

#### ✅ Mantener:
- `components/delete-confirm-dialog.tsx` - Diálogo genérico
- `components/table-pagination.tsx` - Componente genérico
- `components/table-search.tsx` - Componente genérico
- `components/table-skeleton.tsx` - Componente genérico
- Todos los componentes UI de shadcn

### 4. Librerías y Utilidades a Limpiar

#### ❌ Remover de `lib/`:
- `lib/permissions-events.ts` - Eventos de permisos
- `lib/permissions.tsx` - Utilidades de permisos
- `lib/sync-user.ts` - Sincronización de usuario (si es de permit)
- `lib/schemas/permission.ts` - Schema de permisos
- `lib/schemas/resource.ts` - Schema de recursos
- `lib/schemas/role.ts` - Schema de roles

#### ✅ Mantener:
- `lib/api.ts` - Cliente API (limpiar APIs de permit)
- `lib/api-server.ts` - API server-side (limpiar APIs de permit)
- `lib/auth.ts` - Autenticación
- `lib/db.ts` - Base de datos (si existe)
- `lib/toast.ts` - Utilidades de toast
- `lib/utils.ts` - Utilidades generales
- `lib/rate-limit.ts` - Rate limiting
- `lib/rate-limit-helper.ts` - Helper de rate limiting

### 5. Navegación a Limpiar

#### ❌ Remover del layout:
- NavItem para "Permisos" (Shield)
- NavItem para "Asignaciones" (UserCheck)
- NavItem para "Organigrama" (Network)
- NavItem para "Ausentismos" (Calendar)
- NavItem para "Performance" (TrendingUp)
- NavItem para "Auditoría" (FileSearch)
- NavItem para "Roles" (si existe)
- NavItem para "Recursos" (si existe)

#### ✅ Mantener en navegación:
- Home
- Productos (Package)
- Órdenes (ShoppingCart)
- Clientes (Users2)
- Usuarios (Users) - Solo gestión básica
- Configuración (Settings)

### 6. Dashboard Principal

#### ❌ Remover:
- Estadísticas de RBAC (usuarios, roles, recursos, permisos)
- Estadísticas de HR (solicitudes pendientes, evaluaciones, indicadores)
- Notificaciones no leídas
- Gráficos de ausentismos
- Solicitudes recientes de ausencia
- Evaluaciones recientes

#### ✅ Mantener/Agregar:
- Estadísticas de productos (total, activos, inactivos)
- Estadísticas de órdenes (total, pendientes, completadas)
- Estadísticas de clientes (total)
- Órdenes recientes
- Productos más vendidos (futuro)

### 7. Archivos de Configuración

#### Revisar y limpiar:
- `app/(dashboard)/dashboard-charts.tsx` - Si solo tiene gráficos de permit
- `app/(dashboard)/page-title.tsx` - Verificar si tiene lógica de permit
- `app/(dashboard)/search.tsx` - Verificar si es genérico o específico de permit

### 8. Dependencias del package.json

#### Revisar si se pueden remover:
- `recharts` - Si solo se usa para gráficos de permit
- `redoc` - Si solo se usa para documentación de permit
- `swagger-jsdoc` - Si solo se usa para documentación de permit

#### ✅ Mantener:
- Todas las dependencias de UI (shadcn)
- Next.js, React, TypeScript
- NextAuth
- Drizzle ORM
- Bun

## Plan de Acción

1. ✅ Crear definición funcional
2. ⏳ Remover páginas del dashboard
3. ⏳ Remover APIs relacionadas
4. ⏳ Limpiar componentes
5. ⏳ Limpiar librerías
6. ⏳ Actualizar navegación
7. ⏳ Actualizar dashboard principal
8. ⏳ Limpiar imports y referencias
9. ⏳ Verificar que no queden referencias rotas

