import { useState, useEffect } from 'react'

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

  return (
    <div>
      <h1>My Dorm Store</h1>
      <p>Welcome to your one-stop shop for dorm essentials!</p>
      <div>
        <h3>Backend Connection Test:</h3>
        <p>{message}</p>
      </div>
    </div>
  )
}

export default App 