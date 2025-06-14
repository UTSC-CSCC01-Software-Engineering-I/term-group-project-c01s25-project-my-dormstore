import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useLocation } from "react-router-dom";
import TopBar from "./components/TopBar";
import Header from "./components/Header";
import NavBar from "./components/NavBar";
import Content from "./components/Content";
import Login from "./pages/Login";
import Register from "./pages/Register"

import "./App.css"; 

function AppContent() {
  const location = useLocation();
  const hidelayoutRoutes = ["/login", "/register"];
  const hidelayout = hidelayoutRoutes.includes(location.pathname);

  return (
    <div className="App">
      {!hidelayout && <TopBar />}
      {!hidelayout && <Header />}
      {!hidelayout && <NavBar />}

      <Routes>
        <Route path="/" element={<Content />} />
        <Route path="/content" element={<Content />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </div>
  );
}


export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}