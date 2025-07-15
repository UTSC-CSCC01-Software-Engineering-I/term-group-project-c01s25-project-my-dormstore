import react from 'react'
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { productService } from '../services/productService'
import { useCart } from '../contexts/CartContext'
import { Product } from '../types/Product'
import './ProductDetail.css'

export default function ProductDetail()  {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { addToCart } = useCart()
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      
      try {
        setLoading(true)
        const fetchedProduct = await productService.getProductById(Number(id))
        setProduct(fetchedProduct)
        setError(null)
      } catch (err) {
        setError('Failed to load product')
        console.error('Error fetching product:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [id])
  

  if (loading) {
    return (
      <div className="product-detail">
        <h2>Loading product...</h2>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="product-detail not-found">
        <h2>{error || "Product not found"}</h2>
        <button className="back-button" onClick={() => navigate(-1)}>
          ← Back
        </button>
      </div>
    )
  }
  const handleAddToCart = () => {
    if (product) {
      addToCart(product)
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
          ← Back to list
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

        <p className="section-subtitle">Laundry Hamper Colour</p>
        <div className="variants">
          {product.variant?.map(v => (
            <button key={v.id} className="variant-button">
              {v.label}
            </button>
          ))}
        </div>

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

      {/* Delivery, to be implemented */}
      <div className="product-details-list">
        <h2 className="section-title">Product Details</h2>
        <p className="section-text">{product.description}</p>
        <p className="section-subtitle">Includes:</p>
        <ul className="includes-list">
          {product.included?.map(item => (
            <li key={item}>{item}</li>
          ))}
        </ul>

        <div className="delivery-section">
          <p className="section-subtitle">Delivery</p>
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
