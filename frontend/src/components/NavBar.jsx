import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

let timeoutId = null;

export default function NavBar({ isLoggedIn }) {
  const location = useLocation();

  const itemPaths = ["/products", "/bathroom", "/tech", "/storage", "/laundry", "/desk", "/decor"];
  const packagePaths = ["/packages", "/bedding", "/living", "/caring"];

  const [baseSection, setBaseSection] = useState(null);        
  const [activeDropdown, setActiveDropdown] = useState(null); 

  useEffect(() => {
    const path = location.pathname;
    if (itemPaths.includes(path)) {
      setBaseSection("items");
      setActiveDropdown("items");
    } else if (packagePaths.includes(path)) {
      setBaseSection("packages");
      setActiveDropdown("packages");
    } else {
      setBaseSection(null);
      setActiveDropdown(null);
    }
  }, [location.pathname]);

  const handleMouseEnter = (menu) => {
    clearTimeout(timeoutId);
    setActiveDropdown(menu); // visual only
  };

  const handleMouseLeave = () => {
    timeoutId = setTimeout(() => {
      setActiveDropdown(baseSection); // revert to what the route says
    }, 200);
  };

  const packageCategories = [
    { name: "View All", image: "/images/viewall.png", link: "/packages" },
    { name: "Bedding", image: "/images/bedding.png", link: "/bedding" },
    { name: "Living", image: "/images/living.png", link: "/living" },
    { name: "Caring", image: "/images/caring.png", link: "/caring" },
  ];

  const categories = [
    { name: "View All", image: "/images/viewall.png", link: "/products" },
    { name: "Bathroom", image: "/images/bathroom.png", link: "/bathroom" },
    { name: "Tech", image: "/images/tech.png", link: "/tech" },
    { name: "Storage", image: "/images/storage.png", link: "/storage" },
    { name: "Laundry", image: "/images/laundry.png", link: "/laundry" },
    { name: "Desk", image: "/images/desk.png", link: "/desk" },
    { name: "Decor", image: "/images/decor.png", link: "/decor" },
  ];

  return (
    <>
      <nav className="nav-bar">
        <span
          className={`nav-title ${baseSection === "packages" ? "active-tab" : ""}`}
          onMouseEnter={() => handleMouseEnter("packages")}
          onMouseLeave={handleMouseLeave}
        >
          Shop Packages
        </span>

        <span
          className={`nav-title ${baseSection === "items" ? "active-tab" : ""}`}
          onMouseEnter={() => handleMouseEnter("items")}
          onMouseLeave={handleMouseLeave}
        >
          Shop by Items
        </span>

        <div className="dropdown" onMouseEnter={() => handleMouseEnter("story")} onMouseLeave={handleMouseLeave}>
          <Link to="/our-story" className="dropdown-title">Our Story & Blog</Link>
          {activeDropdown === "story" && (
            <div className="dropdown-content">
              <Link to="/our-story">Our Dorm Story</Link>
              <Link to="/blog">My Dorm Store Blog</Link>
              <Link to="/ambassador">Ambassador Program</Link>
            </div>
          )}
        </div>

        <div className="dropdown" onMouseEnter={() => handleMouseEnter("service")} onMouseLeave={handleMouseLeave}>
          <Link to="/contact" className="dropdown-title">Customer Service</Link>
          {activeDropdown === "service" && (
            <div className="dropdown-content">
              {isLoggedIn && <Link to="/checklist" className="nav-link">Move-in Checklist</Link>}
              <Link to="/order-status#order-status">Order Status</Link>
              <Link to="/order-status#order-tracking">Track My Orders</Link>
              <Link to="/live-chat">Live Chat</Link>
              <Link to="/contact">Contact Us</Link>
            </div>
          )}
        </div>
      </nav>

      {activeDropdown === "packages" && (
        <div className="mega-menu-scroll" onMouseEnter={() => clearTimeout(timeoutId)} onMouseLeave={handleMouseLeave}>
          {packageCategories.map((cat) => (
            <Link to={cat.link} className="menu-tile" key={cat.name}>
              <img src={cat.image} alt={cat.name} />
              <span className="menu-label">{cat.name}</span>
            </Link>
          ))}
        </div>
      )}

      {activeDropdown === "items" && (
        <div className="mega-menu-scroll" onMouseEnter={() => clearTimeout(timeoutId)} onMouseLeave={handleMouseLeave}>
          {categories.map((cat) => (
            <Link to={cat.link} className="menu-tile" key={cat.name}>
              <img src={cat.image} alt={cat.name} />
              <span className="menu-label">{cat.name}</span>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
