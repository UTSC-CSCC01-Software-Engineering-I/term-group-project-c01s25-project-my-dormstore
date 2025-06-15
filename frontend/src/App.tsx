import { useState, useEffect } from 'react'
import { ProductList } from './components/ProductList'
import { sampleProducts } from './data/sampleProducts'
import { CartProvider } from './contexts/CartContext'

function App() {
  const [message, setMessage] = useState('Loading...')
  const [showCart, setShowCart] = useState(false)

  useEffect(() => {
    //test connection to backend
    fetch('http://localhost:8000/api/test')
      .then(response => response.json())
      .then(data => {
        setMessage(data.message)
      })
      .catch(error => {
        setMessage('Error connecting to backend: ' + error.message)
      })
  }, [])

  const handleAddToCart = (productId: number) => {
    console.log('Added product to cart:', productId)
    // TODO: Implement cart functionality
  }

  return (
    <CartProvider>
      <div>
        <h1>My Dorm Store</h1>
        <p>Welcome to your one-stop shop for dorm essentials!</p>
        
        <div>
          <h2>Arrive Move In Ready</h2>
          <p>Check off your list with dorm ready bundles just for your dorm.</p>
          <ProductList products={sampleProducts} onAddToCart={handleAddToCart} />
        </div>

        <div>
          <h3>Backend Connection Test:</h3>
          <p>{message}</p>
        </div>
      </div>
    </CartProvider>
  )
}

export default App 