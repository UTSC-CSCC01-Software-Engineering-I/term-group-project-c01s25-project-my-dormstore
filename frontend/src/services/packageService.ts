import { Product } from '../types/Product';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

export const packageService = {
  async getAllPackages(): Promise<Product[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/packages`);
      if (!response.ok) {
        throw new Error('Failed to fetch packages');
      }
      const data = await response.json();
      
      // Transform API data to match frontend expectations
      return data.packages.map((pkg: any) => ({
        id: pkg.id,
        name: pkg.name,
        price: parseFloat(pkg.price),
        category: pkg.category,
        description: pkg.description,
        rating: parseFloat(pkg.rating),
        image_url: pkg.image_url,
        size: pkg.size,
        color: pkg.color,
        stock: pkg.stock || 0,
        created_at: pkg.created_at,
        updated_at: pkg.updated_at
      }));
    } catch (error) {
      console.error('Error fetching packages:', error);
      throw error;
    }
  },

  async getPackageById(id: number): Promise<Product | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/packages/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error('Failed to fetch package');
      }
      const data = await response.json();
      
      // Transform API data to match frontend expectations
      const pkg = {
        id: data.id,
        name: data.name,
        price: parseFloat(data.price),
        category: data.category,
        description: data.description,
        rating: parseFloat(data.rating),
        image_url: data.image_url,
        size: data.size,
        color: data.color,
        stock: data.stock || 0,
        created_at: data.created_at,
        updated_at: data.updated_at
      };
      
      return pkg;
    } catch (error) {
      console.error('Error fetching package:', error);
      throw error;
    }
  },

  async getPackagesByCategory(category: string): Promise<Product[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/packages`);
      if (!response.ok) {
        throw new Error('Failed to fetch packages by category');
      }
      const data = await response.json();
      
      // Filter by category and transform API data
      const filteredPackages = data.packages.filter((pkg: any) => 
        pkg.category.toLowerCase() === category.toLowerCase()
      );
      
      return filteredPackages.map((pkg: any) => ({
        id: pkg.id,
        name: pkg.name,
        price: parseFloat(pkg.price),
        category: pkg.category,
        description: pkg.description,
        rating: parseFloat(pkg.rating),
        image_url: pkg.image_url,
        size: pkg.size,
        color: pkg.color,
        stock: pkg.stock || 0,
        created_at: pkg.created_at,
        updated_at: pkg.updated_at
      }));
    } catch (error) {
      console.error('Error fetching packages by category:', error);
      throw error;
    }
  },

  async getPackageDetails(id: number): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/packages/${id}/details`);
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error('Failed to fetch package details');
      }
      const data = await response.json();
      
      return {
        id: data.package.id,
        name: data.package.name,
        price: parseFloat(data.package.price),
        category: data.package.category,
        description: data.package.description,
        rating: parseFloat(data.package.rating),
        image_url: data.package.image_url,
        size: data.package.size,
        color: data.package.color,
        stock: data.package.stock || 0,
        created_at: data.package.created_at,
        updated_at: data.package.updated_at
      };
    } catch (error) {
      console.error('Error fetching package details:', error);
      throw error;
    }
  }
}; 