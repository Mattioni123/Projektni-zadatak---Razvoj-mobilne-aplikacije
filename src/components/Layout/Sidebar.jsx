import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserCircle,
  faSignOutAlt,
  faLanguage,
  faMoon,
  faSun,
  faBars,
  faFilePen,
  faPlus,
  faTimes,
  faFolder,
  faDotCircle,
  faEdit,
  faTrashAlt,
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { useNoteGroups } from "../../contexts/NoteGroupContext";
import { logOut } from "../../firebase";
import styles from "./Sidebar.module.css";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { t, i18n } = useTranslation();
  const { currentUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const {
    noteGroups,
    isLoadingGroups,
    activeGroupId,
    setActiveGroupId,
    createNoteGroup,
    renameNoteGroup,
    deleteNoteGroup,
    defaultGroupId,
  } = useNoteGroups();

  const [showNewGroupModal, setShowNewGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");

  const [showRenameGroupModal, setShowRenameGroupModal] = useState(false);
  const [renamingGroup, setRenamingGroup] = useState(null);
  const [updatedGroupName, setUpdatedGroupName] = useState("");

  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [deletingGroup, setDeletingGroup] = useState(null);

  const handleLogout = async () => {
    try {
      await logOut();
      if (isOpen && window.innerWidth < 768) {
        toggleSidebar();
      }
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  };

  const changeLanguage = (lng) => {
    if (i18n.language !== lng) {
      i18n
        .changeLanguage(lng)
        .then(() => localStorage.setItem("language", lng));
    }
  };

  const handleOpenNewGroupModal = () => {
    setShowNewGroupModal(true);
    setNewGroupName(""); // Resetiraj input polje
    if (isOpen && window.innerWidth < 768) {
      toggleSidebar();
    }
  };

  const handleCloseNewGroupModal = () => {
    setShowNewGroupModal(false);
    setNewGroupName("");
  };

  const handleCreateNewGroup = async (e) => {
    e.preventDefault();
    if (!newGroupName.trim() || !currentUser) return;
    try {
      // Prva grupa koju korisnik kreira može postati defaultna ako "General" nije (ili ako se "General" može obrisati)
      // Za jednostavnost, nove grupe nisu defaultne, osim ako je to jedina grupa.
      // NoteGroupContext sada automatski kreira "General" kao defaultnu.
      await createNoteGroup({ name: newGroupName.trim(), isDefault: false });
      handleCloseNewGroupModal();
    } catch (error) {
      console.error("Error creating new group:", error);
      alert(t("errorCreatingGroup", "Error creating group."));
    }
  };

  const handleGroupClick = (groupId) => {
    setActiveGroupId(groupId);
    if (isOpen && window.innerWidth < 768) {
      toggleSidebar();
    }
  };

  const handleOpenRenameModal = (group) => {
    setRenamingGroup(group);
    setUpdatedGroupName(group.name);
    setShowRenameGroupModal(true);
    if (isOpen && window.innerWidth < 768) {
      toggleSidebar();
    }
  };

  const handleCloseRenameModal = () => {
    setShowRenameGroupModal(false);
    setRenamingGroup(null);
    setUpdatedGroupName("");
  };

  const handleRenameGroup = async (e) => {
    e.preventDefault();
    if (
      !updatedGroupName.trim() ||
      !renamingGroup ||
      updatedGroupName.trim() === renamingGroup.name
    ) {
      // Ako je ime isto, ili prazno, samo zatvori modal.
      if (updatedGroupName.trim() === renamingGroup.name)
        handleCloseRenameModal();
      return;
    }
    try {
      await renameNoteGroup(renamingGroup.id, updatedGroupName.trim());
      handleCloseRenameModal();
    } catch (error) {
      console.error("Error renaming group:", error);
      alert(t("errorRenamingGroup", "Error renaming group."));
    }
  };

  const handleOpenDeleteModal = (group) => {
    // Ne dopusti otvaranje modala za brisanje defaultne grupe ako je jedina
    if (group.isDefault && noteGroups.length === 1) {
      alert(
        t(
          "cannotDeleteOnlyDefaultGroup",
          "Cannot delete the only default group. Create another group first or rename this one."
        )
      );
      return;
    }
    setDeletingGroup(group);
    setShowDeleteConfirmModal(true);
    if (isOpen && window.innerWidth < 768) {
      toggleSidebar();
    }
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteConfirmModal(false);
    setDeletingGroup(null);
  };

  const handleDeleteGroup = async () => {
    if (!deletingGroup) return;
    // Dodatna provjera (iako je već u open modal funkciji)
    if (deletingGroup.isDefault && noteGroups.length === 1) {
      alert(
        t(
          "cannotDeleteOnlyDefaultGroup",
          "Cannot delete the only default group. Create another group first or rename this one."
        )
      );
      handleCloseDeleteModal();
      return;
    }
    try {
      await deleteNoteGroup(deletingGroup.id);
      // setActiveGroupId će se automatski ažurirati u NoteGroupContextu
      handleCloseDeleteModal();
    } catch (error) {
      console.error("Error deleting group:", error);
      alert(t("errorDeletingGroup", "Error deleting group."));
    }
  };

  return (
    <>
      <div
        className={`${styles.sidebar} ${isOpen ? styles.open : styles.closed}`}
      >
        <div className={styles.sidebarHeader}>
          <button
            onClick={toggleSidebar}
            className={styles.sidebarInternalToggle}
            aria-label={
              isOpen
                ? t("closeSidebar", "Close sidebar")
                : t("openSidebar", "Open sidebar")
            }
          >
            <FontAwesomeIcon icon={faBars} />
          </button>
          {isOpen && (
            <button
              onClick={handleOpenNewGroupModal}
              className={styles.newGroupButton}
              title={t("createNewGroup", "Create new group")}
            >
              <FontAwesomeIcon icon={faFilePen} />
              <span className={styles.newGroupButtonText}>
                {t("newGroup", "New Group")}
              </span>
            </button>
          )}
        </div>

        {isOpen && (
          <div className={styles.noteGroupsSection}>
            {isLoadingGroups ? (
              <p className={styles.placeholderText}>
                {t("loadingGroups", "Loading groups...")}
              </p>
            ) : noteGroups.length === 0 ? (
              <p className={styles.placeholderText}>
                {t("noGroupsYet", "No groups yet. Create one!")}
              </p>
            ) : (
              <ul className={styles.noteGroupList}>
                {noteGroups.map((group) => {
                  // Provjera je li trenutni korisnik vlasnik grupe
                  const isOwner =
                    currentUser && group.creatorUid === currentUser.uid;

                  return (
                    <li
                      key={group.id}
                      className={`${styles.noteGroupItemWrapper}`}
                    >
                      <div
                        className={`${styles.noteGroupItem} ${
                          group.id === activeGroupId ? styles.activeGroup : ""
                        }`}
                        onClick={() => handleGroupClick(group.id)}
                        title={group.name}
                      >
                        <FontAwesomeIcon
                          icon={group.isDefault ? faDotCircle : faFolder} // Ostavite logiku za isDefault ikonu ako želite
                          className={styles.groupIcon}
                        />
                        <span className={styles.groupName}>{group.name}</span>
                      </div>
                      {/* Prikazuj akcije samo ako je korisnik vlasnik */}
                      {/* I dalje zadržavamo logiku da se ne prikazuju za jedinu default grupu ako je to željeno ponašanje */}
                      {isOwner &&
                        !(group.isDefault && noteGroups.length === 1) && (
                          <div className={styles.groupActions}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenRenameModal(group);
                              }}
                              className={styles.groupActionButton}
                              title={t("renameGroup", "Rename group")}
                            >
                              <FontAwesomeIcon icon={faEdit} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenDeleteModal(group);
                              }}
                              className={styles.groupActionButton}
                              title={t("deleteGroup", "Delete group")}
                            >
                              <FontAwesomeIcon icon={faTrashAlt} />
                            </button>
                          </div>
                        )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}

        <div className={styles.settingsSection}>
          <div className={styles.settingItem} onClick={toggleTheme}>
            <FontAwesomeIcon icon={theme === "light" ? faMoon : faSun} />
            <span>{theme === "light" ? t("darkMode") : t("lightMode")}</span>
          </div>
          <div className={styles.languageSwitcher}>
            <FontAwesomeIcon icon={faLanguage} />
            <span>{t("language")}:</span>
            <button
              onClick={() => changeLanguage("en")}
              disabled={i18n.language === "en"}
              aria-pressed={i18n.language === "en"}
            >
              EN
            </button>
            <button
              onClick={() => changeLanguage("hr")}
              disabled={i18n.language === "hr"}
              aria-pressed={i18n.language === "hr"}
            >
              HR
            </button>
          </div>
          {currentUser && (
            <>
              <div className={styles.userInfo}>
                <FontAwesomeIcon icon={faUserCircle} />
                <span>{currentUser.displayName || currentUser.email}</span>
              </div>
              <button onClick={handleLogout} className={styles.logoutButton}>
                <FontAwesomeIcon icon={faSignOutAlt} />{" "}
                <span>{t("logout")}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {showNewGroupModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <button
              className={styles.modalCloseButtonTop}
              onClick={handleCloseNewGroupModal}
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
            <h2>{t("nameNewGroup", "Name your new group")}</h2>
            <form onSubmit={handleCreateNewGroup}>
              <input
                type="text"
                placeholder={t("groupNamePlaceholder", "Group name")}
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                className={styles.modalInput}
                autoFocus
              />
              <div className={styles.modalButtonContainer}>
                <button
                  type="submit"
                  className={styles.modalSaveButton}
                  disabled={!newGroupName.trim()}
                >
                  <FontAwesomeIcon icon={faPlus} />{" "}
                  {t("createGroup", "Create Group")}
                </button>
                <button
                  type="button"
                  onClick={handleCloseNewGroupModal}
                  className={styles.modalCancelButton}
                >
                  {t("cancel", "Cancel")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showRenameGroupModal && renamingGroup && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <button
              className={styles.modalCloseButtonTop}
              onClick={handleCloseRenameModal}
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
            <h2>{t("renameGroupTitle", "Rename Group")}</h2>
            <form onSubmit={handleRenameGroup}>
              <input
                type="text"
                value={updatedGroupName}
                onChange={(e) => setUpdatedGroupName(e.target.value)}
                className={styles.modalInput}
                autoFocus
              />
              <div className={styles.modalButtonContainer}>
                <button
                  type="submit"
                  className={styles.modalSaveButton}
                  disabled={
                    !updatedGroupName.trim() ||
                    updatedGroupName.trim() === renamingGroup.name
                  }
                >
                  {t("saveChanges")}
                </button>
                <button
                  type="button"
                  onClick={handleCloseRenameModal}
                  className={styles.modalCancelButton}
                >
                  {t("cancel")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteConfirmModal && deletingGroup && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <button
              className={styles.modalCloseButtonTop}
              onClick={handleCloseDeleteModal}
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
            <h2>{t("confirmDeleteGroupTitle", "Delete Group")}</h2>
            <p>
              {t("confirmDeleteGroupMessage", {
                groupName: deletingGroup.name,
              })}
            </p>
            <div className={styles.modalButtonContainer}>
              <button
                onClick={handleDeleteGroup}
                className={`${styles.modalSaveButton} ${styles.deleteConfirmButton}`}
              >
                {t("delete")}
              </button>
              <button
                onClick={handleCloseDeleteModal}
                className={styles.modalCancelButton}
              >
                {t("cancel")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
