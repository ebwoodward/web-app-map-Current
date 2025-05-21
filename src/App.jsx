/** File: src/App.jsx **/
import React, { useState, useEffect } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import chroma from "chroma-js";

import Hero from "./components/Hero";
import "./App.css";

const geoUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

const scoreColor = (value) => {
  const num = parseFloat(value);
  if (isNaN(num) || num < 1) return "#eeeeee";
  const colorScale = chroma
    .scale(["#e0a3a3", "#e2b892", "#d2c88e", "#a2c68d", "#6bbd8d"])
    .domain([1, 5]);
  return colorScale(num).hex();
};

const columnSymbology = {
  requires_anthropogenic_cc: (v) =>
    v === "Yes" ? "#6bbd8d" : v === "No" ? "#e0a3a3" : "#eeeeee",
  language_strength: (v) =>
    ({
      Weak: "#d0e6e2",
      Medium: "#9dc9c0",
      Strong: "#62ada1",
      Excellent: "#2f8373",
    }[v] || "#eeeeee"),
  science_standard_type: (v) =>
    ({ State: "#b2a0c0", Hybrid: "#a1c3d1", NGSS: "#c4dba0" }[v] || "#eeeeee"),
  social_studies_type: (v) =>
    ({
      "Human-Environment Interaction": "#f0c4a1",
      "Climate Change": "#f0a572",
      "Anthropogenic Climate Change": "#d95c5c",
    }[v] || "#eeeeee"),
  subjects_covered_cc: (v) =>
    ({
      Science: "#c7dfe6",
      "Science and Social Studies": "#84a9b5",
      Interdisciplinary: "#3d6b76",
    }[v] || "#eeeeee"),
  grades_covered_cc_science: (v) =>
    ({
      High: "#bbb3d3",
      "Middle and High": "#9d95c2",
      "Elementary, Middle, and High": "#7f6bb1",
    }[v] || "#eeeeee"),
  score: scoreColor,
};

const columnNames = {
  requires_anthropogenic_cc:
    "What States Teach Anthropogenic Climate Change?",
  language_strength: "How Strong is Standard Language?",
  science_standard_type: "Science Standard Type",
  social_studies_type: "Extent of Social Studies Instruction",
  subjects_covered_cc: "What Subjects Include Climate Change?",
  grades_covered_cc_science: "What Grades Learn about Climate Change?",
  score: "Total Score",
};

