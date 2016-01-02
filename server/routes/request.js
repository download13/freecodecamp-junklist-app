import bodyParser from 'body-parser';

import {authedOnlyMw} from '../../modules/flux-authenticator/middleware';

import {
    getItemRequestsFromUser,
    getItemRequests,
    createItemRequest,
    removeItemRequest,
    acceptRequest,
    unacceptRequest
} from '../store/request';


export default router => {
    // Show all the requests made on an item (id)
    router.get('/request/item/:id', authedOnlyMw, (req, res) => {
        let {id: itemId} = req.params;
        
        getItemRequests(itemId, req.user.id).then(
            requests => res.json(requests),
            err => res.status(500).send(err)
        );
    });
    
    // Create a request for the item (id)
    router.put('/request/item/:id', authedOnlyMw, (req, res) => {
        let {id: itemId} = req.params;
        createItemRequest(req.user.id, itemId).then(
            requests => res.json(requests),
            err => res.status(500).send(err)
        );
    });
    
    // Remove a requests for the item (id)
    router.delete('/request/item/:id', authedOnlyMw, (req, res) => {
        let {id: itemId} = req.params;
        removeItemRequest(req.user.id, itemId).then(
            requests => res.json(requests),
            err => res.status(500).send(err)
        );
    });
    
    // Accept an item request
    router.post('/request/:id/accept', authedOnlyMw, (req, res) => {
        let {id: requestId} = req.params;
        acceptRequest(req.user.id, requestId).then(
            requests => res.json(requests),
            err => res.status(500).send(err)
        );
    });
    
    // Un-accept an item request
    router.post('/request/:id/unaccept', authedOnlyMw, (req, res) => {
        let {id: requestId} = req.params;
        unacceptRequest(req.user.id, requestId).then(
            requests => res.json(requests),
            err => res.status(500).send(err)
        );
    });
}