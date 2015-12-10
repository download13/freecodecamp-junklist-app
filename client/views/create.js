import element from 'virtual-element';
import {connect} from 'deku-redux';
import {bindActionCreators} from 'redux';
import uuid from 'uuidv4';

import {
    navigateEditItem
} from '../store/actions';


const Create = {
    afterMount({props: {navigateEditItem}}) {
        navigateEditItem(uuid());
    },
    render() {
        return <noscript/>;
    }
};


export default connect(
    state => ({}),
    dispatch => bindActionCreators({
        navigateEditItem
    }, dispatch)
)(Create);