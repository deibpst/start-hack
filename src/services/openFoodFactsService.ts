/**
 * Open Food Facts API Service
 * Consulta información de productos por código de barras
 */

export interface OpenFoodFactsProduct {
  code: string;
  product_name?: string;
  brands?: string;
  image_url?: string;
}

export interface OpenFoodFactsResponse {
  status: 0 | 1;
  product?: OpenFoodFactsProduct;
}

const API_BASE_URL = 'https://world.openfoodfacts.org/api/v2/product';
const USER_AGENT = 'MiAppVibe - Web - Version 1.0 - contact@example.com';

/**
 * Busca un producto en Open Food Facts por su código de barras
 */
export async function buscarProductoOpenFoodFacts(
  barcode: string
): Promise<{ found: boolean; product: OpenFoodFactsProduct | null; error?: string }> {
  try {
    const url = `${API_BASE_URL}/${barcode}.json?fields=product_name,brands,image_url,code`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': USER_AGENT,
      },
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const data: OpenFoodFactsResponse = await response.json();

    if (data.status === 1 && data.product) {
      return {
        found: true,
        product: {
          code: data.product.code || barcode,
          product_name: data.product.product_name,
          brands: data.product.brands,
          image_url: data.product.image_url,
        },
      };
    }

    return {
      found: false,
      product: null,
    };
  } catch (error) {
    console.error('Error al consultar Open Food Facts:', error);
    return {
      found: false,
      product: null,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}
