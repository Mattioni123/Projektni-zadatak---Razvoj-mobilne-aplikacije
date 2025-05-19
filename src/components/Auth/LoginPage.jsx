// src/components/Auth/LoginPage.jsx
import React from "react";
import { useTranslation } from "react-i18next";
import { signInWithGoogle } from "../../firebase";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle } from "@fortawesome/free-brands-svg-icons"; // Make sure to install @fortawesome/free-brands-svg-icons
import styles from "./LoginPage.module.css";

const LoginPage = () => {
  const { t } = useTranslation();

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Login failed", error);
      // Handle login error (e.g., show a message to the user)
    }
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginBox}>
        <h1>{t("appName")}</h1>
        <p>{t("welcomeMessage", "Please log in to manage your notes.")}</p>{" "}
        {/* Add welcomeMessage to translations if needed */}
        <button onClick={handleLogin} className={styles.loginButton}>
          <FontAwesomeIcon icon={faGoogle} /> {t("loginWithGoogle")}
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
