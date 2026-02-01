import { useState, useEffect } from 'react';
import { useShoppingCart } from '@lib/context/shopping-cart';
import { MainLayout } from '@components/common/main-layout';
import { Aside } from '@components/store/aside';
import { Listing } from '@components/store/listing';
import { getAllProducts } from '@lib/api/products';
import { Loading } from '@components/ui/loading';
import type { GetServerSideProps } from 'next';
import type { Products } from '@lib/api/products';

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    // Thử fetch sản phẩm với retry
    let allProducts: Products = [];
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        allProducts = await getAllProducts();
        // eslint-disable-next-line curly
        if (allProducts && allProducts.length > 0) break; // Nếu có sản phẩm, thoát khỏi vòng lặp
      } catch (error) {
        console.error(`Attempt ${attempts + 1} failed:`, error);
      }

      attempts++;
      // eslint-disable-next-line curly
      if (attempts < maxAttempts) {
        // Chờ 1 giây trước khi thử lại
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return {
      props: {
        allProducts: allProducts || []
      }
    };
  } catch (error) {
    console.error('Error in getServerSideProps:', error);
    // Trả về mảng rỗng nếu có lỗi
    return {
      props: {
        allProducts: []
      }
    };
  }
};

type StoreProps = {
  allProducts: Products;
};

export default function Store({ allProducts }: StoreProps): JSX.Element {
  const { isMobile } = useShoppingCart();
  const [products, setProducts] = useState<Products>(allProducts);
  const [loading, setLoading] = useState(false);

  // Nếu không có sản phẩm nào từ server-side, thử fetch lại trên client
  useEffect(() => {
    if (products.length === 0) {
      const fetchProducts = async (): Promise<void> => {
        setLoading(true);
        try {
          const fetchedProducts = await getAllProducts();
          setProducts(fetchedProducts);
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error('Error fetching products on client:', error);
        } finally {
          setLoading(false);
        }
      };

      void fetchProducts();
    }
  }, [products.length]);

  return (
    <MainLayout
      className='flex flex-col items-start gap-6 md:flex-row md:gap-8'
      title='Shopping Cart | Store'
      description='You can find everything you need here.'
      image='/store.png'
      url='/store'
    >
      <Aside isMobile={isMobile} />
      {loading ? (
        <div className='flex flex-1 justify-center items-center h-64'>
          <Loading />
        </div>
      ) : products && products.length > 0 ? (
        <Listing allProducts={products} isMobile={isMobile} />
      ) : (
        <div className='flex flex-1 justify-center items-center'>
          <div className='text-center'>
            <h2 className='text-3xl font-semibold'>No products found</h2>
            <p className='text-base text-secondary'>Please try again later</p>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
