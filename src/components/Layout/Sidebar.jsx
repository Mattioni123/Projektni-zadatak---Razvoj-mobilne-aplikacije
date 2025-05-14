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
  faBars,
  faTimes, // Added faBars, faTimes for toggle
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { useLayout } from "../../contexts/LayoutContext"; // Import useLayout
import { logOut } from "../../firebase";
import styles from "./Sidebar.module.css";

const Sidebar = () => {
  const { t, i18n } = useTranslation();
  const { currentUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { isSidebarOpen, toggleSidebar } = useLayout(); // Get sidebar state and toggle

  const handleLogout = async () => {
    try {
      await logOut();
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem("language", lng);
  };

  /*if (!isSidebarOpen) {
    return (
      <button
        onClick={toggleSidebar}
        className={styles.sidebarToggleButtonCollapsed}
      >
        <FontAwesomeIcon icon={faBars} />
      </button>
    );
  }*/

  return (
    <div
      className={`${styles.sidebar} ${
        isSidebarOpen ? styles.open : styles.closed
      }`}
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
            {/* Add active class logic later with routing */}
            <FontAwesomeIcon icon={faStickyNote} /> {t("notes")}
          </li>
          {/* Add more sections/links if needed */}
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
