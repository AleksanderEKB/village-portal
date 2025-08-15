// frontend/src/features/posts/components/CommentActionsMenu.tsx
import React, { useRef, useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisVertical, faEllipsis, faPenToSquare, faTrash } from "@fortawesome/free-solid-svg-icons";
import styles from "../styles/commentActionsMenu.module.scss";
import type { PostComment } from "../../../types/globalTypes";

interface Props {
  onEdit: () => void;
  onDelete: () => void;
  comment: PostComment;
}

const CommentActionsMenu: React.FC<Props> = ({ onEdit, onDelete }) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div className={styles.actionsMenu} ref={menuRef}>
      <button
        className={styles.menuBtn}
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Меню"
        type="button"
      >
        <FontAwesomeIcon icon={open ? faEllipsis : faEllipsisVertical} />
      </button>

      <div className={`${styles.menuActions} ${open ? styles.open : ""}`}>
        <button
          className={`${styles.actionBtn} ${styles.deleteBtn}`}
          onClick={onDelete}
          type="button"
          title="Удалить"
        >
          <FontAwesomeIcon icon={faTrash} />
        </button>

        <button
          className={`${styles.actionBtn} ${styles.editBtn}`}
          onClick={onEdit}
          type="button"
          title="Редактировать"
        >
          <FontAwesomeIcon icon={faPenToSquare} />
        </button>
      </div>
    </div>
  );
};

export default CommentActionsMenu;
