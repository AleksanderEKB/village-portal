import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../auth/authSlice';
import { RootState } from '../../../app/store';
import '../styles.scss';

const HamburgerMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <div className="hamburger-menu">
      <div className="hamburger-icon" onClick={toggleMenu}>
        {isOpen ? '✖' : '☰'}
      </div>
      <div className={`menu-content ${isOpen ? 'open' : ''}`}>
        {isAuthenticated && user && (
          <div className="user-greeting">
            Приветствую, {user.username}
          </div>
        )}
        <Link to="/" onClick={toggleMenu}>Главная</Link>
        <Link to="/ads" onClick={toggleMenu}>Объявления</Link>
        <Link to="/news" onClick={toggleMenu}>Новости</Link>
        <Link to="/info/social" onClick={toggleMenu}>Социальная информация</Link>
        <Link to="/posts" onClick={toggleMenu}>Лента постов</Link>
        {isAuthenticated ? (
          <>
            <Link to="/profile" onClick={toggleMenu}>Личный кабинет</Link>
            <button onClick={handleLogout}>Выход</button>
          </>
        ) : (
          <>
            <Link to="/register" onClick={toggleMenu}>Регистрация</Link>
            <Link to="/login" onClick={toggleMenu}>Вход</Link>
          </>
        )}
      </div>
    </div>
  );
};

export default HamburgerMenu;
