export type Product = {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating: {
    count: number;
    rate: number;
  };
};

export type Products = Product[];

export async function getAllProducts(): Promise<Products> {
  try {
    const res = await fetch('https://fakestoreapi.com/products', {
      headers: {
        'Cache-Control': 'no-cache'
      }
    });

    // eslint-disable-next-line curly
    if (!res.ok)
      throw new Error(`HTTP error! status: ${res.status}`);

    const data = (await res.json()) as Products;
    return data;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching products:', error);
    return []; // Trả về mảng rỗng nếu có lỗi
  }
}

export type Params = {
  pid: string;
};

type ProductParams = {
  params: Params;
};

export type ProductsParams = ProductParams[];

export async function getAllProductsId(): Promise<ProductsParams> {
  const res = await getAllProducts();
  return res.map((product) => ({
    params: {
      pid: String(product.id)
    }
  }));
}

function isInDb(id: string): boolean {
  if (isNaN(+id)) return false;
  const num = parseInt(id, 10);
  return num >= 1 && num <= 20;
}

export async function getProductData(id: string): Promise<Product | null> {
  if (!isInDb(id)) return null;

  try {
    const res = await fetch(`https://fakestoreapi.com/products/${id}`, {
      headers: {
        'Cache-Control': 'no-cache'
      }
    });

    if (!res.ok) {
      // eslint-disable-next-line curly
      if (res.status === 404) return null; // Trả về null nếu sản phẩm không tồn tại
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = (await res.json()) as Product;
    return data;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`Error fetching product ${id}:`, error);
    return null; // Trả về null nếu có lỗi
  }
}
