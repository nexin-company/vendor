# Platform Analysis (ERP modular multi-dominio)

## Objetivo

Construir una plataforma modular tipo ERP, **single-tenant**, con dominios separados:

- **Vendor**: ventas (clientes, órdenes, precios negociados, pagos manuales, visibilidad de envíos)
- **Inventory**: catálogo externo + precio base + stock + embarques (fuente de verdad operativa)
- **Factory**: catálogo interno de manufactura (fuente de verdad de manufactura)
- **Permit** (servicio transversal): usuarios, RBAC (futuro hardening), auditoría, notificaciones

La integración entre dominios será **sincrónica por HTTP**.

## Estado actual (lo que ya existe)

### Vendor Frontend (`vendor-juampamillan/vendor-frontend`)

- **Productos**
  - UI implementada y funcional (`app/(dashboard)/products/*`).
  - Búsqueda/paginación y CRUD desde cliente (`ProductsPageClient`) vía `lib/api.ts`.
- **Dashboard**
  - Muestra métricas agregadas con fetch server-side (`app/(dashboard)/page.tsx`) usando `lib/api-server.ts`.
- **Usuarios**
  - Módulo funcional (`app/(dashboard)/users/*`), consumiendo usuarios desde Permit.
- **Clientes / Órdenes**
  - **Inconcluso**: páginas placeholder “próximamente”
    - `app/(dashboard)/customers/page.tsx`
    - `app/(dashboard)/orders/page.tsx`
- **Proxy API (seguridad API keys)**
  - Permit proxy: `app/api/permit/*`
  - Vendor proxy: `app/api/vendor/*` (productos/clientes/órdenes)

### Vendor Backend (`vendor-juampamillan/vendor-backend`)

- Endpoints disponibles (v1):
  - `GET/POST/PUT/DELETE /v1/products`
  - `GET/POST/PUT/DELETE /v1/customers`
  - `GET/POST/PUT/DELETE /v1/orders`
- Modelado actual:
  - `products`: incluye `price`, `stock` (esto chocará con la decisión de que stock/precio base viva en Inventory)
  - `orders`: **orden simple** (no tiene líneas/items ni descuentos por línea)
- También existen módulos `api-keys` y `notifications` (por definir ownership definitivo vs Permit).

### Permit Backend (`permit-juampamillan/permit-backend`)

Servicio transversal consolidado (ya existe):
- Users
- RBAC (roles/permissions/resources)
- Audit logs
- Notifications
- API keys + rate limiting

## Fix de integración aplicado (para cerrar inconsistencias)

Se corrigió el cliente público para no mezclar proxies:

- `vendor-frontend/lib/api.ts`
  - Permit: `PERMIT_API_BASE_URL = '/api/permit'`
  - Vendor: `VENDOR_API_BASE_URL = '/api/vendor'`

Esto evita que productos/clientes/órdenes intenten pegarle a rutas antiguas bajo `/api/permit/...`.

## Gaps / funcionalidades inconclusas (qué falta para un MVP real)

### Clientes
- CRUD completo + búsqueda
- Detalle de cliente con:
  - direcciones/contactos/notas
  - historial de órdenes
  - estado de cuenta (fase posterior)

### Órdenes (ventas)
MVP acordado requiere:
- Orden con **líneas**:
  - producto/SKU (externo de Inventory)
  - cantidad
  - precio por línea (con **override permitido**)
  - descuento por línea y/o por orden
  - totales calculados
- Estados de orden (propuesta):
  - `draft → confirmed → fulfillment_requested → shipped → delivered → cancelled`
- Estados de pago (propuesta):
  - `unpaid → partial → paid` (refund opcional a futuro)

### Pagos manuales (transferencia)
- Captura manual por el vendedor:
  - banco/cuenta destino
  - referencia/folio
  - fecha
  - monto
  - comprobante (archivo)
  - notas
- Acción “Marcar como pagado” y registro de auditoría (Permit).

### Envíos (visibilidad)
- Vendor solo **consulta** y muestra:
  - shipments asociados a orderId
  - carrier/guía/tracking
  - eventos/estatus
La creación/gestión del embarque vive en Inventory/Shipping.

## Decisiones de dominio (fuentes de verdad)

- **Users**: solo en Permit (Vendor no duplica users).
- **Catálogo externo + precio base + stock + embarques**: en Inventory.
- **Catálogo interno (manufactura)**: en Factory.
- **Mapping internal→external**: en Inventory.
- **Vendor**: registra órdenes, negociación (override por línea), pagos manuales, y consume estado de embarque.

## Riesgos clave (a gestionar desde el diseño)

- **Duplicación de catálogo/precios/stock**: evitar que Vendor “reanote” stock o precio base como verdad.
- **Consistencia eventual (futura)**: aunque hoy sea HTTP sincrónico, envíos/stock cambian; Vendor debe tolerar discrepancias temporales.
- **Auditoría/seguridad**: cambios sensibles (override de precio, marcar pagado, cancelar orden) deben auditarse vía Permit.


