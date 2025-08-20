import React from 'react';
import { formatTimeElapsed } from '../../../shared/utils/formatTimeElapsed';
import { Advertisement } from '../../../../types/globalTypes';
import adsDateStyles from '../../styles/adsDate.module.scss';

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
    <div className={adsDateStyles.adsDate}>
      <span className={adsDateStyles.adsDate__created}>
        Опубликовано {formatTimeElapsed(created_at)}
      </span>
      {wasUpdated && (
      <span className={adsDateStyles.adsDate__updated}>
        Изменено {formatTimeElapsed(updated_at)}
      </span>
      )}
    </div>
  );
};

export default React.memo(AdDate);
