// front/src/features/auth/ui/Actions/AuthActions.tsx
import React from 'react';
import actionsStyles from './actions.module.scss';

type AuthMode = 'login' | 'register';

interface Props {
  loading: boolean;
  mode: AuthMode;
  disabled?: boolean;
  onSwitch: (m: AuthMode) => void;
}

const AuthActions: React.FC<Props> = ({ loading, mode, disabled }) => {
  return (
    <div className={actionsStyles.actionsButtons}>
      <button type="submit" disabled={loading || disabled}>
        {loading
          ? mode === 'login'
            ? 'Входим…'
            : 'Регистрируем…'
          : mode === 'login'
          ? 'Войти'
          : 'Создать аккаунт'}
      </button>
    </div>
  );
};

export default React.memo(AuthActions);
