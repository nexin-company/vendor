import { Elysia } from 'elysia'
// API Keys
import { apiKeys } from '../src/api-keys/router.js'
// Vendor
import { externalProductsRouter } from '../src/vendor/external-products/router.js'
import { customersRouter } from '../src/vendor/customers/router.js'
import { ordersRouter } from '../src/vendor/orders/router.js'

/**
 * API v1 - Versión actual para sistema Vendor
 * Gestión de clientes y órdenes
 * Nota: 
 * - Los usuarios se gestionan en el backend de Permit
 * - Los productos externos se consultan desde Inventory (solo lectura)
 * - Los productos internos se gestionan en Factory
 */
export const v1Routes = new Elysia({ prefix: '/v1' })
    .use(apiKeys)
    .use(externalProductsRouter)
    .use(customersRouter)
    .use(ordersRouter)

