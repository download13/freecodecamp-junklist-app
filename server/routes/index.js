import express from 'express';

import {
    getFrontPageItems
} from '../store/item';

import jsonOrHtml from './utils/jsonorhtml';
import serveApp from './utils/serveapp';

import itemRoutes from './item';
import itemImageRoutes from './item-images';
import itemRequestRoutes from './request';
import userRoutes from './user';


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

router.get('/dashboard', serveApp);

router.get('/create', serveApp);

itemRoutes(router);
itemImageRoutes(router);
itemRequestRoutes(router);
userRoutes(router);

export default router;
