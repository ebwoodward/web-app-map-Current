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

const geoUrl =
  "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

const scoreColor = (value) => {
  const num = parseFloat(value);
  if (isNaN(num) || num < 1) return "#eeeeee";
  const colorScale = chroma
    .scale([
      "#e0a3a3",
      "#e2b892",
      "#d2c88e",
      "#a2c68d",
      "#6bbd8d",
    ])
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
    ({
      State: "#b2a0c0",
      Hybrid: "#a1c3d1",
      NGSS: "#c4dba0",
    }[v] || "#eeeeee"),
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

const App = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [selectedColumn, setSelectedColumn] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tooltip, setTooltip] = useState({
    isVisible: false,
    content: "",
  });
  const [mousePosition, setMousePosition] = useState({
    x: 0,
    y: 0,
  });

  // map view state
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState([-98, 38]);

  const [activeTab, setActiveTab] = useState("about");

  const tabContent = {
    about:
      "This tool visualizes how U.S. states incorporate climate change into their education standards. Click a state on the map to explore more details about its standards and other approaches to climate education.",
    methodology:
      "Data was sourced from official state documents and analyzed based on consistency, language strength, and inclusion across subjects and grade levels.",
    states: (
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "10px",
        }}
      >
        {[
          "Alabama",
          "Alaska",
          "Arizona",
          "Arkansas",
          "California",
          "Colorado",
          "Connecticut",
          "Delaware",
          "Florida",
          "Georgia",
          "Hawaii",
          "Idaho",
          "Illinois",
          "Indiana",
          "Iowa",
          "Kansas",
          "Kentucky",
          "Louisiana",
          "Maine",
          "Maryland",
          "Massachusetts",
          "Michigan",
          "Minnesota",
          "Mississippi",
          "Missouri",
          "Montana",
          "Nebraska",
          "Nevada",
          "New Hampshire",
          "New Jersey",
          "New Mexico",
          "New York",
          "North Carolina",
          "North Dakota",
          "Ohio",
          "Oklahoma",
          "Oregon",
          "Pennsylvania",
          "Rhode Island",
          "South Carolina",
          "South Dakota",
          "Tennessee",
          "Texas",
          "Utah",
          "Vermont",
          "Virginia",
          "Washington",
          "West Virginia",
          "Wisconsin",
          "Wyoming",
          "District of Columbia",
        ].map((state) => (
          <a
            key={state}
            href={`/states/${state
              .toLowerCase()
              .replace(/ /g, "-")}`}
            style={{
              textDecoration: "none",
              color: "#0077cc",
              backgroundColor: "#f0f0f0",
              padding: "5px 10px",
              borderRadius: "5px",
              fontSize: "0.95rem",
            }}
          >
            {state}
          </a>
        ))}
      </div>
    ),
    FAQ: "Frequently Asked Questions will be listed here. Have a suggestion? Let us know!",
  };

  const renderTabs = () => (
    <div
      style={{
        marginTop: "20px",
        backgroundColor: "#fff",
        border: "1px solid #ccc",
        borderRadius: "8px",
        boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
        padding: "10px",
        width: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          borderBottom: "1px solid #ddd",
          marginBottom: "10px",
        }}
      >
        {Object.keys(tabContent).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1,
              padding: "10px",
              cursor: "pointer",
              backgroundColor:
                activeTab === tab ? "#f4f7f6" : "#fff",
              border: "none",
              borderBottom:
                activeTab === tab
                  ? "3px solid #3b3b3b"
                  : "none",
              fontWeight:
                activeTab === tab ? "bold" : "normal",
            }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>
      <div
        style={{
          fontSize: "0.95rem",
          color: "#333",
          padding: "5px 10px",
        }}
      >
        {tabContent[activeTab]}
      </div>
    </div>
  );

  const sheetBestUrl =
    "https://api.sheetbest.com/sheets/fa3943a8-5866-4c13-97af-1862a50f8a22";
  const excludedColumns = [
    "state",
    "abbreviation",
    "includes_cc",
  ];

  const columnNames = {
    requires_anthropogenic_cc:
      "What States Teach Anthropogenic Climate Change?",
    language_strength:
      "How Strong is Standard Language?",
    science_standard_type: "Science Standard Type",
    social_studies_type:
      "Extent of Social Studies Instruction",
    subjects_covered_cc:
      "What Subjects Include Climate Change?",
    grades_covered_cc_science:
      "What Grades Learn about Climate Change?",
    score: "Total Score",
  };

  useEffect(() => {
    axios
      .get(sheetBestUrl)
      .then((res) => {
        setData(res.data);
        setLoading(false);
        setSelectedColumn(
          Object.keys(res.data[0]).find(
            (k) => !excludedColumns.includes(k)
          )
        );
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleColumnChange = (e) =>
    setSelectedColumn(e.target.value);
  const handleClick = (geo) => {
    const name = geo.properties.name;
    navigate(
      `/states/${name.toLowerCase().replace(/ /g, "-")}`
    );
  };

  const generateLegend = () => {
    const sym = columnSymbology[selectedColumn];
    if (!sym) return null;
    let samples = [],
      isGrad = false;
    switch (selectedColumn) {
      case "score":
        samples = [1, 2, 3, 4, 5];
        isGrad = true;
        break;
      case "requires_anthropogenic_cc":
        samples = ["Yes", "No"];
        break;
      case "language_strength":
        samples = ["Weak", "Medium", "Strong", "Excellent"];
        break;
      case "science_standard_type":
        samples = ["State", "Hybrid", "NGSS"];
        break;
      case "social_studies_type":
        samples = [
          "Human-Environment Interaction",
          "Climate Change",
          "Anthropogenic Climate Change",
        ];
        break;
      case "subjects_covered_cc":
        samples = [
          "Science",
          "Science and Social Studies",
          "Interdisciplinary",
        ];
        break;
      case "grades_covered_cc_science":
        samples = [
          "High",
          "Middle and High",
          "Elementary, Middle, and High",
        ];
        break;
      default:
        samples = [];
    }

    const items = [];
    if (isGrad) {
      items.push(
        <div key="grad">
          <div
            style={{
              width: "200px",
              height: "20px",
              background:
                "linear-gradient(to right, #e0a3a3, #e2b892, #d2c88e, #a2c68d, #6bbd8d)",
              marginBottom: "8px",
            }}
          />
          <div
            style={{
              fontWeight: "bold",
              marginBottom: "8px",
            }}
          >
            Total Score (1–5)
          </div>
        </div>
      );
    } else {
      samples.forEach((v) =>
        items.push(
          <div
            key={v}
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "8px",
            }}
          >
            <div
              style={{
                width: "20px",
                height: "20px",
                backgroundColor: sym(v),
                marginRight: "10px",
              }}
            />
            <span>{v}</span>
          </div>
        )
      );
    }

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          marginTop: "20px",
          padding: "10px",
          backgroundColor: "#fff",
          border: "1px solid #ccc",
          borderRadius: "5px",
          boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
          width: getLegendWidthForColumn(selectedColumn),
        }}
      >
        {items}
      </div>
    );
  };

  const getLegendWidthForColumn = (col) => {
    switch (col) {
      case "score":
        return "200px";
      case "requires_anthropogenic_cc":
        return "160px";
      case "language_strength":
        return "250px";
      case "science_standard_type":
        return "200px";
      case "social_studies_type":
        return "300px";
      case "subjects_covered_cc":
        return "250px";
      case "grades_covered_cc_science":
        return "300px";
      default:
        return "auto";
    }
  };

  return (
    <div
      style={{
        position: "relative",
        backgroundColor: "#f4f7f6",
        minHeight: "100vh",
        padding: "30px",
        borderRadius: "10px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <h1
        style={{
          fontSize: "2.5rem",
          fontWeight: "bold",
          color: "#3b3b3b",
          marginBottom: "30px",
          textAlign: "center",
          padding: "20px",
          backgroundColor: "#f4f7f6",
          borderRadius: "10px",
          boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
        }}
      >
        Climate Change Education Tracker
      </h1>

      {loading ? (
        <p style={{ textAlign: "center" }}>Loading data...</p>
      ) : (
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "40px",
            width: "100%",
            maxWidth: "1300px",
          }}
        >
          {/* Map + Controls */}
          <div style={{ flex: 2 }}>
            <ComposableMap
              projection="geoAlbersUsa"
              width={800}
              height={600}
              style={{
                width: "100%",
                height: "auto",
                borderRadius: "10px",
                boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                marginBottom: "10px",
              }}
              onMouseMove={(e) =>
                setMousePosition({
                  x: e.clientX,
                  y: e.clientY,
                })
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
                          onMouseEnter={() => {
                            // show tooltip for ANY selected column
                            const displayVal = row
                              ? row[selectedColumn]
                              : null;
                            setTooltip({
                              isVisible: true,
                              content: `${name}: ${
                                displayVal ?? "N/A"
                              }`,
                            });
                          }}
                          onMouseLeave={() =>
                            setTooltip({
                              isVisible: false,
                              content: "",
                            })
                          }
                          style={{
                            default: {
                              fill: columnSymbology[
                                selectedColumn
                              ]
                                ? columnSymbology[
                                    selectedColumn
                                  ](val)
                                : "#D6D6DA",
                              stroke: "#FFFFFF",
                              outline: "none",
                              cursor: "pointer",
                            },
                            hover: {
                              fill: "#FFD700",
                              stroke: "#FFFFFF",
                              outline: "none",
                            },
                            pressed: {
                              fill: "#E42",
                              stroke: "#FFFFFF",
                              outline: "none",
                            },
                          }}
                        />
                      );
                    })
                  }
                </Geographies>
              </ZoomableGroup>
            </ComposableMap>

            {/* Zoom / DC / Recenter Controls */}
            <div
              style={{
                textAlign: "center",
                marginBottom: "30px",
              }}
            >
              <button
                onClick={() =>
                  setZoom((z) => Math.min(z * 1.5, 20))
                }
                style={{ marginRight: "8px" }}
              >
                ＋
              </button>
              <button
                onClick={() =>
                  setZoom((z) =>
                    Math.max(z / 1.5, 1)
                  )
                }
                style={{ marginRight: "8px" }}
              >
                －
              </button>
              <button
                onClick={() => {
                  setCenter([-77.0369, 38.9072]);
                  setZoom(10);
                }}
                style={{ marginRight: "8px" }}
              >
                DC
              </button>
              <button
                onClick={() => {
                  setCenter([-98, 38]);
                  setZoom(1);
                }}
              >
                Re-center
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: "5px",
              marginTop: "10px",
              position: "relative",
            }}
          >
            <div>
              <label
                htmlFor="columnSelect"
                style={{
                  fontSize: "1.1rem",
                  fontWeight: "bold",
                  marginBottom: "10px",
                  color: "#333",
                }}
              >
                Choose a Topic to Visualize:
              </label>
              <select
                id="columnSelect"
                value={selectedColumn}
                onChange={handleColumnChange}
                style={{
                  padding: "10px",
                  fontSize: "1rem",
                  borderRadius: "5px",
                  border: "1px solid #ccc",
                  width: "100%",
                  backgroundColor: "#fff",
                  color: "#333",
                }}
              >
                {Object.keys(columnNames).map((key) => (
                  <option key={key} value={key}>
                    {columnNames[key]}
                  </option>
                ))}
              </select>
            </div>

            {/* Tooltip */}
            {tooltip.isVisible && (
              <div
                style={{
                  position: "fixed",
                  top: mousePosition.y + 10,
                  left: mousePosition.x + 10,
                  padding: "8px 16px",
                  backgroundColor: "rgba(0,0,0,0.7)",
                  color: "#fff",
                  borderRadius: "5px",
                  zIndex: 100,
                  pointerEvents: "none",
                  boxShadow:
                    "0 4px 8px rgba(0,0,0,0.2)",
                }}
              >
                {tooltip.content}
              </div>
            )}

            {generateLegend()}
            {renderTabs()}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
