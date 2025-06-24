// src/utils/iconMap.tsx
import {
  faPhone,
  faBolt,
  faQuestion,
  faAmbulance,
  faBuilding,
  faHospital,
  faBus,
  faUserCircle,
  faFire,
  faFireExtinguisher,
  faCertificate,
  faInfo,
  faExchange,
  IconDefinition,
} from '@fortawesome/free-solid-svg-icons';

// Тип ключей:
export type IconName =
  | 'fa-info'
  | 'fa-phone'
  | 'fa-bolt'
  | 'fa-question'
  | 'fa-ambulance'
  | 'fa-building'
  | 'fa-hospital-o'
  | 'fa-bus'
  | 'fa-user-circle'
  | 'fa-fire'
  | 'fa-fire-extinguisher'
  | 'fa-certificate'
  | 'fa-exchange';

export const ICONS_MAP: Record<IconName, IconDefinition> = {
  'fa-info': faInfo,
  'fa-phone': faPhone,
  'fa-bolt': faBolt,
  'fa-question': faQuestion,
  'fa-ambulance': faAmbulance,
  'fa-building': faBuilding,
  'fa-hospital-o': faHospital,
  'fa-bus': faBus,
  'fa-user-circle': faUserCircle,
  'fa-fire': faFire,
  'fa-fire-extinguisher': faFireExtinguisher,
  'fa-certificate': faCertificate,
  'fa-exchange': faExchange,
};

export { faInfo, faPhone };
