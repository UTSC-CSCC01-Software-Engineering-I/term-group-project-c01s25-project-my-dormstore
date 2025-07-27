import React, { useState, useEffect } from 'react';
import './UserList.css';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("adminToken");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/users`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.status === 401 || res.status === 403) {
          throw new Error('Not authorized. Please log in as admin.');
        }
        if (!res.ok) {
          throw new Error(`Server error: ${res.statusText}`);
        }
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        console.error('Fetch users failed:', err);
        setError(err.message);
      }
    };

    fetchUsers();
  }, [token]);

  if (error) {
    return <p className="error-text">{error}</p>;
  }

  return (
    <div className="user-list-page">
      <h1>User List</h1>
      {users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <div className="dashboard-card">
          <table className="user-table">
            <thead>
              <tr>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map(({ id, firstName, lastName, email, phone, address }) => (
                <tr key={id}>
                  <td>{firstName}</td>
                  <td>{lastName}</td>
                  <td>{email}</td>
                  <td>{phone}</td>
                  <td>{address}</td>
                  <td>
                    <button
                      className="delete-button-ad"
                      onClick={async () => {
                        await fetch(`${process.env.REACT_APP_API_URL}/api/admin/users/${id}`, {
                          method: 'DELETE',
                          headers: {
                            'Authorization': `Bearer ${token}`
                          }
                        });
                        setUsers(prev => prev.filter(u => u.id !== id));
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserList;
