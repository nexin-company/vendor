# Plan de Migración: Vendor → Inventory (Productos Externos)

## Objetivo
Eliminar la duplicación de productos. Vendor debe usar directamente los `external_products` de Inventory.

## Arquitectura Correcta

```
Factory (produce)
  ↓
  internal_items (hojas de papel)
  ↓
Inventory (mapea)
  ↓
  internal_to_external_mappings
  ↓
  external_products (paquetes de hojas, cajas de paquetes)
  ↓
Vendor (vende)
  ↓
  orders → order_items (referencian external_product_id)
```

## Cambios Necesarios

### 1. Backend (vendor-backend)

#### 1.1 Eliminar tabla `products`
- Eliminar schema `src/vendor/products/schema.ts`
- Eliminar service `src/vendor/products/service.ts`
- Eliminar router `src/vendor/products/router.ts`
- Eliminar de `api/v1.ts`

#### 1.2 Actualizar `order_items` schema
- Cambiar `product_id` → `external_product_id` (referencia a inventory)
- Mantener `product_name` como snapshot (para historial)
- Agregar `product_sku` como snapshot (opcional pero útil)

#### 1.3 Actualizar `orders` service
- Cambiar referencias de `products` a `external_products` (vía inventory API)
- Validar que el `external_product_id` existe en inventory
- Obtener nombre/SKU desde inventory para el snapshot

#### 1.4 Actualizar `orders` router
- Cambiar `productId` → `externalProductId` en el input

### 2. Frontend (vendor-frontend)

#### 2.1 Actualizar API client
- Eliminar `productsApi` de `lib/api.ts` y `lib/api-server.ts`
- Usar `inventoryApi` (ya existe) para obtener productos externos
- Actualizar todas las referencias

#### 2.2 Actualizar páginas de productos
- `app/(dashboard)/products/*` debe usar `external_products` de inventory
- Cambiar todas las referencias de `Product` a `ExternalProduct`
- Actualizar formularios para usar campos de external products (sku, basePrice, currency)

#### 2.3 Actualizar órdenes
- Cambiar `productId` → `externalProductId` en formularios
- Usar `external_products` para seleccionar productos

### 3. Migración de Datos

#### 3.1 Migrar productos existentes
- Script para migrar `products` de vendor → `external_products` de inventory
- Generar SKU si no existe
- Mapear campos:
  - `name` → `name`
  - `price` → `basePrice`
  - `status` → `status`
  - `imageUrl` → (no existe en external_products, guardar en metadata o eliminar)

#### 3.2 Actualizar order_items
- Migrar `product_id` → `external_product_id`
- Validar que todos los productos migrados existan en inventory

## Pasos de Implementación

### Fase 1: Preparación
1. ✅ Crear funciones en `inventory-client.ts` para CRUD de external products
2. ✅ Verificar que inventory-backend esté desplegado y accesible
3. ✅ Crear script de migración de datos

### Fase 2: Backend
1. Actualizar `order_items` schema (agregar `external_product_id`, mantener `product_id` temporalmente)
2. Actualizar `orders` service para usar inventory API
3. Actualizar `orders` router
4. Eliminar módulo de productos de vendor

### Fase 3: Frontend
1. Actualizar API clients
2. Actualizar páginas de productos
3. Actualizar formularios de órdenes

### Fase 4: Migración y Limpieza
1. Ejecutar migración de datos
2. Eliminar columna `product_id` de `order_items`
3. Eliminar tabla `products`
4. Actualizar documentación

## Consideraciones

### Campos que se pierden
- `imageUrl`: No existe en external_products. Opciones:
  - Agregar campo `imageUrl` a external_products (recomendado)
  - O guardar en metadata JSON
  - O eliminar si no es crítico

### Precio
- Vendor tiene `price` (precio de venta)
- Inventory tiene `basePrice` (precio base)
- Las órdenes guardan snapshot de precio, así que no hay problema
- Pero necesitamos decidir: ¿Vendor puede tener precios diferentes por cliente? (eso sería en orders, no en products)

### Stock
- Vendor tenía `stock` (legacy)
- Inventory tiene `stock_levels` (por warehouse)
- Ya se está usando inventory para stock, así que solo eliminar campo legacy

## Notas
- Las órdenes guardan snapshot (nombre, precio) así que no dependen del catálogo
- El `product_id` en `order_items` puede ser nullable y eliminarse después de migrar
- Inventory es la fuente de verdad para productos externos

