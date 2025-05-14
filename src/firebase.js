import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  // where, // We might not need 'where' for user-specific notes if all are public
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  orderBy, // For ordering public notes
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDkYGo5OK2-4euUVxMuWqIVe6MELMDmGLI",
  authDomain: "notes-app-4g.firebaseapp.com",
  projectId: "notes-app-4g",
  storageBucket: "notes-app-4g.firebasestorage.app",
  messagingSenderId: "776572205973",
  appId: "1:776572205973:web:0959d5bc18e8fa4f2f949c",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

const signInWithGoogle = () => signInWithPopup(auth, googleProvider);
const logOut = () => signOut(auth);

// Global notes collection
const notesCollectionRef = collection(db, "notes");

const createNoteInFirestore = (noteData) => {
  if (!auth.currentUser) return Promise.reject("User not authenticated");
  return addDoc(notesCollectionRef, {
    ...noteData,
    creatorUid: auth.currentUser.uid,
    creatorDisplayName: auth.currentUser.displayName || auth.currentUser.email, // Fallback to email if displayName is not set
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

// Gets ALL public notes
const getPublicNotesFromFirestore = (callback) => {
  const q = query(notesCollectionRef, orderBy("createdAt", "desc")); // Order by creation time
  return onSnapshot(q, (querySnapshot) => {
    const notes = [];
    querySnapshot.forEach((doc) => {
      notes.push({ id: doc.id, ...doc.data() });
    });
    callback(notes);
  });
};

const updateNoteInFirestore = (noteId, updatedData) => {
  // Security for update should be handled by Firestore rules (only creator can update)
  const noteRef = doc(db, "notes", noteId);
  return updateDoc(noteRef, {
    ...updatedData,
    updatedAt: serverTimestamp(),
  });
};

const deleteNoteFromFirestore = (noteId) => {
  // Security for delete should be handled by Firestore rules (only creator can delete)
  const noteRef = doc(db, "notes", noteId);
  return deleteDoc(noteRef);
};

// --- Functions for Comments (Phase 3) ---
const commentsCollectionRef = (noteId) =>
  collection(db, `notes/${noteId}/comments`);

const addCommentToFirestore = (noteId, commentText) => {
  if (!auth.currentUser) return Promise.reject("User not authenticated");
  return addDoc(commentsCollectionRef(noteId), {
    text: commentText,
    userId: auth.currentUser.uid,
    displayName: auth.currentUser.displayName || auth.currentUser.email,
    createdAt: serverTimestamp(),
  });
};

const getCommentsFromFirestore = (noteId, callback) => {
  const q = query(commentsCollectionRef(noteId), orderBy("createdAt", "asc"));
  return onSnapshot(q, (querySnapshot) => {
    const comments = [];
    querySnapshot.forEach((doc) => {
      comments.push({ id: doc.id, ...doc.data() });
    });
    callback(comments);
  });
};

export {
  auth,
  db,
  signInWithGoogle,
  logOut,
  createNoteInFirestore,
  getPublicNotesFromFirestore, // Renamed
  updateNoteInFirestore,
  deleteNoteFromFirestore,
  addCommentToFirestore, // New
  getCommentsFromFirestore, // New
};
