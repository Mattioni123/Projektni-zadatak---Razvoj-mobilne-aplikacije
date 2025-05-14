// src/components/Notes/AddNoteButton.jsx
import React from "react";
import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import styles from "./AddNoteButton.module.css";

const AddNoteButton = ({ onClick }) => {
  const { t } = useTranslation();
  return (
    <button
      className={styles.addNoteButton}
      onClick={onClick}
      title={t("addNote")}
    >
      <FontAwesomeIcon icon={faPlus} />
    </button>
  );
};

export default AddNoteButton;
