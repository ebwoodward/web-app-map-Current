import React, { useState, useEffect } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// TopoJSON source for US map
const geoUrl =
  "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

// Color gradient for score (1–5)
const scoreColor = (value) => {
  const num = parseFloat(value);
  if (isNaN(num) || num < 1) return "#eeeeee";  // Return gray for invalid or < 1 values

  // Slightly bolder red-to-green tones
  const colors = ["#e0a3a3", "#e2b892", "#d2c88e", "#a2c68d", "#6bbd8d"];
  const index = Math.min(Math.floor(num) - 1, colors.length - 1); // Adjusting for 1-based index
  return colors[index];
};

// Symbology rules
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
      case "0.25": return "#d0e6e2";
      case "0.5": return "#9dc9c0";
      case "0.75": return "#62ada1";
      case "1": return "#2f8373";
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
  const navigate = useNavigate(); // Initialize the navigate hook for routing
  const [data, setData] = useState([]);
  const [selectedColumn, setSelectedColumn] = useState(null);
  const [loading, setLoading] = useState(true);

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

  // Navigate on state click
  const handleClick = (geo) => {
    const stateName = geo.properties.name;
    navigate(`/states/${stateName.toLowerCase().replace(/ /g, "-")}`); // Create the dynamic URL based on state name
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
        sampleValues = ["0.25", "0.5", "0.75", "1"];
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

    return legendItems;
  };

  const getMaxLegendWidth = () => {
    if (selectedColumn === "score") {
      return "200px";
    }
    const sampleValues = getSampleValuesForColumn(selectedColumn);
    if (!sampleValues) return "auto";

    let maxLength = 0;
    sampleValues.forEach(value => {
      maxLength = Math.max(maxLength, value.length);
    });
    return `${maxLength * 10 + 30}px`;
  };

  const getSampleValuesForColumn = (column) => {
    switch (column) {
      case "score":
        return [1, 2, 3, 4, 5];
      case "requires_anthropogenic_cc":
        return ["Yes", "No"];
      case "language_strength":
        return ["0.25", "0.5", "0.75", "1"];
      case "science_standard_type":
        return ["State", "Hybrid", "NGSS"];
      case "social_studies_type":
        return ["Human-Environment Interaction", "Climate Change", "Anthropogenic Climate Change"];
      case "subjects_covered_cc":
        return ["Science", "Science and Social Studies", "Interdisciplinary"];
      case "grades_covered_cc_science":
        return ["High", "Middle and High", "Elementary, Middle, and High"];
      default:
        return [];
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
        justifyContent: "center", 
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
        }}
      >
        Climate Change Education Tracker
      </h1>

      {loading ? (
        <p style={{ textAlign: "center" }}>Loading data...</p>
      ) : (
        <div style={{ display: "flex", alignItems: "flex-start", marginBottom: "30px" }}>
          <div style={{ marginRight: "30px" }}>
            <label
              htmlFor="columnSelect"
              style={{
                fontSize: "1.2rem",
                fontWeight: "500",
                color: "#3b3b3b",
                display: "block",
                marginBottom: "10px",
                textAlign: "center",
              }}
            >
              Choose a topic to visualize
            </label>
            <select
              id="columnSelect"
              onChange={handleColumnChange}
              value={selectedColumn}
              style={{
                padding: "10px",
                fontSize: "1rem",
                width: "250px",
                borderRadius: "5px",
                border: "1px solid #ccc",
                backgroundColor: "#fff",
                cursor: "pointer",
                display: "block",
                marginTop: "5px",
              }}
            >
              {Object.keys(data[0])
                .filter((col) => !excludedColumns.includes(col))
                .map((col) => (
                  <option key={col} value={col}>
                    {columnNames[col] || col}
                  </option>
                ))}
            </select>
          </div>

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
              width: getMaxLegendWidth(),
            }}
          >
            {generateLegend()}
          </div>
        </div>
      )}

      <ComposableMap
        projection="geoAlbersUsa"
        style={{
          borderRadius: "10px",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
          marginBottom: "30px",
        }}
      >
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const stateName = geo.properties.name;
              const stateData = data.find((state) => state.state === stateName);
              const value = stateData ? stateData[selectedColumn] : null;

              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  onClick={() => handleClick(geo)} // Clicking a state navigates
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
                      fill: "#FFD700", // Gold for hover effect
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
  );
};

export default App;
