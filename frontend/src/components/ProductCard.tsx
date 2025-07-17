import { Product } from '../types/Product';
import { Link } from 'react-router-dom';
import { getCurrentUserBedSize } from '../utils/bedSizeHelper';
import './ProductCard.css';


interface ProductCardProps {
  product: Product;
  onAddToCart: (productId: number) => void;
  linkPrefix?: string;
}

export const ProductCard = ({ product, onAddToCart, linkPrefix = "/products" }: ProductCardProps) => {
  const handleAddToCart = () => {
    console.log(" CLICKED:", product);  
    onAddToCart(product.id);
  };
  
  // Get bed size recommendation for user's dorm
  const getRecommendationText = () => {
    if (product.category?.toLowerCase() === 'bedding') {
      const userBedSize = getCurrentUserBedSize();
      
      if (userBedSize) {
        return `Required: ${userBedSize} Size Suggested For Your Dorm`;
      } else {
        return "Required: Uknown Size Suggested For Your Dorm";
      }
    }
    return "Highly Recommended";
  };
  
  console.log("Image URL:", product.image_url);

  return (
    <div className="product-card">
      <Link to={`${linkPrefix}/${product.id}`} className="product-link">
        <div className="product-image-container">
        <img
          className="product-image"
          src={product.image_url || product.image || "/images/product-test.jpg"}
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
        
        {/*requirement level indicator */}
        <div className="size-recommendation">
          {product.category?.toLowerCase() === 'bedding' ? (
            <>
              <span className="red-dot">●</span>
              <span className="size-text">{getRecommendationText()}</span>
            </>
          ) : (
            <>
              <span className="green-dot">●</span>
              <span className="size-text">Highly Recommended</span>
            </>
          )}
        </div>
        
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