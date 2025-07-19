import React, { useState, useEffect, useRef } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  useNavigate,
  Link,
  Navigate,
} from "react-router-dom";

import TopBar from "./components/TopBar";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import CartScreen from "./components/CartScreen";
import UserForm from "./components/userForm";
import RequireAdmin from "./components/RequireAdmin";
import HomePage from "./pages/Homepage/Homepage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ProductListPage from "./pages/ProductListPage";
import PackageListPage from "./pages/PackageListPage";
import ProductDetail from "./components/ProductDetail";
import Profile from "./pages/Profile";
import ChecklistPage from "./pages/ChecklistPage";
import ContactUs from "./pages/ContactUs/ContactUs";
import Blog from "./pages/OurStoryBlog/Blog/Blog";
import BlogDetail from "./pages/OurStoryBlog/Blog/BlogDetail";
import Ambassador from "./pages/OurStoryBlog/Ambassador/Ambassador";
import OurStory from "./pages/OurStoryBlog/OurStory/OurStory";
import OrderTrack from "./pages/OrderTrackingPage";
import CheckoutPage from "./pages/CheckoutPage/CheckoutPage";
import CheckoutPaymentPage from "./pages/CheckoutPage/CheckoutPaymentPage";
import ReviewPage from "./pages/CheckoutPage/ReviewPage";
import SuccessPage from "./pages/CheckoutPage/SuccessPage";
import AdminLogin from "./pages/AdminLogin/AdminLogin";
import AdminLayout from "./pages/adminlayout";
import Home from "./pages/AdminDashboard/tabs/Home";
import InventoryCheck from "./pages/AdminDashboard/tabs/InventoryCheck";
import Orders from "./pages/AdminDashboard/tabs/Orders";
import OrderUpdate from "./pages/AdminDashboard/tabs/OrderUpdate";
import AmbassadorList from "./pages/AdminDashboard/tabs/AmbassadorList";
import UserList from "./pages/AdminDashboard/tabs/UserList";
import ProductManagement from "./pages/AdminDashboard/tabs/ProductManagement";
import OrderDetailPage from './pages/OrderDetailPage';
import OrderStatusPage from "./pages/OrderStatusPage.jsx";
import { CartProvider, useCart } from "./contexts/CartContext.tsx";
import { CheckoutProvider } from "./contexts/CheckoutContext.tsx";
import { countryCurrency } from "./data/countryCurrency";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./App.css";

function AppContent() {
  const [showCart, setShowCart] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { totalItems } = useCart();
  const langDropdownRef = useRef(null);

  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("CA | English");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showUserForm, setShowUserForm] = useState(false);

  const hidelayout = [
    "/login",
    "/register",
    "/forgot-password",
    "/checkout",
    "/checkout/payment",
    "/checkout/review",
    "/admin-login",
  ].some((prefix) => location.pathname === prefix || location.pathname.startsWith("/admin") || location.pathname.startsWith("/order-status/"));

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
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
                <img src="/mydormstroe_log.webp" alt="My Dorm Store Logo" />
              </Link>
            </div>
            <div className="search-bar">
              <img src="/search.png" className="search-icon" alt="Search Icon" />
              <input type="text" placeholder="Search" />
            </div>
          </div>

          <div className="header-icons">
            <div className="language-dropdown" ref={langDropdownRef}>
              <span onClick={() => setShowLanguageMenu((prev) => !prev)}>
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
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <ul className="dropdown-menu">
                    {countryCurrency
                      .filter(({ country }) => country.toLowerCase().includes(searchTerm.toLowerCase()))
                      .map(({ country, currency_code }, idx) => (
                        <li key={idx} onClick={() => {
                          setSelectedLanguage(`${country} - ${currency_code}`);
                          setShowLanguageMenu(false);
                          setSearchTerm("");
                        }}>
                          <span className="country">{country}</span>
                          <span className="currency">{currency_code}</span>
                        </li>
                      ))}
                  </ul>
                </div>
              )}
            </div>

            <span onClick={() => navigate(isLoggedIn ? "/profile" : "/login")}>
              <img src="/user.png" alt="User" />
            </span>
            <span onClick={() => navigate(isLoggedIn ? "/checklist" : "/login")}>
              <img src="/check_box.png" alt="Checklist" />
            </span>
            <span onClick={() => setShowCart(true)} style={{ position: "relative" }}>
              <img src="/shopping.png" alt="Cart" />
              {totalItems > 0 && <span style={{ marginLeft: "5px", fontSize: "14px" }}>({totalItems})</span>}
            </span>
          </div>
        </header>
      )}

      {!hidelayout && <NavBar isLoggedIn={isLoggedIn} />}

      {showCart ? (
        <CartScreen />
      ) : (
        <Routes>
          {/* Customer Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductListPage />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/packages" element={<PackageListPage />} />
          <Route path="/packages/:id" element={<ProductDetail />} />
          <Route path="/bedding" element={<PackageListPage key="bedding" category="Bedding" />} />
          <Route path="/living" element={<PackageListPage key="living" category="Living" />} />
          <Route path="/caring" element={<PackageListPage key="caring" category="Caring" />} />
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
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/checklist" element={<ChecklistPage />} />
          <Route path="/order-status" element={<OrderTrack />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/checkout/payment" element={<CheckoutPaymentPage />} />
          <Route path="/checkout/review" element={<ReviewPage />} />
          <Route path="/checkout/success" element={<SuccessPage />} />
          <Route path="/order-status/:orderId" element={<OrderStatusPage />} />
          <Route path="/order-details/:orderId" element={<OrderDetailPage />} />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <RequireAdmin>
                <AdminLayout />
              </RequireAdmin>
            }
          >
            <Route index element={<Navigate to="home" />} />
            <Route path="home" element={<Home />} />
            <Route path="inventory" element={<InventoryCheck />} />
            <Route path="orders" element={<Orders />} />
            <Route path="update" element={<OrderUpdate />} />
            <Route path="ambassadors" element={<AmbassadorList />} />
            <Route path="users" element={<UserList />} />
            <Route path="products" element={<ProductManagement />} />
          </Route>

          <Route path="/admin-login" element={<AdminLogin />} />
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
        <CheckoutProvider>
          <AppContent />
        </CheckoutProvider>
      </CartProvider>
    </BrowserRouter>
  );
}

export default App;
