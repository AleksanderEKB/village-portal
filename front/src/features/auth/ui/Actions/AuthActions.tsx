// front/src/features/auth/ui/Actions/AuthActions.tsx
import React from 'react';
import styles from '../../Pages/auth.module.scss';

type AuthMode = 'login' | 'register';

interface Props {
  loading: boolean;
  mode: AuthMode;
  onSwitch: (m: AuthMode) => void;
}

const AuthActions: React.FC<Props> = ({ loading, mode, onSwitch }) => {
  return (
    <div className={styles.actions}>
      <button type="submit" disabled={loading}>
        {loading
          ? mode === 'login'
            ? 'Входим…'
            : 'Регистрируем…'
          : mode === 'login'
          ? 'Войти'
          : 'Создать аккаунт'}
      </button>

      <div className={styles.alt}>
        {mode === 'login' ? (
          <>
            Нет аккаунта{' '}
            <button
              type="button"
              className={styles.linkLike}
              onClick={() => onSwitch('register')}
            >
              Зарегистрируйтесь
            </button>
          </>
        ) : (
          <>
            Уже есть аккаунт{' '}
            <button
              type="button"
              className={styles.linkLike}
              onClick={() => onSwitch('login')}
            >
              Войдите
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default React.memo(AuthActions);
