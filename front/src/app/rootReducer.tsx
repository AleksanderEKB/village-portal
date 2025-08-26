// front/src/app/rootReducer.tsx
import { combineReducers } from 'redux';
import authReducer from '../features/auth/model/authSlice';




const rootReducer = combineReducers({
    auth: authReducer,
});

export default rootReducer;

export type RootState = ReturnType<typeof rootReducer>;
