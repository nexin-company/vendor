# Roadmap (Vendor + Inventory + Factory + Permit)

## Objetivo del programa

Entregar un ERP modular multi-dominio (single-tenant) donde:
- **Vendor** resuelve ventas (clientes, órdenes con líneas, negociación, pagos manuales y visibilidad de envíos).
- **Inventory** resuelve catálogo externo, precio base, stock y embarques.
- **Factory** resuelve catálogo interno de manufactura.
- **Permit** resuelve usuarios/RBAC/auditoría/notificaciones como servicio transversal.

Integración **sincrónica por HTTP**.

## Estado actual (baseline)

- Vendor: productos OK; clientes/órdenes incompletos en UI.
- Vendor Backend: CRUD básico de products/customers/orders sin order items ni pagos.
- Permit: servicios transversales completos.
- Inventory/Factory repos: creados a nivel carpeta, aún sin contenido implementado.

## Fases

### Fase 0 — Cerrar inconclusos y estabilizar integración (1–2 semanas)

**Objetivo**: que el sistema sea navegable y consistente.

- **Vendor Frontend**
  - Completar UI de clientes (lista + CRUD básico).
  - Completar UI de órdenes (lista + detalle placeholder real).
  - Estabilizar cliente API con proxies separados:
    - `/api/permit` (users/notifications)
    - `/api/vendor` (products/customers/orders)
- **Vendor Backend**
  - Mantener CRUD existente mientras se define el modelo de órdenes con líneas.

**Criterios de aceptación**
- Clientes y órdenes dejan de mostrar “próximamente”.
- No hay rutas rotas; productos se leen por `/api/vendor`.

### Fase 1 — Órdenes con líneas + negociación + pagos manuales (2–4 semanas)

**Objetivo**: valor real de ventas.

- **Vendor Backend**
  - Introducir: `order_items`, `payment_records`, (opcional) `order_status_events`.
  - Endpoints: creación/edición de orden con items; registrar transferencia; estados.
- **Vendor Frontend**
  - Crear orden con líneas (SKU de Inventory).
  - Override por línea + razón.
  - Registro de transferencia y marcado de pago.
- **Permit**
  - Audit logs para acciones sensibles.

**Criterios de aceptación**
- Se puede crear una orden con 2+ items y ver totales correctos.
- Se puede registrar pago manual (transferencia) y pasar a paid.
- Se generan registros de auditoría para override/cancel/pay.

### Fase 2 — Inventory MVP (catálogo externo + precio base + stock + mapping) (3–6 semanas)

**Objetivo**: mover la “fuente de verdad” de catálogo/stock/precios a Inventory.

- **Inventory Backend**
  - External products, warehouses, stock availability
  - Mapping Factory→External
- **Vendor**
  - Consumir catálogo externo desde Inventory (HTTP) para búsqueda/selección de SKUs.

**Criterios de aceptación**
- Vendor lista SKUs desde Inventory.
- Vendor puede consultar disponibilidad.
- Existen mappings internal→external administrables desde Inventory.

### Fase 3 — Embarques/Tracking (3–6 semanas)

**Objetivo**: operación conectada (sin mover el control del embarque a Vendor).

- **Shipments Backend**
  - Shipments, tracking, eventos
- **Vendor**
  - Vista de envíos por orden (read-only desde Shipments)

**Criterios de aceptación**
- Vendor muestra tracking por ordenId.
- Vendor refleja estatus “shipped/delivered” en UI (derivado de shipments).

### Fase 4 — Reportes y control operativo (continuo)

- Reportes de ventas, clientes top, productos top.
- Exportaciones CSV.
- Controles de edición (locks, approvals).

### Fase 5 — Hardening ERP modular (continuo)

- RBAC fino con Permit.
- Auditoría completa.
- Versionado de contratos y compatibilidad entre dominios.

## Riesgos y mitigaciones

- **Duplicación de fuente de verdad**: minimizar campos “stock/price base” en Vendor cuando Inventory esté listo.
- **Cambios sensibles sin gobierno**: usar audit logs + (futuro) RBAC en Permit.
- **Acoplamiento entre dominios**: contracts claros y versionados.

## Documentos relacionados

- `vendor-docs/PLATFORM_ANALYSIS.md`
- `vendor-docs/DOMAIN_CONTRACTS.md`
- `vendor-docs/VENDOR_MVP_ORDERS_SPEC.md`
- `vendor-docs/INVENTORY_MVP_SPEC.md`


