import { Location } from 'react-router-dom';

export function getInitialMode(location: Location): 'login' | 'register' {
  return location.pathname.endsWith('/register') ? 'register' : 'login';
}
