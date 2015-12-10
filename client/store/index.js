import {createStore, applyMiddleware} from 'redux';
import thunk from 'redux-thunk';
import createLogger from 'redux-logger';


import reducer from './reducer';

const finalCreateStore = applyMiddleware(
    thunk,
    createLogger()
)(createStore);

export default (initialState) => {
    return finalCreateStore(reducer, initialState);
};
