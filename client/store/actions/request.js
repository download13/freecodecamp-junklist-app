import fetch from 'isomorphic-fetch';

import * as selectors from '../selectors';

import {ensureItem} from './index';


function createValueActions(name, loadFn, initialState, reducerPath) {
    const TYPE = 'SET_' + name;
    
    function set(v) {
        return {
            type: TYPE,
            payload: v
        }
    }
    
    return {
        set,
        load() {
            return (dispatch, getState) => {
                loadFn(getState).then(v => dispatch(set(v)));
            }
        },
        reducer(state = initialState, {type, payload}) {
            if(type === TYPE) return payload;
            return state;
        },
        selector(state) {
            return state[reducerPath];
        }
    };
}

let sentRequests = createValueActions('SENT_REQUESTS', getState => {
    let token = selectors.token(getState());
    if(token) {
        return fetch('/user/sent_requests', {
            headers: {
                Authorization: token
            }
        })
        .then(res => res.json());
    }
    
    return Promise.reject();
});



function setSentRequests(requests) {
    return {
        type: 'SET_SENT_REQUESTS',
        payload: requests
    };
}

export function loadSentRequests() {
    return (dispatch, getState) => {
        let token = selectors.token(getState());
        if(!token) return;
        
        return fetch('/user/sent_requests', {
            headers: {
                Authorization: token
            }
        })
        .then(res => res.json())
        .then(requests => {
            dispatch(setSentRequests(requests));
        });
    }
}


export function loadRequestsForViewItem() {
    return (dispatch, getState) => {
        let state = getState();
        let owned = selectors.viewItemOwned(state);
        if(!owned) return; // Don't bother loading requests if we don't own it
        let id = selectors.viewItemId(state);
        
        fetch(`/request/item/${id}`, {
            headers: {
                Authorization: selectors.token(state)
            }
        })
        .then(res => res.json())
        .then(requests => {
            dispatch(setViewItemRequests(requests));
        });
    }
}

export function requestItem(id) {
    return (dispatch, getState) => {
        // TODO create a request for some item on the site
        fetch(`/request/item/${id}`, {
            method: 'PUT',
            headers: {
                Authorization: getState().auth.token
            }
        })
        .then(res => res.json())
        .then(requests => {
            dispatch(setSentRequests(requests));
        });
    }
}

export function unrequestItem(id) {
    return (dispatch, getState) => {
        fetch(`/request/item/${id}`, {
            method: 'DELETE',
            headers: {
                Authorization: getState().auth.token
            }
        })
        .then(res => res.json())
        .then(requests => {
            dispatch(setSentRequests(requests));
        });
    }
}

export function acceptRequest(id) {
    return (dispatch, getState) => {
        console.log('acceptRequest', id)
        fetch(`/request/${id}/accept`, {
            method: 'POST',
            headers: {
                Authorization: selectors.token(getState())
            }
        })
        .then(res => res.json())
        .then(requests => {
            dispatch(setViewItemRequests(requests));
        });
        // TODO: requestItem should check for an error if a request has already been accepted for item
    }
}

export function unacceptRequest(id) {
    return (dispatch, getState) => {
        fetch(`/request/${id}/unaccept`, {
            method: 'POST',
            headers: {
                Authorization: selectors.token(getState())
            }
        })
        .then(res => res.json())
        .then(requests => {
            dispatch(setViewItemRequests(requests));
        });
    }
}


function setViewItemRequests(requests) {
    return {
        type: 'SET_VIEW_ITEM_REQUESTS',
        payload: requests
    };
}