// StatePage.js
import React from "react";
import { useParams, Link } from "react-router-dom";

const StatePage = () => {
  const { slug } = useParams();

  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "20px" }}>
        State Details for: {slug.replace(/-/g, " ").toUpperCase()}
      </h1>
      <Link to="/" style={{ fontSize: "1.2rem", color: "#007bff" }}>
        ← Back to Map
      </Link>
    </div>
  );
};

export default StatePage;