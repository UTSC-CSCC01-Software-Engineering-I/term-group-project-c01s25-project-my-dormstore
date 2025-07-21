import React from "react";
import { NavLink, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Home from "./tabs/Home";
import Orders from "./tabs/Orders";
import OrderUpdate from "./tabs/OrderUpdate";
import AmbassadorList from "./tabs/AmbassadorList";
import UserList from "./tabs/UserList";
import ProductManagement from "./tabs/ProductManagement";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("isAdmin");
    navigate("/admin-login");
  };

  return (
    <div className="admin-dashboard">
      <aside className="sidebar">
        <div className="adminlogo">
          <img src="/images/logo-mydormstore.png" alt="MyDormStore Logo" />
        </div>
        <nav className="nav-links">
          <NavLink to="/admin/home" className={({ isActive }) => isActive ? "link active" : "link"}>Home</NavLink>
          <NavLink to="/admin/orders" className={({ isActive }) => isActive ? "link active" : "link"}>Orders</NavLink>
          <NavLink to="/admin/update" className={({ isActive }) => isActive ? "link active" : "link"}>Order Update</NavLink>
          <NavLink to="/admin/products" className={({ isActive }) => isActive ? "link active" : "link"}>Product Management</NavLink>
          <NavLink to="/admin/ambassadors" className={({ isActive }) => isActive ? "link active" : "link"}>Ambassador List</NavLink>
          <NavLink to="/admin/users" className={({ isActive }) => isActive ? "link active" : "link"}>User List</NavLink>
        </nav>

        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </aside>

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Navigate to="/admin/home" />} />
          <Route path="home" element={<Home />} />
          <Route path="orders" element={<Orders />} />
          <Route path="update" element={<OrderUpdate />} />
          <Route path="ambassadors" element={<AmbassadorList />} />
          <Route path="users" element={<UserList />} />
          <Route path="products" element={<ProductManagement />} />
        </Routes>
      </main>
    </div>
  );
};

export default AdminDashboard;
