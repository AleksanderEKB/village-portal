// front/src/features/auth/ui/Tabs/AuthTabs.tsx
import React from 'react';
import styles from '../../Pages/auth.module.scss';

interface AuthTabsProps {
  mode: 'login' | 'register';
  switchTo: (mode: 'login' | 'register') => void;
  error: string | null;
  localError: string | null;
}

const AuthTabs: React.FC<AuthTabsProps> = ({ mode, switchTo, error, localError }) => (
  <div>
    <div className={styles.tabs}>
      <button
        type="button"
        className={mode === 'login' ? styles.tabActive : styles.tab}
        onClick={() => switchTo('login')}
        aria-pressed={mode === 'login'}
      >
        Вход
      </button>
      <button
        type="button"
        className={mode === 'register' ? styles.tabActive : styles.tab}
        onClick={() => switchTo('register')}
        aria-pressed={mode === 'register'}
      >
        Регистрация
      </button>
    </div>

    <h1 className={styles.title}>{mode === 'login' ? 'Вход' : 'Регистрация'}</h1>

    {(error || localError) && <div className={styles.error}>{error || localError}</div>}
  </div>
);

export default AuthTabs;
