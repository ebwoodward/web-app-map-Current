import React, { useState, useEffect } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const geoUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

const scoreColor = (value) => {
  const num = parseFloat(value);
  if (isNaN(num) || num < 1) return "#eeeeee";
  const colors = ["#e0a3a3", "#e2b892", "#d2c88e", "#a2c68d", "#6bbd8d"];
  const index = Math.min(Math.floor(num) - 1, colors.length - 1);
  return colors[index];
};

const columnSymbology = {
  "requires_anthropogenic_cc": (value) => {
    switch (value) {
      case "No": return "#e0a3a3";
      case "Yes": return "#6bbd8d";
      default: return "#eeeeee";
    }
  },
  "language_strength": (value) => {
    switch (value) {
      case "Weak": return "#d0e6e2";
      case "Medium": return "#9dc9c0";
      case "Strong": return "#62ada1";
      case "Excellent": return "#2f8373";
      default: return "#eeeeee";
    }
  },
  "science_standard_type": (value) => {
    switch (value) {
      case "State": return "#b2a0c0";
      case "Hybrid": return "#a1c3d1";
      case "NGSS": return "#c4dba0";
      default: return "#eeeeee";
    }
  },
  "social_studies_type": (value) => {
    switch (value) {
      case "Human-Environment Interaction": return "#f0c4a1";
      case "Climate Change": return "#f0a572";
      case "Anthropogenic Climate Change": return "#d95c5c";
      default: return "#eeeeee";
    }
  },
  "subjects_covered_cc": (value) => {
    switch (value) {
      case "Science": return "#c7dfe6";
      case "Science and Social Studies": return "#84a9b5";
      case "Interdisciplinary": return "#3d6b76";
      default: return "#eeeeee";
    }
  },
  "grades_covered_cc_science": (value) => {
    switch (value) {
      case "High": return "#bbb3d3";
      case "Middle and High": return "#9d95c2";
      case "Elementary, Middle, and High": return "#7f6bb1";
      default: return "#eeeeee";
    }
  },
  "score": scoreColor
};

