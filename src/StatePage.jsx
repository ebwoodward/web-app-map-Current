// src/pages/StatePage.jsx
import React from "react";
import { useParams, Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { stateContent } from "./content/stateContent";

const StatePage = () => {
  const { slug } = useParams();
  const content = stateContent[slug] || {
    title: slug.replace(/-/g, " ").toUpperCase(),
    academicOverview: "Content not available yet.",
    currentLegislation: "Content not available yet.",
    organizations: [],
  };

  return (
    <div style={containerStyle}>
      <Link to="/" style={linkStyle}>
        ← Back to Map
      </Link>

      <h1 style={titleStyle}>{content.title}</h1>

      <div style={gridStyle}>
        {/* Box 1: Academic Standards Overview */}
        <div style={boxStyle}>
          <h2>Academic Standards Overview</h2>
          <ReactMarkdown rehypePlugins={[rehypeRaw]}>
            {content.academicOverview}
          </ReactMarkdown>
        </div>

        {/* Box 2: Current and Recent Legislation */}
        <div style={boxStyle}>
          <h2>Current and Recent Legislation</h2>
          <ReactMarkdown rehypePlugins={[rehypeRaw]}>
            {content.currentLegislation}
          </ReactMarkdown>
        </div>

        {/* Box 3: Organizations Advancing Climate Education (spans both) */}
        <div style={{ ...boxStyle, gridColumn: "1 / -1" }}>
          <h2>Organizations Advancing Climate Education</h2>
          <ul style={listStyle}>
            {content.organizations.map((org, i) => (
              <li key={i}>{org}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

const containerStyle = {
  maxWidth: "1100px",
  margin: "0 auto",
  padding: "40px 20px",
  textAlign: "center",
  fontFamily: "inherit",
  fontSize: "1rem",
  lineHeight: "1.6",
};

const linkStyle = {
  display: "block",
  textAlign: "left",
  marginBottom: "20px",
  fontSize: "1.2rem",
  color: "#007bff",
  textDecoration: "none",
};

const titleStyle = {
  fontSize: "3rem",
  marginBottom: "30px",
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

export default StatePage;