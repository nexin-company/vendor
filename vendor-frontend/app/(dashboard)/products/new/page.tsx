import { redirect } from 'next/navigation';

/**
 * Los productos externos se gestionan en Inventory
 * Redirigir a la página de productos (solo lectura)
 */
export default function NewProductPage() {
  redirect('/products');
}
