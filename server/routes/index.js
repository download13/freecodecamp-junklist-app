import express from 'express';
import accept from 'http-accept';
import bodyParser from 'body-parser';
import {Form} from 'multiparty';
import fs from 'fs';
import sharp from 'sharp';

import {authedOnlyMw} from '../../modules/flux-authenticator/middleware';

import {
    getOrCreateUser,
    getFrontPageItems,
    getItem,
    putItem,
    putImage
} from '../store/rethinkdb';


let router = express.Router();


router.get('/', jsonOrHtml(
    (req, res) => {
        getFrontPageItems()
        .then(
            items => res.json(items),
            err => res.status(500).send('Database error')
        );
    },
    serveApp
));

router.get('/create', serveApp);

router.get('/item/:id', jsonOrHtml(
    (req, res) => {
        getItem(req.params.id)
        .then(
            item => res.json(item),
            err => res.status(500).send('Database error')
        );
    },
    serveApp
));

router.put('/item/:id', authedOnlyMw, bodyParser.json(), (req, res) => {
    putItem(req.user.id, req.params.id, req.body)
    .then(
        item => res.json(item),
        err => {res.status(500).send('Database error');console.log(err)}
    );
});

router.get('/item/:id/edit', serveApp);


router.get('/item-images/:id', (req, res) => {
    // TODO: Get the image from the database and send back
});

// TODO: Add some body middleware for multipart
router.put('/item-images/:id', (req, res) => {
    let {id} = req.params;
    
    let form = new Form({
        maxFilesSize: 10 * 1024 * 1024
    });
    
    form.parse(req, (err, fields, files) => {
        let originalType;
        let img = files.originalImage;
        if(img && img[0]) {
            img = img[0];
            
            let image = sharp(img.path)
            .metadata(({format}) => {
                originalType = `image/${format}`;
                return image;
            })
            .resize(300, 300)
            .max()
            .toFormat('jpg')
            .toBuffer()
            .then(small => {
                fs.readFile(img.path, (err, original) => {
                    if(err) {
                        return console.error(err);
                    }
                    
                    putImage(id, 'image/jpeg', small, originalType, original);
                });
                
            });
        }
        // TODO: Resize photo and change to image/jpg for preview
        // Also keep original image for better view
        // Store images in the database
        
        // TODO Delete all files afterward
        //deleteFiles(files);
    });
});


export default router;


function jsonOrHtml(mwJson, mwHtml) {
    return (req, res, next) => {
        accept(req, res, () => {
            let type = req.accept.types.getBestMatch(['text/html', 'application/json']);
            if(type === 'text/html') {
                mwHtml(req, res, next);
            } else {
                mwJson(req, res, next);
            }
        });
    }
}

function serveApp(req, res) {
    res.sendFile('index.html', {root: 'public'});
}

function deleteFiles(files) {
    Object.keys(files).forEach(name => {
        let field = files[name];
        field.forEach(file => {
            fs.unlink(file.path, err => {
                if(err) {
                    console.error(err);
                }
            });
        });
    });
}