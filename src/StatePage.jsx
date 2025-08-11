// src/StatePage.jsx
import React from "react";
import { useParams, Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";

import Hero from "./components/Hero";
import { stateContent } from "./content/stateContent";

export default function StatePage() {
  const { slug } = useParams();
  const content = stateContent[slug] || {
    title: slug.replace(/-/g, " ").toUpperCase(),
    academicOverview: "Content not available yet.",
    currentLegislation: "Content not available yet.",
    organizations: [],
  };

  return (
    <>
      {/* 1) Same hero banner as home (no backLink inside) */}
      <Hero title="Climate Change Education Tracker" backLink={null} />

      {/* 2) Below the hero: return link and state title */}
      <div style={headerBarStyle}>
        <Link to="/" style={linkStyle}>
          ← Back to Map
        </Link>
        <h1 style={stateTitleStyle}>{content.title}</h1>
      </div>

      {/* 3) Main grid content */}
      <div style={containerStyle}>
        <div style={gridStyle}>
          {/* Box 1: Academic Standards Overview (cream background) */}
          <div
            style={{
              ...boxStyle,
              backgroundColor: "#f7a86d",
            }}
          >
            <h2>Academic Standards Overview</h2>
            <ReactMarkdown rehypePlugins={[rehypeRaw]}>
              {content.academicOverview}
            </ReactMarkdown>
          </div>

          {/* Box 2: Current and Recent Legislation (light gray background) */}
          <div
            style={{
              ...boxStyle,
              backgroundColor: "#aac5a7",
            }}
          >
            <h2>Current and Recent Legislation</h2>
            <ReactMarkdown rehypePlugins={[rehypeRaw]}>
              {content.currentLegislation}
            </ReactMarkdown>
          </div>

          {/* Box 3: Organizations (off-white, full-width) */}
          <div
            style={{
              ...boxStyle,
              gridColumn: "1 / -1",
              backgroundColor: "#f2e5d7",
            }}
          >
            <h2>Organizations Advancing Climate Education</h2>
            <ul style={listStyle}>
              {content.organizations.map((org, i) => (
                <li key={i}>{org}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}

// Styles for the header bar just below the hero
const headerBarStyle = {
  maxWidth: "1100px",
  margin: "0 auto",
  padding: "1rem 20px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  position: "relative",
};

const linkStyle = {
  position: "absolute",
  left: 20,
  fontSize: "1rem",
  color: "#0077cc",
  textDecoration: "none",
};

const stateTitleStyle = {
  margin: 0,
  fontSize: "2.5rem",
  fontWeight: "600",
  textAlign: "center",
};

// Reuse your existing grid & box styles
const containerStyle = {
  maxWidth: "1100px",
  margin: "0 auto",
  padding: "20px",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  columnGap: "24px",
  rowGap: "40px",
};

const boxStyle = {
  padding: "24px",
  backgroundColor: "#fff",
  borderRadius: "8px",
  boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
  textAlign: "left",
  fontFamily: "inherit",
  fontSize: "1rem",
  lineHeight: "1.6",
};

const listStyle = {
  textAlign: "left",
  marginTop: "0.5em",
  paddingLeft: "1.5em",
};
