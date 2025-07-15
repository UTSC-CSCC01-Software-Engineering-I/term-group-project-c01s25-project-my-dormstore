import { Product } from '../types/Product';
import { Link } from 'react-router-dom';
import './ProductCard.css';


interface ProductCardProps {
  product: Product;
  onAddToCart: (productId: number) => void;
}

export const ProductCard = ({ product, onAddToCart }: ProductCardProps) => {
  const handleAddToCart = () => {
    onAddToCart(product.id);
  };
  console.log("Image URL:", product.image_url);


  return (
    <div className="product-card">
      <Link to={`/products/${product.id}`} className="product-link">
        <div className="product-image-container">
        <img
          className="product-image"
          src={product.image_url || "/images/product-test.jpg"}
          alt={product.name}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "/images/product-test.jpg";
          }}
        />
        </div>
      </Link>
      
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <div className="product-footer">
          <span className="product-price">${product.price}</span>
          <button 
            className="cart-icon-btn"
            onClick={handleAddToCart}
            aria-label={`Add ${product.name} to cart`}
            >
            <img src="/images/Shopping-cart.png" alt="Add to Cart" className="cart-icon" />
          </button>
        </div>
      </div>
    </div>
  );
}; 