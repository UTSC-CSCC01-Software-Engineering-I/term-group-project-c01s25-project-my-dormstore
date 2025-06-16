import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Link } from "react-router-dom";

export default function NavBar() {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const location = useLocation();

  let timeoutId = null;

  const handleMouseEnter = (menu) => {
    clearTimeout(timeoutId);
    setActiveDropdown(menu);
  };

  const handleMouseLeave = () => {
    timeoutId = setTimeout(() => {
      setActiveDropdown(null);
    }, 200);
  };

  const packageCategories = [
    { name: "View All", image: "/images/viewall.png", link: "/products" },
    { name: "Bedding", image: "/images/bathroom.png", link: "/bathroom" },
    { name: "Living", image: "/images/living.png", link: "/living" },
    { name: "Caring", image: "/images/caring.png", link: "/caring" },
  ]

  const categories = [
    { name: "View All", image: "/images/viewall.png", link: "/products" },
    { name: "Bedding", image: "/images/bedding.png", link: "/bedding" },
    { name: "Tech", image: "/images/tech.png", link: "/tech" },
    { name: "Storage", image: "/images/storage.png", link: "/storage" },
    { name: "Laundry", image: "/images/laundry.png", link: "/laundry" },
    { name: "Desk", image: "/images/desk.png", link: "/desk" },
    { name: "Decor", image: "/images/decor.png", link: "/decor" },
  ];

  useEffect(() => {
    setSelectedSection(null);  
  }, [location.pathname]);

  return (
    <>
    <nav className="nav-bar">
      {/* Shop Packages */}
      <span
        className={`nav-title ${selectedSection === "packages" ? "active-tab" : ""}`}
        onClick={() => setSelectedSection("packages")}
      >
      Shop Packages
      </span>
      <span
        className={`nav-title ${selectedSection === "items" ? "active-tab" : ""}`}
        onClick={() => setSelectedSection("items")}
      >
      Shop by Items
      </span>

      {/* Our Story & Blog */}
      <div
        className="dropdown"
        onMouseEnter={() => handleMouseEnter("story")}
        onMouseLeave={handleMouseLeave}
      >
        <Link to="/our-story" className="dropdown-title">Our Story & Blog</Link>
        {activeDropdown === "story" && (
          <div className="dropdown-content">
            <Link to="/our-story">Our Dorm Story</Link>
            <Link to="/blog">My Dorm Store Blog</Link>
            <Link to="/ambassador">Ambassador Program</Link>
          </div>
        )}
      </div>

      {/* Customer Service */}
      <div
        className="dropdown"
        onMouseEnter={() => handleMouseEnter("service")}
        onMouseLeave={handleMouseLeave}
      >
        <Link to="/contact" className="dropdown-title">Customer Service</Link>
        {activeDropdown === "service" && (
          <div className="dropdown-content">
            <Link to="/visualizer">Dorm Visualizer</Link>
            <Link to="/checklist">Move-in Checklist</Link>
            <Link to="/order-status">Order Status</Link>
            <Link to="/track-orders">Track My Orders</Link>
            <Link to="/live-chat">Live Chat</Link>
            <Link to="/contact">Contact Us</Link>
          </div>
        )}
      </div>
    </nav>

    {selectedSection === "packages" && (
      <div className="mega-menu-scroll">
        {packageCategories.map((cat) => (
          <Link to={cat.link} className="menu-tile" key={cat.name}>
            <img src={cat.image} alt={cat.name} />
            <span className="menu-label">{cat.name}</span>
          </Link>
        ))}
      </div>
    )}

    {selectedSection === "items" && (
      <div className="mega-menu-scroll">
        {categories.map((cat) => (
          <Link to={cat.link} className="menu-tile" key={cat.name}>
            <img src={cat.image} alt={cat.name} />
          </Link>
        ))}
      </div>
    )}
    </>
  );
}
