// frontend/src/app/store.tsx
import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './rootReducer';

const store = configureStore({
  reducer: rootReducer,
});

export default store;

// ВАЖНО: Получаем тип стора
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
