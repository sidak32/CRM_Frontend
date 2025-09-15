import React from "react";
import { Outlet } from "react-router-dom";

function App() {
  return (
    <div>
      <h1>My CRM App</h1>
      <Outlet /> {/* this is where child routes like homepage.jsx will render */}
    </div>
  );
}

export default App;
