import { useState, useEffect } from "react";
import "./App.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faPen, faTrash } from "@fortawesome/free-solid-svg-icons";

const NotePopup = ({ isEdit, noteText, onTextChange, onSave, onClose }) => (
  <div className="popupContainer">
    <div className="popup">
      <h1>{isEdit ? "Edit Note" : "New Note"}</h1>
      <textarea
        value={noteText}
        onChange={(e) => onTextChange(e.target.value)}
        placeholder="Enter your note..."
        autoFocus
      />
      <div className="btn-container">
        <button onClick={onSave}>{isEdit ? "Done" : "Create Note"}</button>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  </div>
);

export default function App() {
  const [notes, setNotes] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [editingNoteId, setEditingNoteId] = useState(null);

  useEffect(() => {
    const storedNotes = JSON.parse(localStorage.getItem("notes")) || [];
    setNotes(storedNotes);
  }, []);

  const saveNotesToStorage = (updatedNotes) => {
    localStorage.setItem("notes", JSON.stringify(updatedNotes));
    setNotes(updatedNotes);
  };

  const createNote = () => {
    if (noteText.trim() !== "") {
      const newNote = {
        id: new Date().getTime(),
        text: noteText,
      };
      const updatedNotes = [...notes, newNote];
      saveNotesToStorage(updatedNotes);
      setNoteText("");
      setShowPopup(false);
    }
  };

  const editNote = (noteId) => {
    const noteToEdit = notes.find((note) => note.id === noteId);
    if (noteToEdit) {
      setNoteText(noteToEdit.text);
      setEditingNoteId(noteId);
      setShowEditPopup(true);
    }
  };

  const updateNote = () => {
    if (noteText.trim() !== "") {
      const updatedNotes = notes.map((note) =>
        note.id === editingNoteId ? { ...note, text: noteText } : note
      );
      saveNotesToStorage(updatedNotes);
      setNoteText("");
      setEditingNoteId(null);
      setShowEditPopup(false);
    }
  };

  const deleteNote = (noteId) => {
    const updatedNotes = notes.filter((note) => note.id !== noteId);
    saveNotesToStorage(updatedNotes);
  };

  const closePopup = () => {
    setShowPopup(false);
    setShowEditPopup(false);
    setNoteText("");
  };

  return (
    <div id="container">
      <div id="list-header">
        <div id="addNoteDiv" onClick={() => setShowPopup(true)}>
          <FontAwesomeIcon icon={faPlus} />
        </div>
        <div className="blankDiv"></div>
        <div className="blankDiv"></div>
      </div>

      <div id="list-container">
        <ul id="notes-list">
          {notes.map((note) => (
            <li key={note.id}>
              <span>{note.text}</span>
              <div className="noteBtns-container">
                <button onClick={() => editNote(note.id)}>
                  <FontAwesomeIcon icon={faPen} />
                </button>
                <button onClick={() => deleteNote(note.id)}>
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {showPopup && (
        <NotePopup
          isEdit={false}
          noteText={noteText}
          onTextChange={setNoteText}
          onSave={createNote}
          onClose={closePopup}
        />
      )}
      {showEditPopup && (
        <NotePopup
          isEdit={true}
          noteText={noteText}
          onTextChange={setNoteText}
          onSave={updateNote}
          onClose={closePopup}
        />
      )}
    </div>
  );
}