export default function App() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [selectedColumn, setSelectedColumn] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tooltip, setTooltip] = useState({ isVisible: false, content: "" });
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState([-97, 38]);
  const [activeTab, setActiveTab] = useState("about");

  const tabContent = {
    about:
      "This tool visualizes how U.S. states incorporate climate change into their education standards. Click a state on the map to explore more details.",
    methodology:
      "Data was sourced from official state documents and analyzed based on consistency, language strength, and inclusion across subjects and grade levels.",
    states: (
      <div className="states-list">
        {[
          "Alabama","Alaska","Arizona","Arkansas","California","Colorado",
          "Connecticut","Delaware","Florida","Georgia","Hawaii","Idaho",
          "Illinois","Indiana","Iowa","Kansas","Kentucky","Louisiana",
          "Maine","Maryland","Massachusetts","Michigan","Minnesota",
          "Mississippi","Missouri","Montana","Nebraska","Nevada",
          "New Hampshire","New Jersey","New Mexico","New York",
          "North Carolina","North Dakota","Ohio","Oklahoma","Oregon",
          "Pennsylvania","Rhode Island","South Carolina","South Dakota",
          "Tennessee","Texas","Utah","Vermont","Virginia","Washington",
          "West Virginia","Wisconsin","Wyoming","District of Columbia",
        ].map((state) => (
          <a
            key={state}
            href={`/states/${state.toLowerCase().replace(/ /g, "-")}`}
            className="state-link"
          >
            {state}
          </a>
        ))}
      </div>
    ),
    FAQ: "Frequently Asked Questions will be listed here.",
  };

  useEffect(() => {
    axios
      .get(
        "https://api.sheetbest.com/sheets/fa3943a8-5866-4c13-97af-1862a50f8a22"
      )
      .then((res) => {
        setData(res.data);
        setLoading(false);
        setSelectedColumn(
          Object.keys(res.data[0]).find(
            (k) => !["state", "abbreviation", "includes_cc"].includes(k)
          )
        );
      })
      .catch((err) => {
        console.error("SheetBest API error:", err.response?.status, err.message);
        setLoading(false);
      });
  }, []);

  const handleColumnChange = (e) => setSelectedColumn(e.target.value);
  const handleClick = (geo) => {
    const name = geo.properties.name;
    navigate(`/states/${name.toLowerCase().replace(/ /g, "-")}`);
  };

  const getLegendWidthForColumn = (col) => {
    switch (col) {
      case "score": return "200px";
      case "requires_anthropogenic_cc": return "160px";
      case "language_strength": return "250px";
      case "science_standard_type": return "200px";
      case "social_studies_type": return "300px";
      case "subjects_covered_cc": return "250px";
      case "grades_covered_cc_science": return "300px";
      default: return "auto";
    }
  };

  const generateLegend = () => {
    const sym = columnSymbology[selectedColumn];
    if (!sym) return null;
    let samples = [];
    let isGrad = false;
    switch (selectedColumn) {
      case "score":
        samples = [1,2,3,4,5];
        isGrad = true;
        break;
      case "requires_anthropogenic_cc":
        samples = ["Yes","No"];
        break;
      case "language_strength":
        samples = ["Weak","Medium","Strong","Excellent"];
        break;
      case "science_standard_type":
        samples = ["State","Hybrid","NGSS"];
        break;
      case "social_studies_type":
        samples = [
          "Human-Environment Interaction",
          "Climate Change",
          "Anthropogenic Climate Change",
        ];
        break;
      case "subjects_covered_cc":
        samples = ["Science","Science and Social Studies","Interdisciplinary"];
        break;
      case "grades_covered_cc_science":
        samples = ["High","Middle and High","Elementary, Middle, and High"];
        break;
      default:
        samples = [];
    }
    return (
      <div className="legend" style={{ width: getLegendWidthForColumn(selectedColumn) }}>
        {isGrad ? (
          <>
            <div className="legend-grad-bar" />
            <div className="legend-grad-label">Total Score (1–5)</div>
          </>
        ) : (
          samples.map((v) => (
            <div key={v} className="legend-item">
              <div className="legend-color-box" style={{ backgroundColor: sym(v) }} />
              <span>{v}</span>
            </div>
          ))
        )}
      </div>
    );
  };

  const renderTabs = () => (
    <div className="tabs-container">
      <div className="tab-buttons">
        {Object.keys(tabContent).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`tab-button${tab === activeTab ? " tab-button--active" : ""}`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>
      <div className="tab-content">{tabContent[activeTab]}</div>
    </div>
  );

  return (
    <>
      {/* Shared Hero banner */}
      <Hero title="Climate Change Education Tracker" backLink={null} />

      <div className="app-container">
        {loading ? (
          <p>Loading data...</p>
        ) : (
          <div className="main-content">
            {/* Map Column */}
            <div className="map-section">
              <ComposableMap
                projection="geoAlbersUsa"
                className="map-container"
                onMouseMove={(e) =>
                  setMousePosition({ x: e.clientX, y: e.clientY })
                }
              >
                <ZoomableGroup
                  center={center}
                  zoom={zoom}
                  onMoveEnd={({ coordinates, zoom }) => {
                    setCenter(coordinates);
                    setZoom(zoom);
                  }}
                >
                  <Geographies geography={geoUrl}>
                    {({ geographies }) =>
                      geographies.map((geo) => {
                        const name = geo.properties.name;
                        const row = data.find((d) => d.state === name);
                        const val = row ? row[selectedColumn] : null;
                        return (
                          <Geography
                            key={geo.rsmKey}
                            geography={geo}
                            onClick={() => handleClick(geo)}
                            onMouseEnter={() =>
                              setTooltip({
                                isVisible: true,
                                content: `${name}: ${
                                  row ? row[selectedColumn] : "N/A"
                                }`,
                              })
                            }
                            onMouseLeave={() =>
                              setTooltip({ isVisible: false, content: "" })
                            }
                            style={{
                              default: {
                                fill: columnSymbology[selectedColumn]
                                  ? columnSymbology[selectedColumn](val)
                                  : "#D6D6DA",
                                stroke: "#FFFFFF",
                                outline: "none",
                                cursor: "pointer",
                              },
                              hover: { fill: "#FFD700", stroke: "#FFFFFF", outline: "none" },
                              pressed: { fill: "#E42", stroke: "#FFFFFF", outline: "none" },
                            }}
                          />
                        );
                      })
                    }
                  </Geographies>
                </ZoomableGroup>
              </ComposableMap>
              <div className="zoom-controls">
                <button onClick={() => setZoom((z) => Math.min(z * 1.5, 20))}>
                  ＋
                </button>
                <button onClick={() => setZoom((z) => Math.max(z / 1.5, 1))}>
                  －
                </button>
                <button
                  onClick={() => {
                    setCenter([-77.0369, 38.9072]);
                    setZoom(10);
                  }}
                >
                  DC
                </button>
                <button
                  onClick={() => {
                    setCenter([-97, 38]);
                    setZoom(1);
                  }}
                >
                  Re-center
                </button>
              </div>
            </div>

            {/* Sidebar + Tabs */}
            <div className="sidebar-wrapper">
              <div className="sidebar">
                <label htmlFor="columnSelect" className="select-label">
                  Choose a Topic to Visualize:
                </label>
                <select
                  id="columnSelect"
                  value={selectedColumn}
                  onChange={handleColumnChange}
                  className="select-input"
                >
                  {Object.entries(columnNames).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
                {tooltip.isVisible && (
                  <div
                    className="tooltip"
                    style={{
                      top: mousePosition.y + 10,
                      left: mousePosition.x + 10,
                    }}
                  >
                    {tooltip.content}
                  </div>
                )}
                {generateLegend()}
              </div>
              {renderTabs()}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
