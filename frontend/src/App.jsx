import React, { useState } from "react";
import TopBar from "./components/TopBar";
import NavBar from "./components/NavBar";
import HomePage from "./pages/Homepage/Homepage"; 
import Footer from "./components/Footer";
import { CartProvider } from "./contexts/CartContext.tsx";
import CartScreen from "./components/CartScreen";
import "./App.css"; // your main styles

function App() {
  const [showCart, setShowCart] = useState(false);

  return (
    <CartProvider>
      <div className="App">
        <TopBar />
        
        {/* Header built directly in App */}
        <header className="header">
          <div className="left-section">
            <div className="logo">
              <img src="/mydormstroe_log.webp" alt="My Dorm Store Logo" />
            </div>
            <div className="search-bar">
              <img src="/search.png" className="search-icon" alt="Search Icon" />
              <input type="text" placeholder="Search" />
            </div>
          </div>

          <div className="header-icons">
            <span>
              <img src="/language.png" alt="Language icon" /> CA | English
            </span>
            <span>
              <img src="/user.png" alt="User icon" />
            </span>
            <span>
              <img src="/check_box.png" alt="Checklist icon" />
            </span>
            <span onClick={() => setShowCart(true)} style={{ cursor: 'pointer' }}>
              <img src="/shopping.png" alt="Cart icon" />
            </span>
          </div>
        </header>
        
        <NavBar />
        {showCart ? (
          <CartScreen />
        ) : (
          <HomePage />
        )}
        <Footer />
      </div>
    </CartProvider>
 );
}

export default App;