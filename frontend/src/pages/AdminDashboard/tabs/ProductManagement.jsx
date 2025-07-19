import React, { useState, useEffect } from "react";
import "./ProductManagement.css";

const API = process.env.REACT_APP_API_URL || "http://localhost:5001";

const PRODUCT_CATEGORIES = [
  "bathroom",
  "tech",
  "storage",
  "laundry",
  "desk",
  "decor",
];
const PACKAGE_CATEGORIES = ["Bedding", "Living", "Caring"];

export default function ProductManagement() {
  const [categoryType, setCategoryType] = useState("product");
  const [products, setProducts] = useState([]);
  const [packages, setPackages] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProd, setNewProd] = useState({
    name: "",
    price: "",
    category: "",
    description: "",
    imageUrl: "",
    size: "",
    color: "",
    stock: 0,
    active: true,
  });
  const [packageItems, setPackageItems] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [error, setError] = useState("");
  const [descViewId, setDescViewId] = useState(null);
  const [packageItemsMap, setPackageItemsMap] = useState({});
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch(`${API}/api/admin/products`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : Promise.reject("Failed to fetch products")))
      .then((data) => setProducts(Array.isArray(data) ? data : data.products || []))
      .catch((e) => setError(e.toString()));
  }, [token]);

  useEffect(() => {
    fetch(`${API}/api/admin/packages`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : Promise.reject("Failed to fetch packages")))
      .then((data) => setPackages(Array.isArray(data) ? data : data.packages || []))
      .catch((e) => setError(e.toString()));
  }, [token]);

  useEffect(() => {
    if (packages.length === 0) return;
    const fetchAllItems = async () => {
      const m = {};
      for (const pkg of packages) {
        try {
          const res = await fetch(`${API}/api/admin/packages/${pkg.id}/items`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            m[pkg.id] = await res.json();
          }
        } catch {}
      }
      setPackageItemsMap(m);
    };
    fetchAllItems();
  }, [packages, token]);

  const handleAddChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewProd((p) => ({
      ...p,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handlePackageItemChange = (i, field, v) =>
    setPackageItems((ps) =>
      ps.map((it, idx) => (idx === i ? { ...it, [field]: v } : it))
    );
  const handleAddPackageItem = () =>
    setPackageItems((ps) => [...ps, { product_id: "", quantity: 1 }]);
  const handleRemovePackageItem = (i) =>
    setPackageItems((ps) => ps.filter((_, idx) => idx !== i));

  const submitNew = async (e) => {
    e.preventDefault();
    try {
      const body =
        categoryType === "product"
          ? {
              name: newProd.name,
              price: parseFloat(newProd.price),
              category: newProd.category,
              description: newProd.description,
              image_url: newProd.imageUrl,
              size: newProd.size,
              color: newProd.color,
              stock: Number(newProd.stock),
              active: newProd.active,
            }
          : {
              name: newProd.name,
              price: parseFloat(newProd.price),
              category: newProd.category,
              description: newProd.description,
              image_url: newProd.imageUrl,
              rating: 0,
              size: newProd.size,
              color: newProd.color,
              stock: Number(newProd.stock),
              active: newProd.active,
              items: packageItems
                .filter((x) => x.product_id && x.quantity > 0)
                .map((x) => ({
                  product_id: Number(x.product_id),
                  quantity: Number(x.quantity),
                })),
            };
      const url =
        categoryType === "product"
          ? `${API}/api/admin/products`
          : `${API}/api/admin/packages`;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to add");
      const added = await res.json();
      if (categoryType === "product") setProducts((ps) => [...ps, added]);
      else setPackages((pk) => [...pk, added]);
      setShowAddForm(false);
      setNewProd({
        name: "",
        price: "",
        category: "",
        description: "",
        imageUrl: "",
        size: "",
        color: "",
        stock: 0,
        active: true,
      });
      setPackageItems([]);
    } catch (e) {
      setError(e.toString());
    }
  };

  const onEditClick = (item) => {
    const items = packageItemsMap[item.id] || [];
    setEditingId(item.id);
    setEditData({
      name: item.name,
      price: item.price?.toString() || "",
      category: item.category,
      description: item.description,
      imageUrl: item.imageUrl || "",
      size: item.size || "",
      color: item.color || "",
      stock: item.stock || 0,
      active: item.active,
      items: items.map((it) => ({
        product_id: it.product_id.toString(),
        quantity: it.quantity,
      })),
    });
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditData((d) => ({
      ...d,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleEditItemChange = (i, field, v) =>
    setEditData((d) => ({
      ...d,
      items: d.items.map((it, idx) =>
        idx === i ? { ...it, [field]: v } : it
      ),
    }));
  const handleAddEditItem = () =>
    setEditData((d) => ({
      ...d,
      items: [...(d.items || []), { product_id: "", quantity: 1 }],
    }));
  const handleRemoveEditItem = (i) =>
    setEditData((d) => ({
      ...d,
      items: d.items.filter((_, idx) => idx !== i),
    }));

  const submitEdit = async (e, id) => {
    e.preventDefault();
    try {
      const body =
        categoryType === "product"
          ? {
              name: editData.name,
              price: parseFloat(editData.price),
              category: editData.category,
              description: editData.description,
              image_url: editData.imageUrl,
              size: editData.size,
              color: editData.color,
              stock: Number(editData.stock),
              active: editData.active,
            }
          : {
              name: editData.name,
              price: parseFloat(editData.price),
              category: editData.category,
              description: editData.description,
              image_url: editData.imageUrl,
              size: editData.size,
              color: editData.color,
              stock: Number(editData.stock),
              active: editData.active,
              items: (editData.items || [])
                .filter((x) => x.product_id && x.quantity > 0)
                .map((x) => ({
                  product_id: Number(x.product_id),
                  quantity: Number(x.quantity),
                })),
            };
      const url =
        categoryType === "product"
          ? `${API}/api/admin/products/${id}`
          : `${API}/api/admin/packages/${id}`;
      const res = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to update");
      const updated = await res.json();
      if (categoryType === "product")
        setProducts((ps) => ps.map((x) => (x.id === id ? updated : x)));
      else
        setPackages((pk) => pk.map((x) => (x.id === id ? updated : x)));
      setEditingId(null);
    } catch (e) {
      setError(e.toString());
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      const url =
        categoryType === "product"
          ? `${API}/api/admin/products/${id}`
          : `${API}/api/admin/packages/${id}`;
      const res = await fetch(url, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Delete failed");
      if (categoryType === "product")
        setProducts((ps) => ps.filter((x) => x.id !== id));
      else setPackages((pk) => pk.filter((x) => x.id !== id));
    } catch (e) {
      setError(e.toString());
    }
  };

  const currentList = categoryType === "product" ? products : packages;

  if (error) return <p className="error-text">{error}</p>;

  return (
    <div className="product-management-page">
      <h1>Product Management</h1>

      <div className="top-controls">
        <label>Category Type:</label>
        <select
          value={categoryType}
          onChange={(e) => {
            setCategoryType(e.target.value);
            setShowAddForm(false);
            setEditingId(null);
          }}
        >
          <option value="product">product</option>
          <option value="package">package</option>
        </select>
        <button
          className="add-button"
          onClick={() => {
            setShowAddForm((s) => !s);
            setEditingId(null);
          }}
        >
          {showAddForm ? "Cancel" : `Add ${categoryType}`}
        </button>
      </div>

      {showAddForm && (
        <form className="add-form" onSubmit={submitNew}>
          <input
            name="name"
            placeholder="Name"
            required
            value={newProd.name}
            onChange={handleAddChange}
          />
          <input
            name="price"
            placeholder="Price"
            required
            value={newProd.price}
            onChange={handleAddChange}
          />
          <input
            name="imageUrl"
            placeholder="Image URL"
            required
            value={newProd.imageUrl}
            onChange={handleAddChange}
          />
          <input
            name="size"
            placeholder="Size"
            value={newProd.size}
            onChange={handleAddChange}
          />
          <input
            name="color"
            placeholder="Color"
            value={newProd.color}
            onChange={handleAddChange}
          />
          <input
            name="stock"
            type="number"
            min={0}
            placeholder="Stock"
            value={newProd.stock}
            onChange={handleAddChange}
            style={{ width: "4.5rem" }}
          />
          <label>
            Active:
            <input
              name="active"
              type="checkbox"
              checked={newProd.active}
              onChange={handleAddChange}
            />
          </label>
          <select
            name="category"
            required
            value={newProd.category}
            onChange={handleAddChange}
          >
            <option value="">Select Category</option>
            {(categoryType === "product"
              ? PRODUCT_CATEGORIES
              : PACKAGE_CATEGORIES
            ).map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <textarea
            name="description"
            placeholder="Description"
            required
            value={newProd.description}
            onChange={handleAddChange}
          />

          {categoryType === "package" && (
            <div className="package-items-form">
              <label>Package Items:</label>
              {packageItems.map((it, i) => (
                <div key={i} className="package-item-row">
                  <select
                    value={it.product_id}
                    onChange={(e) =>
                      handlePackageItemChange(i, "product_id", e.target.value)
                    }
                    required
                  >
                    <option value="">Select Product</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        #{p.id} - {p.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min={1}
                    value={it.quantity}
                    onChange={(e) =>
                      handlePackageItemChange(i, "quantity", e.target.value)
                    }
                    required
                    style={{ width: "4.5rem" }}
                  />
                  <button onClick={() => handleRemovePackageItem(i)}>
                    ×
                  </button>
                </div>
              ))}
              <button onClick={handleAddPackageItem}>+ Add Product</button>
            </div>
          )}

          <button className="add-button" type="submit">
            Submit
          </button>
        </form>
      )}

      <table className="product-table">
        <thead>
          <tr>
            <th>Image</th>
            <th>Name</th>
            <th>Price</th>
            <th>Category</th>
            <th>Size</th>
            <th>Color</th>
            <th>Stock</th>
            <th>Active</th>
            <th>Rating</th>
            <th>Description</th>
            {categoryType === "package" && <th>Package Items</th>}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentList.length === 0 && (
            <tr>
              <td colSpan={categoryType === "package" ? 12 : 11}>
                No items found
              </td>
            </tr>
          )}
          {currentList.map((item) =>
            editingId === item.id ? (
              <tr key={item.id}>
                <td>
                  <textarea
                    name="imageUrl"
                    value={editData.imageUrl}
                    onChange={handleEditChange}
                  />
                </td>
                <td>
                  <textarea
                    name="name"
                    value={editData.name}
                    onChange={handleEditChange}
                  />
                </td>
                <td>
                  <textarea
                    name="price"
                    value={editData.price}
                    onChange={handleEditChange}
                  />
                </td>
                <td>
                  <select
                    name="category"
                    value={editData.category}
                    onChange={handleEditChange}
                  >
                    {(categoryType === "product"
                      ? PRODUCT_CATEGORIES
                      : PACKAGE_CATEGORIES
                    ).map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <textarea
                    name="size"
                    value={editData.size}
                    onChange={handleEditChange}
                  />
                </td>
                <td>
                  <textarea
                    name="color"
                    value={editData.color}
                    onChange={handleEditChange}
                  />
                </td>
                <td>
                  {categoryType === "package" && editData.items && editData.items.length > 0 ? (
                    <input
                      name="stock"
                      type="number"
                      min={0}
                      value={editData.stock}
                      readOnly
                      style={{ background: "#f5f6fa", color: "#aaa", width: "4.5rem" }}
                      title="Stock auto-calculated from included products"
                    />
                  ) : (
                    <input
                      name="stock"
                      type="number"
                      min={0}
                      value={editData.stock}
                      onChange={handleEditChange}
                      style={{ width: "4.5rem" }}
                    />
                  )}
                </td>
                <td>
                  <input
                    name="active"
                    type="checkbox"
                    checked={editData.active}
                    onChange={handleEditChange}
                  />
                </td>
                <td>{Number(item.rating || 0).toFixed(1)}</td>
                <td className="description-cell">
                  {descViewId === item.id ? (
                    <>
                      <div className="desc-box">{item.description}</div>
                      <button
                        className="desc-toggle"
                        onClick={() => setDescViewId(null)}
                      >
                        Hide
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="desc-box">
                        {item.description.length > 60
                          ? item.description.slice(0, 60) + "..."
                          : item.description}
                      </div>
                      {item.description.length > 60 && (
                        <button
                          className="desc-toggle"
                          onClick={() => setDescViewId(item.id)}
                        >
                          View
                        </button>
                      )}
                    </>
                  )}
                </td>

                {categoryType === "package" && (
                  <td>
                    {(editData.items || []).map((it, i) => (
                      <div key={i} className="package-item-row">
                        <select
                          value={it.product_id}
                          onChange={(e) =>
                            handleEditItemChange(i, "product_id", e.target.value)
                          }
                          required
                        >
                          <option value="">Select Product</option>
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              #{p.id} - {p.name}
                            </option>
                          ))}
                        </select>
                        <input
                          type="number"
                          min={1}
                          value={it.quantity}
                          onChange={(e) =>
                            handleEditItemChange(i, "quantity", e.target.value)
                          }
                          required
                          style={{ width: "4.5rem" }}
                        />
                        <button onClick={() => handleRemoveEditItem(i)}>
                          ×
                        </button>
                      </div>
                    ))}
                    <button onClick={handleAddEditItem}>+ Add Product</button>
                  </td>
                )}

                <td>
                  <button
                    className="submit-button"
                    onClick={(e) => submitEdit(e, item.id)}
                  >
                    Submit
                  </button>
                  <button
                    className="cancel-button"
                    onClick={() => setEditingId(null)}
                  >
                    Cancel
                  </button>
                </td>
              </tr>
            ) : (
              <tr key={item.id}>
                <td>
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="product-img"
                  />
                </td>
                <td>{item.name}</td>
                <td>{Number(item.price).toFixed(2)}</td>
                <td>{item.category}</td>
                <td>{item.size}</td>
                <td>{item.color}</td>
                <td
                  title={categoryType === "package" && (packageItemsMap[item.id]?.length > 0)
                    ? "Stock auto-set based on included products"
                    : "Editable when no package items"}
                  style={{ width: "5rem" }}
                >
                  {item.stock}
                </td>
                <td>{item.active ? "Yes" : "No"}</td>
                <td>{Number(item.rating || 0).toFixed(1)}</td>
                <td className="description-cell">
                  {descViewId === item.id ? (
                    <>
                      <div className="desc-box">{item.description}</div>
                      <button
                        className="desc-toggle"
                        onClick={() => setDescViewId(null)}
                      >
                        Hide
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="desc-box">
                        {item.description.length > 60
                          ? item.description.slice(0, 60) + "..."
                          : item.description}
                      </div>
                      {item.description.length > 60 && (
                        <button
                          className="desc-toggle"
                          onClick={() => setDescViewId(item.id)}
                        >
                          View
                        </button>
                      )}
                    </>
                  )}
                </td>

                {categoryType === "package" && (
                  <td className="package-items-cell">
                    <ul>
                      {(packageItemsMap[item.id] || []).map((pi) => (
                        <li key={pi.product_id}>
                          #{pi.product_id} - {pi.product_name} × {pi.quantity}
                        </li>
                      ))}
                    </ul>
                  </td>
                )}

                <td>
                  <button
                    className="edit-button"
                    onClick={() => onEditClick(item)}
                  >
                    Edit
                  </button>
                  <button
                    className="delete-button"
                    onClick={() => handleDelete(item.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
}
