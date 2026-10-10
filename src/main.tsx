import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { AuthProvider } from "./lib/useAuth";
import { applyUiScale, readStoredUiScale } from "./lib/uiScale";

applyUiScale(readStoredUiScale());

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>
);
