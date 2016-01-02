import {combineReducers} from 'redux';
import {routeReducer} from 'redux-simple-router';
import pathToRegexp from 'path-to-regexp';

import authReducer from '../../modules/flux-authenticator/reducer';


export default combineReducers({
    auth: authReducer,
    routing: createRouteReducer([
        '/',
        '/dashboard',
        '/create',
        '/item/:id',
        '/item/:id/edit'
    ]),
    items(state = {}, {type, payload}) {
        switch(type) {
        case 'ADD_ITEM':
            return {
                ...state,
                [payload.item.id]: payload.item
            };
        case 'REMOVE_ITEM':
            let copy = {...state};
            delete copy[payload.id];
            return copy;
        default:
            return state;
        }
    },
    userItems(state = [], {type, payload}) {
        switch(type) {
        case 'SET_USER_ITEMS':
            return payload;
        default:
            return state;
        }
    },
    frontPageItemIds(state = [], {type, payload}) {
        switch(type) {
        case 'SET_FRONTPAGE_ITEMS':
            return payload;
        default:
            return state;
        }
    },
    viewItemId(state = null, {type, id}) {
        if(type === 'SET_VIEW_ITEM') return id;
        return state;
    },
    sentRequests(state = [], {type, payload}) {
        if(type === 'SET_SENT_REQUESTS') return payload;
        return state;
    },
    incomingRequests(state = [], {type, payload}) {
        if(type === 'SET_INCOMING_REQUESTS') return payload;
        return state;
    },
    viewItemRequests(state = [], {type, payload}) {
        if(type === 'SET_VIEW_ITEM_REQUESTS') return payload;
        return state;
    },
    editItemId(state = null, {type, id}) {
        if(type === 'SET_EDIT_ITEM') return id;
        return state;
    },
    editItemCache(state = {}, {type, payload}) {
        switch(type) {
            case 'SET_EDIT_CACHE_DESCRIPTION':
                return {
                    ...state,
                    description: payload
                };
            case 'SET_EDIT_CACHE_CITY':
                return {
                    ...state,
                    city: payload
                };
            case 'SET_EDIT_CACHE_TEXT':
                return {
                    ...state,
                    text: payload
                };
            case 'SET_EDIT_CACHE_IMAGE':
                return {
                    ...state,
                    image: payload
                };
            case 'CLEAR_EDIT_CACHE':
                return {};
            default:
                return state;
        }
    },
    editImageUpload(state = {}, {type, payload}) {
        switch(type) {
            case 'SET_UPLOAD_STATUS':
                return payload;
            default:
                return state;
        }
    }
});


function createRouteReducer(routes) {
	const routeMatcher = createRouteMatcher(routes);
    
	return (state, action) => {
		let newState = routeReducer(state, action);
		
		if(newState !== state) {
		    return {
		        ...newState,
		        params: routeMatcher(newState.path)
		    };
		}
		
		return newState;
	}
}

function createRouteMatcher(routes) {
	const compiledRoutes = routes.map(routePath => {
		let paramsInfo = [];
		let re = pathToRegexp(routePath, paramsInfo);
		let paramNames = paramsInfo.map(p => p.name);

		return {re, paramNames};
	});

	return path => {
		let params = null;
		
		compiledRoutes.some(({re, paramNames}) => {
			let match = re.exec(path || '');
			if(match) {
				params = pairsToObj(zip(paramNames, match.slice(1)))
				return true;
			}
			return false;
		});

		return params;
	};
}

function zip(a1, a2) {
    return a1.map((v, i) => [v, a2[i]]);
}

function pairsToObj(arr) {
    let o = {};
    arr.forEach(pair => {
        o[pair[0]] = pair[1]
    });
    return o;
}
