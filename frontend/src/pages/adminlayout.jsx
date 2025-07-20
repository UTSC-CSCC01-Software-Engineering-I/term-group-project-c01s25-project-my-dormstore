import { NavLink } from 'react-router-dom';
import { Outlet, useNavigate } from "react-router-dom";
import './AdminDashboard/AdminDashboard.css';

const AdminLayout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("isAdmin");
    navigate("/admin-login");
  };

  return (
    <div className="admin-dashboard">
      <aside className="sidebar">
        <div className="logo">
          <img src="/images/logo-mydormstore.png" alt="MyDormStore Logo" />
        </div>
        <nav className="nav-links">
          <NavLink to="home" className={({ isActive }) => isActive ? "link active" : "link"}>Home</NavLink>
          <NavLink to="orders" className={({ isActive }) => isActive ? "link active" : "link"}>Orders</NavLink>
          <NavLink to="update" className={({ isActive }) => isActive ? "link active" : "link"}>Order Update</NavLink>
          <NavLink to="products" className={({ isActive }) => isActive ? "link active" : "link"}>Product Management</NavLink>
          <NavLink to="ambassadors" className={({ isActive }) => isActive ? "link active" : "link"}>Ambassador List</NavLink>
          <NavLink to="users" className={({ isActive }) => isActive ? "link active" : "link"}>User List</NavLink>
        </nav>
        <button className="logout-button" onClick={handleLogout}>Logout</button>
      </aside>

      <main className="main-content">
        <Outlet /> 
      </main>
    </div>
  );
};

export default AdminLayout;
