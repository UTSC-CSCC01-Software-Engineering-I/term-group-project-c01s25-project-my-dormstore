import React, { useState, useEffect } from "react";
import "./AmbassadorList.css";

const AmbassadorList = () => {
  const [ambassadors, setAmbassadors] = useState([]);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token"); 

  useEffect(() => {
    const fetchAmbassadors = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/ambassadors`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (res.status === 401 || res.status === 403) {
          throw new Error("Not authorized. Please log in as admin.");
        }
        if (!res.ok) {
          throw new Error(`Server error: ${res.statusText}`);
        }
        const data = await res.json();
        setAmbassadors(data);
      } catch (err) {
        console.error("Fetch ambassadors failed:", err);
        setError(err.message);
      }
    };

    fetchAmbassadors();
  }, [token]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this ambassador?")) {
      return;
    }
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/ambassadors/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!res.ok) {
        throw new Error(`Delete failed: ${res.statusText}`);
      }
      setAmbassadors(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      console.error("Delete ambassador failed:", err);
      setError(err.message);
    }
  };

  return (
    <div className="ambassador-list-page">
      <h1>Ambassador List</h1>
      {error && <div className="error-text">{error}</div>}

      {ambassadors.length === 0 ? (
        <p>No ambassadors found.</p>
      ) : (
        <table className="ambassador-table">
          <thead>
            <tr>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Email</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {ambassadors.map(({ id, firstName, lastName, email }) => (
              <tr key={id}>
                <td>{firstName}</td>
                <td>{lastName}</td>
                <td>{email}</td>
                <td>
                  <button
                    className="delete-button"
                    onClick={() => handleDelete(id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AmbassadorList;
