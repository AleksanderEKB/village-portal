import React from 'react';
import '../styles/scss_page/main.scss';
import AdOwnerMenu from './AdOwnerMenu';
import type { Advertisement } from '../../../types/globalTypes';

interface AdOwnerPanelProps {
  ad: Advertisement;
  onDelete: () => void;
  onSwitchStatus: () => Promise<void>;
  switching: boolean;
}

const AdOwnerPanel: React.FC<AdOwnerPanelProps> = ({
  ad, onDelete, onSwitchStatus, switching
}) => (
  <div className="ad-owner-panel">
    <AdOwnerMenu
      ad={ad}
      onDelete={onDelete}
      onSwitchStatus={onSwitchStatus}
      switching={switching}
    />
    <div
      className={`ad-status ${ad.is_active ? 'active' : 'inactive'}`}
    >
      {ad.is_active ? "Активное" : "Неактивное"}
    </div>
  </div>
);

export default AdOwnerPanel;
