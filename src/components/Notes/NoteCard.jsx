// src/components/Notes/NoteCard.jsx
import React from "react";
import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faTrash, faUser } from "@fortawesome/free-solid-svg-icons"; // Added faUser
import styles from "./NoteCard.module.css";

const NoteCard = ({ note, onEdit, onDelete, currentUserUid }) => {
  const { t } = useTranslation();

  const formatDate = (timestamp) => {
    // ... (formatDate function remains the same) ...
  };

  const isOwner = currentUserUid === note.creatorUid;

  return (
    <div
      className={styles.noteCard}
      style={{ backgroundColor: note.color || "var(--note-bg)" }}
    >
      {note.title && <h3 className={styles.noteTitle}>{note.title}</h3>}
      <p className={styles.noteText}>{note.text}</p>
      <div className={styles.noteMeta}>
        <FontAwesomeIcon icon={faUser} />
        <span className={styles.creatorName}>
          {note.creatorDisplayName || t("anonymous", "Anonymous")}
        </span>
      </div>
      {/* Comments section will go here later */}
      <div className={styles.noteFooter}>
        <span className={styles.noteDate}>
          {note.updatedAt
            ? formatDate(note.updatedAt)
            : formatDate(note.createdAt)}
        </span>
        {isOwner && ( // Only show actions if current user is the owner
          <div className={styles.noteActions}>
            <button onClick={() => onEdit(note)} aria-label={t("editNote")}>
              <FontAwesomeIcon icon={faPen} />
            </button>
            <button
              onClick={() => onDelete(note.id, note.creatorUid)}
              aria-label={t("delete")}
            >
              <FontAwesomeIcon icon={faTrash} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NoteCard;
