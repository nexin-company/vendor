# Inventory MVP - Catálogo externo, precio base, stock y mapping Factory→External

## Rol del dominio Inventory

Inventory es el **source of truth** de:
- Catálogo externo (ventas): SKUs, presentaciones, UOM, impuestos, estatus
- Precio base y vigencia
- Stock por almacén, disponibilidad y reservas
- Mapping entre catálogo interno (Factory) y externo (Inventory)

Vendor **no** administra estos datos: solo los consume.

## MVP Inventory (fase inicial)

### 1) Catálogo externo
Entidad: `external_product`
- `externalSkuId`
- `sku` (string visible)
- `name`
- `presentation` (ej. “Saco 25kg”, “Tarima”, etc.)
- `uom` (unidad de venta)
- `status` (active|inactive|archived)
- `basePrice` (moneda + valor)
- `taxProfile` (opcional)
- `createdAt`, `updatedAt`

Endpoints:
- `GET /v1/external-products?search=&status=&limit=&offset=`
- `GET /v1/external-products/:externalSkuId`

### 2) Stock y disponibilidad
Entidad: `warehouse`
- `warehouseId`, `name`

Entidad: `stock_balance`
- `externalSkuId`
- `warehouseId`
- `onHand`
- `reserved`
- `available`
- `updatedAt`

Endpoints:
- `GET /v1/warehouses`
- `GET /v1/availability?externalSkuId=&warehouseId=`

Notas:
- En MVP se puede calcular `available = onHand - reserved`.
- Reservas (`POST /v1/reservations`) se deja para fase posterior, o se incluye como “optional early”.

### 3) Mapping Factory→External
Inventory mantiene la relación entre el catálogo interno de Factory y los SKUs de ventas.

Entidad: `internal_to_external_mapping`
- `mappingId`
- `internalItemId` (Factory)
- `externalSkuId` (Inventory)
- `conversionRules` (JSON: factores, empaque, rendimiento)
- `notes`
- `createdAt`, `updatedAt`

Endpoints:
- `POST /v1/mappings/internal-to-external`
- `PUT /v1/mappings/internal-to-external/:mappingId`
- `GET /v1/mappings/internal-to-external?internalItemId=&externalSkuId=`

## Nota sobre Shipments

El dominio de **embarques/tracking** vive en el módulo **Shipments** (repositorio `shipments-juampamillan`).

Inventory expone stock/availability y catálogo externo; Vendor consulta tracking desde Shipments.

## Integración Inventory → Factory

Factory es fuente de verdad del catálogo interno. Inventory solo lo consulta.

Endpoints (Factory):
- `GET /v1/internal-items?search=&status=&limit=&offset=`
- `GET /v1/internal-items/:internalItemId`

## Consideraciones de seguridad

- Autenticación por API Key en backend (igual que Vendor/Permit).
- Rate limiting por key.
- Vendor frontend accede a Inventory mediante proxy:
  - `/app/api/inventory/*` (por definir e implementar en Vendor Frontend)


