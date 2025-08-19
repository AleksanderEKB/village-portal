import React from 'react';
import { Advertisement } from '../../../../types/globalTypes';
import adTitleStyles from '../../styles/adTitle.module.scss';

interface Props {
  title: Advertisement['title'];
}

const AdTitle: React.FC<Props> = ({ title }) => (
  <div className={adTitleStyles.adsTitleRow}>
    <h2 className={adTitleStyles.adsTitle}>{title}</h2>
  </div>
);

export default React.memo(AdTitle);
