import element from 'virtual-element';

import styles from './authbox.css';


const AuthBox = {
    render({
        props: {
            loggedIn,
            displayName,
            onLogin,
            onLogout
        }
    }) {
        if(loggedIn) {
           return <div class={styles.authbox}>
                <span>Logged in as {displayName}</span>
                <a href="#" onClick={e => {e.preventDefault(); onLogout()}}>Logout</a>
            </div>;
        } else {
           return <div class={styles.authbox}>
                <a href="#" onClick={e => {e.preventDefault(); onLogin()}}>Login or Sign Up</a>
            </div>;
        }
    }
};

export default AuthBox;