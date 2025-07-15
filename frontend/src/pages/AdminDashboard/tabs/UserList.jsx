import React, { useState } from "react";
import "./UserList.css";

const UserList = () => {
  const [users, setUsers] = useState([
    {
      id: 1,
      firstName: "Alice",
      lastName: "Johnson",
      email: "alice@example.com",
      phone: "123-456-7890",
      address: "123 Dorm Lane, Room 201",
    },
    {
      id: 2,
      firstName: "Bob",
      lastName: "Smith",
      email: "bob@example.com",
      phone: "987-654-3210",
      address: "456 Campus Rd, Apt 5B",
    },
    {
      id: 3,
      firstName: "Charlie",
      lastName: "Lee",
      email: "charlie@example.com",
      phone: "555-123-4567",
      address: "789 University Blvd, Unit 9",
    },
  ]);

  const handleDelete = (id) => {
    setUsers((prev) => prev.filter((user) => user.id !== id));
  };

  return (
    <div className="user-list-page">
      <h1>User List</h1>
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
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.firstName}</td>
                <td>{user.lastName}</td>
                <td>{user.email}</td>
                <td>{user.phone}</td>
                <td>{user.address}</td>
                <td>
                  <button className="delete-button" onClick={() => handleDelete(user.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan="6" className="empty-text">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserList;
