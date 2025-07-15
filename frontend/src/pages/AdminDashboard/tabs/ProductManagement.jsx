import React, { useState } from "react";
import "./ProductManagement.css";

const ProductManagement = () => {
  const [products, setProducts] = useState([
    {
      id: 1,
      name: "Dorm Plate Set",
      price: 29.99,
      description: "Includes 4 ceramic plates with dorm-friendly minimalist design.",
      rating: 4.6,
      image_url: "/images/plate.jpg",
    },
    {
      id: 2,
      name: "Cozy Bedding Pack",
      price: 89.99,
      description: "Soft twin XL comforter, fitted sheet, and 2 pillow cases. Perfect for dorm beds.",
      rating: 4.8,
      image_url: "/images/bedding.jpg",
    },
    {
      id: 3,
      name: "Study Desk Lamp",
      price: 24.99,
      description: "Adjustable LED lamp with 3 brightness levels and USB charging port.",
      rating: 4.2,
      image_url: "/images/lamp.jpg",
    },
  ]);

  const [expandedProductId, setExpandedProductId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    description: "",
    image_url: "",
  });

  const [editingProductId, setEditingProductId] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  const toggleDescription = (id) => {
    setExpandedProductId(expandedProductId === id ? null : id);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddProduct = (e) => {
    e.preventDefault();
    const newId = products.length + 1;
    const productToAdd = {
      id: newId,
      ...newProduct,
      price: parseFloat(newProduct.price),
      rating: 5,
    };
    setProducts((prev) => [...prev, productToAdd]);
    setNewProduct({ name: "", price: "", description: "", image_url: "" });
    setShowAddForm(false);
  };

  const handleEditClick = (product) => {
    setEditingProductId(product.id);
    setEditFormData({ ...product });
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditSubmit = (e, id) => {
    e.preventDefault();
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              name: editFormData.name,
              price: parseFloat(editFormData.price),
              image_url: editFormData.image_url,
              description: editFormData.description,
            }
          : p
      )
    );
    setEditingProductId(null);
  };

  return (
    <div className="product-management-page">
      <h1>Product Management</h1>
      <div className="top-bar">
        <div className="top-bar-inner">
          <button className="add-button" onClick={() => setShowAddForm(!showAddForm)}>
            {showAddForm ? "Cancel" : "Add Product"}
          </button>
        </div>
      </div>

      {showAddForm && (
        <form className="add-form" onSubmit={handleAddProduct}>
          <input
            type="text"
            name="name"
            placeholder="Product Name"
            value={newProduct.name}
            onChange={handleInputChange}
            required
          />
          <input
            type="number"
            name="price"
            placeholder="Price"
            step="0.01"
            value={newProduct.price}
            onChange={handleInputChange}
            required
          />
          <input
            type="text"
            name="image_url"
            placeholder="Image URL"
            value={newProduct.image_url}
            onChange={handleInputChange}
            required
          />
          <textarea
            name="description"
            placeholder="Description"
            value={newProduct.description}
            onChange={handleInputChange}
            required
          />
          <button type="submit">Submit</button>
        </form>
      )}

      <div className="dashboard-card">
        <table className="product-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Price ($)</th>
              <th>Rating</th>
              <th>Description</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) =>
              editingProductId === product.id ? (
                <tr key={product.id}>
                  <td>
                    <input
                      type="text"
                      name="image_url"
                      value={editFormData.image_url}
                      onChange={handleEditFormChange}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      name="name"
                      value={editFormData.name}
                      onChange={handleEditFormChange}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      name="price"
                      step="0.01"
                      value={editFormData.price}
                      onChange={handleEditFormChange}
                    />
                  </td>
                  <td>{product.rating}</td>
                  <td>
                    <textarea
                      name="description"
                      value={editFormData.description}
                      onChange={handleEditFormChange}
                    />
                  </td>
                  <td>
                    <button className="modify-button" onClick={(e) => handleEditSubmit(e, product.id)}>
                      Submit
                    </button>
                  </td>
                </tr>
              ) : (
                <tr key={product.id}>
                  <td>
                    <img src={product.image_url} alt={product.name} className="product-img" />
                  </td>
                  <td>{product.name}</td>
                  <td>{product.price.toFixed(2)}</td>
                  <td>{product.rating}</td>
                  <td>
                    {expandedProductId === product.id ? (
                      <div>
                        {product.description}{" "}
                        <button onClick={() => toggleDescription(product.id)} className="desc-toggle">
                          Hide
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => toggleDescription(product.id)} className="desc-toggle">
                        View
                      </button>
                    )}
                  </td>
                  <td>
                    <button className="modify-button" onClick={() => handleEditClick(product)}>
                      Modify
                    </button>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductManagement;
