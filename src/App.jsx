// src/App.jsx
import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LayoutProvider, useLayout } from "./contexts/LayoutContext";
import Sidebar from "./components/Layout/Sidebar"; // Sidebar component
import LoginPage from "./components/Auth/LoginPage";
import HomePage from "./pages/HomePage";
import "./styles/global.css";
import appStyles from "./App.module.css";
import sidebarStyles from "./components/Layout/Sidebar.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";

const MOBILE_BREAKPOINT = 768;

function AppContent() {
  const { currentUser, loading } = useAuth();
  const { isSidebarOpen, toggleSidebar } = useLayout(); // isSidebarOpen controls the state
  const [isMobile, setIsMobile] = useState(
    window.innerWidth < MOBILE_BREAKPOINT
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    window.addEventListener("resize", handleResize);
    handleResize(); // Initial check
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (loading) {
    return <div className={appStyles.appLoading}>Loading application...</div>;
  }

  return (
    <div className={appStyles.appContainer}>
      {/* Sidebar Component: Always rendered if user is logged in.
          Its visual open/closed state is controlled by the 'isOpen' prop. */}
      {currentUser && <Sidebar isOpen={isSidebarOpen} />}{" "}
      {/* Pass isOpen prop */}
      {/* Hamburger Button: Shown if user is logged in AND sidebar is currently visually closed. */}
      {currentUser && !isSidebarOpen && (
        <button
          onClick={toggleSidebar}
          className={sidebarStyles.sidebarToggleButtonCollapsed}
          aria-label="Open sidebar"
        >
          <FontAwesomeIcon icon={faBars} />
        </button>
      )}
      {/* Backdrop for mobile overlay sidebar: Shown if on mobile, sidebar is visually open, and user is logged in. */}
      {isMobile && isSidebarOpen && currentUser && (
        <div className={appStyles.backdrop} onClick={toggleSidebar}></div>
      )}
      {/* Main Content Area: Shifts if sidebar is visually open AND not on mobile AND user is logged in. */}
      <main
        className={`${appStyles.mainContent} ${
          isSidebarOpen && !isMobile && currentUser
            ? appStyles.mainContentShifted
            : ""
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
