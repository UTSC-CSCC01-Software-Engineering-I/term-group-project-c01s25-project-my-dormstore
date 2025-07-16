import { Product } from '../types/Product';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

export const productService = {
  async getAllProducts(): Promise<Product[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products`);
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const data = await response.json();
      
      // Factory method: transform API data to match frontend expectations
      return data.products.map((product: any) => ({
        ...product,
        price: parseFloat(product.price),
        rating: parseFloat(product.rating),
        image: product.image
      }));
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  async getProductById(id: number): Promise<Product | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error('Failed to fetch product');
      }
      const data = await response.json();
      
      // Factory method: transform API data to match frontend expectations
      const product = {
        ...data.product,
        price: parseFloat(data.product.price),
        rating: parseFloat(data.product.rating),
        image: data.product.image
      };
      
      return product;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  },

  async getProductsByCategory(category: string): Promise<Product[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products?category=${encodeURIComponent(category)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch products by category');
      }
      const data = await response.json();
      
      // Factory method: transform API data to match frontend expectations
      return data.products.map((product: any) => ({
        ...product,
        price: parseFloat(product.price),
        rating: parseFloat(product.rating),
        image: product.image
      }));
    } catch (error) {
      console.error('Error fetching products by category:', error);
      throw error;
    }
  }
}; 