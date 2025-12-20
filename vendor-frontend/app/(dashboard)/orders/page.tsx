import { ordersApi, type Order } from '@/lib/api-server';
import { OrdersPageClient } from './orders-page-client';

export const dynamic = 'force-dynamic';

export default async function OrdersPage() {
  let orders: Order[] = [];
  try {
    orders = await ordersApi.getAll();
  } catch (error) {
    console.error('Error fetching orders:', error);
  }

  return <OrdersPageClient initialOrders={orders} />;
}

