import bodyParser from 'body-parser';

import {
    getItem,
    putItem,
    getUserItems
} from '../store/item';

import {authedOnlyMw} from '../../modules/flux-authenticator/middleware';

import jsonOrHtml from './utils/jsonorhtml';
import serveApp from './utils/serveapp';


export default router => {
    // Get all items for that belong to the user
    router.get('/user/items', authedOnlyMw, (req, res) => {
        getUserItems(req.user.id)
        .then(
            items => res.json(items),
            err => res.status(500).send(err)
        );
    });
    
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
}
