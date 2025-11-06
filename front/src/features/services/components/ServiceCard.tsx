// front/src/features/services/components/ServiceCard.tsx
import React from 'react';
import { Service } from '../model/types';
import { Link } from 'react-router-dom';
import styles from './serviceCard.module.scss';

interface Props {
  service: Service;
}

const ServiceCard: React.FC<Props> = ({ service }) => {
  return (
    <div className={styles.card}>
      <Link to={`/services/${service.slug}`} className={styles.imageWrap} aria-label={service.title}>
        {service.image_url ? (
          <img
            src={service.image_url}
            alt={service.title}
            className={styles.image}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className={styles.imagePlaceholder} />
        )}
      </Link>
      <div className={styles.content}>
        <Link to={`/services/${service.slug}`} className={styles.title}>
          {service.title}
        </Link>
        {service.short_description && (
          <p className={styles.desc}>{service.short_description}</p>
        )}
        <div className={styles.price}>
          от {Number(service.price).toLocaleString('ru-RU', {
            style: 'currency',
            currency: 'RUB',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })}
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;
