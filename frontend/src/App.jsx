import React, { useState } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import TopBar from "./components/TopBar";
import NavBar from "./components/NavBar";
import HomePage from "./pages/Homepage/Homepage"; 
import Footer from "./components/Footer";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProductListPage from "./pages/ProductListPage";
import { CartProvider, useCart } from "./contexts/CartContext.tsx";
import CartScreen from "./components/CartScreen";
import OurStory from "./pages/OurStoryBlog/OurStory/OurStory";
import Blog from "./pages/OurStoryBlog/Blog/Blog";
import Ambassador from "./pages/OurStoryBlog/Ambassador/Ambassador";
import BlogDetail from "./pages/OurStoryBlog/Blog/BlogDetail";

import '@fortawesome/fontawesome-free/css/all.min.css';
import "./App.css"; // your main styles

function AppContent() {
  const [showCart, setShowCart] = useState(false);
  const location = useLocation();
  const { totalItems } = useCart();
  
  // Hide layout components on login and register pages
  const hidelayoutRoutes = ["/login", "/register"];
  const hidelayout = hidelayoutRoutes.includes(location.pathname);

  return (
    <CartProvider>
      <div className="App">
        {!hidelayout && <TopBar />}
        
        {/* Header built directly in App - only show when not on login/register */}
        {!hidelayout && (
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
              <span onClick={() => setShowCart(true)} style={{ cursor: 'pointer', position: 'relative' }}>
                <img src="/shopping.png" alt="Cart icon" />
                {totalItems > 0 && (
                  <span style={{ marginLeft: '5px', fontSize: '14px' }}>
                    ({totalItems})
                  </span>
                )}
              </span>
            </div>
          </header>
        )}
        
        {!hidelayout && <NavBar />}
        {showCart ? (
          <CartScreen />
        ) : (
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductListPage />} />
          <Route path="/our-story" element={<OurStory />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:id" element={<BlogDetail />} />
          <Route path="/ambassador" element={<Ambassador />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
                  </Routes>
        )}
        
        {!hidelayout && <Footer />}
      </div>
    </CartProvider>
  );
}

function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </BrowserRouter>
  );
}

export default App;