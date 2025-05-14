// src/components/Notes/NotesGrid.jsx
import React from "react";
import NoteCard from "./NoteCard";
import styles from "./NotesGrid.module.css";

const NotesGrid = ({ notes, onEditNote, onDeleteNote, currentUserUid }) => {
  // Added currentUserUid
  if (!notes || notes.length === 0) {
    return (
      <p className={styles.noNotesMessage}>
        {/* No notes yet or adjust message */}
      </p>
    );
  }

  return (
    <div className={styles.notesGrid}>
      {notes.map((note) => (
        <NoteCard
          key={note.id}
          note={note}
          onEdit={onEditNote}
          onDelete={onDeleteNote}
          currentUserUid={currentUserUid} // Pass it down
        />
      ))}
    </div>
  );
};

export default NotesGrid;
