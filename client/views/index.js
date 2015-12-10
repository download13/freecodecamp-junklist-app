import element from 'virtual-element';
import {connect} from 'deku-redux';
import {bindActionCreators} from 'redux';

import {frontPageItems} from '../store/selectors';
import {
    navigateToItem,
    getFrontPageItems
} from '../store/actions';

import ItemBox from '../components/itembox';

import styles from './index.css';


const Index = {
    afterMount({props}, el, setState) {
        props.getFrontPageItems();
    },
    render({
        props: {
            items,
            navigateToItem
        }
    }) {
        let content;
        if(Array.isArray(items)) {
            if(items.length < 1) {
                content = <div class={styles.searching}>Searching...</div>;
            } else {
                content = items.map(item => <ItemBox key={item.id} item={item} onClick={() => navigateToItem(item.id)} />);
            }
        } else {
            content = <div class={styles.searchError}>Error: {items}</div>;
        } 
        
        return <div>
            <input class={styles.searchIn} type="search" placeholder="Find stuff" />
            <div class={styles.items}>
                {content}
            </div>
        </div>;
    }
};


export default connect(
    state => ({
        items: frontPageItems(state)
    }),
    dispatch => bindActionCreators({
        navigateToItem,
        getFrontPageItems
    }, dispatch)
)(Index);