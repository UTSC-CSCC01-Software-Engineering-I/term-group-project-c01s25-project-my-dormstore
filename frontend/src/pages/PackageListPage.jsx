import React, { useState, useEffect } from 'react';
import { ProductList } from '../components/ProductList.tsx';
import { packageService } from '../services/packageService.ts';
import { useCart } from '../contexts/CartContext.tsx';

const PackageListPage = ({ category }) => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setLoading(true);
        let fetchedPackages;
        
        if (category) {
          fetchedPackages = await packageService.getPackagesByCategory(category);
        } else {
          fetchedPackages = await packageService.getAllPackages();
        }
        
        setPackages(fetchedPackages);
        setError(null);
      } catch (err) {
        setError('Failed to load packages. Please try again later.');
        console.error('Error fetching packages:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, [category]);

  const handleAddToCart = (packageId) => {
    // Find the package by ID and add it to cart
    const pkg = packages.find(p => p.id === packageId);
    if (pkg) {
      addToCart(pkg);
      console.log('Added to cart:', pkg.name);
    }
  };

  if (loading) {
    return (
      <div className="product-list-page">
        <div className="page-header">
          <h1>Shop Packages</h1>
          <p>Loading packages...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="product-list-page">
        <div className="page-header">
          <h1>Shop Packages</h1>
          <p style={{ color: 'red' }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="product-list-page">
      <div className="page-header">
        <h1>{category ? `${category} Packages` : 'Shop Packages'}</h1>
        <p>Curated packages designed for student life</p>
      </div>
      <ProductList 
        products={packages} 
        onAddToCart={handleAddToCart}
        linkPrefix="/packages"
      />
    </div>
  );
};

export default PackageListPage; 