import {SET_TOKEN} from './constants';


const initialState = {
    token: null,
    user: null
};


export default (state = initialState, action) => {
    switch(action.type) {
    case SET_TOKEN:
        return {
            ...state,
            token: action.token,
            user: decodeToken(action.token)
        };
    default:
        return state;
    }
};


function decodeToken(token) {
    try {
        return JSON.parse(window.atob(token.split('.')[1]));
    } catch(e) {}
    
    return null;
}