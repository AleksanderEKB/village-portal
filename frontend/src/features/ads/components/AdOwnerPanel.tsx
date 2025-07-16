// frontend/src/features/ads/components/AdOwnerPanel.tsx
import React from 'react';
import AdOwnerMenu from './AdOwnerMenu';
import type { Advertisement } from '../../../types/globalTypes';

interface AdOwnerPanelProps {
  ad: Advertisement;
  onDelete: () => void;
  onSwitchStatus: () => Promise<void>; // <-- Исправлено здесь!
  switching: boolean;
}

const AdOwnerPanel: React.FC<AdOwnerPanelProps> = ({
  ad, onDelete, onSwitchStatus, switching
}) => (
  <div style={{ marginTop: 20 }}>
    <AdOwnerMenu
      ad={ad}
      onDelete={onDelete}
      onSwitchStatus={onSwitchStatus} // теперь типы совпадают
      switching={switching}
    />
    <div style={{
      marginTop: 12,
      color: ad.is_active ? "green" : "red",
      fontWeight: 600,
      fontSize: 16
    }}>
      {ad.is_active ? "Активное" : "Неактивное"}
    </div>
  </div>
);

export default AdOwnerPanel;
