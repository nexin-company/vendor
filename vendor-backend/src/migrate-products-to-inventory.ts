/**
 * Script de migración: Products (Vendor) → External Products (Inventory)
 * 
 * Este script migra los productos de vendor-backend a inventory-backend
 * como external_products.
 * 
 * Ejecutar con: bun run src/migrate-products-to-inventory.ts
 * 
 * Requiere:
 * - VENDOR_DATABASE_URL: URL de la base de datos de vendor
 * - INVENTORY_API_URL: URL del backend de inventory
 * - INVENTORY_API_KEY: API key para inventory
 */

import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { products } from './vendor/products/schema.js'

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
 * Generar SKU único basado en el nombre del producto
 */
function generateSku(name: string, id: number): string {
  // Normalizar nombre: eliminar acentos, espacios, convertir a mayúsculas
  const normalized = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
    .replace(/[^a-zA-Z0-9]/g, '') // Eliminar caracteres especiales
    .toUpperCase()
    .substring(0, 20) // Limitar longitud
  
  return `VENDOR-${normalized}-${id}`
}

/**
 * Crear external product en inventory
 */
async function createExternalProduct(product: any): Promise<number | null> {
  try {
    const sku = generateSku(product.name, product.id)
    
    const response = await fetch(`${INVENTORY_API_URL}/v1/external-products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': INVENTORY_API_KEY,
      },
      body: JSON.stringify({
        sku,
        name: product.name,
        status: product.status,
        basePrice: Number(product.price),
        currency: 'MXN',
        imageUrl: product.imageUrl || null,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({})) as { message?: string; error?: string }
      const errorMessage = errorData.message || errorData.error || response.statusText
      console.error(`❌ Error al crear producto ${product.id} (${product.name}):`, errorMessage)
      return null
    }

    const result = await response.json() as { data?: { id: number } }
    if (!result.data?.id) {
      console.error(`❌ Respuesta inválida al crear producto ${product.id} (${product.name}):`, result)
      return null
    }
    return result.data.id
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error(`❌ Error al crear producto ${product.id} (${product.name}):`, errorMessage)
    return null
  }
}

/**
 * Verificar si un producto ya existe en inventory por SKU
 */
async function productExistsInInventory(sku: string): Promise<boolean> {
  try {
    const response = await fetch(`${INVENTORY_API_URL}/v1/external-products?q=${encodeURIComponent(sku)}`, {
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': INVENTORY_API_KEY,
      },
    })

    if (!response.ok) {
      // Si hay un error, asumimos que no existe
      return false
    }

    const result = await response.json() as { data?: Array<{ sku: string }> }
    return result.data?.some((p) => p.sku === sku) || false
  } catch (error: unknown) {
    // Si hay un error de red, asumimos que no existe para continuar
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.warn(`⚠️  Advertencia al verificar SKU ${sku}:`, errorMessage)
    return false
  }
}

async function migrate() {
  console.log('🚀 Iniciando migración de productos de Vendor a Inventory...')
  console.log(`📦 Vendor DB: ${VENDOR_DATABASE_URL.substring(0, 30)}...`)
  console.log(`🔗 Inventory API: ${INVENTORY_API_URL}`)
  console.log('')

  try {
    // Obtener todos los productos de vendor
    const vendorProducts = await vendorDb.select().from(products)
    console.log(`📋 Encontrados ${vendorProducts.length} productos en Vendor`)

    if (vendorProducts.length === 0) {
      console.log('✅ No hay productos para migrar')
      return
    }

    let migrated = 0
    let skipped = 0
    let errors = 0
    const productIdMap = new Map<number, number>() // vendor_product_id -> inventory_external_product_id

    for (const product of vendorProducts) {
      const sku = generateSku(product.name, product.id)
      
      // Verificar si ya existe
      const exists = await productExistsInInventory(sku)
      if (exists) {
        console.log(`⏭️  Producto ${product.id} (${product.name}) ya existe en Inventory, omitiendo...`)
        skipped++
        continue
      }

      // Crear en inventory
      const externalProductId = await createExternalProduct(product)
      
      if (externalProductId) {
        productIdMap.set(product.id, externalProductId)
        migrated++
        console.log(`✅ Migrado: ${product.id} → ${externalProductId} (${product.name})`)
      } else {
        errors++
        console.log(`❌ Error al migrar producto ${product.id} (${product.name})`)
      }
    }

    console.log('')
    console.log('📊 Resumen de migración:')
    console.log(`   ✅ Migrados: ${migrated}`)
    console.log(`   ⏭️  Omitidos: ${skipped}`)
    console.log(`   ❌ Errores: ${errors}`)
    console.log('')
    console.log('📝 Mapeo de IDs (vendor_product_id → inventory_external_product_id):')
    for (const [vendorId, inventoryId] of productIdMap.entries()) {
      console.log(`   ${vendorId} → ${inventoryId}`)
    }
    console.log('')
    console.log('⚠️  IMPORTANTE: Guarda este mapeo para actualizar order_items después')
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

