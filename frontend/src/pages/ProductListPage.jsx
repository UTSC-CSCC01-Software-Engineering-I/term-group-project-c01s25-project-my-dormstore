import React, { useState, useEffect } from 'react';
import { ProductList } from '../components/ProductList.tsx';
import { productService } from '../services/productService.ts';
import { useCart } from '../contexts/CartContext.tsx';

const ProductListPage = ({ category }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        let fetchedProducts;
        
        if (category) {
          fetchedProducts = await productService.getProductsByCategory(category);
        } else {
          fetchedProducts = await productService.getAllProducts();
        }
        
        setProducts(fetchedProducts);
        setError(null);
      } catch (err) {
        setError('Failed to load products. Please try again later.');
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category]);

  const handleAddToCart = (productId) => {
    // Find the product by ID and add it to cart
    const product = products.find(p => p.id === productId);
    if (product) {
      addToCart(product);
      console.log('Added to cart:', product.name);
    }
  };

  if (loading) {
    return (
      <div className="product-list-page">
        <div className="page-header">
          <h1>Shop by Items</h1>
          <p>Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="product-list-page">
        <div className="page-header">
          <h1>Shop by Items</h1>
          <p style={{ color: 'red' }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="product-list-page">
      <div className="page-header">
        <h1>{category ? `${category} Items` : 'Shop by Items'}</h1>
      </div>
      <ProductList 
        products={products} 
        onAddToCart={handleAddToCart}
      />
    </div>
  );
};

export default ProductListPage; 