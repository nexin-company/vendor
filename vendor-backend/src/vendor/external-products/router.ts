/**
 * Router para consultar productos externos desde Logistics
 * Solo lectura - los productos externos se gestionan en logistic-backend
 */

import { Elysia, t } from 'elysia'
import {
	inventoryGetExternalProductById,
	inventoryFindExternalProductByName,
} from '../../integrations/inventory-client.js'

export const externalProductsRouter = new Elysia({ prefix: '/external-products' })
	/**
	 * GET /external-products - Listar productos externos (proxy a Inventory)
	 * Nota: Este endpoint consulta inventory-backend, no tiene su propia base de datos
	 */
	.get(
		'/',
		async ({ query }) => {
			try {
				const LOGISTIC_API_URL = process.env.LOGISTIC_API_URL || 'http://localhost:8004'
				const LOGISTIC_API_KEY = process.env.LOGISTIC_API_KEY || process.env.VENDOR_API_KEY || ''

				const params = new URLSearchParams()
				if ((query as any)?.q) params.set('q', (query as any).q)
				if ((query as any)?.status) params.set('status', (query as any).status)
				if ((query as any)?.offset) params.set('offset', (query as any).offset)
				if ((query as any)?.limit) params.set('limit', (query as any).limit)

				const url = `${LOGISTIC_API_URL}/v1/catalog${params.toString() ? `?${params.toString()}` : ''}`
				const response = await fetch(url, {
					headers: {
						'Content-Type': 'application/json',
						'X-API-Key': LOGISTIC_API_KEY,
					},
				})

				if (!response.ok) {
					const errorData = await response.json().catch(() => ({}))
					throw new Error(errorData.message || `Error al consultar productos externos: ${response.status}`)
				}

				return await response.json()
			} catch (error: any) {
				throw new Error(error.message || 'Error al consultar productos externos')
			}
		},
		{
			query: t.Object({
				q: t.Optional(t.String()),
				status: t.Optional(t.Union([t.Literal('active'), t.Literal('inactive'), t.Literal('archived')])),
				offset: t.Optional(t.String()),
				limit: t.Optional(t.String()),
			}),
			detail: {
				tags: ['external-products'],
				summary: 'Listar productos externos (desde Logistics) - Solo lectura',
			},
		}
	)
	/**
	 * GET /external-products/:id - Obtener producto externo por ID (proxy a Logistics)
	 */
	.get(
		'/:id',
		async ({ params }) => {
			try {
				const externalProduct = await inventoryGetExternalProductById(Number(params.id))
				if (!externalProduct) {
					throw new Error(`Producto externo con ID ${params.id} no encontrado`)
				}
				return { data: externalProduct }
			} catch (error: any) {
				throw new Error(error.message || 'Error al obtener producto externo')
			}
		},
		{
			params: t.Object({ id: t.Numeric() }),
			detail: {
				tags: ['external-products'],
				summary: 'Obtener producto externo por ID (desde Logistics) - Solo lectura',
			},
		}
	)
	.compile()

