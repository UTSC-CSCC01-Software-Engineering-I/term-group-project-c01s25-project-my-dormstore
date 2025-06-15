import React from "react";
import { Link } from "react-router-dom";

export default function NavBar() {
  return (
    <nav className="nav-bar">
      <Link to="/shopPackages">Shop Packages</Link>
      <Link to="/shopItems">Shop Items</Link>
      <Link to="/OurStory">Our Story & Blog</Link>
      <Link to="/CutomerService">Customer Service</Link>
    </nav>
  );
}