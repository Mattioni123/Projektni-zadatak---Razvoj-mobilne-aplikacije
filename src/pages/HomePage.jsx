// src/pages/HomePage.jsx
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../contexts/AuthContext";
import {
  createNoteInFirestore,
  getPublicNotesFromFirestore, // Updated
  updateNoteInFirestore,
  deleteNoteFromFirestore,
} from "../firebase"; // auth will be used internally by firebase functions
import NotesGrid from "../components/Notes/NotesGrid";
import NoteForm from "../components/Notes/NoteForm";
import AddNoteButton from "../components/Notes/AddNoteButton";
import styles from "./HomePage.module.css";


const HomePage = () => {
  const { t } = useTranslation();
  const { currentUser } = useAuth(); // Still needed for conditional rendering or passing to components
  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [editingNote, setEditingNote] = useState(null);

  useEffect(() => {
    if (currentUser) {
      // Only fetch if user is logged in
      setIsLoading(true);
      // Now fetching all public notes
      const unsubscribe = getPublicNotesFromFirestore((fetchedNotes) => {
        // Sorting is now handled in getPublicNotesFromFirestore query
        setNotes(fetchedNotes);
        setIsLoading(false);
      });
      return () => unsubscribe();
    } else {
      setNotes([]);
      setIsLoading(false);
    }
  }, [currentUser]); // Re-run if currentUser changes

  const handleOpenNoteForm = (note = null) => {
    setEditingNote(note);
    setShowNoteForm(true);
  };

  const handleCloseNoteForm = () => {
    setEditingNote(null);
    setShowNoteForm(false);
  };

  const handleSaveNote = async (noteData) => {
    if (!currentUser) return; // Should be handled by auth check before calling
    try {
      if (editingNote) {
        // Check if current user is the creator before allowing update
        // This check is primarily for UI; Firestore rules are the source of truth
        if (editingNote.creatorUid === currentUser.uid) {
          await updateNoteInFirestore(editingNote.id, noteData);
        } else {
          console.warn("User is not authorized to edit this note.");
          alert("You can only edit your own notes."); // Or some other user feedback
          // Optionally, don't close the form or refresh notes to show it wasn't updated
          return;
        }
      } else {
        await createNoteInFirestore(noteData); // creatorUid and displayName added in firebase.js
      }
      handleCloseNoteForm();
    } catch (error) {
      console.error("Error saving note:", error);
    }
  };

  const handleDeleteNote = async (noteId, noteCreatorUid) => {
    if (!currentUser) return;
    // UI check, Firestore rules enforce this
    if (noteCreatorUid !== currentUser.uid) {
      alert("You can only delete your own notes.");
      return;
    }
    if (window.confirm(t("confirmDelete"))) {
      try {
        await deleteNoteFromFirestore(noteId);
      } catch (error) {
        console.error("Error deleting note:", error);
      }
    }
  };

  if (!currentUser && !isLoading) {
    return (
      <div className={styles.loading}>
        {t("pleaseLoginToViewNotes", "Please log in to view and create notes.")}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={styles.loading}>{t("loading", "Loading notes...")}</div>
    );
  }

  return (
    <div className={styles.homePage}>
      {" "}
      <NotesGrid
        notes={notes}
        onEditNote={handleOpenNoteForm}
        onDeleteNote={(noteId, creatorUid) =>
          handleDeleteNote(noteId, creatorUid)
        }
        currentUserUid={currentUser?.uid}
      />
      <AddNoteButton onClick={() => handleOpenNoteForm()} />
      {showNoteForm && (
        <NoteForm
          noteToEdit={editingNote}
          onSave={handleSaveNote}
          onClose={handleCloseNoteForm}
        />
      )}
    </div>
  );
};

export default HomePage;
