/**
 * Cliente API para comunicarse con las rutas API de Next.js
 * Las rutas API actúan como proxy y manejan la autenticación y API key server-side
 */

const API_BASE_URL = '/api/permit';

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

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
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

// ==================== USUARIOS ====================

export interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string | Date;
}

export interface CreateUserInput {
  name: string;
  email: string;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
}

export const usersApi = {
  getAll: async (): Promise<User[]> => {
    return fetchApi<User[]>('/users/');
  },

  getById: async (id: number): Promise<User> => {
    return fetchApi<User>(`/users/${id}`);
  },

  create: async (data: CreateUserInput): Promise<User> => {
    return fetchApi<User>('/users/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: UpdateUserInput): Promise<User> => {
    return fetchApi<User>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<{ message: string; user: User }> => {
    return fetchApi<{ message: string; user: User }>(`/users/${id}`, {
      method: 'DELETE',
    });
  },
};

// ==================== PRODUCTOS ====================

export interface Product {
  id: number;
  imageUrl: string;
  name: string;
  status: 'active' | 'inactive' | 'archived';
  price: string;
  stock: number;
  availableAt: string | Date;
}

export interface CreateProductInput {
  imageUrl: string;
  name: string;
  status: 'active' | 'inactive' | 'archived';
  price: string;
  stock: number;
  availableAt: string;
}

export interface UpdateProductInput {
  imageUrl?: string;
  name?: string;
  status?: 'active' | 'inactive' | 'archived';
  price?: string;
  stock?: number;
  availableAt?: string;
}

export interface ProductFilters {
  search?: string;
  status?: 'active' | 'inactive' | 'archived';
  offset?: number;
  limit?: number;
}

export const productsApi = {
  getAll: async (filters?: ProductFilters): Promise<{ products: Product[]; total: number; offset: number | null }> => {
    const params = new URLSearchParams();
    if (filters?.search) params.set('q', filters.search);
    if (filters?.status) params.set('status', filters.status);
    if (filters?.offset) params.set('offset', filters.offset.toString());
    if (filters?.limit) params.set('limit', filters.limit.toString());
    
    const query = params.toString();
    return fetchApi<{ products: Product[]; total: number; offset: number | null }>(`/permit/vendor/products${query ? `?${query}` : ''}`);
  },

  getById: async (id: number): Promise<Product> => {
    return fetchApi<Product>(`/permit/vendor/products/${id}`);
  },

  create: async (data: CreateProductInput): Promise<Product> => {
    return fetchApi<Product>('/permit/vendor/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: UpdateProductInput): Promise<Product> => {
    return fetchApi<Product>(`/permit/vendor/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<{ message: string; product: Product }> => {
    return fetchApi<{ message: string; product: Product }>(`/permit/vendor/products/${id}`, {
      method: 'DELETE',
    });
  },
};

// ==================== CLIENTES ====================

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  createdAt: string | Date;
}

export interface CreateCustomerInput {
  name: string;
  email: string;
  phone?: string;
  address?: string;
}

export interface UpdateCustomerInput {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export const customersApi = {
  getAll: async (): Promise<Customer[]> => {
    return fetchApi<Customer[]>('/permit/vendor/customers');
  },

  getById: async (id: number): Promise<Customer> => {
    return fetchApi<Customer>(`/permit/vendor/customers/${id}`);
  },

  create: async (data: CreateCustomerInput): Promise<Customer> => {
    return fetchApi<Customer>('/permit/vendor/customers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: UpdateCustomerInput): Promise<Customer> => {
    return fetchApi<Customer>(`/permit/vendor/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<{ message: string; customer: Customer }> => {
    return fetchApi<{ message: string; customer: Customer }>(`/permit/vendor/customers/${id}`, {
      method: 'DELETE',
    });
  },
};

// ==================== ÓRDENES ====================

export interface Order {
  id: number;
  customerId: number;
  customerName?: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface CreateOrderInput {
  customerId: number;
  status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: string;
}

export interface UpdateOrderInput {
  customerId?: number;
  status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total?: string;
}

export const ordersApi = {
  getAll: async (): Promise<Order[]> => {
    return fetchApi<Order[]>('/permit/vendor/orders');
  },

  getById: async (id: number): Promise<Order> => {
    return fetchApi<Order>(`/permit/vendor/orders/${id}`);
  },

  create: async (data: CreateOrderInput): Promise<Order> => {
    return fetchApi<Order>('/permit/vendor/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: UpdateOrderInput): Promise<Order> => {
    return fetchApi<Order>(`/permit/vendor/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<{ message: string; order: Order }> => {
    return fetchApi<{ message: string; order: Order }>(`/permit/vendor/orders/${id}`, {
      method: 'DELETE',
    });
  },
};

