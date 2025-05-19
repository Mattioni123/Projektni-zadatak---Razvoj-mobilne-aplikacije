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
import Sidebar from "./components/Layout/Sidebar";
import LoginPage from "./components/Auth/LoginPage";
import HomePage from "./pages/HomePage";
import "./styles/global.css";
import appStyles from "./App.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons"; // Samo faBars
import { useTranslation } from "react-i18next";
import { NoteGroupProvider } from "./contexts/NoteGroupContext";

const MOBILE_BREAKPOINT = 768;

function AppContent() {
  const { currentUser, loading } = useAuth();
  const { isSidebarOpen, toggleSidebar } = useLayout();
  const { t } = useTranslation();
  const [isMobile, setIsMobile] = useState(
    window.innerWidth < MOBILE_BREAKPOINT
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (loading) {
    return <div className={appStyles.appLoading}>Loading application...</div>;
  }

  return (
    <div className={appStyles.appContainer}>
      {/* Sidebar sada prima toggleSidebar funkciju da bi je koristio interni gumb */}
      {currentUser && (
        <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      )}

      {isMobile && isSidebarOpen && currentUser && (
        <div className={appStyles.backdrop} onClick={toggleSidebar}></div>
      )}

      <main
        className={`${appStyles.mainContent} ${
          isSidebarOpen && !isMobile && currentUser
            ? appStyles.mainContentShifted
            : ""
        }`}
      >
        {currentUser && (
          <div className={appStyles.mainHeader}>
            {/* Ovaj gumb je vidljiv SAMO KADA JE SIDEBAR ZATVOREN */}
            {!isSidebarOpen && (
              <button
                onClick={toggleSidebar}
                className={appStyles.headerSidebarToggle}
                aria-label="Open sidebar"
              >
                <FontAwesomeIcon icon={faBars} />
              </button>
            )}
            {/* Naziv aplikacije - prikazuje se samo ako sidebar nije otvoren, 
                ili ako je desktop prikaz (da ne smeta na mobitelu kad je sidebar overlay) */}
            {(!isSidebarOpen || !isMobile) && (
              <h1
                className={`${appStyles.headerAppName} ${
                  !isSidebarOpen ? appStyles.headerAppNameSidebarClosed : ""
                }`}
              >
                {t("appName")}
              </h1>
            )}
          </div>
        )}
        <div className={appStyles.pageContent}>
          <Routes>
            <Route
              path="/"
              element={
                currentUser ? <HomePage /> : <Navigate to="/login" replace />
              }
            />
            <Route
              path="/login"
              element={
                !currentUser ? <LoginPage /> : <Navigate to="/" replace />
              }
            />
          </Routes>
        </div>
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
            <NoteGroupProvider>
              <AppContent />
            </NoteGroupProvider>
          </LayoutProvider>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
