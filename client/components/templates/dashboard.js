import element from 'virtual-element';
import {connect} from 'deku-redux';
import {bindActionCreators} from 'redux';

import {
    userItems
} from '../../store/selectors';
import {
    navigateToItem,
    loadUserItems
} from '../../store/actions';

import ItemBox from '../molecules/itembox';

import styles from './dashboard.css';


const Dashboard = {
    afterMount({
        props: {
            loadUserItems
        }
    }) {
        loadUserItems();
    },
    render({
        props: {
            userItems,
            navigateToItem
        }
    }) {
        return <div>
            <div>
                <h2 class={styles.title}>My Items</h2>
                <div>
                    { userItems.map(item => <ItemBox key={item.id} item={item} onClick={() => navigateToItem(item.id)} />) }
                </div>
            </div>
        </div>;
    }
};


export default connect(
    (state) => ({
        userItems: userItems(state),
    }),
    dispatch => bindActionCreators({
        navigateToItem,
        loadUserItems
    }, dispatch)
)(Dashboard);
