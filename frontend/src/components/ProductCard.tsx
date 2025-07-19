import { Product } from '../types/Product';
import { Link } from 'react-router-dom';
import { getCurrentUserBedSize } from '../utils/bedSizeHelper';
import { DormChecklistItems } from '../data/dormChecklistItems';
import './ProductCard.css';


interface ProductCardProps {
  product: Product;
  onAddToCart: (productId: number) => void;
  linkPrefix?: string;
}

export const ProductCard = ({ product, onAddToCart, linkPrefix = "/products" }: ProductCardProps) => {
  // Check if product has  size or color
  const hasMultipleSizes = product.size && product.size.split(',').length > 1;
  const hasMultipleColors = product.color && product.color.split(',').length > 1;
  const needsOptionsSelection = hasMultipleSizes || hasMultipleColors;

  const handleAddToCart = () => {
    if (needsOptionsSelection) {
      window.location.href = `${linkPrefix}/${product.id}`;
      return;
    }
    // Quick add for products without options
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

  // Check if this product is in the user's dorm checklist
  const isProductInDormChecklist = () => {
    try {
      const email = localStorage.getItem("userEmail");
      if (!email) return false;
      const userInfo = localStorage.getItem(`userInfo_${email}`);
      if (!userInfo) return false;
      
       const parsed = JSON.parse(userInfo);
      const userDorm: string = parsed.dorm;
      
      if (!userDorm || !DormChecklistItems[userDorm as keyof typeof DormChecklistItems]) return false;
      
      // see if product name contains any word from checklist items
      const dormItems = DormChecklistItems[userDorm as keyof typeof DormChecklistItems];
      const productName = product.name.toLowerCase();
      return dormItems.some((item: any) => {
        const itemLabel = item.label.toLowerCase();
        return productName.includes(itemLabel) || itemLabel.includes(productName);
      });
      
    } 
    catch (error) {
      return false;
    }
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
            isProductInDormChecklist() ? (
              <>
                <span className="green-dot">●</span>
                <span className="size-text">Highly Recommended</span>
              </>
            ) : null
          )}
        </div>
        
        <div className="product-footer">
          <span className="product-price">${product.price}</span>
          <button 
            className="cart-icon-btn"
            onClick={handleAddToCart}
            aria-label={needsOptionsSelection ? `Select options for ${product.name}` : `Add ${product.name} to cart`}
          >
            <img src="/images/Shopping-cart.png" alt="Add to Cart" className="cart-icon" />
          </button>
        </div>
      </div>
    </div>
  );
}; 