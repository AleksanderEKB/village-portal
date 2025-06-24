// frontend/src/app/rootReducer.tsx
import { combineReducers } from 'redux';

import newsReducer from '../reducers/newsReducers';
import authReducer from '../features/auth/authSlice';
import postsReducer from '../features/posts/postsSlice';
import userProfileReducer from '../features/userProfile/userProfileSlice';
import socialReducer from '../features/info/informSlice';
import adsReducer from '../features/ads/adsSlice';



const rootReducer = combineReducers({
  posts: postsReducer,
  userProfile: userProfileReducer,
  news: newsReducer,
  auth: authReducer,
  social: socialReducer,
  ads: adsReducer,
});

export default rootReducer;

export type RootState = ReturnType<typeof rootReducer>;
