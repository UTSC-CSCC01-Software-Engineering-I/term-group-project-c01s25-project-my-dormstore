import { Product } from '../types/Product';
import { ProductCard } from './ProductCard.tsx';
import './ProductComponents.css';

interface ProductListProps {
  products: Product[];
  onAddToCart: (productId: number) => void;
}

export const ProductList = ({ products, onAddToCart }: ProductListProps) => {
  if (products.length === 0) {
    return (
      <div className="empty-state">
        <p>No products available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="product-list">
      <div className="product-grid">
        <style> 
          {`
            .product-grid {
            grid-template-columns: repeat(2, 1fr);
            display: flex;
            flex-wrap: wrap;
            justify-content: flex-start;
            gap: 2rem;
            }
          `}
        </style>
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={onAddToCart}
          />
        ))}
      </div>
    </div>
  );
}; 