import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

let timeoutId = null;

export default function NavBar({ isLoggedIn }) {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const location = useLocation();
 
  const isFixedDropdownPage = location.pathname === "/products" || location.pathname === "/packages";

  const handleMouseEnter = (menu) => {
    clearTimeout(timeoutId);
    setActiveDropdown(menu);
    setSelectedSection(menu);
  };

  const handleMouseLeave = () => {
    if (!isFixedDropdownPage) {
      timeoutId = setTimeout(() => {
        setActiveDropdown(null);
        setSelectedSection(null);
      }, 200);
    }
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

  useEffect(() => {
    if (location.pathname === "/products") {
      setSelectedSection("items");
      setActiveDropdown("items");
      sessionStorage.setItem("dropdownSection", "items");
    } else if (location.pathname === "/packages") {
      setSelectedSection("packages");
      setActiveDropdown("packages");
      sessionStorage.setItem("dropdownSection", "packages");
    } else {
      setSelectedSection(null);
      setActiveDropdown(null);
      sessionStorage.removeItem("dropdownSection");
    }
  }, [location.pathname]);

  return (
    <>
      <nav className="nav-bar">
        {/* Shop Packages */}
        <span
          className={`nav-title ${selectedSection === "packages" ? "active-tab" : ""}`}
          onMouseEnter={() => handleMouseEnter("packages")}
          onMouseLeave={handleMouseLeave}
          onClick={() => {
            sessionStorage.setItem("dropdownSection", "packages");
            setSelectedSection("packages");
            setActiveDropdown("packages");
          }}
        >
          Shop Packages
        </span>

        {/* Shop by Items */}
        <span
          className={`nav-title ${selectedSection === "items" ? "active-tab" : ""}`}
          onMouseEnter={() => handleMouseEnter("items")}
          onMouseLeave={handleMouseLeave}
          onClick={() => {
            sessionStorage.setItem("dropdownSection", "items");
            setSelectedSection("items");
            setActiveDropdown("items");
          }}
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
              {isLoggedIn && (
                <Link to="/checklist" className="nav-link">
                  Move-in Checklist
                </Link>
              )}          
              <Link to="/order-status#order-status">Order Status</Link>
              <Link to="/order-status#order-tracking">Track My Orders</Link>
              <Link to="/live-chat">Live Chat</Link>
              <Link to="/contact">Contact Us</Link>
            </div>
          )}
        </div>
      </nav>

      {selectedSection === "packages" && (
        <div
          className="mega-menu-scroll"
          onMouseEnter={() => clearTimeout(timeoutId)}
          onMouseLeave={!isFixedDropdownPage ? handleMouseLeave : undefined}
        >
          {packageCategories.map((cat) => (
            <Link to={cat.link} className="menu-tile" key={cat.name}>
              <img src={cat.image} alt={cat.name} />
              <span className="menu-label">{cat.name}</span>
            </Link>
          ))}
        </div>
      )}

      {selectedSection === "items" && (
        <div
          className="mega-menu-scroll"
          onMouseEnter={() => clearTimeout(timeoutId)}
          onMouseLeave={!isFixedDropdownPage ? handleMouseLeave : undefined}
        >
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
