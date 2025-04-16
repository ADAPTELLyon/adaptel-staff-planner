import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import LoginPage from "./pages/login";
import Commandes from "./pages/Commandes";
import Parametrages from "./pages/Parametrages";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/commandes" element={<Commandes />} />
      <Route path="/parametrages" element={<Parametrages />} />
    </Routes>
  </BrowserRouter>
);
