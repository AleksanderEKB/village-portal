// src/features/nav/HamburgerMenu.tsx
import React, { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hook';
import { logout } from '../auth/model/authSlice';
import { selectIsAuth, selectUser } from '../auth/model/selectors';
import styles from './hamburger.module.scss';

const HamburgerMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const isAuthenticated = useAppSelector(selectIsAuth);
  const user = useAppSelector(selectUser);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const toggleMenu = () => setIsOpen(v => !v);

  const handleLogout = () => {
    dispatch(logout());
    setIsOpen(false);
    navigate('/');
  };

  // Закрываем меню при смене маршрута (в т.ч. когда меняется таб /login ↔ /register)
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  return (
    <div className={styles.hamburgerMenu}>
      <button
        type="button"
        aria-label={isOpen ? 'Закрыть меню' : 'Открыть меню'}
        aria-expanded={isOpen}
        className={styles.hamburgerIcon}
        onClick={toggleMenu}
      >
        {isOpen ? '✖' : '☰'}
      </button>

      <nav className={`${styles.menuContent} ${isOpen ? styles.open : ''}`} role="navigation">
        {isAuthenticated && user && (
          <div className={styles.userGreeting}>
            Приветствую, {user.username ?? user.email ?? 'пользователь'}
          </div>
        )}

        <NavLink
          to="/"
          className={({ isActive }) => (isActive ? styles.activeLink : undefined)}
        >
          Главная
        </NavLink>

        {!isAuthenticated && (
          <>
            <NavLink
              to="/register"
              className={({ isActive }) => (isActive ? styles.activeLink : undefined)}
            >
              Вход/Регистрация
            </NavLink>
          </>
        )}

        {isAuthenticated && (
          <>
            <NavLink
              to="/profile"
              className={({ isActive }) => (isActive ? styles.activeLink : undefined)}
            >
              Профиль
            </NavLink>
            <button type="button" className={styles.logoutBtn} onClick={handleLogout}>
              Выход
            </button>
          </>
        )}
      </nav>
    </div>
  );
};

export default HamburgerMenu;
