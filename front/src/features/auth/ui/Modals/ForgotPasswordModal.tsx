// front/src/features/auth/ui/Modals/ForgotPasswordModal.tsx
import React from 'react';
import Modal from './Modal';
import styles from '../../Pages/auth.module.scss';

type ForgotPasswordModalProps = {
  open: boolean;
  onClose: () => void;
  fpEmail: string;
  onChangeEmail: (value: string) => void;
  onSubmit: () => void;
};

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  open,
  onClose,
  fpEmail,
  onChangeEmail,
  onSubmit,
}) => {
  return (
    <Modal open={open} onClose={onClose} title="Восстановление пароля">
      <div style={{ display: 'grid', gap: 12 }}>
        <label htmlFor="fp-email">Укажите email, на который отправим ссылку:</label>
        <input
          id="fp-email"
          type="email"
          value={fpEmail}
          onChange={(e) => onChangeEmail(e.target.value)}
          placeholder="you@example.com"
          className={styles.input}
          autoFocus
        />
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button type="button" className={styles.linkLike} onClick={onClose}>
            Отмена
          </button>
          <button type="button" onClick={onSubmit}>
            Отправить
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ForgotPasswordModal;
