// src/components/Hero.jsx
import React from "react";
import { Link } from "react-router-dom";
import "./Hero.css";

export default function Hero({ title, backLink }) {
  return (
    <div className="hero">
      <div className="hero-content">
        {backLink && (
          <Link to={backLink} className="hero-back">
            ← Back
          </Link>
        )}
        <h1 className="hero-title">{title}</h1>
      </div>
    </div>
  );
}
