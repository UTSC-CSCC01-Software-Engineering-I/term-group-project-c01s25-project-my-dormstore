import React, { useState } from "react";
import "./AmbassadorList.css";

const dummyAmbassadors = [
  {
    id: 1,
    firstName: "Alice",
    lastName: "Johnson",
    email: "alice.johnson@example.com",
  },
  {
    id: 2,
    firstName: "Bob",
    lastName: "Smith",
    email: "bob.smith@example.com",
  },
];

const AmbassadorList = () => {
  const [ambassadors] = useState(dummyAmbassadors);

  return (
    <div className="ambassador-list-page">
      <h1>Ambassador List</h1>

      <table className="ambassador-table">
        <thead>
          <tr>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Email</th>
          </tr>
        </thead>
        <tbody>
          {ambassadors.map((amb) => (
            <tr key={amb.id}>
              <td>{amb.firstName}</td>
              <td>{amb.lastName}</td>
              <td>{amb.email}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AmbassadorList;
