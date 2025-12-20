'use client';

import { useEffect, useMemo, useState } from 'react';
import { customersApi, ordersApi, productsApi, type Customer, type Product } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/lib/toast';

type OrderLineDraft = {
  productId: number | null;
  quantity: number;
  unitPriceFinal?: number;
  discountAmount?: number;
  discountPercent?: number;
};

export function OrderForm(props: { onCreated: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [customerId, setCustomerId] = useState<number | null>(null);
  const [lines, setLines] = useState<OrderLineDraft[]>([
    { productId: null, quantity: 1, discountAmount: 0, discountPercent: 0 },
  ]);

  useEffect(() => {
    (async () => {
      try {
        const [c, p] = await Promise.all([
          customersApi.getAll(),
          productsApi.getAll({ limit: 50 }),
        ]);
        setCustomers(c);
        setProducts(p.products);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  const totals = useMemo(() => {
    let total = 0;
    for (const line of lines) {
      if (!line.productId) continue;
      const product = products.find((p) => p.id === line.productId);
      if (!product) continue;
      const unitBase = Number(product.price);
      const unitFinal = line.unitPriceFinal ?? unitBase;
      const qty = Number(line.quantity || 0);
      const raw = unitFinal * qty;
      const discAmt = Number(line.discountAmount || 0);
      const discPct = Number(line.discountPercent || 0);
      const discFromPct = (raw * discPct) / 100;
      const lineTotal = Math.max(0, raw - discAmt - discFromPct);
      total += lineTotal;
    }
    return { total };
  }, [lines, products]);

  const addLine = () => {
    setLines((prev) => [...prev, { productId: null, quantity: 1, discountAmount: 0, discountPercent: 0 }]);
  };

  const removeLine = (idx: number) => {
    setLines((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateLine = (idx: number, patch: Partial<OrderLineDraft>) => {
    setLines((prev) => prev.map((l, i) => (i === idx ? { ...l, ...patch } : l)));
  };

  const submit = async () => {
    if (!customerId) {
      toast.error('Selecciona un cliente');
      return;
    }

    const normalized = lines
      .filter((l) => l.productId && l.quantity > 0)
      .map((l) => ({
        productId: l.productId!,
        quantity: Number(l.quantity),
        unitPriceFinal: l.unitPriceFinal !== undefined ? Number(l.unitPriceFinal) : undefined,
        discountAmount: l.discountAmount !== undefined ? Number(l.discountAmount) : undefined,
        discountPercent: l.discountPercent !== undefined ? Number(l.discountPercent) : undefined,
      }));

    if (normalized.length === 0) {
      toast.error('Agrega al menos una línea');
      return;
    }

    setIsSubmitting(true);
    try {
      await ordersApi.create({
        customerId,
        items: normalized,
      });
      toast.success('Orden creada');
      props.onCreated();
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || 'Error al crear orden');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Cliente</Label>
        <Select
          value={customerId ? String(customerId) : undefined}
          onValueChange={(v) => setCustomerId(Number(v))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecciona un cliente" />
          </SelectTrigger>
          <SelectContent>
            {customers.map((c) => (
              <SelectItem key={c.id} value={String(c.id)}>
                {c.name} ({c.email})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Líneas</Label>
          <Button type="button" variant="outline" size="sm" onClick={addLine}>
            Agregar línea
          </Button>
        </div>

        <div className="space-y-3">
          {lines.map((line, idx) => (
            <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
              <div className="md:col-span-5 space-y-1">
                <Label>Producto</Label>
                <Select
                  value={line.productId ? String(line.productId) : undefined}
                  onValueChange={(v) => updateLine(idx, { productId: Number(v) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Producto" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((p) => (
                      <SelectItem key={p.id} value={String(p.id)}>
                        {p.name} (${Number(p.price).toFixed(2)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2 space-y-1">
                <Label>Cantidad</Label>
                <Input
                  type="number"
                  min={1}
                  value={line.quantity}
                  onChange={(e) => updateLine(idx, { quantity: Number(e.target.value) })}
                />
              </div>

              <div className="md:col-span-2 space-y-1">
                <Label>Precio final</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={line.unitPriceFinal ?? ''}
                  onChange={(e) =>
                    updateLine(idx, { unitPriceFinal: e.target.value ? Number(e.target.value) : undefined })
                  }
                  placeholder="(auto)"
                />
              </div>

              <div className="md:col-span-2 space-y-1">
                <Label>Desc. %</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={line.discountPercent ?? 0}
                  onChange={(e) => updateLine(idx, { discountPercent: Number(e.target.value) })}
                />
              </div>

              <div className="md:col-span-1 flex justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeLine(idx)}
                  disabled={lines.length === 1}
                >
                  Quitar
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">Total estimado</div>
        <div className="text-lg font-semibold">${totals.total.toFixed(2)}</div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" onClick={submit} disabled={isSubmitting}>
          {isSubmitting ? 'Creando...' : 'Crear orden'}
        </Button>
      </div>
    </div>
  );
}


