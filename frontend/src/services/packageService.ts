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
        ...pkg,
        price: parseFloat(pkg.price),
        rating: parseFloat(pkg.rating),
        image: pkg.image
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
        ...data.package,
        price: parseFloat(data.package.price),
        rating: parseFloat(data.package.rating),
        image: data.package.image 
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
        ...pkg,
        price: parseFloat(pkg.price),
        rating: parseFloat(pkg.rating),
        image: pkg.image
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
        ...data.package,
        price: parseFloat(data.package.price),
        rating: parseFloat(data.package.rating),
        image: data.package.image 
      };
    } catch (error) {
      console.error('Error fetching package details:', error);
      throw error;
    }
  }
}; 