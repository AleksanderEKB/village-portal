// frontend/src/features/info/components/inform.tsx
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '../../../app/hook';
import type { RootState } from '../../../app/store';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ICONS_MAP, faPhone, faInfo } from '../../shared/components/iconMap';
import { usePagination } from '../../shared/utils/pagination';
import { fetchSocials } from '../informSlice';
import '../styles.scss';
import Pagination from '../../shared/components/Pagination';

const ITEMS_PER_PAGE = 4;

const InformComponent: React.FC = () => {
  const dispatch = useAppDispatch();
  const { socials, loading, error } = useSelector((state: RootState) => state.social);

  const [page, setPage] = useState<number>(1);

  useEffect(() => {
    dispatch(fetchSocials());
  }, [dispatch]);

  const { totalPages, currentItems: currentSocials } = usePagination(socials, page, ITEMS_PER_PAGE);

  return (
    <div className='social-container'>
      <h1>Справочная информация</h1>
      <div className='social-content'>
        {loading && <div>Загрузка...</div>}
        {error && <div>Ошибка: {error}</div>}
        <div className="social-grid">
          {currentSocials.map((social, index) => (
            <div className="social-card" key={social.id}>
              <div className="social-card-title-row">
                <h2>{social.title}</h2>
                <span className="social-card-icon">
                  <FontAwesomeIcon icon={ICONS_MAP[social.icon_name] || faInfo} />
                </span>
              </div>
              <ul className='info-phone-ul'>
                {social.phones?.length > 0 ? (
                  social.phones.map((phone, i) => (
                    <li className='info-phone' key={i}>
                      <p><FontAwesomeIcon className='info-icon-faPhone' icon={faPhone} />{phone.number}</p>
                    </li>
                  ))
                ) : (
                  <li>Нет телефонов</li>
                )}
              </ul>
            </div>
          ))}
        </div>
        <Pagination
          page={page}
          totalPages={totalPages}
          setPage={setPage}
          prevLabel="Назад"
          nextLabel="Вперед"
        />
      </div>
    </div>
  );
};

export default InformComponent;
