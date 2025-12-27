/**
 * Archivo central que exporta todos los schemas
 * Este archivo es usado por Drizzle Kit para generar migraciones
 * Única fuente de verdad para la estructura de la base de datos
 * 
 * Nota: Los usuarios se gestionan en el backend de Permit
 */

// API Keys Schema
export * from './api-keys/schema'

// Vendor Schemas
// Nota: products schema se mantiene solo para migraciones y seed, pero ya no se usa en la API
// Los productos externos se gestionan en inventory-backend
export * from './vendor/products/schema'
export * from './vendor/customers/schema'
export * from './vendor/orders/schema'

