/**
 * Cliente API server-side para comunicarse con vendor-backend
 * La API key se mantiene solo en el servidor
 */

import 'server-only';
import { auth } from '@/lib/auth';
import { 
  CreateUserInput, 
  UpdateUserInput, 
  User,
  Product,
  CreateProductInput,
  UpdateProductInput,
  ProductFilters,
  Customer,
  CreateCustomerInput,
  UpdateCustomerInput,
  Order,
  CreateOrderInput,
  UpdateOrderInput
} from './api';

const API_BASE_URL = process.env.VENDOR_API_URL || process.env.PERMIT_API_URL || 'http://localhost:8000';
const API_KEY = process.env.VENDOR_API_KEY || process.env.PERMIT_API_KEY || '';

if (!API_KEY) {
  console.warn('⚠️ VENDOR_API_KEY no está configurada. Las llamadas al backend pueden fallar.');
}

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Función helper para hacer requests al backend con API key
 */
async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  // Verificar que el usuario esté autenticado
  const session = await auth();
  if (!session?.user) {
    throw new ApiError('No autenticado', 401);
  }

  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY, // API key solo en el servidor
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      errorData.message || `HTTP error! status: ${response.status}`,
      response.status,
      errorData
    );
  }

  return response.json();
}

// Re-exportar tipos del cliente público
export type {
  User,
  CreateUserInput,
  UpdateUserInput,
  Product,
  CreateProductInput,
  UpdateProductInput,
  ProductFilters,
  Customer,
  CreateCustomerInput,
  UpdateCustomerInput,
  Order,
  CreateOrderInput,
  UpdateOrderInput,
} from './api';

// Exportar funciones API server-side
export const usersApi = {
  getAll: async () => fetchApi<User[]>('/v1/users/'),
  getById: async (id: number) => fetchApi<User>(`/v1/users/${id}`),
  create: async (data: CreateUserInput) =>
    fetchApi<User>('/v1/users/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: async (id: number, data: UpdateUserInput) =>
    fetchApi<User>(`/v1/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: async (id: number) =>
    fetchApi<{ message: string; user: User }>(`/v1/users/${id}`, {
      method: 'DELETE',
    }),
};

// ==================== PRODUCTOS ====================

export const productsApi = {
  getAll: async (filters?: ProductFilters): Promise<{ products: Product[]; total: number; offset: number | null }> => {
    const params = new URLSearchParams();
    if (filters?.search) params.set('q', filters.search);
    if (filters?.status) params.set('status', filters.status);
    if (filters?.offset) params.set('offset', filters.offset.toString());
    if (filters?.limit) params.set('limit', filters.limit.toString());
    
    const query = params.toString();
    return fetchApi<{ products: Product[]; total: number; offset: number | null }>(`/v1/vendor/products${query ? `?${query}` : ''}`);
  },

  getById: async (id: number): Promise<Product> => {
    return fetchApi<Product>(`/v1/vendor/products/${id}`);
  },

  create: async (data: CreateProductInput): Promise<Product> => {
    return fetchApi<Product>('/v1/vendor/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: UpdateProductInput): Promise<Product> => {
    return fetchApi<Product>(`/v1/vendor/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<{ message: string; product: Product }> => {
    return fetchApi<{ message: string; product: Product }>(`/v1/vendor/products/${id}`, {
      method: 'DELETE',
    });
  },
};

// ==================== CLIENTES ====================

export const customersApi = {
  getAll: async (): Promise<Customer[]> => {
    return fetchApi<Customer[]>('/v1/vendor/customers');
  },

  getById: async (id: number): Promise<Customer> => {
    return fetchApi<Customer>(`/v1/vendor/customers/${id}`);
  },

  create: async (data: CreateCustomerInput): Promise<Customer> => {
    return fetchApi<Customer>('/v1/vendor/customers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: UpdateCustomerInput): Promise<Customer> => {
    return fetchApi<Customer>(`/v1/vendor/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<{ message: string; customer: Customer }> => {
    return fetchApi<{ message: string; customer: Customer }>(`/v1/vendor/customers/${id}`, {
      method: 'DELETE',
    });
  },
};

// ==================== ÓRDENES ====================

export const ordersApi = {
  getAll: async (): Promise<Order[]> => {
    return fetchApi<Order[]>('/v1/vendor/orders');
  },

  getById: async (id: number): Promise<Order> => {
    return fetchApi<Order>(`/v1/vendor/orders/${id}`);
  },

  create: async (data: CreateOrderInput): Promise<Order> => {
    return fetchApi<Order>('/v1/vendor/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: UpdateOrderInput): Promise<Order> => {
    return fetchApi<Order>(`/v1/vendor/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<{ message: string; order: Order }> => {
    return fetchApi<{ message: string; order: Order }>(`/v1/vendor/orders/${id}`, {
      method: 'DELETE',
    });
  },
};

