import element from 'virtual-element';
import {connect} from 'deku-redux';
import {bindActionCreators} from 'redux';

import {
    user as userSelector,
    editItem,
    editImageStatus
} from '../../store/selectors';
import {
    selectEditItem,
    cacheEditItemDescription,
    cacheEditItemCity,
    cacheEditItemText,
    clearEditCache,
    saveCachedEditItem,
    uploadEditImage
} from '../../store/actions';

import ImagePicker from '../molecules/imagepicker';

import styles from './edit.css';
import buttonStyles from '../atoms/button.css';


const Edit = {
    afterMount({
        props: {
            id,
            selectEditItem
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
            user,
            imageStatus,
            cacheEditItemDescription,
            cacheEditItemCity,
            cacheEditItemText,
            clearEditCache,
            saveCachedEditItem,
            uploadEditImage
        },
        state: {
            el
        }
    }) {
        let loggedIn = !!user;
        
        let canClear = item.description || item.city || item.text;
        let statusContent = null;
        let {status, progress} = imageStatus;
        switch(status) {
        case 'done':
            statusContent = 'Done';
            break;
        case 'failed':
            statusContent = 'Upload failed';
            break;
        case 'uploading':
            statusContent = <progress value={progress} />;
            break;
        }
        
        console.log('imageStatus', imageStatus)
        let canSave = item.description && item.city;
        console.log('canSave', item, 'loggedIn', loggedIn)
        if(imageStatus.status) {
            canSave = canSave && item.image;
        }
        
        // TODO: If not logged in don't allow saving
        let saveText = 'Save';
        if(!loggedIn) {
            canSave = false;
            saveText = 'Login to Save';
        }
        
        return <div class={styles.editor}>
            <input class={styles.desc} placeholder="Short description" value={item.description} onKeyUp={targetValue(cacheEditItemDescription)} />
            { item.image ?
                <img src={`/item-images/${item.image}/small`}/> :
                null
            }
            <ImagePicker onPick={uploadEditImage} />
            <div>{statusContent}</div>
            <div>{imageStatus.text}</div>
            <input class={styles.city} placeholder="City" type="url" value={item.city} onKeyUp={targetValue(cacheEditItemCity)} />
            <textarea class={styles.notes} placeholder="Notes..." value={item.text} onKeyUp={targetValue(cacheEditItemText)} />
            <button class={`${buttonStyles.button} ${styles.clear}`} onClick={clearEditCache} disabled={!canClear}>Clear</button>
            <button class={buttonStyles.button} onClick={saveCachedEditItem} disabled={!canSave}>{saveText}</button>
        </div>;
    }
};


export default connect(
    (state, {params: {id}}) => ({
        id,
        user: userSelector(state),
        item: editItem(state),
        imageStatus: editImageStatus(state)
    }),
    dispatch => bindActionCreators({
        selectEditItem,
        cacheEditItemDescription,
        cacheEditItemCity,
        cacheEditItemText,
        clearEditCache,
        saveCachedEditItem,
        uploadEditImage
    }, dispatch)
)(Edit);


function targetValue(fn) {
    return e => {
        fn(e.target.value);
    }
}