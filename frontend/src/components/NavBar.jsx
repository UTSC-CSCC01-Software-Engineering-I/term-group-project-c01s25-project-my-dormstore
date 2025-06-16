import React from "react";
import { Link } from "react-router-dom";

export default function NavBar() {
  return (
    <nav className="nav-bar">
      <a href="#">Shop Packages</a>
      <Link to="/products">Shop by Items</Link>
      <Link to="/our-story">Our Story & Blog</Link>
      <a href="#">Customer Service</a>
    </nav>
  );
}