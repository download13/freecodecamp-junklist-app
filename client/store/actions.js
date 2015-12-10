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
        // TODO connect to server, get current and future state changes as actions
        
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
    return {type: 'SET_FRONTPAGE_ITEMS', itemIds};
}

export function getFrontPageItems() {
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

function ensureItem(id) {
    return (dispatch, getState) => {
        let {items} = getState();
        if(!items[id]) {
            fetch(`/item/${id}`, {
                headers: {'Accept': 'application/json'}
            })
            .then(res => res.json())
            .then(item => {
                if(item) {
                    dispatch(addItem(item));
                }
            });
        }
    }
}

function setViewItem(id) {
    return {type: 'SET_VIEW_ITEM', id};
}

export function selectViewItem(id) {
    return (dispatch, getState) => {
        let {items} = getState();
        
        dispatch(setViewItem(id));
        dispatch(ensureItem(id));
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

export function cacheEditItem(item) {
    return {type: 'SET_EDIT_CACHE', item};
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
                Authorization: auth.token
            },
            body: JSON.stringify(editItemCache)
        })
        .then(res => res.json())
        .then(data => {
            // TODO
            console.log('data',data)
            // Clear edit cache
            dispatch(cacheEditItem({}));
            dispatch(removeItem(editItemId));
            dispatch(navigateToItem(editItemId));
        });
    }
}

export function uploadImage(file) {
    let id = uuid();
    let body = new FormData();
    body.append('originalImage', file);
    
    fetch(`/item-images/${id}`, {
        method: 'PUT',
        body
    })
    .then(res => {
        console.log('uploadImage',res.status)
    }, err => console.log('uploadImage err', err));
}

export function requestItem(id, requesting = true) {
    return (dispatch, getState) => {
        // TODO create a request for some item on the site
        fetch(`/request`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: getState().auth.token
            },
            body: JSON.stringify({
                item: id,
                requesting
            })
        })
        .then(res => res.json())
        .then(ids => {
            dispatch(setRequestedItemIds(ids));
        });
    }
}


function addItem(item) {
    return {type: 'ADD_ITEM', payload: {item}};
}

function removeItem(id) {
    return {type: 'REMOVE_ITEM', payload: {id}};
}

function setRequestedItemIds(itemIds) {
    return {type: 'SET_REQUESTED_ITEMS', itemIds};
}