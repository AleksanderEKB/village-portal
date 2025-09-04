// front/src/features/auth/ui/Modals/PasswordHintsModal.tsx
import React from 'react';
import Modal from './Modal';

type Hint = { id: string | number; ok: boolean; label: string };
type PasswordCheck = { hints: Hint[] };

type PasswordHintsModalProps = {
  open: boolean;
  onClose: () => void;
  passwordCheck: PasswordCheck;
};

const PasswordHintsModal: React.FC<PasswordHintsModalProps> = ({ open, onClose, passwordCheck }) => {
  return (
    <Modal open={open} onClose={onClose} title="Требования к паролю">
      <div id="password-hints-dialog">
        <p>Рекомендуем придерживаться следующих правил безопасности:</p>
        <ul className="hintsList">
          {passwordCheck.hints.map((h) => (
            <li key={h.id} className={`hintItem ${h.ok ? 'hintOk' : 'hintBad'}`}>
              <span className="bullet" aria-hidden />
              <span>{h.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </Modal>
  );
};

export default PasswordHintsModal;
