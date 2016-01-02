import element from 'virtual-element';
import {tree, render} from 'deku';
import {storePlugin} from 'deku-redux';
import createBrowserHistory from 'history/lib/createBrowserHistory';
import {syncReduxAndRouter} from 'redux-simple-router';

import createStore from './store';
import {initialize} from './store/actions';

import App from './components/templates/app';


function createApp() {
    const store = createStore();
    window.store = store; // DEBUG
    
    const history = createBrowserHistory();
    //history.listen((...args) => console.log(args));
    syncReduxAndRouter(history, store);
    store.dispatch(initialize());
    
    return tree().use(storePlugin(store)).mount(<App/>);
}

render(createApp(), document.getElementById('approot'));
