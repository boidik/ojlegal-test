import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import ErrorBoundary from "./components/ErrorBoundary";
import { CustomThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { AppProvider } from "./context/AppContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <AppProvider>
          <CustomThemeProvider>
            <App />
          </CustomThemeProvider>
        </AppProvider>
      </AuthProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
