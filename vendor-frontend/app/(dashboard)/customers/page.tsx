import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';

export const dynamic = 'force-dynamic';

export default function CustomersPage() {
  return (
    <div className="flex flex-1 flex-col p-4 md:p-6">
      <Card>
        <CardHeader>
          <CardTitle>Clientes</CardTitle>
          <CardDescription>
            Ver todos los clientes y sus órdenes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            La funcionalidad de clientes estará disponible próximamente.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

