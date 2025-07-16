import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';

import type { RootState } from '../../../app/store';
import { useAppDispatch } from '../../../app/hook';

// Тип новости
interface News {
  id: number;
  title: string;
  content: string;
}

// Action creator
const setNewses = (newses: News[]) => ({
  type: 'SET_NEWSES' as const,
  payload: newses,
});

// Можно типизировать action (опционально)
type SetNewsesAction = ReturnType<typeof setNewses>;

// Компонент
const NewsPage: React.FC = () => {
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://bobrovsky.online';
  const newses = useSelector((state: RootState) => state.news.newses);
  const dispatch = useAppDispatch();

  useEffect(() => {
    axios
      .get<News[]>(`${API_BASE_URL}/api/news/`)
      .then((response) => dispatch(setNewses(response.data)))
      .catch((error) => console.error(error));
  }, [dispatch, API_BASE_URL]);

  return (
    <div>
      <h1>Новости</h1>
      <div>
        {/* {newses.map((news) => (
          <div key={news.id}>
            <hr />
            <h2>{news.title}</h2>
            <p>{news.content}</p>
            <hr />
          </div>
        ))} */}
      </div>
    </div>
  );
};

export default NewsPage;
