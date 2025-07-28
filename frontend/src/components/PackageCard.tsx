import { Package } from '../types/Package';
import { Link } from 'react-router-dom';
import './ProductCard.css'; // Reuse the same CSS

interface PackageCardProps {
  package: Package;
  onAddToCart: (packageId: number) => void;
  linkPrefix?: string;
}

export const PackageCard = ({ package: pkg, onAddToCart, linkPrefix = "/packages" }: PackageCardProps) => {
  const handleAddToCart = () => {
    // Quick add for packages
    onAddToCart(pkg.id);
  };
  
  console.log("Package Image URL:", pkg.image_url);

  return (
    <div className="product-card">
      <Link to={`${linkPrefix}/${pkg.id}`} className="product-link">
        <div className="product-image-container">
        <img
          className="product-image"
          src={pkg.image_url || pkg.image || "/images/product-test.jpg"}
          alt={pkg.name}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "/images/product-test.jpg";
          }}
        />
        </div>
      </Link>
      
      <div className="product-info">
        <h3 className="product-name">{pkg.name}</h3>
        
        <div className="product-footer">
          <div className="product-price-info">
            <span className="product-price">${pkg.price}</span>
<<<<<<< HEAD
                  {pkg.stock !== undefined && (
        <span className="product-inventory">
          {pkg.stock > 0 ? `${pkg.stock} in stock` : 'Out of stock'}
        </span>
      )}
=======
            {pkg.stock !== undefined && (
              <span className="product-inventory">
                {pkg.stock > 0 ? `${pkg.stock} in stock` : 'Out of stock'}
              </span>
            )}
>>>>>>> c39b07a692a26c821f5883b6c0d944ca1ca89dde
          </div>
          <button 
            className="cart-icon-btn"
            onClick={handleAddToCart}
            aria-label={`Add ${pkg.name} to cart`}
          >
            <img src="/images/Shopping-cart.png" alt="Add to Cart" className="cart-icon" />
          </button>
        </div>
      </div>
    </div>
  );
}; 