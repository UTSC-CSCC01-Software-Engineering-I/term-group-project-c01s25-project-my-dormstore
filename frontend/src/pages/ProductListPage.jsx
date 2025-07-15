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
    const product = products.find(p => p.id === productId);
    if (product) {
      addToCart(product);
      console.log('Added to cart:', product.name);
    }
  };

  if (loading) {
    return (
      <div className="product-list-page">
        <p>Loading products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="product-list-page">
        <p style={{ color: 'red' }}>{error}</p>
      </div>
    );
  }

  return (
    <div className="product-list-page">
      <ProductList 
        products={products} 
        onAddToCart={handleAddToCart}
        category={category}
      />
    </div>
  );
};

export default ProductListPage;
