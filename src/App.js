import React from "react";
import { FastSpringProvider } from "./context/FastSpringContext";
import BuilderPage from "./pages/BuilderPage";

export default function App() {
  return (
    <FastSpringProvider>
      <BuilderPage />
    </FastSpringProvider>
  );
}
