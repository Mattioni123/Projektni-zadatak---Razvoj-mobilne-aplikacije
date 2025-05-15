// src/components/Layout/Sidebar.jsx
import React from "react"; // Removed useState and useEffect for isMobileView here
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
import { logOut } from "../../firebase";
import styles from "./Sidebar.module.css";

const Sidebar = ({ isOpen }) => {
  // Accept isOpen prop
  const { t, i18n } = useTranslation();
  const { currentUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { toggleSidebar } = useLayout(); // For the "X" button

  const handleLogout = async () => {
    /* ... */
  };
  const changeLanguage = (lng) => {
    /* ... */
  };

  return (
    <div
      className={`${styles.sidebar} ${isOpen ? styles.open : styles.closed}`}
    >
      {" "}
      {/* Apply .open or .closed */}
      <div className={styles.sidebarHeader}>
        <div className={styles.logoSection}>
          <h2>{t("appName")}</h2>
        </div>
        {/* "X" button to close the sidebar */}
        <button onClick={toggleSidebar} className={styles.sidebarToggleButton}>
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>
      <nav className={styles.nav}>
        <ul>
          <li className={styles.active}>
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
