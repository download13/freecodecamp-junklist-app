import element from 'virtual-element';

import styles from './itembox.css';


export default {
    render({
        props: {
            item,
            onClick
        }
    }) {
        return <div class={styles.itembox} onClick={onClick}>
            { item.image ?
                <img src={`/item-images/${item.image}/small`}/> :
                null
            }
            <div class={styles.desc}>{item.description}</div>
            <div class={styles.city}>{item.city}</div>
        </div>;
    }
};
