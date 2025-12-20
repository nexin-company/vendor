# Vendor MVP - Órdenes con líneas, negociación, pagos manuales y visibilidad de envíos

## Objetivo del MVP

Permitir que un vendedor/admin:
- cree y gestione **órdenes con productos (líneas)**,
- negocie precio por línea (**override**),
- aplique **descuentos**,
- registre **pagos manuales** (transferencia) y marque la orden como pagada,
- vea el estado de **embarques/tracking** (gestionados por Inventory/Shipping).

## Alcance / No alcance

### Incluye
- CRUD de órdenes
- Líneas de orden (items)
- Cálculo de totales
- Override de precio por línea con razón
- Descuentos por línea y por orden (opcional por orden si se decide)
- Pago manual por transferencia (captura y asociación a orden)
- Integración de lectura de envíos desde Inventory

### No incluye (por ahora)
- Pasarelas de pago
- Facturación fiscal
- Conciliación bancaria automática
- Reservas de stock obligatorias (se deja para fase posterior)

## Modelo de datos propuesto (Vendor Backend)

### orders
Campos mínimos:
- `id`
- `customerId`
- `status` (ver estados abajo)
- `currency` (ej. `MXN`)
- `subtotal`
- `discountTotal`
- `taxTotal` (opcional si aplica)
- `total`
- `paymentStatus` (unpaid|partial|paid)
- `createdAt`, `updatedAt`

### order_items
Campos mínimos:
- `id`
- `orderId`
- `externalSkuId` (SKU del catálogo externo en Inventory)
- `externalSkuNameSnapshot` (snapshot opcional para histórico)
- `quantity`
- `unitPriceBase` (precio base leído de Inventory al momento)
- `unitPriceFinal` (precio final negociado/override)
- `discountType` (percent|amount)
- `discountValue`
- `lineSubtotal`
- `lineTotal`
- `priceOverrideReason` (nullable)

### payment_records
Campos mínimos:
- `id`
- `orderId`
- `method` = `bank_transfer`
- `bankName` (opcional)
- `reference` (folio/rastreo)
- `amount`
- `paidAt`
- `evidenceUrl` (o referencia a storage)
- `notes`
- `createdByUserId` (usuario Permit)

### order_status_events (opcional MVP, recomendado)
Para timeline:
- `id`
- `orderId`
- `fromStatus`
- `toStatus`
- `note`
- `createdByUserId`
- `createdAt`

## Estados

### order.status (negocio)
- `draft`: editable
- `confirmed`: bloquea líneas (o requiere permiso para editar)
- `fulfillment_requested`: se notificó a Inventory/Shipping (futuro)
- `shipped`: shipment en tránsito (viene de Inventory)
- `delivered`: entregada
- `cancelled`: cancelada

### order.paymentStatus
- `unpaid`
- `partial`
- `paid`

Reglas:
- No se debe marcar `paid` si el total de `payment_records.amount` < `order.total` (salvo excepción autorizada).

## Reglas de negocio clave

### Precio y descuentos
- Inventory es fuente de verdad de **precio base**.
- Vendor puede override por línea:
  - `unitPriceFinal` puede diferir de `unitPriceBase`.
  - Debe capturarse `priceOverrideReason`.
  - Auditar el evento en Permit (ver abajo).

### Cambios de orden y auditoría
Toda acción sensible genera audit log (Permit):
- crear orden
- editar líneas
- override de precio
- cancelar orden
- registrar pago / marcar pagado

## Endpoints (Vendor Backend) propuestos

MVP:
- `GET /v1/orders` (lista)
- `GET /v1/orders/:id` (detalle + items + pagos + shipments (agregado por Vendor llamando Inventory))
- `POST /v1/orders` (crear draft con items)
- `PUT /v1/orders/:id` (editar draft/confirmed con reglas)
- `POST /v1/orders/:id/payments` (registrar transferencia)
- `POST /v1/orders/:id/mark-paid` (opcional; o deducir por suma de pagos)
- `POST /v1/orders/:id/cancel`

## UX mínimo (Vendor Frontend)

### Lista de órdenes
- filtros: status, paymentStatus, cliente, rango fechas
- columnas: #, cliente, total, status, paymentStatus, createdAt

### Crear orden (wizard simple)
1) Seleccionar cliente (o crear rápido)
2) Agregar líneas (buscar SKU externo desde Inventory)
3) Editar qty, unitPriceFinal (override), discount
4) Confirmar

### Detalle de orden
- Resumen: cliente, estados, totales
- Líneas con breakdown
- Pagos: lista + botón “Registrar transferencia”
- Envíos: tracking (read-only, desde Inventory)

## Dependencias con otros dominios

- **Inventory**:
  - catálogo externo (`external-products`)
  - disponibilidad (`availability`)
  - shipments (`shipments?orderId=`)
- **Permit**:
  - users (quién hizo cambios)
  - audit logs
  - notifications (alertas al vendedor/admin)


