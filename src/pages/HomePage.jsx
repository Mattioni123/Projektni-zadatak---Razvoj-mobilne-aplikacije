// src/pages/HomePage.jsx
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../contexts/AuthContext";
import { useNoteGroups } from "../contexts/NoteGroupContext";
import { useLayout } from "../contexts/LayoutContext"; // Dodali smo ovo u prošlom koraku
import {
  getNotesForGroupFromFirestore,
  updateNoteInFirestore,
  deleteNoteFromFirestore,
  createNoteInFirestore,
} from "../firebase";
import NotesGrid from "../components/Notes/NotesGrid";
import NoteForm from "../components/Notes/NoteForm";
import AddNoteButton from "../components/Notes/AddNoteButton";
import styles from "./HomePage.module.css";

const HomePage = () => {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const { activeGroupId, isLoadingGroups, defaultGroupId, noteGroups } =
    useNoteGroups();
  const { toggleSidebar, isSidebarOpen } = useLayout(); // Dohvaćeno iz LayoutContexta

  const [notes, setNotes] = useState([]);
  const [isLoadingNotes, setIsLoadingNotes] = useState(true);
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [editingNote, setEditingNote] = useState(null);

  useEffect(() => {
    if (currentUser && activeGroupId) {
      setIsLoadingNotes(true);
      const unsubscribe = getNotesForGroupFromFirestore(
        activeGroupId,
        (fetchedNotes) => {
          setNotes(fetchedNotes);
          setIsLoadingNotes(false);
        }
      );
      return () => unsubscribe();
    } else if (!activeGroupId && !isLoadingGroups) {
      setNotes([]);
      setIsLoadingNotes(false);
    }
  }, [currentUser, activeGroupId, isLoadingGroups]);

  const handleOpenNoteForm = (note = null) => {
    const targetGroupId = activeGroupId || defaultGroupId;
    if (!targetGroupId) {
      if (noteGroups.length === 0 && !isLoadingGroups) {
        alert(
          t(
            "noGroupsExistCreateOne",
            "No note groups exist yet. Please create one from the sidebar."
          )
        );
        if (!isSidebarOpen) {
          toggleSidebar();
        }
      } else {
        alert(
          t(
            "selectGroupFirst",
            "Please select a group from the sidebar before adding a note."
          )
        );
        if (!isSidebarOpen) {
          toggleSidebar();
        }
      }
      return;
    }
    setEditingNote(note);
    setShowNoteForm(true);
  };

  const handleCloseNoteForm = () => {
    setEditingNote(null);
    setShowNoteForm(false);
  };

  const handleSaveNote = async (noteData) => {
    if (!currentUser) return;
    const currentGroupId = activeGroupId || defaultGroupId;
    if (!currentGroupId) {
      alert(
        t(
          "noActiveGroupForSave",
          "Cannot save note, no active group. Please select or create one."
        )
      );
      return;
    }
    try {
      if (editingNote) {
        if (editingNote.creatorUid === currentUser.uid) {
          await updateNoteInFirestore(editingNote.id, noteData);
        } else {
          console.warn("User is not authorized to edit this note.");
          alert(t("unauthorizedEdit", "You can only edit your own notes."));
          return;
        }
      } else {
        await createNoteInFirestore(noteData, currentGroupId);
      }
      handleCloseNoteForm();
    } catch (error) {
      console.error("Error saving note:", error);
      alert(t("errorSavingNote", "Error saving note."));
    }
  };

  const handleDeleteNote = async (noteId, noteCreatorUid) => {
    if (!currentUser) return;
    if (noteCreatorUid !== currentUser.uid) {
      alert(t("unauthorizedDelete", "You can only delete your own notes."));
      return;
    }
    if (window.confirm(t("confirmDelete"))) {
      try {
        await deleteNoteFromFirestore(noteId);
      } catch (error) {
        console.error("Error deleting note:", error);
        alert(t("errorDeletingNote", "Error deleting note."));
      }
    }
  };

  // DEFINIRAJ canAddNote OVDJE, PRIJE RETURN BLOKA
  const canAddNote = !!(activeGroupId || defaultGroupId);

  if (isLoadingGroups) {
    return (
      <div className={styles.loading}>
        {t("loadingGroups", "Loading groups...")}
      </div>
    );
  }

  if (!currentUser && !isLoadingGroups) {
    return (
      <div className={styles.loading}>
        {t("pleaseLoginToViewNotes", "Please log in to view and create notes.")}
      </div>
    );
  }

  if (
    !activeGroupId &&
    !defaultGroupId &&
    !isLoadingGroups &&
    noteGroups.length === 0
  ) {
    return (
      <div className={`${styles.homePage} ${styles.noNotesMessageContainer}`}>
        <p className={styles.noNotesMessage}>
          {t(
            "pleaseCreateOrSelectGroup",
            "Please create or select a note group from the sidebar."
          )}
        </p>
      </div>
    );
  }

  if (isLoadingNotes && activeGroupId) {
    return (
      <div className={styles.loading}>
        {t("loadingNotes", "Loading notes...")}
      </div>
    );
  }

  return (
    <div className={styles.homePage}>
      {!isLoadingGroups &&
        !isLoadingNotes &&
        activeGroupId &&
        notes.length === 0 && (
          <div className={styles.noNotesMessageContainer}>
            <p className={styles.noNotesMessage}>
              {t("noNotesInGroup", "No notes in this group yet. Add one!")}
            </p>
          </div>
        )}

      {!isLoadingGroups && activeGroupId && (
        <NotesGrid
          notes={notes}
          onEditNote={handleOpenNoteForm}
          onDeleteNote={handleDeleteNote}
          currentUserUid={currentUser?.uid}
        />
      )}

      <AddNoteButton
        onClick={() => handleOpenNoteForm()}
        disabled={!canAddNote || isLoadingGroups}
        title={
          !canAddNote
            ? t("selectGroupFirstTitle", "Select a group first")
            : t("addNote")
        }
      />
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
