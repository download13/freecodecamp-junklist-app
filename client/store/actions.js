import fetch from 'isomorphic-fetch';
import uuid from 'uuidv4';

import * as selectors from './selectors';

import {
    updatePath
} from 'redux-simple-router';

import {
    initialize as initializeAuth,
    tryLogin,
    logout
} from '../../modules/flux-authenticator/actions';


export function initialize() {
    return (dispatch) => {
        dispatch(initializeAuth());
    }
}

export {
    tryLogin,
    logout,
    updatePath
}


export function navigateToItem(id) {
    return updatePath(`/item/${id}`);
}

export function navigateEditItem(id) {
    return updatePath(`/item/${id}/edit`);
}

function setFrontPageItems(itemIds) {
    return {
        type: 'SET_FRONTPAGE_ITEMS',
        payload: itemIds
    };
}

export function loadFrontPageItems() {
    return (dispatch) => {
        fetch('/', {
            headers: {'Accept': 'application/json'}
        })
        .then(res => {
            if(res.status === 200) {
                res.json().then(items => {
                    items.forEach(item => dispatch(addItem(item)));
                    let itemIds = items.map(item => item.id);
                    dispatch(setFrontPageItems(itemIds));
                });
            } else {
                res.text().then(err => {
                    dispatch(setFrontPageItems(err));
                });
            }
        });
    }
}


function setUserItems(itemIds) {
    return {
        type: 'SET_USER_ITEMS',
        payload: itemIds
    };
}

export function loadUserItems() {
    return (dispatch, getState) => {
        let state = getState();
        if(!selectors.loggedIn(state)) return;
        
        fetch(`/user/items`, {
            headers: {
                Authorization: selectors.token(state)
            }
        })
        .then(res => res.json())
        .then(items => {
            dispatch(setUserItems(items));
        });
    }
}

export function ensureItem(id) {
    return (dispatch, getState) => {
        let {items} = getState();
        
        if(!items[id]) {
            return fetch(`/item/${id}`, {
                headers: {'Accept': 'application/json'}
            })
            .then(res => res.json())
            .then(item => {
                if(item) {
                    dispatch(addItem(item));
                }
            });
        }
        
        return Promise.resolve();
    }
}

function setViewItem(id) {
    return {type: 'SET_VIEW_ITEM', id};
}

export function selectViewItem(id) {
    return (dispatch, getState) => {
        let {items} = getState();
        
        dispatch(setViewItem(id));
        dispatch(ensureItem(id)).then(() => {
            dispatch(loadRequestsForViewItem());
            dispatch(loadSentRequests());
        });
    }
}

function setEditItem(id) {
    return {type: 'SET_EDIT_ITEM', id};
}

export function selectEditItem(id) {
    return (dispatch, getState) => {
        let {items} = getState();
        
        dispatch(setEditItem(id));
        dispatch(ensureItem(id));
    }
}

export function cacheEditItemDescription(description) {
    return {
        type: 'SET_EDIT_CACHE_DESCRIPTION',
        payload: description
    };
}

export function cacheEditItemCity(city) {
    return {
        type: 'SET_EDIT_CACHE_CITY',
        payload: city
    };
}

export function cacheEditItemText(text) {
    return {
        type: 'SET_EDIT_CACHE_TEXT',
        payload: text
    };
}

export function cacheEditItemImage(id) {
    return {
        type: 'SET_EDIT_CACHE_IMAGE',
        payload: id
    }
}

export function clearEditCache() {
    return {
        type: 'CLEAR_EDIT_CACHE'
    };
}

export function saveCachedEditItem() {
    return (dispatch, getState) => {
        let {
            auth,
            editItemId,
            editItemCache
        } = getState();
        
        fetch(`/item/${editItemId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: selectors.token(getState())
            },
            body: JSON.stringify(editItemCache)
        })
        .then(res => res.json())
        .then(data => {
            //console.log('data',data)
            // Clear edit cache
            dispatch(setUploadStatus());
            dispatch(clearEditCache());
            dispatch(removeItem(editItemId));
            dispatch(navigateToItem(editItemId));
        });
    }
}

let previousUpload;
export function uploadEditImage(file) {
    return (dispatch, getState) => {
        let state = getState();
        let {
            auth,
            editItemCache
        } = state;
        
        if(previousUpload) {
            previousUpload.abort();
        }
        
        if(!file || !auth.token) return;
        
        // TODO: This should terminate the previous upload if it's still going on
        let id = uuid();
        let body = new FormData();
        body.append('originalImage', file);
        
        let x = new XMLHttpRequest();
        previousUpload = x;
        x.upload.addEventListener('progress', e => {
            if(e.lengthComputable) {
                dispatch(setUploadStatus('uploading', e.loaded / e.total));
            }
        });
        x.upload.addEventListener('error', err => {
            console.log('Upload failed');
            console.error(err);
            dispatch(setUploadStatus('failed'));
        });
        x.upload.addEventListener('load', () => {
            dispatch(cacheEditItemImage(id));
            dispatch(setUploadStatus('done', 1));
        });
        x.open('PUT', `/item-images/${id}`);
        x.setRequestHeader('Authorization', selectors.token(state));
        x.send(body);
        
        dispatch(setUploadStatus('uploading', 0));
    }
}


function addItem(item) {
    return {type: 'ADD_ITEM', payload: {item}};
}

function removeItem(id) {
    return {type: 'REMOVE_ITEM', payload: {id}};
}

function setUploadStatus(status = '', progress = 0) {
    return {
        type: 'SET_UPLOAD_STATUS',
        payload: {
            status,
            progress
        }
    }
}


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
    }
}