import element from 'virtual-element';
import {connect} from 'deku-redux';
import {bindActionCreators} from 'redux';

import {
    editItem
} from '../store/selectors';
import {
    selectEditItem,
    cacheEditItem,
    saveCachedEditItem,
    uploadImage
} from '../store/actions';

import ImagePicker from '../components/imagepicker';

import styles from './edit.css';
import buttonStyles from '../components/button.css';


const Edit = {
    afterMount({
        props: {
            id,
            selectEditItem,
            uploadImage
        },
        state: {
            untrackedState
        }
    }, el, setState) {
        selectEditItem(id);
        
        setState({el});
    },
    render({
        props: {
            item,
            cacheEditItem,
            saveCachedEditItem
        },
        state: {
            el
        }
    }) {
        const change = () => {
            let c = el.children;
            let data = {
                description: c[0].value,
                imageUrl: c[2].value,
                city: c[3].value,
                text: c[4].value
            };
            
            cacheEditItem(data);
        };
        
        const pick = file => {
            uploadImage(file);
            // TODO: Get back results and use to upload item
        };
        
        return <div class={styles.editor}>
            <input class={styles.desc} placeholder="Short description" value={item.description} onKeyUp={change} />
            <ImagePicker onPick={pick} />
            <input class={styles.city} placeholder="City" type="url" value={item.city} onKeyUp={change} />
            <textarea class={styles.notes} placeholder="Notes..." value={item.text} onKeyUp={change} />
            <button class={`${buttonStyles.button} ${styles.clear}`} onClick={() => cacheEditItem({})}>Clear</button>
            <button class={buttonStyles.button} onClick={() => saveCachedEditItem()}>Save</button>
        </div>;
    }
};


export default connect(
    (state, {params: {id}}) => ({
        id,
        item: editItem(state)
    }),
    dispatch => bindActionCreators({
        selectEditItem,
        cacheEditItem,
        saveCachedEditItem,
        uploadImage
    }, dispatch)
)(Edit);
