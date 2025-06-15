import { useState, useEffect } from 'react'
import { ProductList } from './components/ProductList'
import ProductDetail from './components/ProductDetail'
import { sampleProducts } from './data/sampleProducts'
import { Routes, Route } from 'react-router-dom'

function App() {
  const [message, setMessage] = useState('Loading...')

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
    <div>
      <h1>My Dorm Store</h1>
      <p>Welcome to your one-stop shop for dorm essentials!</p>
      
      <div>
        <h2>Arrive Move In Ready</h2>
        <p>Check off your list with dorm ready bundles just for your dorm.</p>
        <Routes>
        {/* list view at “/” */}
        <Route
          path="/"
          element={
            <ProductList
              products={sampleProducts}
              onAddToCart={handleAddToCart}
            />
          }
        />

        {/* detail view at “/products/:id” */}
        <Route
          path="/products/:id"
          element={<ProductDetail />}
        />
      </Routes>
      </div>

      <div>
        <h3>Backend Connection Test:</h3>
        <p>{message}</p>
      </div>
    </div>
  )
}

export default App 