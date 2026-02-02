import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { getProductData } from '@lib/api/products';
import { ProductView } from '@components/product/product-view';
import NotFound from 'pages/404';
import type { Product } from '@lib/api/products';

type ProductProps = {
  pid: string;
  productData: Product | null;
};

export default function Product(_props: ProductProps): JSX.Element { /* eslint-disable-line @typescript-eslint/no-unused-vars */
  const router = useRouter();
  const { pid } = router.query;
  const [productData, setProductData] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (pid && typeof pid === 'string') {
      const fetchProduct = async (): Promise<void> => {
        try {
          const data = await getProductData(pid);
          setProductData(data);
        } catch (error: unknown) {
          console.error(`Error fetching product ${pid}:`, error);
          setProductData(null);
        } finally {
          setLoading(false);
        }
      };

      void fetchProduct(); // Explicitly mark promise as ignored
    }
  }, [pid]);

  if (router.isFallback || loading) { /* eslint-disable-line curly */
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <p>Loading...</p>
      </div>
    );
  }

  return productData ? (
    <ProductView pid={typeof pid === 'string' ? pid : ''} productData={productData} />
  ) : (
    <NotFound pid={typeof pid === 'string' ? pid : ''} />
  );
}

export async function getStaticPaths(): Promise<{ paths: Array<Record<string, never>>, fallback: boolean }> { /* eslint-disable-line @typescript-eslint/require-await */
  // Return an empty paths array with fallback true
  // This allows any product ID to be accessed and handled by the client-side fetch
  return {
    paths: [],
    fallback: true // Changed from 'blocking' to true for better error handling
  };
}

// Using getStaticProps with fallback instead of getServerSideProps
export async function getStaticProps({ params }: { params: { pid: string } }): Promise<{ props: ProductProps, revalidate: number }> { /* eslint-disable-line @typescript-eslint/require-await */
  return {
    props: {
      pid: params.pid,
      productData: null // Will be fetched client-side
    },
    // Revalidate to ensure fresh data periodically
    revalidate: 3600
  };
}
