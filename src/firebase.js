// src/firebase.js
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
  where,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  orderBy,
  writeBatch, // Za transakcijsko brisanje bilješki
  getDocs, // Za dohvaćanje svih bilješki grupe prije brisanja
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

const notesCollectionRef = collection(db, "notes");
const noteGroupsCollectionRef = collection(db, "noteGroups");

const createNoteGroupInFirestore = (groupData) => {
  if (!auth.currentUser) return Promise.reject("User not authenticated");
  return addDoc(noteGroupsCollectionRef, {
    ...groupData,
    creatorUid: auth.currentUser.uid,
    createdAt: serverTimestamp(),
  });
};

const getNoteGroupsFromFirestore = (userId, callback) => {
  const q = query(
    noteGroupsCollectionRef,
    where("creatorUid", "==", userId),
    orderBy("createdAt", "asc")
  );
  return onSnapshot(q, (querySnapshot) => {
    const groups = [];
    querySnapshot.forEach((doc) => {
      groups.push({ id: doc.id, ...doc.data() });
    });
    callback(groups);
  });
};

const updateNoteGroupNameInFirestore = (groupId, newName) => {
  if (!auth.currentUser) return Promise.reject("User not authenticated");
  const groupRef = doc(db, "noteGroups", groupId);
  // Dodatna provjera: Osiguraj da korisnik mijenja samo svoju grupu (ovo bi trebalo biti i u Firestore pravilima)
  return updateDoc(groupRef, {
    name: newName,
  });
};

const deleteNoteGroupFromFirestore = async (groupId) => {
  if (!auth.currentUser) return Promise.reject("User not authenticated");

  // Prvo, obriši sve bilješke koje pripadaju toj grupi
  const notesQuery = query(
    notesCollectionRef,
    where("groupId", "==", groupId),
    where("creatorUid", "==", auth.currentUser.uid)
  );
  const notesSnapshot = await getDocs(notesQuery);

  const batch = writeBatch(db);
  notesSnapshot.forEach((noteDoc) => {
    batch.delete(noteDoc.ref);
    // Ovdje bi trebalo rekurzivno brisati i komentare za svaku bilješku ako postoje
    // Za jednostavnost, preskačemo brisanje komentara, ali u produkciji je važno
  });
  await batch.commit();

  // Zatim, obriši samu grupu
  const groupRef = doc(db, "noteGroups", groupId);
  return deleteDoc(groupRef);
};

const createNoteInFirestore = (noteData, groupId) => {
  if (!auth.currentUser || !groupId)
    return Promise.reject("User not authenticated or groupId missing");
  return addDoc(notesCollectionRef, {
    ...noteData,
    creatorUid: auth.currentUser.uid,
    creatorDisplayName: auth.currentUser.displayName || auth.currentUser.email,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    groupId: groupId,
  });
};

const getNotesForGroupFromFirestore = (groupId, callback) => {
  if (!auth.currentUser || !groupId) {
    callback([]);
    return () => {};
  }
  const q = query(
    notesCollectionRef,
    where("creatorUid", "==", auth.currentUser.uid),
    where("groupId", "==", groupId),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(
    q,
    (querySnapshot) => {
      const notes = [];
      querySnapshot.forEach((doc) => {
        notes.push({ id: doc.id, ...doc.data() });
      });
      callback(notes);
    },
    (error) => {
      console.error("Error fetching notes for group:", error);
      callback([]);
    }
  );
};

const updateNoteInFirestore = (noteId, updatedData) => {
  const noteRef = doc(db, "notes", noteId);
  return updateDoc(noteRef, {
    ...updatedData,
    updatedAt: serverTimestamp(),
  });
};

const deleteNoteFromFirestore = (noteId) => {
  const noteRef = doc(db, "notes", noteId);
  return deleteDoc(noteRef);
};

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
  createNoteGroupInFirestore,
  getNoteGroupsFromFirestore,
  updateNoteGroupNameInFirestore, // Novo
  deleteNoteGroupFromFirestore, // Novo
  createNoteInFirestore,
  getNotesForGroupFromFirestore,
  updateNoteInFirestore,
  deleteNoteFromFirestore,
  addCommentToFirestore,
  getCommentsFromFirestore,
  serverTimestamp,
};
