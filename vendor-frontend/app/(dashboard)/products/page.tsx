import { productsApi, type Product } from '@/lib/api-server';
import { ProductsPageClient } from './products-page-client';

export const dynamic = 'force-dynamic';

export default async function ProductsPage(props: {
  searchParams?: Promise<{ q?: string; offset?: string; status?: string }>;
}) {
  const searchParams = await props.searchParams;
  const search = searchParams?.q ?? '';
  const offset = searchParams?.offset ? Number(searchParams.offset) : 0;
  const status = searchParams?.status as 'active' | 'inactive' | 'archived' | undefined;

  let result = { products: [] as Product[], total: 0, offset: null as number | null };
  
  try {
    result = await productsApi.getAll({
      search,
      offset,
      status,
      limit: 5,
    });
  } catch (error) {
    console.error('Error fetching products:', error);
  }

  return (
    <ProductsPageClient
      initialProducts={result.products}
      initialTotal={result.total}
      initialOffset={result.offset}
      initialSearch={search}
      initialStatus={status}
    />
  );
}

