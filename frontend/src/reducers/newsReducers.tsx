import { NewsState, NewsAction } from '../types/globalTypes';


const initialState: NewsState = {
    newses: [],
    currentNews: null,
};

function newsReducer(state = initialState, action: NewsAction): NewsState {
    switch (action.type) {
        case 'SET_NEWSES':
            return { ...state, newses: action.payload };
        case 'SET_CURRENT_NEWS':
            return { ...state, currentNews: action.payload };
        default:
            return state;
    }
}

export default newsReducer;
