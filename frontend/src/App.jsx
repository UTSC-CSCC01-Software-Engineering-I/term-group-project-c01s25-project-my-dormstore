import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation, useNavigate, Link } from "react-router-dom";
import { useRef } from "react";
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
import ProductDetail from "./components/ProductDetail.tsx";
import BlogDetail from "./pages/OurStoryBlog/Blog/BlogDetail";
import Profile from "./pages/Profile";
import ChecklistPage from "./pages/ChecklistPage";
import { countryCurrency } from "./data/countryCurrency";
import OrderTrack from "./pages/OrderTrack.jsx";
import UserForm from "./components/userForm.jsx";
import ScrollToTop from "./components/ScrollToTop";
import ForgotPassword from "./pages/ForgotPassword.jsx";


import "@fortawesome/fontawesome-free/css/all.min.css";
import "./App.css";

function AppContent() {
  const [showCart, setShowCart] = useState(false);
  const location = useLocation();
  const { totalItems } = useCart();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const langDropdownRef = useRef(null);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("CA | English");
  const [searchTerm, setSearchTerm] = useState("");
  const [showUserForm, setShowUserForm] = useState(false);


  const hidelayoutRoutes = ["/login", "/register", "/forgot-password"];
  const hidelayout = hidelayoutRoutes.includes(location.pathname);

  useEffect(() => {
    async function checkAuth() {
      try {
        const token = localStorage.getItem("token");
  
        const res = await fetch(`${process.env.REACT_APP_API_URL}/me`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
  
        if (res.ok) {
          setIsLoggedIn(true);
          const data = await res.json();
          const email = data.email;
          const userData = {
            firstname: data.first_name,
            lastname: data.last_name,
            dorm: data.dorm,
            school: data.school,
            email,
          };
  
          localStorage.setItem("userEmail", email);
          localStorage.setItem(`userInfo_${email}`, JSON.stringify(userData));
  
          const isIncomplete =
            !userData.firstname || !userData.lastname || !userData.school || !userData.dorm;
          const completed = localStorage.getItem(`completed_${email}`);
          if (!completed || isIncomplete) {
            setShowUserForm(true);
          }
        } else {
          setIsLoggedIn(false);
        }
      } catch (err) {
        console.error(err);
        setIsLoggedIn(false);
      }
    }
  
    checkAuth();
  }, []);

  // close cart when navigating to different pages
  useEffect(() => {
    setShowCart(false);
  }, [location.pathname]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target)) {
        setShowLanguageMenu(false);
      }
    }
  
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  return (
    <div className="App">
      {showUserForm && (
        <UserForm
          onClose={() => setShowUserForm(false)}
          onSubmit={(data) => {
            const email = localStorage.getItem("userEmail");
            if (email) {
              localStorage.setItem(`userInfo_${email}`, JSON.stringify(data));
              localStorage.setItem(`completed_${email}`, "true"); 
            }
            setShowUserForm(false);
          }}
        />
      )}
      {!hidelayout && <TopBar />}

      {!hidelayout && (
        <header className="header">
          <div className="left-section">
            <div className="logo">
              <Link to="/">
                <img src="/mydormstroe_log.webp" alt="My Dorm Store Logo" className="logo" />
              </Link>
            </div>
            <div className="search-bar">
              <img src="/search.png" className="search-icon" alt="Search Icon" />
              <input type="text" placeholder="Search" />
            </div>
          </div>

          <div className="header-icons">
            <div className="language-dropdown" ref={langDropdownRef}>
              <span onClick={() => setShowLanguageMenu(prev => !prev)} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <img src="/language.png" alt="Language icon" />
                <span>{selectedLanguage}</span>
              </span>
              {showLanguageMenu && (
                <div className="dropdown-container" ref={langDropdownRef}>
                  <input
                    type="text"
                    className="dropdown-search"
                    placeholder="Search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <ul className="dropdown-menu">
                    {countryCurrency
                      .filter(({ country }) =>
                      country.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map(({ country, currency_code }, idx) => (
                        currency_code && (
                          <li
                            key={idx}
                            onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLanguage(`${country} - ${currency_code}`);
                            setShowLanguageMenu(false);
                            setSearchTerm("");
                          }}
                          >
                            <span className="country">{country}</span>
                            <span className="currency">{currency_code}</span>
                          </li>
                        )
                      ))}
                  </ul>
                </div>
              )}
            </div>
            <span
              onClick={() => navigate(isLoggedIn ? "/profile" : "/login")}
              style={{ cursor: "pointer" }}
            >
              <img src="/user.png" alt="User icon" />
            </span>
            <span onClick={() => navigate(isLoggedIn ? "/checklist" : "/login")} style={{ cursor: "pointer" }}>
              <img src="/check_box.png" alt="Checklist icon" />
            </span>
            <span onClick={() => setShowCart(true)} style={{ cursor: "pointer", position: "relative" }}>
              <img src="/shopping.png" alt="Cart icon" />
              {totalItems > 0 && (
                <span style={{ marginLeft: "5px", fontSize: "14px" }}>
                  ({totalItems})
                </span>
              )}
            </span>
          </div>
        </header>
      )}

      {!hidelayout && <NavBar isLoggedIn={isLoggedIn} />}

      {showCart ? (
        <CartScreen />
      ) : (
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductListPage />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          {/* Category routes */}
          <Route path="/bedding" element={<ProductListPage key="bedding" category="Bedding" />} />
          <Route path="/bathroom" element={<ProductListPage key="bathroom" category="Bathroom" />} />
          <Route path="/tech" element={<ProductListPage key="tech" category="Tech" />} />
          <Route path="/storage" element={<ProductListPage key="storage" category="Storage" />} />
          <Route path="/laundry" element={<ProductListPage key="laundry" category="Laundry" />} />
          <Route path="/desk" element={<ProductListPage key="desk" category="Desk" />} />
          <Route path="/decor" element={<ProductListPage key="decor" category="Decor" />} />
          <Route path="/our-story" element={<OurStory />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:id" element={<BlogDetail />} />
          <Route path="/ambassador" element={<Ambassador />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/checklist" element={<ChecklistPage />} />
          <Route path="/order-status" element={<OrderTrack />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Routes>
      )}

      {!hidelayout && <Footer />}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <CartProvider>
        <AppContent />
      </CartProvider>
    </BrowserRouter>
  );
}

export default App;
