import rethinkdbdash from 'rethinkdbdash';
import uuid from 'uuidv4';
import {validate} from 'revalidator';
import validator from 'validator';


const r = rethinkdbdash({cursor: true});

const nop = () => {};

r.dbCreate('junk').run(err => {
    r.tableCreate('users', {primaryKey: 'email'}).run(nop);
    //r.table('items').delete().run();
    r.tableCreate('items').run(() => {
        r.table('items').indexCreate('timeAdded').run(nop);
        
        let mock = require('./MOCK_DATA.json');
        mock = mock.map(item => {
            return {
                ...item,
                imageUrl: `https://placehold.it/300x300?text=${item.description}`
            }
        });
        r.table('items').insert(mock).run(nop);
    });
    r.tableCreate('item_images').run();
});


const ItemSchema = {
    properties: {
        description: {
            type: 'string'
        },
        imageUrl: {
            type: 'string',
            allowEmpty: true,
            conform(v) {
                return v.length === 0 || validator.isURL(v);
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


export function getOrCreateUser(email, displayName) {
    return r.table('users').insert({
        email,
        id: uuid(),
        displayName
    }, {conflict: 'error'}).run()
    .then(
        () => getUser(email), () => getUser(email),
        err => {
            console.log('getOrCreateUser', err)
            // TODO: If insert conflict, say user already exists, else return error
        }
    );
}

function getUser(email) {
    return r.table('users').get(email).run()
    .then(null, err => {throw 'Database error'});
}

export function getFrontPageItems() {
    return r.table('items').orderBy({index: r.desc('timeAdded')}).limit(18).run()
    .then(cursor => cursor.toArray())
    .then(null, err => {throw 'Database error'});
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
    return r.table('items').filter({id: itemId, owner: userId}).update({
        description: item.description,
        city: item.city,
        text: item.text,
        imageUrl: item.imageUrl
    }).run()
    .then(({replaced}) => {
        // Otherwise, try to insert it as a new item
        if(replaced === 0) {
            return r.table('items').insert({
                id: itemId,
                description: item.description,
                city: item.city,
                text: item.text,
                imageUrl: item.imageUrl,
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

export function putImage(id, smallType, small, originalType, original) {
    if(!validator.isUUID(itemId)) {
        return Promise.reject('Invalid id');
    }
    
    let record = {
        id:
        smallType,
        small,
        originalType,
        original
    };
    
    let imageValid = validate(record, {
        id: {type: 'string'},
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
    r.table('item_images').insert(record).run()
    .then(null, err => {
        console.log('putImage', err)
        // TODO: on insert error, send back id taken
    });
}


function isBuffer(obj) {
    return Buffer.isBuffer(obj);
}