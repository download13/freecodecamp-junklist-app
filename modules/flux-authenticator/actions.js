import {
    SET_TOKEN,
    LOGIN_PATH,
    LOCALSTORAGE_TOKEN_KEY
} from './constants';


export function initialize(key = LOCALSTORAGE_TOKEN_KEY) {
    return dispatch => {
        window.addEventListener('storage', e => {
            if(e.key === key) {
                dispatch(setToken(e.newValue));
            }
        });
        
        dispatch(setToken(localStorage.getItem(key)));
    }
}

export function tryLogin(loginUrl = LOGIN_PATH) {
    return () => {
        window.open(loginUrl);
    }
}

export function logout(key = LOCALSTORAGE_TOKEN_KEY) {
    return dispatch => {
        localStorage.removeItem(key);
        dispatch(setToken(null));
    }
}


function setToken(token) {
    return {type: SET_TOKEN, token};
}