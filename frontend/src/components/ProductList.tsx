import { Product } from '../types/Product';
import { ProductCard } from './ProductCard';
import './ProductComponents.css';

interface ProductListProps {
  products: Product[];
  onAddToCart: (productId: number) => void;
  linkPrefix?: string;
  category?: string;
}

export const ProductList = ({ products, onAddToCart, linkPrefix = "/products", category }: ProductListProps) => {
  if (products.length === 0) {
    return (
      <div className="empty-state">
        <p>No products available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="product-list">
      <div className="hero-section">
        <div className="hero-text">
          <h2>{category ? `${category} Essentials` : 'Shop All The Essentials Items At One Step'}</h2>
          <p>
            No more back-and-forth shopping trips. We’ve gathered all the dorm must-haves so you can settle in with ease and style.          
          </p>
          <a href="#product-grid" className="down-arrow" aria-label="Scroll to products">
            <img src="/images/group-arrow.png" alt="Scroll down" />
          </a>        
        </div>
        <div className="hero-image">
          <img src="/images/sleep-product.png" alt="Bed Essentials" />
        </div>
      </div>

      <div id="product-grid" className="product-grid">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={onAddToCart}
            linkPrefix={linkPrefix}
          />
        ))}
      </div>
    </div>
  );
};
