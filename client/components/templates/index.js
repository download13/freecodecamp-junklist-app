import element from 'virtual-element';
import {connect} from 'deku-redux';
import {bindActionCreators} from 'redux';

import {frontPageItems} from '../../store/selectors';
import {
    navigateToItem,
    loadFrontPageItems
} from '../../store/actions';

import ItemBox from '../molecules/itembox';

import styles from './index.css';


const Index = {
    afterMount({
        props: {
            loadFrontPageItems
        }
    }) {
        loadFrontPageItems();
    },
    render({
        props: {
            items,
            navigateToItem
        }
    }) {
        let itemsContent = null;
        let itemsError = null;
        let itemsThrobber = null;
        console.log('items',items)
        if(Array.isArray(items)) {
            if(items.length < 1) {
                itemsThrobber = <div class={styles.searching}>Searching...</div>;
            } else {
                itemsContent = items.map(item => <ItemBox key={item.id} item={item} onClick={() => navigateToItem(item.id)} />);
            }
        } else {
            itemsError = <div class={styles.searchError}>Error: {items}</div>;
        } 
        
        return <div>
            <input class={styles.searchIn} type="search" placeholder="Find stuff" />
            {itemsThrobber}
            {itemsError}
            <div class={styles.items}>
                {itemsContent}
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
        loadFrontPageItems
    }, dispatch)
)(Index);