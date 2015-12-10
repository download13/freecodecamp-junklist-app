import {combineReducers} from 'redux';
import {routeReducer} from 'redux-simple-router';
import pathToRegexp from 'path-to-regexp';

import authReducer from '../../modules/flux-authenticator/reducer';


export default combineReducers({
    auth: authReducer,
    routing: createRouteReducer([
        '/',
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
    frontPageItemIds(state = [], action) {
        switch(action.type) {
        case 'SET_FRONTPAGE_ITEMS':
            return action.itemIds;
        default:
            return state;
        }
    },
    userRequestedItemIds(state = [], action) {
        switch(action.type) {
        case 'SET_USER_REQUESTED_ITEMS':
            return action.itemIds;
        default:
            return state;
        }
    },
    viewItemId(state = null, {type, id}) {
        if(type === 'SET_VIEW_ITEM') return id;
        return state;
    },
    editItemId(state = null, {type, id}) {
        if(type === 'SET_EDIT_ITEM') return id;
        return state;
    },
    editItemCache(state = {}, {type, item}) {
        if(type === 'SET_EDIT_CACHE') return item;
        return state;
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
