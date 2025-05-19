// src/contexts/NoteGroupContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { db } from "../firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
  deleteDoc,
  getDocs,
  writeBatch, // Dodano za brisanje i update
} from "firebase/firestore";

const NoteGroupContext = createContext();

export const useNoteGroups = () => useContext(NoteGroupContext);

export const NoteGroupProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [noteGroups, setNoteGroups] = useState([]);
  const [activeGroupId, setActiveGroupId] = useState(null);
  const [isLoadingGroups, setIsLoadingGroups] = useState(true);
  const [defaultGroupId, setDefaultGroupId] = useState(null);

  useEffect(() => {
    if (currentUser) {
      setIsLoadingGroups(true);
      const groupsCollectionRef = collection(db, "noteGroups");
      const q = query(
        groupsCollectionRef,
        // where("creatorUid", "==", currentUser.uid), // This line should already be removed or commented out from the previous step
        orderBy("createdAt", "asc")
      );
      const unsubscribe = onSnapshot(
        q,
        (querySnapshot) => {
          const fetchedGroups = [];
          let foundDefaultId = null;
          querySnapshot.forEach((doc) => {
            const groupData = { id: doc.id, ...doc.data() };
            fetchedGroups.push(groupData);
            if (groupData.isDefault) {
              foundDefaultId = doc.id;
            }
          });
          setNoteGroups(fetchedGroups);
          setDefaultGroupId(foundDefaultId);

          // REMOVE OR COMMENT OUT THE FOLLOWING BLOCK:
          /*
            if (querySnapshot.empty && !foundDefaultId) {
              const generalGroup = {
                name: "General",
                creatorUid: currentUser.uid,
                createdAt: serverTimestamp(),
                isDefault: true,
              };
              addDoc(collection(db, "noteGroups"), generalGroup)
                .then((docRef) => {
                  // Handled by next useEffect
                })
                .catch((error) =>
                  console.error("Error creating default group: ", error)
                );
            } else 
            */
          // END OF BLOCK TO REMOVE OR COMMENT OUT

          // The rest of the logic to set activeGroupId might need adjustment
          // if you no longer rely on a "General" or default group being present.
          if (
            foundDefaultId &&
            (!activeGroupId ||
              !fetchedGroups.find((g) => g.id === activeGroupId))
          ) {
            setActiveGroupId(foundDefaultId);
          } else if (
            !foundDefaultId &&
            fetchedGroups.length > 0 &&
            (!activeGroupId ||
              !fetchedGroups.find((g) => g.id === activeGroupId))
          ) {
            setActiveGroupId(fetchedGroups[0].id);
          } else if (fetchedGroups.length === 0) {
            setActiveGroupId(null);
          }
          setIsLoadingGroups(false);
        },
        (error) => {
          console.error("Error fetching note groups:", error);
          setIsLoadingGroups(false);
        }
      );
      return () => unsubscribe();
    } else {
      setNoteGroups([]);
      setActiveGroupId(null);
      setDefaultGroupId(null);
      setIsLoadingGroups(false);
    }
  }, [currentUser]); // Dependency array

  useEffect(() => {
    // Ako je aktivna grupa obrisana, postavi defaultnu ili prvu dostupnu kao aktivnu
    if (
      activeGroupId &&
      !noteGroups.find((g) => g.id === activeGroupId) &&
      !isLoadingGroups
    ) {
      if (defaultGroupId && noteGroups.find((g) => g.id === defaultGroupId)) {
        setActiveGroupId(defaultGroupId);
      } else if (noteGroups.length > 0) {
        setActiveGroupId(noteGroups[0].id);
      } else {
        setActiveGroupId(null); // Nema više grupa
      }
    }
    // Ako nema aktivne, postavi defaultnu ili prvu
    else if (!activeGroupId && !isLoadingGroups) {
      if (defaultGroupId && noteGroups.find((g) => g.id === defaultGroupId)) {
        setActiveGroupId(defaultGroupId);
      } else if (noteGroups.length > 0) {
        setActiveGroupId(noteGroups[0].id);
      }
    }
  }, [noteGroups, activeGroupId, defaultGroupId, isLoadingGroups]);

  const createNoteGroup = async (groupData) => {
    if (!currentUser) return Promise.reject("User not authenticated");
    const groupsCollectionRef = collection(db, "noteGroups");
    const docRef = await addDoc(groupsCollectionRef, {
      ...groupData,
      creatorUid: currentUser.uid,
      createdAt: serverTimestamp(),
    });
    setActiveGroupId(docRef.id); // Automatski postavi novu grupu kao aktivnu
    return docRef;
  };

  const renameNoteGroup = async (groupId, newName) => {
    if (!currentUser) return Promise.reject("User not authenticated");
    const groupRef = doc(db, "noteGroups", groupId);
    // Firestore pravila bi trebala osigurati autorizaciju
    return updateDoc(groupRef, { name: newName });
  };

  const deleteNoteGroup = async (groupIdToDelete) => {
    if (!currentUser) return Promise.reject("User not authenticated");
    // Ne dopusti brisanje defaultne grupe ako je jedina
    const groupToDelete = noteGroups.find((g) => g.id === groupIdToDelete);
    if (groupToDelete && groupToDelete.isDefault && noteGroups.length === 1) {
      return Promise.reject("Cannot delete the only default group.");
    }

    // Brisanje bilješki unutar grupe
    const notesQuery = query(
      collection(db, "notes"),
      where("groupId", "==", groupIdToDelete),
      where("creatorUid", "==", currentUser.uid)
    );
    const notesSnapshot = await getDocs(notesQuery);
    const batch = writeBatch(db);
    notesSnapshot.forEach((noteDoc) => {
      batch.delete(noteDoc.ref);
      // TODO: Rekurzivno brisanje komentara za svaku bilješku
    });
    await batch.commit();

    // Brisanje grupe
    const groupRef = doc(db, "noteGroups", groupIdToDelete);
    await deleteDoc(groupRef);

    // Ažuriraj aktivnu grupu ako je obrisana aktivna
    // Ovo će se sada automatski dogoditi zbog useEffect-a koji prati noteGroups
  };

  const value = {
    noteGroups,
    isLoadingGroups,
    activeGroupId,
    setActiveGroupId,
    createNoteGroup,
    renameNoteGroup, // Novo
    deleteNoteGroup, // Novo
    defaultGroupId,
  };

  return (
    <NoteGroupContext.Provider value={value}>
      {children}
    </NoteGroupContext.Provider>
  );
};
