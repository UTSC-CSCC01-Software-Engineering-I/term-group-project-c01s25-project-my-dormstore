import { useParams, useNavigate } from 'react-router-dom'
import { sampleProducts } from '../data/sampleProducts'

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const product = sampleProducts.find(p => p.id.toString() === id)

  if (!product) {
    return (
      <div style={{ padding: 20 }}>
        <h2>Product not found</h2>
        <button onClick={() => navigate(-1)}>← Back</button>
      </div>
    )
  }

  return (
    <div className="product-detail" style={{ padding: 20 }}>
      <button onClick={() => navigate(-1)} style={{ marginBottom: 20 }}>
        ← Back to list
      </button>
      <img src={product.imageUrl} alt={product.name} style={{ maxWidth: 400 }} />
      <h1>{product.name}</h1>
      <p><strong>Price:</strong> ${product.price.toFixed(2)}</p>
      <p>{product.description}</p>
      </div>
  )
}
