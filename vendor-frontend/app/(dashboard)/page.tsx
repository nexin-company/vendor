import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Package,
  ShoppingCart,
  Users2,
  Users
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { productsApi, customersApi, ordersApi, usersApi } from '@/lib/api-server';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  // Fetch all data
  let counts = {
    products: 0,
    productsActive: 0,
    productsInactive: 0,
    orders: 0,
    ordersPending: 0,
    ordersCompleted: 0,
    customers: 0,
    users: 0,
  };

  try {
    const [productsResult, orders, customers, users] = await Promise.all([
      productsApi.getAll().catch(() => ({ products: [], total: 0, offset: null })),
      ordersApi.getAll().catch(() => []),
      customersApi.getAll().catch(() => []),
      usersApi.getAll().catch(() => []),
    ]);

    const products = productsResult.products || [];
    
    counts = {
      products: productsResult.total || 0,
      productsActive: products.filter((p: any) => p.status === 'active').length,
      productsInactive: products.filter((p: any) => p.status === 'inactive').length,
      orders: orders.length,
      ordersPending: orders.filter((o: any) => o.status === 'pending').length,
      ordersCompleted: orders.filter((o: any) => o.status === 'delivered').length,
      customers: customers.length,
      users: users.length,
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
  }

  const stats = [
    {
      title: 'Productos',
      value: counts.products,
      icon: Package,
      href: '/products',
      description: `${counts.productsActive} activos`,
      color: 'text-blue-600'
    },
    {
      title: 'Órdenes',
      value: counts.orders,
      icon: ShoppingCart,
      href: '/orders',
      description: `${counts.ordersPending} pendientes`,
      color: 'text-green-600'
    },
    {
      title: 'Clientes',
      value: counts.customers,
      icon: Users2,
      href: '/customers',
      description: 'Clientes registrados',
      color: 'text-purple-600'
    },
    {
      title: 'Usuarios',
      value: counts.users,
      icon: Users,
      href: '/users',
      description: 'Usuarios del sistema',
      color: 'text-orange-600'
    }
  ];

  return (
    <div className="flex flex-1 flex-col p-4 md:p-6 space-y-6">
      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
          <CardDescription>
            Accesos directos a las funcionalidades principales
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
            <Button asChild variant="outline" className="justify-start">
              <Link href="/products">
                <Package className="h-4 w-4 mr-2" />
                Gestionar Productos
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start">
              <Link href="/orders">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Ver Órdenes
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start">
              <Link href="/customers">
                <Users2 className="h-4 w-4 mr-2" />
                Ver Clientes
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start">
              <Link href="/users">
                <Users className="h-4 w-4 mr-2" />
                Gestionar Usuarios
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Resumen General</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Link key={stat.title} href={stat.href}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {stat.title}
                    </CardTitle>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground">
                      {stat.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
