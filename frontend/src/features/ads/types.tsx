// frontend/src/features/ads/types.tsx
import type { Advertisement } from '../../types/globalTypes';

export interface AdsState {
  ads: Advertisement[];
  currentAd: Advertisement | null;
}

export const SET_ADS = 'SET_ADS' as const;
export const SET_CURRENT_AD = 'SET_CURRENT_AD' as const;

export interface SetAdsAction {
  type: typeof SET_ADS;
  payload: Advertisement[];
}
export interface SetCurrentAdAction {
  type: typeof SET_CURRENT_AD;
  payload: Advertisement | null;
}

export type AdsActionTypes = SetAdsAction | SetCurrentAdAction;
