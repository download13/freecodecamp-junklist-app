import element from 'virtual-element';

import styles from './requestbox.css';
import {button} from '../atoms/button.css';


export default {
    render({
        props: {
            request: {
                accepted,
                displayName
            },
            onAccept,
            onUndoAccept
        }
    }) {
        let requestContent = <div class={styles.request}>Requested by {displayName}</div>;
        let acceptContent = null;
        if(accepted === true) {
            acceptContent = <div class={styles.accept}>
                <div class={styles.accepted}>Accepted</div>
                <button class={button} onClick={onUndoAccept}>Undo</button>
            </div>;
        } else if(accepted === false) {
            requestContent = <div class={styles.request + ' ' + styles.denied}>Requested by {displayName}</div>;
        } else {
            acceptContent = <button class={button + ' ' + styles.accept} onClick={onAccept}>Accept</button>;
        }
        
        return <div class={styles.box}>
            {requestContent}
            {acceptContent}
        </div>;
    }
};
