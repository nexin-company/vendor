# Mejoras de Integración con Inventory

## Resumen
Ahora que `inventory-backend` está desplegado, podemos mejorar la integración entre Vendor e Inventory para que:
- **Vendor** venda productos externos (gestionados en Inventory)
- **Inventory** maneje la gestión y mapeo de productos externos
- **Factory** produzca productos internos

## Mejoras Propuestas

### 1. ✅ Agregar campo `externalProductId` a la tabla `products` de vendor
**Objetivo**: Tener una relación directa entre productos de vendor y productos externos de inventory.

**Cambios necesarios**:
- Agregar columna `external_product_id` (nullable) a la tabla `products`
- Migración de base de datos
- Actualizar schema y service

### 2. ✅ Sincronización automática de productos
**Objetivo**: Cuando se crea/actualiza un producto en vendor, crear/actualizar automáticamente el producto externo en inventory.

**Cambios necesarios**:
- Extender `inventory-client.ts` con funciones para crear/actualizar productos externos
- Modificar `ProductsService.createProduct()` para crear producto externo en inventory
- Modificar `ProductsService.updateProduct()` para actualizar producto externo en inventory
- Generar SKU automáticamente si no se proporciona

### 3. ✅ Mejorar búsqueda de productos externos
**Objetivo**: Usar SKU además de nombre para mapear productos.

**Cambios necesarios**:
- Agregar función `inventoryFindExternalProductBySku()` en `inventory-client.ts`
- Modificar búsqueda para usar SKU cuando esté disponible
- Actualizar `product-row.tsx` para usar SKU si existe

### 4. ⏳ Mostrar disponibilidad por almacén
**Objetivo**: Mostrar stock por warehouse, no solo total.

**Cambios necesarios**:
- Agregar función para obtener stock por warehouse
- Actualizar UI para mostrar stock por almacén
- Mostrar indicador visual de disponibilidad

### 5. ⏳ Sincronización de precios
**Objetivo**: Sincronizar precios entre vendor e inventory.

**Cambios necesarios**:
- Al actualizar precio en vendor, actualizar `basePrice` en inventory
- Al actualizar precio en inventory, actualizar `price` en vendor (opcional)

## Prioridad

1. **Alta**: Mejoras 1, 2, 3 (relación directa y sincronización básica)
2. **Media**: Mejora 4 (mejor UX)
3. **Baja**: Mejora 5 (sincronización bidireccional de precios)

