import http from 'http';
import express from 'express';
import socketio from 'socket.io';

import createAuthMiddleware from '../modules/flux-authenticator/middleware';

import routes from './routes';

import {
    getOrCreateUser
} from './store/user';


const authRouter = createAuthMiddleware({
    jwtSecret: 'dskajfidsuafdsf87das9f9',
    getOrCreateUser,
    clientID: '782271593008-ojlttrvpijmao9d5vac603ntvvb9cc3p.apps.googleusercontent.com',
    clientSecret: 'utKlzH7q96Xa0tn1Tow7zSPL',
    host: 'junklist-app-download13.c9users.io'
});


const app = express();
const server = http.createServer(app);
const io = socketio(server);

/*
io.on('connection', socket => {
    socket.on('disconnect', () => console.log('Cleanup'));
	// TODO
});
*/

app.disable('x-powered-by');

app.use(express.static('dist/public', {index: false}));

app.use(authRouter);

app.use(routes);

server.listen(process.env.PORT || 80, process.env.IP, () => console.log('Listening'));
