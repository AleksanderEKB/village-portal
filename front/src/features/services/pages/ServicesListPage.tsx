// front/src/features/services/pages/ServicesListPage.tsx
import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/hook';
import { fetchServices } from '../model/slice';
import ServiceCard from '../components/ServiceCard';
import styles from './servicesList.module.scss';

const ServicesListPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { list, loadingList, errorList } = useAppSelector((s) => s.services);

  useEffect(() => {
    dispatch(fetchServices());
  }, [dispatch]);

  if (loadingList) return <div className={styles.center}>Загрузка услуг...</div>;
  if (errorList) return <div className={styles.centerError}>Ошибка: {errorList}</div>;
  if (!list.length) return <div className={styles.center}>Услуги не найдены</div>;

  return (
    <div className={styles.wrap}>
      <h1 className={styles.pageTitle}>Наши услуги</h1>
      <div className={styles.grid}>
        {list.map((s) => (
          <ServiceCard key={s.id} service={s} />
        ))}
      </div>
    </div>
  );
};

export default ServicesListPage;
