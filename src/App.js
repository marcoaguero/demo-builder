import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { FastSpringProvider } from "./context/FastSpringContext";
import BuilderPage from "./pages/BuilderPage";
import DemoPage from "./pages/DemoPage";

export default function App() {
  return (
    <FastSpringProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<BuilderPage />} />
          <Route path="/builder" element={<BuilderPage />} />
          <Route path="/demo" element={<DemoPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </FastSpringProvider>
  );
}
