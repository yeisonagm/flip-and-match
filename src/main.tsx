import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./app/App";
import { registerPwa } from "./platform/pwa";
import "./styles/index.css";

registerPwa();

const rootElement = document.getElementById("root");
if (rootElement === null) {
  throw new Error("Root element #root not found in index.html");
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
