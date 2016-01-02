import element from 'virtual-element';
import ReactTestUtils from 'react-addons-test-utils';

import styles from './itembox.css';


export default {
    render({
        props: {
            item
        }
    }) {
        return <div class={styles.itembox}>
            <img src={item.imgUrl} />
            <div>{item.description}</div>
            <div>{item.city}</div>
            <button class="request-btn">Request</button>
        </div>;
    }
};
