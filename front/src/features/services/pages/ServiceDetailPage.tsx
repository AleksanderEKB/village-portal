// front/src/features/services/pages/ServiceDetailPage.tsx
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../app/hook';
import { clearDetail, fetchServiceBySlug } from '../model/slice';
import styles from './serviceDetail.module.scss';

const ServiceDetailPage: React.FC = () => {
  const { slug = '' } = useParams();
  const dispatch = useAppDispatch();
  const { detail, loadingDetail, errorDetail } = useAppSelector((s) => s.services);

  useEffect(() => {
    if (slug) {
      dispatch(fetchServiceBySlug(slug));
    }
    return () => {
      dispatch(clearDetail());
    };
  }, [dispatch, slug]);

  if (loadingDetail) return <div className={styles.center}>Загрузка...</div>;
  if (errorDetail) return <div className={styles.centerError}>Ошибка: {errorDetail}</div>;
  if (!detail) return null;

  const priceNumber = Number(detail.price);

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <div className={styles.imageWrap}>
          {detail.image_url ? (
            <img src={detail.image_url} alt={detail.title} className={styles.image} />
          ) : (
            <div className={styles.imagePlaceholder} />
          )}
        </div>
        <div className={styles.content}>
          <h1 className={styles.title}>{detail.title}</h1>
          <div className={styles.price}>
            от {priceNumber.toLocaleString('ru-RU', {
              style: 'currency',
              currency: 'RUB',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}
          </div>
          <div className={styles.desc}>{detail.description}</div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetailPage;
