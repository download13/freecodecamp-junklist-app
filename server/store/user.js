import {validate} from 'revalidator';
import validator from 'validator';
import uuid from 'uuidv4';

import getR from './rethinkdb';
const r = getR();


export function getOrCreateUser(email, displayName) {
    return r.table('users').insert({
        email,
        id: uuid(),
        displayName
    }, {conflict: 'error'}).run()
    .then(
        () => getUser(email),
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