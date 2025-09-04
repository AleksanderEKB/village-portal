// front/src/features/auth/ui/PrivateRoute/PrivateRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../../../../app/hook';
import { selectIsAuth, selectAuthLoaded } from '../../model/selectors';
import { JSX } from 'react/jsx-runtime';

type Props = { children: JSX.Element };

const PrivateRoute: React.FC<Props> = ({ children }) => {
  const isAuth = useAppSelector(selectIsAuth);
  const authLoaded = useAppSelector(selectAuthLoaded);

  // Пока идёт гидратация стора из localStorage — не редиректим
  if (!authLoaded) {
    return <div>Загрузка...</div>;
  }

  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoute;
