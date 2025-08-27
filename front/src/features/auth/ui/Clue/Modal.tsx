// front/src/features/auth/ui/Modal/Modal.tsx
import React, { useEffect, useRef, useState } from 'react';
import modalStyles from './modal.module.scss';

type ModalProps = {
  open: boolean;
  title?: string;
  onClose: () => void;
  children: React.ReactNode;
  animated?: boolean;
};

const Modal: React.FC<ModalProps> = ({
  open,
  title,
  onClose,
  children,
  animated = true,
}) => {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const lastFocused = useRef<HTMLElement | null>(null);

  // Для управления анимацией появления/скрытия
  const [visible, setVisible] = useState(open);
  const [show, setShow] = useState(open);

  useEffect(() => {
    if (open) {
      setVisible(true);
      setTimeout(() => setShow(true), 10); // запуск анимации (must be after render)
    } else if (animated && visible) {
      setShow(false); // запуск анимации скрытия
      // После завершения анимации скрытия убираем из DOM
      const timeout = setTimeout(() => setVisible(false), 260); // 250ms + запас
      return () => clearTimeout(timeout);
    } else {
      setVisible(false);
      setShow(false);
    }
  }, [open, animated]);

  useEffect(() => {
    if (!visible) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab' && dialogRef.current) {
        const focusables = Array.from(
          dialogRef.current.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
          )
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement as HTMLElement | null;
        if (!active) return;
        if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus();
        } else if (e.shiftKey && active === first) {
          e.preventDefault();
          last.focus();
        }
      }
    };

    lastFocused.current = document.activeElement as HTMLElement | null;
    document.addEventListener('keydown', onKey);
    setTimeout(() => {
      dialogRef.current?.focus();
    }, 0);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      lastFocused.current?.focus();
    };
  }, [visible, onClose]);

  if (!visible) return null;

  const onBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className={`${modalStyles.backdrop} ${show ? modalStyles.backdropShow : modalStyles.backdropHide}`}
      onMouseDown={onBackdrop}
      role="presentation"
    >
      <div
        className={`${modalStyles.dialog} ${animated ? (show ? modalStyles.dialogShow : modalStyles.dialogHide) : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        ref={dialogRef}
      >
        <div className={modalStyles.header}>
          {title && <h2 className={modalStyles.title}>{title}</h2>}
          <button
            type="button"
            className={modalStyles.close}
            aria-label="Закрыть подсказки"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <div className={modalStyles.body}>{children}</div>
        <div className={modalStyles.footer}>
          <button type="button" onClick={onClose} className={modalStyles.primaryBtn}>
            Понятно
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
