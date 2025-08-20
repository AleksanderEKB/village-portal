import React from 'react';
import '../styles/scss_page/main.scss';
import type { Advertisement } from '../../../types/globalTypes';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPenToSquare,
  faTrash,
  faToggleOn,
  faToggleOff,
  faCircle,
} from '@fortawesome/free-solid-svg-icons';
import adOwnerPanelStyles from '../styles/adOwnerPanel.module.scss';

interface AdOwnerPanelProps {
  ad: Advertisement;
  onDelete: () => void;
  onSwitchStatus: () => Promise<void>;
  switching: boolean;
}

const AdOwnerPanel: React.FC<AdOwnerPanelProps> = ({
  ad,
  onDelete,
  onSwitchStatus,
  switching,
}) => {
  const navigate = useNavigate();

  return (
    <div className={adOwnerPanelStyles.ownerPanelWrapper}>
      {/* Левая часть — статус */}
      <div className={adOwnerPanelStyles.statusWrapper}>
        <FontAwesomeIcon
          icon={faCircle}
          className={`${adOwnerPanelStyles.statusCircle} ${
            ad.is_active ? adOwnerPanelStyles.statusActive : adOwnerPanelStyles.statusInactive
          }`}
          title={ad.is_active ? 'Опубликовано' : 'Скрыто'}
        />
        <span className={adOwnerPanelStyles.statusText}>
          {ad.is_active ? 'Опубликовано' : 'Скрыто'}
        </span>
      </div>
      {/* Правая часть — действия */}
      <div className={adOwnerPanelStyles.panelActions}>
        <button
          type="button"
          className={adOwnerPanelStyles.actionBtn}
          title={ad.is_active ? 'Скрыть' : 'Опубликовать снова'}
          onClick={onSwitchStatus}
          disabled={switching}
          aria-pressed={ad.is_active}
          aria-label={ad.is_active ? 'Скрыть объявление' : 'Опубликовать объявление'}
        >
          <FontAwesomeIcon icon={ad.is_active ? faToggleOn : faToggleOff} />
        </button>
        <button
          type="button"
          className={adOwnerPanelStyles.actionBtn}
          onClick={() => navigate(`/ads/${ad.slug}/edit`)}
          title="Редактировать"
          aria-label="Редактировать объявление"
        >
          <FontAwesomeIcon icon={faPenToSquare} />
        </button>
        <button
          type="button"
          className={adOwnerPanelStyles.actionBtn}
          onClick={onDelete}
          title="Удалить"
          aria-label="Удалить объявление"
        >
          <FontAwesomeIcon icon={faTrash} />
        </button>
      </div>
    </div>
  );
};

export default AdOwnerPanel;
