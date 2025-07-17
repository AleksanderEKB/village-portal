import React from 'react';
import { formatTimeElapsed } from '../../../shared/utils/formatTimeElapsed';
import { Advertisement } from '../../../../types/globalTypes';

interface Props {
  created_at: Advertisement['created_at'];
  updated_at: Advertisement['updated_at'];
}

function areDatesEqual(created: string, updated: string) {
  return new Date(created).toISOString().slice(0, 19) === new Date(updated).toISOString().slice(0, 19);
}

const AdDate: React.FC<Props> = ({ created_at, updated_at }) => {
  const wasUpdated = updated_at && !areDatesEqual(created_at, updated_at);

  return (
    <div className="ads-date">
      Опубликовано {formatTimeElapsed(created_at)}
      {wasUpdated && (
        <span>
          {' '}| Изменено {formatTimeElapsed(updated_at)}
        </span>
      )}
    </div>
  );
};

export default React.memo(AdDate);
