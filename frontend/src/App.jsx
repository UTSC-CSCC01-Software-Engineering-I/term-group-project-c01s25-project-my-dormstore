import React, { useState } from "react";
import TopBar from "./components/TopBar";
import Header from "./components/Header";
import NavBar from "./components/NavBar";
import HomePage from "./pages/Homepage/Homepage"; 
import Footer from "./components/Footer";
import { CartProvider } from "./contexts/CartContext";
import CartScreen from "./components/CartScreen";
import "./App.css"; // your main styles

function App() {
  const [showCart, setShowCart] = useState(false);

  return (
    <CartProvider>
      <div className="App">
        <TopBar />
        <Header onShowCart={() => setShowCart(true)} />
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