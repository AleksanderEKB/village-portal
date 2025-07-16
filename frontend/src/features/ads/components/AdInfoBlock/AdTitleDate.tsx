import React from 'react';
import { formatTimeElapsed } from '../../../shared/utils/formatTimeElapsed';
import { Advertisement } from '../../../../types/globalTypes';

interface Props {
  title: Advertisement['title'];
  created_at?: Advertisement['created_at']; // не обязательно
}

const AdTitleDate: React.FC<Props> = ({ title, created_at }) => (
  <div className="ads-title-date-row">
    <h2 className="ads-title">{title}</h2>
    {created_at && (
      <div className="ads-date">{formatTimeElapsed(created_at)}</div>
    )}
  </div>
);

export default React.memo(AdTitleDate);
