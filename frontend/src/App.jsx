import React from "react";
import TopBar from "./components/TopBar";
import Header from "./components/Header";
import NavBar from "./components/NavBar";
import HomePage from "./pages/Homepage/Homepage"; 
import Footer from "./components/Footer";
import "./App.css"; // your main styles

function App() {
  return (
    <div className="App">
      <TopBar />
      <Header />
      <NavBar />
      <HomePage />
      <Footer />
    </div>
  );
}

export default App;