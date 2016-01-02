import element from 'virtual-element';
import {connect} from 'deku-redux';
import {bindActionCreators} from 'redux';

import {renderRoutes} from '../../../modules/component-router';

import * as selectors from '../../store/selectors';
import {
    tryLogin,
    logout,
    updatePath
} from '../../store/actions';

import IndexView from './index';
import DashboardView from './dashboard';
import CreateView from './create';
import ItemView from './item';
import EditView from './edit';

import AuthBox from '../molecules/authbox';
import Link from '../../../modules/component-router/link';

import styles from './app.css';


const App = {
    render({
        props: {
            user,
            tryLogin,
            logout,
            path,
            children,
            updatePath
        }
    }) {
        let loggedIn = !!user;
        
        let createLink = null;
        let dashLink = null;
        if(loggedIn) {
            createLink = <Link class={styles.navLink} href="/create" updatePath={updatePath}>Post Item</Link>;
            dashLink = <Link class={styles.navLink} href="/dashboard" updatePath={updatePath}>Dashboard</Link>;
        }
        
        return <div class={styles.junklist}>
            <div class={styles.header}>
                <Link class={styles.title} href="/" updatePath={updatePath}>Junklist</Link>
                <nav class={styles.nav}>
                    {dashLink}
                    {createLink}
                </nav>
                <AuthBox loggedIn={loggedIn} displayName={loggedIn ? user.displayName : null} onLogin={tryLogin} onLogout={logout} />
            </div>
            {renderRoutes(path, {
                '/': IndexView,
                '/dashboard': DashboardView,
                '/create': CreateView,
                '/item/:id': ItemView,
                '/item/:id/edit': EditView
            })}
        </div>;
    }
};


export default connect(
    state => ({
        user: selectors.user(state),
        path: selectors.path(state)
    }),
    dispatch => bindActionCreators({
        tryLogin,
        logout,
        updatePath
    }, dispatch)
)(App);