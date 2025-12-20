# Domain Contracts (HTTP) - Vendor ↔ Inventory ↔ Factory ↔ Permit

## Principios

- **Single-tenant**.
- Integración **sincrónica por HTTP** (MVP).
- **API keys** viven en el server (proxies `/app/api/*` en Next para el frontend).
- **Fuentes de verdad**:
  - Permit: users, (futuro) RBAC, audit logs, notifications
  - Factory: catálogo interno de manufactura (internal items)
  - Inventory: catálogo externo, precio base, stock, embarques; mapping internal→external
  - Vendor: órdenes, negociación (override), pagos manuales, y “vista” de envíos/stock

## Nomenclatura de IDs

- `internalItemId`: ID del item interno (Factory)
- `externalSkuId`: ID del SKU externo (Inventory)
- `orderId`: ID de la orden (Vendor)
- `shipmentId`: ID del embarque (Inventory)

## Contrato: Vendor → Permit

### Users (source of truth)
- `GET /v1/users/`
- `GET /v1/users/:id`
- `POST /v1/users/`
- `PUT /v1/users/:id`
- `DELETE /v1/users/:id`

### Audit (registrar cambios sensibles de ventas)
Propuesta mínima:
- `POST /v1/audit-logs`
  - eventos recomendados:
    - `order.created`
    - `order.updated`
    - `order.cancelled`
    - `order.paid_marked`
    - `order.item.price_overridden`

### Notifications
- `GET /v1/notifications?userId=&unreadOnly=&limit=`
- `GET /v1/notifications/unread-count?userId=`
- `PUT /v1/notifications/:id/read?userId=`
- `PUT /v1/notifications/read-all?userId=`
- `GET /v1/notifications/preferences?userId=`
- `PUT /v1/notifications/preferences?userId=`

## Contrato: Vendor → Inventory

Vendor consume catálogo externo, disponibilidad/stock y envíos. Inventory es fuente de verdad.

### Catálogo externo (lectura)
- `GET /v1/external-products?search=&status=&limit=&offset=`
  - `status`: `active|inactive|archived`
  - responde paginado
- `GET /v1/external-products/:externalSkuId`

### Precio base (lectura)
Incluido en external-products, pero puede existir endpoint específico:
- `GET /v1/pricing/external-products/:externalSkuId`

### Disponibilidad / Stock (lectura)
- `GET /v1/availability?externalSkuId=&warehouseId=`
  - responde:
    - `onHand`
    - `available`
    - `reserved`
    - `updatedAt`

## Contrato: Vendor → Shipments

Shipments es el dominio fuente de verdad de embarques/tracking.

### Embarques (lectura)
- `GET /v1/shipments?orderId=`
- `GET /v1/shipments/:shipmentId`

### Reserva (fase posterior)
Para evitar overselling, cuando se active:
- `POST /v1/reservations`
  - body: `orderId`, `lines[{externalSkuId, quantity}]`
  - respuesta: reservationId, breakdown

## Contrato: Inventory → Factory

Inventory necesita resolver el catálogo interno (manufactura) y mantener el mapping.

### Catálogo interno (lectura)
- `GET /v1/internal-items?search=&status=&limit=&offset=`
- `GET /v1/internal-items/:internalItemId`

### Atributos manufactura (lectura)
Opcional, pero previsto:
- `GET /v1/internal-items/:internalItemId/attributes`

## Contrato: Mapping (Inventory mantiene relación internal→external)

### Crear/editar mapping
- `POST /v1/mappings/internal-to-external`
  - body:
    - `internalItemId`
    - `externalSkuId`
    - `conversionRules` (e.g., factores, empaque, rendimiento)
    - `notes`
- `PUT /v1/mappings/internal-to-external/:mappingId`

### Consultar mapping
- `GET /v1/mappings/internal-to-external?internalItemId=&externalSkuId=`

## Errores y estandarización

Recomendación: todos los servicios devuelven JSON consistente:

```json
{
  "error": "string",
  "message": "string",
  "details": {}
}
```

Y status codes estándar:
- 400: validación
- 401: no autorizado (api key)
- 403: forbidden (RBAC, futuro)
- 404: no encontrado
- 409: conflicto (ej. mapping duplicado, reserva insuficiente)
- 422: regla de negocio
- 429: rate limit
- 500: error interno


