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
      // First try /products/:id
      const productResponse = await fetch(`${API_BASE_URL}/api/products/${id}`);
      if (productResponse.ok) {
        const data = await productResponse.json();
        return {
          ...data.product,
          price: parseFloat(data.product.price),
          rating: parseFloat(data.product.rating),
          image: data.product.image || data.product.image_url 
        };
      }
    } catch (err) {
      console.warn("Product not found in /products/:id, trying /packages/:id...");
    }
  
    try {
      // Fallback to /packages/:id
      const packageResponse = await fetch(`${API_BASE_URL}/api/packages/${id}`);
      if (packageResponse.ok) {
        const pkg = await packageResponse.json(); // make sure backend sends raw object
        return {
          ...pkg,
          price: parseFloat(pkg.price),
          rating: parseFloat(pkg.rating),
          image: pkg.image || pkg.image_url
        };
      }
    } catch (err) {
      console.error("Error fetching package by ID:", err);
    }
  
    return null;
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