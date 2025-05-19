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
  faBars, // Koristimo faBars za otvaranje i zatvaranje
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { logOut } from "../../firebase"; // Firebase logout function
import styles from "./Sidebar.module.css";

// isOpen i toggleSidebar sada dolaze kao props
const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { t, i18n } = useTranslation();
  const { currentUser } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    try {
      await logOut();
      // Ako je sidebar bio otvoren na mobilnom, toggleSidebar će ga zatvoriti ako je pozvan
      // Najbolje je da se ovo rješava u App.jsx ili da se osigura da nakon odjave
      // korisnik bude preusmjeren i da se stanje sidebara resetira ako je potrebno.
      // Za sada, ako je mobilni i sidebar je otvoren, pozvat ćemo toggleSidebar.
      if (isOpen && window.innerWidth < 768) {
        // 768 je MOBILE_BREAKPOINT
        toggleSidebar();
      }
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  const changeLanguage = (lng) => {
    if (i18n.language !== lng) {
      i18n
        .changeLanguage(lng)
        .then(() => {
          localStorage.setItem("language", lng);
          // console.log("Language changed to:", lng);
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
        {/* Gumb je sada uvijek hamburger i koristi toggleSidebar prop.
            Ovaj gumb je UVIJEK unutar sidebara. */}
        <button
          onClick={toggleSidebar}
          className={styles.sidebarInternalToggle}
          aria-label={
            isOpen
              ? t("closeSidebar", "Close sidebar")
              : t("openSidebar", "Open sidebar")
          } // Dinamički aria-label
        >
          <FontAwesomeIcon icon={faBars} />
        </button>
        {/* Logo/naziv aplikacije se prikazuje samo ako je sidebar otvoren i ima dovoljno prostora */}
        {isOpen && (
          <div className={styles.logoSection}>
            <h2>{t("appName")}</h2>
          </div>
        )}
      </div>

      {/* Ostatak sadržaja sidebara - nav, settings.
          Ovi elementi će biti vidljivi samo ako je `isOpen` true, 
          jer klasa .closed (ili nedostatak .open) će ih sakriti ili smanjiti. */}
      <nav className={styles.nav}>
        <ul>
          {/* Primjer aktivne stavke, trebalo bi biti dinamično ako ima više stranica */}
          <li className={styles.active}>
            <FontAwesomeIcon icon={faStickyNote} /> <span>{t("notes")}</span>
          </li>
          {/* Dodaj druge navigacijske stavke ovdje ako je potrebno */}
        </ul>
      </nav>

      <div className={styles.settingsSection}>
        <div className={styles.settingItem} onClick={toggleTheme}>
          <FontAwesomeIcon icon={theme === "light" ? faMoon : faSun} />
          <span>{theme === "light" ? t("darkMode") : t("lightMode")}</span>
        </div>
        <div className={styles.languageSwitcher}>
          <FontAwesomeIcon icon={faLanguage} />
          <span>{t("language")}:</span>
          <button
            onClick={() => changeLanguage("en")}
            disabled={i18n.language === "en"}
            aria-pressed={i18n.language === "en"}
          >
            EN
          </button>
          <button
            onClick={() => changeLanguage("hr")}
            disabled={i18n.language === "hr"}
            aria-pressed={i18n.language === "hr"}
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
              <FontAwesomeIcon icon={faSignOutAlt} /> <span>{t("logout")}</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
