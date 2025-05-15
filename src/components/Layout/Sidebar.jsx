// src/components/Layout/Sidebar.jsx
import React from "react";
import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStickyNote,
  faUserCircle,
  faSignOutAlt,
  faLanguage,
  faMoon,
  faSun,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { useLayout } from "../../contexts/LayoutContext";
import { logOut } from "../../firebase"; // Firebase logout function
import styles from "./Sidebar.module.css";

const Sidebar = ({ isOpen }) => {
  const { t, i18n } = useTranslation();
  const { currentUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { toggleSidebar, setIsSidebarOpen } = useLayout(); // Get setIsSidebarOpen if mobile needs to close sidebar on logout

  const handleLogout = async () => {
    try {
      await logOut(); // Call the imported Firebase logout function
      // Optionally, if on mobile and sidebar is an overlay, close it
      if (window.innerWidth < 768 && typeof setIsSidebarOpen === "function") {
        // Check if setIsSidebarOpen is available
        setIsSidebarOpen(false);
      }
    } catch (error) {
      console.error("Failed to log out", error);
      // You might want to show an error message to the user here
    }
  };

  const changeLanguage = (lng) => {
    if (i18n.language !== lng) {
      // Only change if different
      i18n
        .changeLanguage(lng)
        .then(() => {
          localStorage.setItem("language", lng);
          console.log("Language changed to:", lng);
        })
        .catch((err) => {
          console.error("Error changing language:", err);
        });
    }
  };

  return (
    <div
      className={`${styles.sidebar} ${isOpen ? styles.open : styles.closed}`}
    >
      <div className={styles.sidebarHeader}>
        <div className={styles.logoSection}>
          <h2>{t("appName")}</h2>
        </div>
        <button onClick={toggleSidebar} className={styles.sidebarToggleButton}>
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>
      <nav className={styles.nav}>
        <ul>
          <li className={styles.active}>
            {" "}
            {/* Consider making 'active' dynamic if you add more nav items */}
            <FontAwesomeIcon icon={faStickyNote} /> {t("notes")}
          </li>
        </ul>
      </nav>
      <div className={styles.settingsSection}>
        <div className={styles.settingItem} onClick={toggleTheme}>
          <FontAwesomeIcon icon={theme === "light" ? faMoon : faSun} />
          {theme === "light" ? t("darkMode") : t("lightMode")}
        </div>
        <div className={styles.languageSwitcher}>
          <FontAwesomeIcon icon={faLanguage} /> {t("language")}:
          <button
            onClick={() => changeLanguage("en")}
            disabled={i18n.language === "en"}
          >
            EN
          </button>
          <button
            onClick={() => changeLanguage("hr")}
            disabled={i18n.language === "hr"}
          >
            HR
          </button>
        </div>
        {currentUser && (
          <>
            <div className={styles.userInfo}>
              <FontAwesomeIcon icon={faUserCircle} />
              <span>{currentUser.displayName || currentUser.email}</span>
            </div>
            <button onClick={handleLogout} className={styles.logoutButton}>
              <FontAwesomeIcon icon={faSignOutAlt} /> {t("logout")}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
