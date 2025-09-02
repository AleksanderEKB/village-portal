// front/src/features/auth/ui/Modals/Modal.tsx
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

  // держим актуальную ссылку на onClose, чтобы не переинициализировать эффект
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // Для управления анимацией появления/скрытия
  const [visible, setVisible] = useState(open);
  const [show, setShow] = useState(open);

  useEffect(() => {
    if (open) {
      setVisible(true);
      // запуск анимации (должен быть после рендера)
      const t = setTimeout(() => setShow(true), 10);
      return () => clearTimeout(t);
    } else if (animated && visible) {
      setShow(false); // запуск анимации скрытия
      const timeout = setTimeout(() => setVisible(false), 260); // 250ms + запас
      return () => clearTimeout(timeout);
    } else {
      setVisible(false);
      setShow(false);
    }
  }, [open, animated]); // <— тут всё ок

  useEffect(() => {
    if (!visible) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCloseRef.current();
        return;
      }
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

    // Фокусируем диалог ОДИН раз при открытии
    setTimeout(() => {
      dialogRef.current?.focus();
    }, 0);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      lastFocused.current?.focus();
    };
  }, [visible]); // <— убрали onClose из зависимостей

  if (!visible) return null;

  const onBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onCloseRef.current();
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
            onClick={() => onCloseRef.current()}
          >
            ×
          </button>
        </div>
        <div className={modalStyles.body}>{children}</div>
        <div className={modalStyles.footer}>
          <button type="button" onClick={() => onCloseRef.current()} className={modalStyles.primaryBtn}>
            Понятно
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
