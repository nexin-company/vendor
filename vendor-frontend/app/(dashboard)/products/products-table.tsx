'use client';

import {
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  Table
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Product as ProductRow } from './product-row';
import { Product as ProductType } from '@/lib/api';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TableCell } from '@/components/ui/table';

interface ProductsTableProps {
  products: ProductType[];
  total: number;
  currentOffset: number;
  nextOffset: number | null;
  onRefresh: () => void;
  onPrevPage: () => void;
  onNextPage: () => void;
}

export function ProductsTable({
  products,
  total,
  currentOffset,
  nextOffset,
  onRefresh,
  onPrevPage,
  onNextPage,
}: ProductsTableProps) {
  const PRODUCTS_PER_PAGE = 5;

  const startIndex = Math.max(0, currentOffset - PRODUCTS_PER_PAGE);
  const endIndex = Math.min(currentOffset, total);

  return (
    <Card>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="hidden w-[100px] sm:table-cell">
                <span className="sr-only">Imagen</span>
              </TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="hidden md:table-cell">Precio</TableHead>
              <TableHead className="hidden md:table-cell">
                Stock
              </TableHead>
              <TableHead className="hidden md:table-cell">Creado</TableHead>
              <TableHead>
                <span className="sr-only">Acciones</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  No se encontraron productos
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <ProductRow key={product.id} product={product} onRefresh={onRefresh} />
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter>
        <div className="flex items-center w-full justify-between">
          <div className="text-xs text-muted-foreground">
            Mostrando{' '}
            <strong>
              {total > 0 ? startIndex + 1 : 0}-{endIndex}
            </strong>{' '}
            de <strong>{total}</strong> productos
          </div>
          <div className="flex gap-2">
            <Button
              onClick={onPrevPage}
              variant="ghost"
              size="sm"
              disabled={currentOffset === PRODUCTS_PER_PAGE}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Anterior
            </Button>
            <Button
              onClick={onNextPage}
              variant="ghost"
              size="sm"
              disabled={nextOffset === null}
            >
              Siguiente
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}

