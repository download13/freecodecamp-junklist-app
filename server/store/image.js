import {validate} from 'revalidator';
import validator from 'validator';

import getR from './rethinkdb';
const r = getR();


export function putImage(userId, id, smallType, small, originalType, original) {
    let record = {
        id,
        smallType,
        small,
        originalType,
        original,
        timestamp: Date.now()
    };
    
    let imageValid = validate(record, {
        id: {
            type: 'string',
            conform: validator.isUUID
        },
        smallType: {type: 'string'},
        small: {
            type: 'object',
            conform: isBuffer
        },
        originalType: {type: 'string'},
        original: {
            type: 'object',
            conform: isBuffer
        }
    });
    
    if(!imageValid.valid) {
        console.log(imageValid.errors);
        return Promise.reject('Invalid image');
    }
    
    // TODO: Allow original uploader to replace the image
    return r.table('item_images').insert(record).run()
    .then(
        () => 'Image saved',
        err => {
            console.log('putImage', err);
            // TODO: on insert error, send back id taken
            throw 'Database error';
        }
    );
}

export function getImageOriginal(id) {
    return r.table('item_images').get(id).pluck('originalType', 'original').run()
    .then(
        record => {
            return {
                type: record.originalType,
                image: record.original
            };
        },
        err => {
            console.warn('getImageOriginal', id, err);
            throw 'Database error';
        }
    );
}

export function getImageSmall(id) {
    return r.table('item_images').get(id).pluck('smallType', 'small').run()
    .then(
        record => {
            return {
                type: record.smallType,
                image: record.small
            };
        },
        err => {
            console.warn('getImageSmall', id, err);
            throw 'Database error';
        }
    );
}


function isBuffer(obj) {
    return Buffer.isBuffer(obj);
}