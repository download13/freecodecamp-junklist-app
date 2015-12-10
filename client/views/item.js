import element from 'virtual-element';
import {connect} from 'deku-redux';
import {bindActionCreators} from 'redux';

import {
    viewItem,
    viewItemRequested,
    viewItemOwned
} from '../store/selectors';
import {
    selectViewItem,
    requestItem,
    navigateEditItem
} from '../store/actions';

import styles from './item.css';
import {button as buttonClass} from '../components/button.css';


const Item = {
    afterMount({
        props: {
            id,
            selectViewItem
        }
    }) {
        selectViewItem(id);
    },
    render({
        props: {
            item,
            requested,
            owned,
            requestItem,
            navigateEditItem
        }
    }) {
        let content;
        if(item) {
            if(typeof item === 'string') {
                content = <div class={styles.error}>Error: {item}</div>;
            } else {
                content = [
                    <h1 class={styles.desc}>{item.description}</h1>,
                    <div class={styles.imageHolder}>
                        <img class={styles.image} src={item.imageUrl} />
                        <div class={styles.city}>{item.city}</div>
                    </div>,
                    <div class={styles.text}>{item.text}</div>
                ];
                
                if(owned) {
                    // TODO: Show edit button
                    content.push(
                        <button class={buttonClass} onClick={() => navigateEditItem(item.id)}>Edit</button>,
                        <div class={styles.ownerInfo}>This post belongs to you</div>
                    );
                } else {
                    if(requested) {
                        content.push(<button class={`${buttonClass} requested`} onClick={() => requestItem(item.id, false)}>Remove Request</button>);
                    } else {
                        content.push(<button class={buttonClass} onClick={() => requestItem(item.id, true)}>Request Item</button>);
                    }
                }
            }
        } else {
            content = <div class={styles.loading}>Loading...</div>;
        }
        
        return <div class={styles.item}>
            {content}
        </div>;
    }
};


export default connect(
    (state, {params}) => ({
        id: params.id,
        item: viewItem(state),
        requested: viewItemRequested(state),
        owned: viewItemOwned(state)
    }),
    dispatch => bindActionCreators({
        selectViewItem,
        requestItem,
        navigateEditItem
    }, dispatch)
)(Item);