import React from 'react';
import { ProductList } from '../components/ProductList.tsx';
import { sampleProducts } from '../data/sampleProducts.ts';
import { useCart } from '../contexts/CartContext.tsx';

const ProductListPage = () => {
  const { addToCart } = useCart();

  const handleAddToCart = (productId) => {
    // Find the product by ID and add it to cart
    const product = sampleProducts.find(p => p.id === productId);
    if (product) {
      addToCart(product);
      console.log('Added to cart:', product.name);
    }
  };

  return (
    <div className="product-list-page">
      <div className="page-header">
        <h1>Shop by Items</h1>
        <p>Browse our collection of dorm essentials</p>
      </div>
      <ProductList 
        products={sampleProducts} 
        onAddToCart={handleAddToCart}
      />
    </div>
  );
};

export default ProductListPage; 