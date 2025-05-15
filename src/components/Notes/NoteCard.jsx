// src/components/Notes/NoteCard.jsx
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPen,
  faTrash,
  faUser,
  faCommentDots,
  faPaperPlane,
} from "@fortawesome/free-solid-svg-icons"; // Added comment icons
import styles from "./NoteCard.module.css";
import { useAuth } from "../../contexts/AuthContext"; // For current user info for new comments
import {
  getCommentsFromFirestore,
  addCommentToFirestore,
} from "../../firebase";

const NoteCard = ({ note, onEdit, onDelete, currentUserUid }) => {
  const { t } = useTranslation();
  const { currentUser } = useAuth(); // Get full currentUser object

  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isLoadingComments, setIsLoadingComments] = useState(false);

  useEffect(() => {
    if (showComments && note.id) {
      setIsLoadingComments(true);
      const unsubscribe = getCommentsFromFirestore(
        note.id,
        (fetchedComments) => {
          setComments(fetchedComments);
          setIsLoadingComments(false);
        }
      );
      return () => unsubscribe(); // Cleanup listener
    } else {
      setComments([]); // Clear comments if section is hidden
    }
  }, [showComments, note.id]);

  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isOwner = currentUserUid === note.creatorUid;

  const toggleComments = () => {
    setShowComments((prev) => !prev);
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (newComment.trim() === "" || !currentUser || !note.id) return;
    try {
      await addCommentToFirestore(note.id, newComment.trim());
      setNewComment(""); // Clear input field
      // Comments will update via the onSnapshot listener
    } catch (error) {
      console.error("Error adding comment:", error);
      // TODO: Show error to user
    }
  };

  return (
    <div
      className={`${styles.noteCardWrapper} ${
        showComments ? styles.commentsVisible : ""
      }`}
    >
      <div
        className={styles.noteCard}
        style={{ backgroundColor: note.color || "var(--note-bg)" }}
      >
        {note.title && <h3 className={styles.noteTitle}>{note.title}</h3>}
        <div className={styles.noteTextContainer}>
          {" "}
          {/* For controlling text scroll independently */}
          <p className={styles.noteText}>{note.text}</p>
        </div>
        <div className={styles.noteMeta}>
          <FontAwesomeIcon icon={faUser} />
          <span className={styles.creatorName}>
            {note.creatorDisplayName || t("anonymous", "Anonymous")}
          </span>
        </div>

        <div className={styles.noteFooter}>
          <span className={styles.noteDate}>
            {note.updatedAt
              ? formatDate(note.updatedAt)
              : formatDate(note.createdAt)}
          </span>
          <div className={styles.noteActions}>
            <button
              onClick={toggleComments}
              aria-label={t("comments", "Comments")}
            >
              <FontAwesomeIcon icon={faCommentDots} />
              {comments.length > 0 && !showComments && (
                <span className={styles.commentCountBadge}>
                  {comments.length}
                </span>
              )}
            </button>
            {isOwner && (
              <>
                <button onClick={() => onEdit(note)} aria-label={t("editNote")}>
                  <FontAwesomeIcon icon={faPen} />
                </button>
                <button
                  onClick={() => onDelete(note.id, note.creatorUid)}
                  aria-label={t("delete")}
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Comments Section - Animate height transition */}
      <div
        className={`${styles.commentsSection} ${
          showComments ? styles.open : styles.closed
        }`}
      >
        {isLoadingComments && (
          <p className={styles.loadingComments}>
            {t("loadingComments", "Loading comments...")}
          </p>
        )}
        {!isLoadingComments && comments.length === 0 && showComments && (
          <p className={styles.noComments}>
            {t("noCommentsYet", "No comments yet. Be the first!")}
          </p>
        )}
        <ul className={styles.commentsList}>
          {comments.map((comment) => (
            <li key={comment.id} className={styles.commentItem}>
              <div className={styles.commentHeader}>
                <strong className={styles.commentAuthor}>
                  {comment.displayName || t("anonymous")}
                </strong>
                <span className={styles.commentDate}>
                  {formatDate(comment.createdAt)}
                </span>
              </div>
              <p className={styles.commentText}>{comment.text}</p>
            </li>
          ))}
        </ul>
        {currentUser && showComments && (
          <form onSubmit={handleAddComment} className={styles.addCommentForm}>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={t("writeCommentPlaceholder", "Write a comment...")}
              rows="2"
              className={styles.commentInput}
            />
            <button
              type="submit"
              className={styles.sendCommentButton}
              disabled={!newComment.trim()}
            >
              <FontAwesomeIcon icon={faPaperPlane} />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default NoteCard;
