// front/src/features/auth/ui/Avatar/AvatarPreview.tsx
import React from 'react';
import avatarStyles from './avatar.module.scss';
import DropMenu from '../../../shared/components/dropmenu/DropdownMenu';

interface AvatarPreviewProps {
  /** Новый файл (если пользователь выбрал в этом сеансе) */
  file: File | null;
  /** URL текущего аватара пользователя (с сервера) */
  currentUrl?: string | null;
  /** Явный флаг, что у пользователя есть кастомный аватар (а не дефолт) */
  hasCustom?: boolean;
  /** URL аватара по умолчанию */
  defaultUrl: string;
  /** Удалить текущий аватар (сбросить на дефолт) */
  onRemove: () => void;
  /** Запросить выбор файла (открыть file input) */
  onChangeRequest: () => void;
  /** Заголовок поля (не обязателен, в профиле скрываем) */
  label?: string;
}

const AvatarPreview: React.FC<AvatarPreviewProps> = ({
  file,
  currentUrl,
  hasCustom = false,
  defaultUrl,
  onRemove,
  onChangeRequest,
  label,
}) => {
  const [objectUrl, setObjectUrl] = React.useState<string | null>(null);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement | null>(null);

  // Если есть новый файл — показываем его через blob-URL.
  React.useEffect(() => {
    if (!file) {
      setObjectUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setObjectUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // Текущий src для <img>: приоритет file -> currentUrl -> defaultUrl
  const src = objectUrl ?? currentUrl ?? defaultUrl;

  // Признак «дефолтный ли сейчас аватар» для меню:
  // если есть выбранный файл — точно не дефолт;
  // иначе полагаемся на внешний признак hasCustom.
  const isDefaultNow = !file && !hasCustom;

  // Закрытие по клику вне меню
  React.useEffect(() => {
    if (!menuOpen) return;
    const onDocClick = (e: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [menuOpen]);

  const toggleMenu = () => setMenuOpen((v) => !v);

  const onKeyToggle = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleMenu();
    }
  };

  return (
    <div className={avatarStyles.avatarFieldRoot}>
      {label && <label className={avatarStyles.label}>{label}</label>}

      <div className={avatarStyles.previewWrap}>
        <img
          src={src}
          alt="avatar"
          className={avatarStyles.avatarImage}
          role="button"
          tabIndex={0}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          onClick={toggleMenu}
          onKeyDown={onKeyToggle}
        />

        <DropMenu ref={menuRef} open={menuOpen}>
          {isDefaultNow ? (
            <a
              href="#"
              role="menuitem"
              tabIndex={0}
              className={avatarStyles.menuItem}
              onClick={e => {
                e.preventDefault();
                onChangeRequest();
                setMenuOpen(false);
              }}
            >
              Загрузить
            </a>
          ) : (
            <>
              <a
                href="#"
                role="menuitem"
                tabIndex={0}
                className={avatarStyles.menuItem}
                onClick={e => {
                  e.preventDefault();
                  onChangeRequest();
                  setMenuOpen(false);
                }}
              >
                Изменить
              </a>
              <a
                href="#"
                role="menuitem"
                tabIndex={0}
                className={avatarStyles.menuItemDanger}
                onClick={e => {
                  e.preventDefault();
                  onRemove();
                  setMenuOpen(false);
                }}
              >
                Удалить
              </a>
            </>
          )}
        </DropMenu>
      </div>
    </div>
  );
};

export default AvatarPreview;
