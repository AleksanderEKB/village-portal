// frontend/src/types/globalTypes.tsx
import type { IconName } from '../features/shared/components/iconMap';

export interface User {
    id: number;
    username: string;
}

export interface UserWithAvatar extends User {
  avatar?: string;
}

export type AdsCategory = 'sell' | 'buy' | 'free' | 'service' | 'sundry' | 'hire' | 'loss';

export interface AdvertisementImage {
  id: number;
  image: string;
  order: number;
}

export interface Advertisement {
  // category_label: string;
  id: number;
  user: UserWithAvatar; // <-- тут!
  title: string;
  description: string;
  category: AdsCategory;
  price?: string;
  location?: string;
  contact_phone?: string;
  contact_email?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  main_image?: string;
  slug: string;
  images: AdvertisementImage[];
}

export interface PostComment {
    id: number;
    body: string;
    author: number | UserWithAvatar;
    post: number;
    created_at?: string;
}

export interface Post {
    id: number;
    title: string;
    body: string;
    author: number | User;
    comments_count: number;
    likes_count?: number;
    liked?: boolean;
    created_at: string;
}

export interface PostExtended extends Post {
  image?: string;
  author: UserWithAvatar;
}

export interface PostState {
    post: Post | null;
    comments: Record<number, PostComment[]>;
    error: string | null;
    loading: boolean;
}

export interface PostAction {
    type: string;
    payload?: any;
}

export interface AuthState {
    isAuthenticated: boolean;
    user: User | null;
    loading: boolean;
    error: string | null;
}

export interface AuthAction {
    type: string;
    payload?: any;
}

export interface NewsItem {
    id: number;
    [key: string]: any;
}

export interface NewsState {
    newses: NewsItem[];
    currentNews: NewsItem | null;
}

export interface NewsAction {
    type: string;
    payload?: any;
}

export interface Phone {
  number: string;
}

export interface Social {
  id: number;
  title: string;
  icon_name: IconName;
  phones: Phone[];
}

export interface SocialState {
  social: Social[];
  currentSocial: Social | null;
}

// Redux Actions
export const SET_SOCIALS = 'SET_SOCIALS' as const;
export const SET_CURRENT_SOCIAL = 'SET_CURRENT_SOCIAL' as const;

export interface SetSocialsAction {
  type: typeof SET_SOCIALS;
  payload: Social[];
}

export interface SetCurrentSocialAction {
  type: typeof SET_CURRENT_SOCIAL;
  payload: Social | null;
}

export type SocialActionTypes = SetSocialsAction | SetCurrentSocialAction;

