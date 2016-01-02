import getR from './rethinkdb';
const r = getR();

import {getItem} from './item';


export function getItemRequestsFromUser(userId) {
    return r.table('requests').getAll(userId, {index: 'requester'}).run()
    .then(cursor => cursor.toArray())
    .then(null, err => {console.log('getItemRequestsFromUser err',err);throw 'Database error'});
}

// Get the requests for an item if it is owned by userId
export function getItemRequests(itemId, userId) {
    return r.table('items').get(itemId).run()
    .then(item => {
        if(item.owner === userId) {
            return r.table('requests').getAll(itemId, {index: 'item'})
                .eqJoin('requester', r.table('users'), {index: 'id'}).pluck({left: ['id', 'timeAdded', 'accepted'], right: 'displayName'}).zip().run()
            .then(cursor => cursor.toArray())
            .then(null, err => {console.log('showItemRequests err',err);throw 'Database error'});
        } else {
            throw 'This is not your item';
        }
    });
}

export function getRequestsMadeToUser(userId) {
    return r.table('requests').getAll(userId, {index: 'itemOwner'}).run()
    .then(cursor => cursor.toArray()) // TODO: Cleanup results
    .then(null, err => {throw 'Database error'});
}

export function createItemRequest(userId, itemId) {
    return getItem(itemId)
    .then(item => {
        return r.table('requests').insert({
            id: userId + '_' + itemId, // Use as primary key, a user should only request an item once
            requester: userId,
            item: itemId,
            itemOwner: item.owner,
            timeAdded: Date.now()
        });
    })
    .then(
        () => getItemRequestsFromUser(userId),
        err => {
            console.log('createItemRequest err', err, Object.keys(err));
            // TODO: If error is duplicate id, return false
            throw 'Database error';
        }
    );
    
}

export function removeItemRequest(userId, itemId) {
    return r.table('requests').get(userId + '_' + itemId).delete().run()
    .then(
        () => getItemRequestsFromUser(userId),
        err => {
            console.log('removeItemRequest err', err, Object.keys(err));
            throw 'Database error';
        }
    );
}

export function acceptRequest(userId, requestId) {
    return r.table('requests').get(requestId).run()
    .then(request => {
        if(request.itemOwner !== userId) {
            throw 'You do not own the item concerned'
        }
        
        return r.table('requests').getAll(request.item, {index: 'item'}).filter(r.row('id').ne(requestId)).update({accepted: false}).run()
        .then(() => {
            return r.table('requests').get(requestId).update({accepted: true}).run()
            .then(() => getItemRequests(request.item, userId));
        });
    })
    .then(null, err => {
        console.log('acceptRequest error', err);
        throw 'Database error';
    });
}

export function unacceptRequest(userId, requestId) {
    return r.table('requests').get(requestId).run()
    .then(request => {
        return r.table('requests').getAll(request.item, {index: 'item'}).replace(r.row.without('accepted')).run()
        .then(() => getItemRequests(request.item, userId));
    })
    .then(null, err => {
        console.log('unacceptRequest error', err);
        throw 'Database error';
    });
}