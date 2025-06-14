import React from "react";
import TopBar from "./components/TopBar";
import Header from "./components/Header";
import NavBar from "./components/NavBar";
import HomePage from "./pages/Homepage/Homepage"; 
import "./App.css"; // your main styles

function App() {
  return (
    <div className="App">
      <TopBar />
      <Header />
      <NavBar />
      <HomePage />
    </div>
  );
}

export default App;