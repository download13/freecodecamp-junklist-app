import {authedOnlyMw} from '../../modules/flux-authenticator/middleware';

import {
    getItemRequestsFromUser,
    getRequestsMadeToUser
} from '../store/request';


export default router => {
    // Show all the requests made by the user
    router.get('/user/sent_requests', authedOnlyMw, (req, res) => {
        getItemRequestsFromUser(req.user.id).then(
            requests => res.json(requests),
            err => res.status(500).send(err)
        );
    });
    
    router.get('/user/incoming_requests', authedOnlyMw, (req, res) => {
        getRequestsMadeToUser(req.user.id).then(
            results => res.json(results),
            err => res.status(500).send(err)
        );
    });
}