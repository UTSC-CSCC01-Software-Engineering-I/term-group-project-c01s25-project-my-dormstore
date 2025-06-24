// src/App.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  useNavigate,
  Link
} from "react-router-dom";
import { CartProvider, useCart } from "./contexts/CartContext.tsx";

import TopBar          from "./components/TopBar";
import NavBar          from "./components/NavBar";
import Footer          from "./components/Footer";
import HomePage        from "./pages/Homepage/Homepage";
import ProductListPage from "./pages/ProductListPage";
import ProductDetail   from "./components/ProductDetail.tsx";
import Login           from "./pages/Login";
import Register        from "./pages/Register";
import Profile         from "./pages/Profile";
import ChecklistPage   from "./pages/ChecklistPage";
import OrderTrack      from "./pages/OrderTrack.jsx";
import OurStory        from "./pages/OurStoryBlog/OurStory/OurStory";
import Blog            from "./pages/OurStoryBlog/Blog/Blog";
import Ambassador      from "./pages/OurStoryBlog/Ambassador/Ambassador";
import BlogDetail      from "./pages/OurStoryBlog/Blog/BlogDetail";
import CheckoutPage    from "./pages/CheckoutPage/CheckoutPage.jsx";
import CartScreen      from "./components/CartScreen";

import { countryCurrency } from "./data/countryCurrency";

import "@fortawesome/fontawesome-free/css/all.min.css";
import "./App.css";

function AppContent() {
  const [showCart, setShowCart]               = useState(false);
  const { totalItems }                        = useCart();
  const navigate                              = useNavigate();
  const location                              = useLocation();
  const langDropdownRef                       = useRef(null);
  const [isLoggedIn, setIsLoggedIn]           = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("CA | English");
  const [searchTerm, setSearchTerm]           = useState("");

  const hidelayoutRoutes = ["/login", "/register"];
  const hidelayout       = hidelayoutRoutes.includes(location.pathname);

  // hide cart overlay whenever route changes
  useEffect(() => {
    setShowCart(false);
  }, [location.pathname]);

  // check authentication
  useEffect(() => {
    async function checkAuth() {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/me", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        setIsLoggedIn(res.ok);
      } catch {
        setIsLoggedIn(false);
      }
    }
    checkAuth();
  }, []);

  // close language dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (
        langDropdownRef.current &&
        !langDropdownRef.current.contains(e.target)
      ) {
        setShowLanguageMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="App">
      {!hidelayout && <TopBar />}

      {!hidelayout && (
        <>
          <header className="header">
            <div className="left-section">
              <div className="logo">
                <Link to="/">
                  <img
                    src="/mydormstroe_log.webp"
                    alt="My Dorm Store Logo"
                    className="logo"
                  />
                </Link>
              </div>
              <div className="search-bar">
                <img
                  src="/search.png"
                  className="search-icon"
                  alt="Search Icon"
                />
                <input type="text" placeholder="Search" />
              </div>
            </div>

            <div className="header-icons">
              <div className="language-dropdown" ref={langDropdownRef}>
                <span
                  onClick={() => setShowLanguageMenu(v => !v)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                  }}
                >
                  <img src="/language.png" alt="Language icon" />
                  <span>{selectedLanguage}</span>
                </span>
                {showLanguageMenu && (
                  <div className="dropdown-container">
                    <input
                      type="text"
                      className="dropdown-search"
                      placeholder="Search"
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                    />
                    <ul className="dropdown-menu">
                      {countryCurrency
                        .filter(({ country }) =>
                          country
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase())
                        )
                        .map(({ country, currency_code }, idx) =>
                          currency_code ? (
                            <li
                              key={idx}
                              onClick={e => {
                                e.stopPropagation();
                                setSelectedLanguage(
                                  `${country} - ${currency_code}`
                                );
                                setShowLanguageMenu(false);
                                setSearchTerm("");
                              }}
                            >
                              <span className="country">{country}</span>
                              <span className="currency">
                                {currency_code}
                              </span>
                            </li>
                          ) : null
                        )}
                    </ul>
                  </div>
                )}
              </div>

              <span
                onClick={() =>
                  navigate(isLoggedIn ? "/profile" : "/login")
                }
                style={{ cursor: "pointer" }}
              >
                <img src="/user.png" alt="User icon" />
              </span>

              <span
                onClick={() => navigate("/checklist")}
                style={{ cursor: "pointer" }}
              >
                <img src="/check_box.png" alt="Checklist icon" />
              </span>

              <span
                onClick={() => setShowCart(v => !v)}
                style={{ cursor: "pointer", position: "relative" }}
              >
                <img src="/shopping.png" alt="Cart icon" />
                {totalItems > 0 && (
                  <span style={{ marginLeft: 5, fontSize: 14 }}>
                    ({totalItems})
                  </span>
                )}
              </span>
            </div>
          </header>

          <NavBar />
        </>
      )}

      {/* fly-down cart overlay */}
      {showCart && (
        <CartScreen
          onClose={() => setShowCart(false)}
          onCheckout={() => navigate("/checkout")}
        />
      )}

      <Routes>
        <Route path="/"            element={<HomePage />} />
        <Route path="/products"    element={<ProductListPage />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/our-story"   element={<OurStory />} />
        <Route path="/blog"        element={<Blog />} />
        <Route path="/blog/:id"    element={<BlogDetail />} />
        <Route path="/ambassador"  element={<Ambassador />} />
        <Route path="/login"       element={<Login />} />
        <Route path="/register"    element={<Register />} />
        <Route path="/profile"     element={<Profile />} />
        <Route path="/checklist"   element={<ChecklistPage />} />
        <Route path="/order-status" element={<OrderTrack />} />
        <Route path="/checkout"    element={<CheckoutPage />} />
      </Routes>

      {!hidelayout && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </BrowserRouter>
  );
}
