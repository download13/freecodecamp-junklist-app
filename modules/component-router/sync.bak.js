import deepEqual from 'deep-equal';
import qp from 'query-parse';
import pathToRegexp from 'path-to-regexp';


// Constants
const PUSH_PATH = '@@component-router/PUSH_PATH';
const REPLACE_PATH = '@@component-router/REPLACE_PATH';

const SELECT_STATE = state => state.routing;


// Action creators
function pushPath(path, query, hash, key) {
	return updatePath(PUSH_PATH, path, query, hash, key);
}

function replacePath(path, query, hash, key) {
	return updatePath(REPLACE_PATH, path, query, hash, key);
}

function updatePath(type, path, query, hash, key) {
	return {
		type: PUSH_PATH,
		path,
		query,
		hash,
		key: key || Math.random().toString(36).substr(2)
	};
}


// Reducer
const initialState = {
	path: '',
	params: {},
	query: {},
	hash: '',
	_replaced: false,
	_key: null
};

function createRouteReducer(routes) {
	const routeMatcher = createRouteMatcher(routes);

	return (state = initialState, {type, path, query, hash, key}) => {
		if(type === PUSH_PATH || type === REPLACE_PATH) {
			return {
				path: path || '',
				params: routeMatcher(path),
				query: qp.toObject(query || ''),
				hash: hash || '',
				_replaced: type === REPLACE_PATH,
				_key: key
			};
		}
		return state;
	};
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


function syncReduxAndRouter(history, store, selectRouterState = SELECT_STATE) {
	const getRouterState = () => selectRouterState(store.getState());

	if(!getRouterState()) {
		throw new Error('Route state does not exist. Did you install the reducer?');
	}

	let historyLocation;

	const unsubscribeHistory = history.listen(location => {
	    let routerState = getRouterState();
	    historyLocation = location;
	    console.log('history update event', routerState._key, historyLocation.key);
	    // Already up-to-date? Do nothing
	    if(routerState._key === historyLocation.key) {
	        console.log('history will not update store');
	        return;
	    }
        
		const updatePath = location.action === 'REPLACE' ? replacePath : pushPath;
        
        console.log('history updating store');
		store.dispatch(updatePath(location.pathname, location.search, location.hash, location.key));
	});

	const unsubscribeStore = store.subscribe(() => {
		const routerState = getRouterState();
		console.log('store update event', routerState._key, historyLocation.key);
		// Already up-to-date? Do nothing
		if(routerState._key === historyLocation.key) {
		    console.log('store will not update history')
		    return;
		}
		
		const method = routerState._replaced ? 'replaceState' : 'pushState';
        console.log('store updating history');
		history[method](null, routerState.path + qp.toString(routerState.query) + routerState.hash);
	});

	return function unsubscribe() {
		unsubscribeHistory();
		unsubscribeStore();
	};
}


export {
	pushPath,
	replacePath,
	syncReduxAndRouter,
	createRouteReducer
};
