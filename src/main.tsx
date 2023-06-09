import React from "react";
import ReactDOM from "react-dom/client";
import Editor from "./Editor";
import "./index.css";

ReactDOM.createRoot(document.getElementById("react-app-root") as HTMLElement).render(
  <React.StrictMode>
    <Editor />
  </React.StrictMode>,
);
