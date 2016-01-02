import element from 'virtual-element';
import {connect} from 'deku-redux';
import {bindActionCreators} from 'redux';

import {
    loggedIn,
    viewItem,
    viewItemRequested,
    viewItemRequestAccepted,
    viewItemOwned,
    viewItemRequests
} from '../../store/selectors';
import {
    selectViewItem,
    requestItem,
    unrequestItem,
    navigateEditItem
} from '../../store/actions';
import {
    acceptRequest,
    unacceptRequest
} from '../../store/actions/request';

import styles from './item.css';
import {button as buttonClass} from '../atoms/button.css';

import RequestBox from '../molecules/requestbox';


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
            loggedIn,
            item,
            requested,
            requestAccepted,
            owned,
            itemRequests,
            requestItem,
            unrequestItem,
            acceptRequest,
            unacceptRequest,
            navigateEditItem
        }
    }) {
        let itemError = null;
        let itemThrobber = null;
        let itemContent = null;
        let editButton = null;
        let requestButton = null;
        let requestContent = null;
        
        if(item) {
            if(typeof item === 'string') {
                itemError = <div class={styles.error}>Error: {item}</div>;
            } else {
                itemContent = [
                    <h1 class={styles.desc}>{item.description}</h1>,
                    <div class={styles.imageHolder}>
                        { item.image ?
                            <a target="_blank" href={`/item-images/${item.image}`}>
                                <img class={styles.image} src={`/item-images/${item.image}/small`} />
                            </a> :
                            null
                        }
                        <div class={styles.city}>{item.city}</div>
                    </div>,
                    <div class={styles.text}>{item.text}</div>
                ];
                
                if(owned) {
                    editButton = [
                        <button class={buttonClass} onClick={() => navigateEditItem(item.id)}>Edit</button>,
                        <div class={styles.ownerInfo}>This post belongs to you</div>
                    ];
                    console.log('requestbox', itemRequests)
                    requestContent = itemRequests.map(request => <RequestBox request={request} onAccept={() => acceptRequest(request.id)} onUndoAccept={() => unacceptRequest(request.id)} />);
                } else {
                    if(requested) {
                        if(requestAccepted === true) {
                            requestButton = <div>Your request was accepted</div>;
                        } else if(requestAccepted === false) {
                            requestButton = <div>Someone else's request was selected</div>;
                        } else {
                            requestButton = <button class={buttonClass + ' requested'} onClick={() => unrequestItem(item.id)}>Remove Request</button>;
                        }
                    } else if(loggedIn) {
                        requestButton = <button class={buttonClass} onClick={() => requestItem(item.id)}>Request Item</button>;
                    }
                }
            } 
        } else {
            itemThrobber = <div class={styles.loading}>Loading...</div>;
        }
        
        return <div class={styles.item}>
            {itemThrobber}
            {itemError}
            {itemContent}
            {editButton}
            {requestButton}
            {requestContent}
        </div>;
    }
};


export default connect(
    (state, {params}) => ({
        loggedIn: loggedIn(state),
        id: params.id,
        item: viewItem(state),
        requested: viewItemRequested(state),
        requestAccepted: viewItemRequestAccepted(state),
        owned: viewItemOwned(state),
        itemRequests: viewItemRequests(state)
    }),
    dispatch => bindActionCreators({
        selectViewItem,
        requestItem,
        unrequestItem,
        acceptRequest,
        unacceptRequest,
        navigateEditItem
    }, dispatch)
)(Item);