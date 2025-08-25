import React from "react";
import SacredGlyph from "./SacredGlyph"; // adjust path if needed

export default function App() {
  return (
    <>
      {/* Existing App UI */}
      <div className="app-container">
        <h1>Welcome to the App</h1>
        <p>This is your root app component.</p>
      </div>

      {/* SacredGlyph Component */}
      <div className="sacred-glyph-wrapper">
        <SacredGlyph />
      </div>
    </>
  );
}

