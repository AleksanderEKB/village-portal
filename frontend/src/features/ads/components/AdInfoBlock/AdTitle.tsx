import React from 'react';
import { Advertisement } from '../../../../types/globalTypes';

interface Props {
  title: Advertisement['title'];
}

const AdTitle: React.FC<Props> = ({ title }) => (
  <div className="ads-title-row">
    <h2 className="ads-title">{title}</h2>
  </div>
);

export default React.memo(AdTitle);
