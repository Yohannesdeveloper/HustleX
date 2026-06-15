import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import ReactGA from "react-ga4";
import App from "./App";
import "./index.css";
import { Provider } from "react-redux";
import { store } from "./store";
import "./i18n/config"; // Initialize i18n

// Initialize Google Analytics 4 (set VITE_GA_MEASUREMENT_ID in .env or Vercel env vars)
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined;
if (GA_MEASUREMENT_ID) {
  ReactGA.initialize(GA_MEASUREMENT_ID);
  console.log("📊 Google Analytics initialized:", GA_MEASUREMENT_ID);
} else {
  console.warn("⚠️  VITE_GA_MEASUREMENT_ID not set — Google Analytics disabled");
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <Provider store={store}>
          <App />
        </Provider>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
);
