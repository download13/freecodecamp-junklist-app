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
            let {files} = e.dataTransfer;
            let allowedFiles = filter(files, file => file.type.indexOf('image/') === 0);
            if(allowedFiles.length > 0) {
                e.preventDefault();
                picked(allowedFiles[0]);
            }
            
            setState({hover: false});
        };
        
        const click = e => {
            let el = e.delegateTarget.querySelector('.' + styles.fileInput);
            if(el) {
                el.click();
            }
        }
        
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
                <input class={styles.fileInput} type="file" accept="image/*" onChange={change} />
                { previewUrl ?
                    <img class={styles.preview} src={previewUrl} /> :
                    <div>Drop File Here</div>
                }
            </div>
        </div>;
    }
}


function filter(it, fn) {
    return Array.prototype.filter.call(it, fn);
}