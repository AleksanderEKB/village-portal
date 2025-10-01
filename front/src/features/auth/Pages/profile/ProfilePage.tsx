// front/src/features/auth/Pages/profile/ProfilePage.tsx
import React from 'react';
import { useAppDispatch, useAppSelector } from '../../../../app/hook';
import { selectUser } from '../../model/selectors';
import styles from './profile.module.scss';

import ProfileInfo from './components/ProfileInfo';
import ProfileEditForm from './components/ProfileEditForm';
import AvatarSection from './components/AvatarSection';
import ChangePasswordSection from './components/ChangePasswordSection';

import DropMenu from '../../../shared/components/dropmenu/DropdownMenu';
import { FaUserEdit } from 'react-icons/fa';
import { logout } from '../../model/authSlice';

const ProfilePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);

  const [menuOpen, setMenuOpen] = React.useState(false);
  const [showEdit, setShowEdit] = React.useState(false);
  const [showChangePw, setShowChangePw] = React.useState(false);

  const menuRef = React.useRef<HTMLDivElement | null>(null);
  const btnRef = React.useRef<HTMLButtonElement | null>(null);

  React.useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as Node | null;
      if (!target) return;
      if (menuRef.current?.contains(target)) return;
      if (btnRef.current?.contains(target)) return;
      setMenuOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  if (!user) {
    return <div className={styles.formWrap}>Нет данных пользователя</div>;
  }

  function onLogout() {
    dispatch(logout());
  }

  return (
    <div className={styles.formWrap} style={{ position: 'relative' }}>
      {/* Контейнер для якоря меню в правом верхнем углу */}
      <div style={{ position: 'absolute', top: 12, right: 12 }}>
        {/* Кнопка-иконка меню */}
        <button
          ref={btnRef}
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: '#5865f2',
            fontSize: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 6
          }}
          title="Действия"
        >
          <FaUserEdit />
        </button>

        {/* Меню — слева от иконки (right: calc(100% + 8px); top: 0) */}
        <DropMenu
          ref={menuRef}
          open={menuOpen}
          style={{
            top: 0,
            right: 'calc(100% + 8px)',
            left: 'auto',
            transform: 'none',
          }}
        >
          <div style={{ display: 'grid', gap: 4 }}>
            <button
              type="button"
              onClick={() => {
                setShowEdit(true);
                setShowChangePw(false);
                setMenuOpen(false);
              }}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                padding: '8px 10px',
                borderRadius: 6
              }}
            >
              Редактировать свои данные
            </button>
            <button
              type="button"
              onClick={() => {
                setShowChangePw(true);
                setShowEdit(false);
                setMenuOpen(false);
              }}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                padding: '8px 10px',
                borderRadius: 6
              }}
            >
              Изменить пароль
            </button>
            <hr style={{ margin: '6px 0', border: 0, borderTop: '1px solid #eee' }} />
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                onLogout();
              }}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                padding: '8px 10px',
                borderRadius: 6,
                color: '#b42318',
                fontWeight: 700
              }}
            >
              Выйти из аккаунта
            </button>
          </div>
        </DropMenu>
      </div>

      <h1 className={styles.title}>Личный кабинет</h1>

      {/* Аватар */}
      <div className={styles.avatarBlock} style={{ margin: '12px 0 24px' }}>
        <AvatarSection />
      </div>

      {/* Инфоблок — виден всегда */}
      <ProfileInfo />

      {/* Редактирование — по клику из меню */}
      {showEdit && (
        <ProfileEditForm
          visible={showEdit}
          onCancel={() => setShowEdit(false)}
          onSaved={() => setShowEdit(false)}
        />
      )}

      {/* Смена пароля — по клику из меню */}
      {showChangePw && (
        <ChangePasswordSection
          visible={showChangePw}
          onClose={() => setShowChangePw(false)}
        />
      )}
    </div>
  );
};

export default ProfilePage;
