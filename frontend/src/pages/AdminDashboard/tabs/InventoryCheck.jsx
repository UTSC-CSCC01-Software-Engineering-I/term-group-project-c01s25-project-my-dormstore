import React, { useState, useEffect } from "react";
import "./InventoryCheck.css";

const InventoryCheck = () => {
  const [search, setSearch] = useState("");
  const [inventory, setInventory] = useState([]);

  // need to fetch inventory data from the backend
  // data needed formating[{ id, name, sku, stock }]
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/inventory`);
        const data = await res.json();
        setInventory(data);
      } catch (err) {
        console.error("Failed to fetch inventory:", err);
      }
    };

    fetchInventory();
  }, []);

    // Filter inventory based on search input
  const filtered = inventory.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="inventory-page">
      <h1>Inventory Check</h1>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by name or SKU..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="dashboard-card">
        <table className="inventory-table">
          <thead>
            <tr>
              <th>Product Name</th>
              <th>SKU</th>
              <th>Stock</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.sku}</td>
                  <td className={item.stock === 0 ? "out-of-stock" : ""}>
                    {item.stock}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" style={{ textAlign: "center", padding: "1rem" }}>
                  No matching items found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryCheck;
