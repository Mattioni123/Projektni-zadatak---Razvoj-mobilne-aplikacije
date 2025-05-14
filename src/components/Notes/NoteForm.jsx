// src/components/Notes/NoteForm.jsx
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import styles from "./NoteForm.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

const NoteForm = ({ noteToEdit, onSave, onClose }) => {
  const { t } = useTranslation();
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  // const [color, setColor] = useState('#ffffff'); // Future: Add color picker

  useEffect(() => {
    if (noteToEdit) {
      setTitle(noteToEdit.title || "");
      setText(noteToEdit.text || "");
      // setColor(noteToEdit.color || '#ffffff');
    } else {
      setTitle("");
      setText("");
      // setColor('#ffffff');
    }
  }, [noteToEdit]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim() === "" && title.trim() === "") return; // Don't save empty notes
    onSave({ title: title.trim(), text: text.trim() /*, color */ });
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button className={styles.closeButtonTop} onClick={onClose}>
          <FontAwesomeIcon icon={faTimes} />
        </button>
        <h2>{noteToEdit ? t("editNote") : t("newNote")}</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder={t("noteTitlePlaceholder")}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={styles.titleInput}
          />
          <textarea
            placeholder={t("noteContentPlaceholder")}
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows="8"
            className={styles.contentInput}
            autoFocus
          />
          {/* Future: Color picker */}
          <div className={styles.buttonContainer}>
            <button type="submit" className={styles.saveButton}>
              {noteToEdit ? t("saveChanges") : t("createNote")}
            </button>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelButton}
            >
              {t("close")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NoteForm;
