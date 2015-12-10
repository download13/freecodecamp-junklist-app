import element from 'virtual-element';

import styles from './imagepicker.css';


export default {
    render({
        props: {
            onPick
        },
        state: {
            hover,
            previewUrl
        }
    }, setState) {
        const dragEnter = e => {
            e.preventDefault();
            setState({hover: true});
        };
        
        const dragOver = e => {
            e.preventDefault();
        };
        
        const dragLeave = e => {
            e.preventDefault();
            setState({hover: false});
        };
        
        const drop = e => {
            e.preventDefault();
            let {files} = e.dataTransfer;
            if(files.length > 0) {
                picked(files[0]);
            }
            setState({hover: false});
        };
        
        const click = e => e.target.children[0].click();
        
        const change = e => picked(e.target.files[0]);
        
        const picked = file => {
            if(previewUrl) {
                window.URL.revokeObjectURL(previewUrl);
            }
            
            setState({previewUrl: window.URL.createObjectURL(file)});
            
            onPick(file);
        };

        return <div class={styles.picker}>
            <div class={styles.droparea + (hover ? ' hover' : '')} onClick={click} onDragEnter={dragEnter} onDragOver={dragOver} onDragLeave={dragLeave} onDrop={drop}>
                <input class={styles.fileinput} type="file" accept="image/*" onChange={change} />
                <img class={styles.preview} src={previewUrl} />
                <div>Drop File Here</div>
            </div>
        </div>;
    }
}