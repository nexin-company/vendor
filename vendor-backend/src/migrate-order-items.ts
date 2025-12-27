/**
 * Script de migración: Actualizar order_items con external_product_id
 * 
 * Este script actualiza las órdenes existentes para usar external_product_id
 * basándose en el mapeo de productos migrados.
 * 
 * Ejecutar con: bun run src/migrate-order-items.ts
 * 
 * Requiere:
 * - VENDOR_DATABASE_URL: URL de la base de datos de vendor
 * - INVENTORY_API_URL: URL del backend de inventory
 * - INVENTORY_API_KEY: API key para inventory
 */

import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { orderItems } from './vendor/orders/schema.js'
import { eq, and, isNotNull, isNull } from 'drizzle-orm'

const VENDOR_DATABASE_URL = process.env.VENDOR_DATABASE_URL || process.env.DATABASE_URL || ''
const INVENTORY_API_URL = process.env.INVENTORY_API_URL || 'http://localhost:8000'
const INVENTORY_API_KEY = process.env.INVENTORY_API_KEY || process.env.VENDOR_API_KEY || ''

if (!VENDOR_DATABASE_URL) {
  console.error('❌ VENDOR_DATABASE_URL no está configurada')
  process.exit(1)
}

if (!INVENTORY_API_KEY) {
  console.error('❌ INVENTORY_API_KEY no está configurada')
  process.exit(1)
}

const vendorDb = drizzle(neon(VENDOR_DATABASE_URL))

/**
 * Obtener mapeo de productos desde inventory
 * Busca productos externos que tengan SKU con formato VENDOR-*
 */
async function getProductMapping(): Promise<Map<number, number>> {
  const mapping = new Map<number, number>()
  
  try {
    console.log('🔍 Obteniendo mapeo de productos desde Inventory...')
    
    // Buscar todos los productos externos que empiecen con VENDOR-
    const response = await fetch(`${INVENTORY_API_URL}/v1/external-products?q=VENDOR-`, {
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': INVENTORY_API_KEY,
      },
    })

    if (!response.ok) {
      console.warn('⚠️  No se pudo obtener mapeo desde Inventory')
      return mapping
    }

    const result = await response.json() as { data?: Array<{ id: number; sku: string }> }
    const products = result.data || []

    // Extraer vendor_product_id del SKU (formato: VENDOR-{NOMBRE}-{ID})
    for (const product of products) {
      const skuParts = product.sku.split('-')
      if (skuParts.length >= 3 && skuParts[0] === 'VENDOR') {
        const vendorProductId = parseInt(skuParts[skuParts.length - 1], 10)
        if (!isNaN(vendorProductId)) {
          mapping.set(vendorProductId, product.id)
        }
      }
    }

    console.log(`✅ Mapeo obtenido: ${mapping.size} productos`)
    return mapping
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.warn(`⚠️  Error al obtener mapeo: ${errorMessage}`)
    return mapping
  }
}

async function migrate() {
  console.log('🚀 Iniciando migración de order_items...')
  console.log(`📦 Vendor DB: ${VENDOR_DATABASE_URL.substring(0, 30)}...`)
  console.log(`🔗 Inventory API: ${INVENTORY_API_URL}`)
  console.log('')

  try {
    // Obtener mapeo de productos
    const productMapping = await getProductMapping()
    
    if (productMapping.size === 0) {
      console.log('⚠️  No se encontró mapeo de productos. Asegúrate de haber ejecutado migrate-products-to-inventory.ts primero.')
      return
    }

    // Obtener todos los order_items que tienen product_id pero no external_product_id
    const allItems = await vendorDb
      .select()
      .from(orderItems)
      .where(
        and(
          isNotNull(orderItems.productId),
          isNull(orderItems.externalProductId)
        )
      )

    const itemsNeedingUpdate = allItems.filter(
      (item) => item.productId !== null && item.externalProductId === null
    )

    console.log(`📋 Encontrados ${itemsNeedingUpdate.length} order_items para actualizar`)

    if (itemsNeedingUpdate.length === 0) {
      console.log('✅ No hay order_items para actualizar')
      return
    }

    let updated = 0
    let skipped = 0
    let errors = 0

    for (const item of itemsNeedingUpdate) {
      if (!item.productId) {
        skipped++
        continue
      }

      const externalProductId = productMapping.get(item.productId)
      
      if (!externalProductId) {
        console.log(`⏭️  Order item ${item.id}: No se encontró mapeo para product_id ${item.productId}`)
        skipped++
        continue
      }

      try {
        // Actualizar el order_item con external_product_id
        await vendorDb
          .update(orderItems)
          .set({
            externalProductId: externalProductId,
            // También actualizar product_sku si no está ya establecido
            productSku: item.productSku || null,
          })
          .where(eq(orderItems.id, item.id))

        updated++
        console.log(`✅ Actualizado order_item ${item.id}: product_id ${item.productId} → external_product_id ${externalProductId}`)
      } catch (error: unknown) {
        errors++
        const errorMessage = error instanceof Error ? error.message : String(error)
        console.error(`❌ Error al actualizar order_item ${item.id}:`, errorMessage)
      }
    }

    console.log('')
    console.log('📊 Resumen de migración:')
    console.log(`   ✅ Actualizados: ${updated}`)
    console.log(`   ⏭️  Omitidos: ${skipped}`)
    console.log(`   ❌ Errores: ${errors}`)
    console.log('')

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('❌ Error durante la migración:', errorMessage)
    if (error instanceof Error && error.stack) {
      console.error('Stack trace:', error.stack)
    }
    process.exit(1)
  }
}

migrate()

