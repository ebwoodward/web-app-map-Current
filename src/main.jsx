// index.js
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import StatePage from "./StatePage"; // You'll create this next

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/states/:slug" element={<StatePage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);