
import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom'
import { productService } from '../services/productService'
import { packageService } from '../services/packageService'
import { useCart } from '../contexts/CartContext'
import { Product } from '../types/Product'
import './ProductDetail.css'

export default function ProductDetail()  {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const [product, setProduct] = useState<Product | null>(null)
  const [packageDetails, setPackageDetails] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { addToCart } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [selectedSize, setSelectedSize] = useState<string>('')
  const [selectedColor, setSelectedColor] = useState<string>('')

  const isPackage = location.pathname.startsWith('/packages/')

  useEffect(() => {
    const fetchItem = async () => {
      if (!id) return;
      
      try {
        setLoading(true)
        
        if (isPackage) {
          // Fetch package details with included products
          const packageData = await packageService.getPackageDetails(Number(id))
          setProduct(packageData)
          setPackageDetails(packageData)
        } else {
          const fetchedItem = await productService.getProductById(Number(id))
          setProduct(fetchedItem)
          setPackageDetails(null)
        }
        
        setError(null)
      } catch (err) {
        setError(`Failed to load ${isPackage ? 'package' : 'product'}`)
        console.error(`Error fetching ${isPackage ? 'package' : 'product'}:`, err)
      } finally {
        setLoading(false)
      }
    }

    fetchItem()
  }, [id, isPackage])
  

  if (loading) {
    return (
      <div className="product-detail">
        <h2>Loading {isPackage ? 'package' : 'product'}...</h2>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="product-detail not-found">
        <h2>{error || `${isPackage ? 'Package' : 'Product'} not found`}</h2>
        <button className="back-button" onClick={() => navigate(-1)}>
          ← Back
        </button>
      </div>
    )
  }
  const hasSizes = !!product.size && product.size.split(',').length > 0 && product.size.split(',')[0].trim() !== '';
  const hasColors = !!product.color && product.color.split(',').length > 0 && product.color.split(',')[0].trim() !== '';

  const handleAddToCart = () => {
    if (product) {
      // Check if size/color selection is required
      const availableSizes = product.size ? product.size.split(',') : [];
      const availableColors = product.color ? product.color.split(',') : [];
      if (hasSizes && availableSizes.length > 1 && !selectedSize) {
        alert('Please select a size');
        return;
      }
      if (hasColors && availableColors.length > 1 && !selectedColor) {
        alert('Please select a color');
        return;
      }
      // Determine final size and color
      const finalSize = selectedSize || (availableSizes.length === 1 ? availableSizes[0] : undefined);
      const finalColor = selectedColor || (availableColors.length === 1 ? availableColors[0] : undefined);
      addToCart(product, quantity, finalSize, finalColor);
    }
  }

  return (
    <div className="product-detail">
      {/* Left: Image */}
      <img
        src={product.image_url || "/images/product-test.jpg"}
        alt={product.name}
        className="product-image"
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src = "/images/product-test.jpg";
        }}
      />


      {/* Right: Info */}
      <div className="product-info">
        <button
          className="back-button"
          onClick={() => navigate(-1)}
        >
          ← Back to {isPackage ? 'packages' : 'products'}
        </button>

        <h1 className="product-title">{product.name}</h1>

        {product.suggestedWithPurchase && (
          <p className="suggested-badge">
            <span className="dot" />Strongly Suggested With Your Purchase
          </p>
        )}

        <div className="rating-stars">
          {[...Array(5)].map((_, i) => (
            <span
              key={i}
              className={
                i < product.rating ? 'star-filled' : 'star-empty'
              }
            >
              ★
            </span>
          ))}
          <span className="rating-count">
            {product.rating} / 5
          </span>
        </div>

        <p className="product-price">
          ${product.price.toFixed(2)} CAD
        </p>

        {product.shippingInfo && (
          <p
            className="shipping-info"
            onClick={() => {/* to be implemented */}}
          >
            {product.shippingInfo}
          </p>
        )}

        {/* Size Selection (for both products and packages) */}
        {hasSizes && (
          <>
            <p className="section-subtitle">Size</p>
            <div className="size-options">
              {product.size!.split(',').map(size => (
                <button 
                  key={size.trim()} 
                  className={`size-button ${selectedSize === size.trim() ? 'selected' : ''}`}
                  onClick={() => setSelectedSize(size.trim())}
                >
                  {size.trim()}
                </button>
              ))}
            </div>
          </>
        )}

        {/* Color Selection (for both products and packages) */}
        {hasColors && (
          <>
            <p className="section-subtitle">Color</p>
            <div className="color-options">
              {product.color!.split(',').map(color => (
                <button 
                  key={color.trim()} 
                  className={`color-button ${selectedColor === color.trim() ? 'selected' : ''}`}
                  onClick={() => setSelectedColor(color.trim())}
                >
                  {color.trim()}
                </button>
              ))}
            </div>
          </>
        )}

        <p className="section-subtitle">Quantity</p>
        <div className="quantity-add">
          <div className="quantity-selector">
            <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>−</button>
            <span>{quantity}</span>
            <button onClick={() => setQuantity(q => q + 1)}>+</button>
          </div>
          <button onClick={handleAddToCart}
          className="add-to-cart-button">
            Add To Cart
          </button>
        </div>
      </div>

      {isPackage && packageDetails?.included_products && packageDetails.included_products.length > 0 && (
        <div className="package-included-products">
          <h2 className="section-title-p">What's Included in This Package</h2>
          <div className="included-products-grid">
            {packageDetails.included_products.map((includedProduct: any) => {
              // show as non-clickable card w
              if (includedProduct.is_intended) {
                return (
                  <div 
                    key={includedProduct.id} 
                    className="included-product-card intended-product"
                  >
                    <div className="included-product-info">
                      <h3 className="included-product-name">{includedProduct.name}</h3>
                    </div>
                  </div>
                );
              }
              
              // Otherwise show as clickable card with full details
              return (
                <Link 
                  key={includedProduct.id} 
                  to={`/products/${includedProduct.id}`} 
                  className="included-product-card"
                >
                  <div className="included-product-info">
                    <h3 className="included-product-name">{includedProduct.name}</h3>
                    <p className="included-product-price">${parseFloat(includedProduct.price).toFixed(2)} CAD</p>
                    <p className="included-product-quantity">Quantity: {includedProduct.quantity}</p>
                    <p className="included-product-description">{includedProduct.description}</p>
                  </div>
                  <div className="included-product-arrow">→</div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Product/Package Details */}
      <div className="product-details-list">
        <h2 className="section-title-p">{isPackage ? 'Package' : 'Product'} Details</h2>
        <p className="section-text">{product.description}</p>
        
        {/* Show includes for products only (packages show detailed products above) */}
        {!isPackage && product.included && (
          <>
            <p className="section-subtitle">Includes:</p>
            <ul className="includes-list">
              {product.included?.map(item => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </>
        )}

        <div className="delivery-section">
          <p className="section-subtitle-p">Delivery</p>
          <p>
            My Dorm Store offers delivery across Canada and the United States.
            We are partnering with select university and college residences to
            deliver everything to your dorm when you arrive. Please find a
            complete list of partnering schools when you checkout. You can
            select “Dorm Drop Off” as your delivery method to view the full
            list of partnering residences.
          </p>
        </div>
        <a href="#reviews" className="reviews-link">
          Customer Reviews
        </a>
      </div>
    </div>
  )
}
