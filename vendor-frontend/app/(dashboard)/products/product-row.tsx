'use client';

import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LOGISTIC_FRONTEND_URL } from '@/lib/config';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Link2 } from 'lucide-react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Product as ProductType, productsApi, inventoryApi } from '@/lib/api';
import { toast } from '@/lib/toast';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ProductProps {
  product: ProductType;
  onRefresh: () => void;
}

export function Product({ product, onRefresh }: ProductProps) {
  const [realStock, setRealStock] = useState<number | null>(null);
  const [isLoadingStock, setIsLoadingStock] = useState(false);
  const [hasMapping, setHasMapping] = useState(false);

  // Nota: Los productos externos se gestionan en inventory-backend
  // Vendor solo puede consultarlos (solo lectura)
  // La eliminación/edición se hace desde inventory-frontend

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 capitalize">Activo</Badge>;
      case 'inactive':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 capitalize">Inactivo</Badge>;
      case 'archived':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 capitalize">Archivado</Badge>;
      default:
        return <Badge variant="outline" className="capitalize">{status}</Badge>;
    }
  };

  // Cargar stock real desde Inventory y verificar mapeos
  useEffect(() => {
    const loadInventoryData = async () => {
      setIsLoadingStock(true);
      try {
        // El producto ya es un external product, usar su ID directamente
        const totalStock = await inventoryApi.getTotalAvailableStock(product.id);
        setRealStock(totalStock);
        
        // Verificar si tiene mapeos con items internos
        const mappings = await inventoryApi.getMappingsByExternalProduct(product.id);
        setHasMapping(mappings.length > 0);
      } catch (error) {
        console.error('Error al cargar datos desde Inventory:', error);
        setRealStock(null);
        setHasMapping(false);
      } finally {
        setIsLoadingStock(false);
      }
    };

    loadInventoryData();
  }, [product.id]);

  const formatDate = (date: string | Date) => {
    const d = new Date(date);
    return d.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Mostrar stock real desde Inventory
  const displayStock = realStock !== null ? realStock : 0;
  const stockLabel = 'Stock disponible';

  return (
    <>
      <TableRow>
        <TableCell className="hidden sm:table-cell">
          {product.imageUrl ? (
            <Image
              alt="Imagen del producto"
              className="aspect-square rounded-md object-cover"
              height="64"
              src={product.imageUrl}
              width="64"
            />
          ) : (
            <div className="aspect-square rounded-md bg-muted flex items-center justify-center">
              <span className="text-xs text-muted-foreground">Sin imagen</span>
            </div>
          )}
        </TableCell>
        <TableCell className="font-medium">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span>{product.name}</span>
              {hasMapping && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link2 className="h-4 w-4 text-blue-500" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Este producto tiene mapeo con items internos de Factory</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
            {product.sku && (
              <span className="text-xs text-muted-foreground">SKU: {product.sku}</span>
            )}
          </div>
        </TableCell>
        <TableCell>
          {getStatusBadge(product.status)}
        </TableCell>
        <TableCell className="hidden md:table-cell">{`$${product.basePrice} ${product.currency || 'MXN'}`}</TableCell>
        <TableCell className="hidden md:table-cell">
          {isLoadingStock ? (
            <span className="text-muted-foreground text-sm">Cargando...</span>
          ) : (
            <div className="flex flex-col">
              <span className={realStock !== null ? 'font-semibold text-blue-600' : ''}>
                {displayStock}
              </span>
              {realStock !== null && (
                <span className="text-xs text-muted-foreground">{stockLabel}</span>
              )}
            </div>
          )}
        </TableCell>
        <TableCell className="hidden md:table-cell">
          {formatDate(product.createdAt)}
        </TableCell>
        <TableCell>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                asChild
                size="icon" 
                variant="ghost"
                title="Los productos externos se gestionan en Logistics"
              >
                <Link href={`${LOGISTIC_FRONTEND_URL}/catalog/${product.id}`} target="_blank">
                  <Link2 className="h-4 w-4" />
                  <span className="sr-only">Ver en Logistics</span>
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Ver/editar en Inventory (solo lectura en Vendor)</p>
            </TooltipContent>
          </Tooltip>
        </TableCell>
      </TableRow>
    </>
  );
}

