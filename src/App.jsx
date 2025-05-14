// src/App.jsx
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LayoutProvider, useLayout } from "./contexts/LayoutContext";
import Sidebar from "./components/Layout/Sidebar";
import LoginPage from "./components/Auth/LoginPage";
import HomePage from "./pages/HomePage";
import "./styles/global.css";
import appStyles from "./App.module.css"; // Renamed to avoid conflict if you have styles.appContainer elsewhere
import sidebarStyles from "./components/Layout/Sidebar.module.css"; // To access .sidebarToggleButtonCollapsed
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"; // Import FontAwesomeIcon
import { faBars } from "@fortawesome/free-solid-svg-icons"; // Import faBars

function AppContent() {
  const { currentUser, loading } = useAuth();
  const { isSidebarOpen, toggleSidebar } = useLayout(); // Get toggleSidebar here

  if (loading) {
    return <div>Loading application...</div>;
  }

  return (
    <div
      className={`${appStyles.appContainer} ${
        isSidebarOpen ? appStyles.sidebarOpen : appStyles.sidebarClosed
      }`}
    >
      {currentUser && isSidebarOpen && <Sidebar />}{" "}
      {/* Conditionally render full sidebar */}
      {currentUser &&
        !isSidebarOpen /* Render only the toggle button when closed */ && (
          <button
            onClick={toggleSidebar}
            className={sidebarStyles.sidebarToggleButtonCollapsed}
          >
            {" "}
            {/* Use toggleSidebar from context */}
            <FontAwesomeIcon icon={faBars} />
          </button>
        )}
      <main
        className={`${appStyles.mainContent} ${
          isSidebarOpen
            ? appStyles.mainContentSidebarOpen
            : appStyles.mainContentSidebarClosed
        }`}
      >
        <Routes>
          <Route
            path="/"
            element={
              currentUser ? <HomePage /> : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/login"
            element={!currentUser ? <LoginPage /> : <Navigate to="/" replace />}
          />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <LayoutProvider>
            <AppContent />
          </LayoutProvider>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
