import { useState, useEffect } from 'react';
import { useShoppingCart } from '@lib/context/shopping-cart';
import { MainLayout } from '@components/common/main-layout';
import { Aside } from '@components/store/aside';
import { Listing } from '@components/store/listing';
import { getAllProducts } from '@lib/api/products';
import { Empty } from '@components/ui/empty';
import type { InferGetStaticPropsType } from 'next';
import type { Products } from '@lib/api/products';

export async function getStaticProps(): Promise<{ props: { allProducts: Products }; revalidate?: number }> {
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
      },
      // Revalidate sau mỗi 1 giờ để cập nhật sản phẩm mới
      revalidate: 3600
    };
  } catch (error) {
    console.error('Error in getStaticProps:', error);
    // Trả về mảng rỗng nếu có lỗi
    return {
      props: {
        allProducts: []
      },
      revalidate: 3600
    };
  }
}

export default function Store({
  allProducts
}: InferGetStaticPropsType<typeof getStaticProps>): JSX.Element {
  const { isMobile } = useShoppingCart();

  return (
    <MainLayout
      className='flex flex-col items-start gap-6 md:flex-row md:gap-8'
      title='Shopping Cart | Store'
      description='You can find everything you need here.'
      image='/store.png'
      url='/store'
    >
      <Aside isMobile={isMobile} />
      {allProducts && allProducts.length > 0 ? (
        <Listing allProducts={allProducts} isMobile={isMobile} />
      ) : (
        <Empty searchQuery='all products' />
      )}
    </MainLayout>
  );
}
