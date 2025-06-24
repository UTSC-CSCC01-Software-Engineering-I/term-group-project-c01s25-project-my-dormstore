import React from "react";
import { Link } from "react-router-dom";


export default function Content() {
  return (
    <section className="content">
      <h1>
        Make Your Dorm
        <br />
        Into Your Home
      </h1>
      <Link to="/products" className="cta-button">
        Learn More
      </Link>
    </section>
  );
}