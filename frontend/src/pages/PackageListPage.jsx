import React, { useState, useEffect } from 'react';
import { PackageList } from '../components/PackageList.tsx';
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
      // Treat package as product in cart
      addToCart(pkg, 1);
      console.log('Added package to cart:', pkg.name);
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
      <PackageList 
        packages={packages} 
        onAddToCart={handleAddToCart}
        category={category}
        linkPrefix="/packages"
      />
    </div>
  );
};

export default PackageListPage; 