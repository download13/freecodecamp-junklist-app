import sharp from 'sharp';
import fs from 'fs';
import {Form} from 'multiparty';

import {
    putImage,
    getImageSmall,
    getImageOriginal
} from '../store/image';

import {authedOnlyMw} from '../../modules/flux-authenticator/middleware';


export default router => {
    router.get('/item-images/:id/small', (req, res) => {
        getImageSmall(req.params.id).then(
            ({type, image}) => {
                res.set('Content-Type', type);
                res.send(image);
            },
            err => res.status(500).send(err)
        );
    });
    
    router.get('/item-images/:id', (req, res) => {
        getImageOriginal(req.params.id).then(
            ({type, image}) => {
                res.set('Content-Type', type);
                res.send(image);
            },
            err => res.status(500).send(err)
        );
    });
    
    router.put('/item-images/:id', authedOnlyMw, uploadedFiles, (req, res) => {
        let {id} = req.params;
    
        let originalType;
        let img = req.files.originalImage;
        if(img && img[0]) {
            img = img[0];
            createSmallImage(img.path)
            .then(({small, formatFrom}) => {
                fs.readFile(img.path, (err, original) => {
                    if(err) {
                        return console.warn(`Unable to read file ${img.path}. ${err}`);
                    }
                    
                    putImage(req.user.id, id, 'image/jpeg', small, originalType, original)
                    .then(
                        out => res.send(out),
                        err => res.status(500).send(err)
                    )
                    .then(() => req.files.cleanup());
                });
            });
        }
    });
}


function uploadedFiles(req, res, next) {
    let form = new Form({
        maxFilesSize: 10 * 1024 * 1024
    });
    
    form.parse(req, (err, fields, files) => {
        if(err) {
            return next(err);
        }
        
        req.files = {
            ...files,
            cleanup() {
                let fileList = Object.keys(files).reduce((list, name) => {
                    return list.concat(files[name]);
                }, []);
                
                fileList.forEach(file => {
                    fs.unlink(file.path, err => {
                        if(err) {
                            console.warn(`Uploaded file may not have been cleaned up. ${err} occurred while removing ${file.path}`);
                        }
                    });
                });
            }
        };
        
        next();
    });
}

function createSmallImage(path) {
    let fromFormat;
    let image = sharp(path)
    .metadata((err, metadata) => {
        if(err) return Promise.reject(err);
        fromFormat = `image/${metadata.format}`;
        return image;
    })
    .resize(300, 300)
    .max()
    .jpeg()
    .toBuffer()
    .then(small => {
        return {small, fromFormat};
    });
    
    return image;
}