const App = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [selectedColumn, setSelectedColumn] = useState(null);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState("about");

  const tabContent = {
    about: "This tool visualizes how U.S. states incorporate climate change into their education standards. Click a state on the map to explore more details about its standards and other approaches to climate education.",
    methodology: "Data was sourced from official state documents and analyzed based on consistency, language strength, and inclusion across subjects and grade levels.",
    states: (
      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
        {[
          "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut",
          "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana",
          "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts",
          "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada",
          "New Hampshire", "New Jersey", "New Mexico", "New York", "North Carolina",
          "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island",
          "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont",
          "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming", "District of Columbia"
        ].map((state) => (
          <a
            key={state}
            href={`/states/${state.toLowerCase().replace(/ /g, "-")}`}
            style={{
              textDecoration: "none",
              color: "#0077cc",
              backgroundColor: "#f0f0f0",
              padding: "5px 10px",
              borderRadius: "5px",
              fontSize: "0.95rem"
            }}
          >
            {state}
          </a>
        ))}
      </div>
    ),
    FAQ: "Frequently Asked Questions will be listed here. Have a suggestion? Let us know!"
  };

  const renderTabs = () => (
    <div
      style={{
        marginTop: "20px",
        backgroundColor: "#fff",
        border: "1px solid #ccc",
        borderRadius: "8px",
        boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
        padding: "10px",
        width: "100%",
      }}
    >
      <div style={{ display: "flex", borderBottom: "1px solid #ddd", marginBottom: "10px" }}>
        {Object.keys(tabContent).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1,
              padding: "10px",
              cursor: "pointer",
              backgroundColor: activeTab === tab ? "#f4f7f6" : "#fff",
              border: "none",
              borderBottom: activeTab === tab ? "3px solid #3b3b3b" : "none",
              fontWeight: activeTab === tab ? "bold" : "normal"
            }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div style={{ fontSize: "0.95rem", color: "#333", padding: "5px 10px" }}>
        {tabContent[activeTab]}
      </div>
    </div>
  );

  const sheetBestUrl = "https://api.sheetbest.com/sheets/fa3943a8-5866-4c13-97af-1862a50f8a22";
  const excludedColumns = ["state", "abbreviation", "includes_cc"];

  const columnNames = {
    "requires_anthropogenic_cc": "What States Teach Anthropogenic Climate Change?",
    "language_strength": "How Strong is Standard Language?",
    "science_standard_type": "Science Standard Type",
    "social_studies_type": "Extent of Social Studies Instruction",
    "subjects_covered_cc": "What Subjects Include Climate Change?",
    "grades_covered_cc_science": "What Grades Learn about Climate Change?",
    "score": "Total Score"
  };

  useEffect(() => {
    axios
      .get(sheetBestUrl)
      .then((response) => {
        setData(response.data);
        setLoading(false);
        setSelectedColumn(Object.keys(response.data[0]).find(key => !excludedColumns.includes(key)));
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setLoading(false);
      });
  }, []);

  const handleColumnChange = (event) => {
    setSelectedColumn(event.target.value);
  };

  const handleClick = (geo) => {
    const stateName = geo.properties.name;
    navigate(`/states/${stateName.toLowerCase().replace(/ /g, "-")}`);
  };

  const generateLegend = () => {
    const symbology = columnSymbology[selectedColumn];
    if (!symbology) return null;

    const legendItems = [];
    let sampleValues = [];
    let isGradient = false;
    switch (selectedColumn) {
      case "score":
        sampleValues = [1, 2, 3, 4, 5];
        isGradient = true;
        break;
      case "requires_anthropogenic_cc":
        sampleValues = ["Yes", "No"];
        break;
      case "language_strength":
        sampleValues = ["Weak", "Medium", "Strong", "Excellent"];
        break;
      case "science_standard_type":
        sampleValues = ["State", "Hybrid", "NGSS"];
        break;
      case "social_studies_type":
        sampleValues = ["Human-Environment Interaction", "Climate Change", "Anthropogenic Climate Change"];
        break;
      case "subjects_covered_cc":
        sampleValues = ["Science", "Science and Social Studies", "Interdisciplinary"];
        break;
      case "grades_covered_cc_science":
        sampleValues = ["High", "Middle and High", "Elementary, Middle, and High"];
        break;
      default:
        sampleValues = [];
    }

    if (isGradient) {
      const gradientStyle = {
        width: "200px",
        height: "20px",
        background: "linear-gradient(to right, #e0a3a3, #e2b892, #d2c88e, #a2c68d, #6bbd8d)",
        marginBottom: "8px",
      };
      legendItems.push(
        <div key="gradient" style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
          <div style={gradientStyle}></div>
        </div>
      );
      legendItems.unshift(
        <div key="legend-title" style={{ fontWeight: "bold", marginBottom: "8px" }}>
          Total Score (1 to 5)
        </div>
      );
    } else {
      sampleValues.forEach(value => {
        legendItems.push(
          <div key={value} style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
            <div
              style={{
                width: "20px",
                height: "20px",
                backgroundColor: symbology(value),
                marginRight: "10px",
              }}
            ></div>
            <span>{value}</span>
          </div>
        );
      });
    }

    const legendWidth = getLegendWidthForColumn(selectedColumn);

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
          boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
          width: legendWidth,
        }}
      >
        {legendItems}
      </div>
    );
  };

  const getLegendWidthForColumn = (column) => {
    switch (column) {
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

  return (
    <div
      style={{
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
          border: "0px solid #333",
          borderRadius: "10px",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
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
          <div style={{ flex: 2 }}>
            <ComposableMap
              projection="geoAlbersUsa"
              width={800}
              height={600}
              style={{
                width: "100%",
                height: "auto",
                borderRadius: "10px",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                marginBottom: "30px",
              }}
            >
              <Geographies geography={geoUrl}>
                {({ geographies }) =>
                  geographies.map((geo) => {
                    const stateName = geo.properties.name;
                    const stateData = data.find(
                      (state) => state.state === stateName
                    );
                    const value = stateData ? stateData[selectedColumn] : null;

                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        onClick={() => handleClick(geo)}
                        style={{
                          default: {
                            fill: columnSymbology[selectedColumn]
                              ? columnSymbology[selectedColumn](value)
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
            </ComposableMap>
          </div>

          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: "5px",
              marginTop: "10px",
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

            <>
              {generateLegend()}
              {renderTabs()}
            </>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
