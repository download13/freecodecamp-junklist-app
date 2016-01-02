import {validate} from 'revalidator';
import validator from 'validator';

import getR from './rethinkdb';
const r = getR();


const ItemSchema = {
    properties: {
        description: {
            type: 'string'
        },
        image: {
            type: 'string',
            allowEmpty: true,
            conform(v) {
                return v.length === 0 || validator.isUUID(v);
            }
        },
        city: {
            type: 'string'
        },
        text: {
            type: 'string'
        }
    }
};


export function getFrontPageItems() {
    return r.table('items').orderBy({index: r.desc('timeAdded')}).limit(18).run()
    .then(cursor => cursor.toArray())
    .then(null, err => {
        console.log('getFrontPageItems err', err);
        throw 'Database error';
    });
}

export function getUserItems(userId) {
    return r.table('items').getAll(userId, {index: 'owner'}).orderBy(r.desc('timeAdded')).run()
    .then(cursor => cursor.toArray())
    .then(null, err => {
        console.log('getUserItems err', err);
        throw 'Database error';
    });
}

export function getItem(id) {
    return r.table('items').get(id).run()
    .then(null, err => {throw 'Database error'});
}

export function putItem(userId, itemId, item) {
    if(!validator.isUUID(itemId)) {
        return Promise.reject('Invalid id');
    }
    let itemValid = validate(item, ItemSchema);
    if(!itemValid.valid) {
        console.log(itemValid.errors);
        return Promise.reject('Invalid item');
    }
    
    // If item by that id already exists and has owner of userId, update properties
    return r.table('items').filter({
        id: itemId,
        owner: userId
    }).update({
        description: item.description,
        city: item.city,
        text: item.text,
        image: item.image
    }).run()
    .then(({replaced}) => {
        // Otherwise, try to insert it as a new item
        if(replaced === 0) {
            return r.table('items').insert({
                id: itemId,
                description: item.description,
                city: item.city,
                text: item.text,
                image: item.image,
                timeAdded: Date.now(),
                owner: userId
            }).run()
            .then(null, err => {
                return itemId;
            });
        }
        // TODO: Other errors should be in the form of responses
        return itemId;
    })
    .then(null, err => {throw 'Database error'});
}
