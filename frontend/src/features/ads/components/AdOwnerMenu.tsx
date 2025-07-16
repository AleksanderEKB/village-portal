// frontend/src/features/ads/components/AdOwnerMenu.tsx
import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare } from '@fortawesome/free-solid-svg-icons';
import { Advertisement } from '../../../types/globalTypes';

interface Props {
  ad: Advertisement;
  onDelete: () => void;
  onSwitchStatus: () => Promise<void>;
  switching: boolean;
}

const AdOwnerMenu: React.FC<Props> = ({ ad, onDelete, onSwitchStatus, switching }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  return (
    <div className="ads-menu-wrapper" ref={menuRef}>
      <button
        className="ads-menu-btn"
        onClick={() => setMenuOpen(v => !v)}
        aria-label="Меню"
      >
        <FontAwesomeIcon className='dropmenu' icon={faPenToSquare} size="lg" />
      </button>
      {menuOpen && (
        <div className="ads-menu-dropdown">
                    <button
            className={`ads-menu-item ${ad.is_active ? 'ads-menu-item-unpublish' : 'ads-menu-item-publish'}`}
            onClick={onSwitchStatus}
            disabled={switching}
          >
            {switching
              ? "Обновление..."
              : ad.is_active
                ? "Скрыть"
                : "Опубликовать снова"}
          </button>
          <button
            className="ads-menu-item"
            onClick={() => {
              setMenuOpen(false);
              navigate(`/ads/${ad.slug}/edit`);
            }}
          >
            Редактировать
          </button>
          <button
            className="ads-menu-item ads-menu-item-delete"
            onClick={onDelete}
          >
            Удалить
          </button>
        </div>
      )}
    </div>
  );
};

export default React.memo(AdOwnerMenu);
