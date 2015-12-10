import http from 'http';
import express from 'express';
import socketio from 'socket.io';

import createAuthMiddleware from '../modules/flux-authenticator/middleware';

import routes from './routes';

import {
    getOrCreateUser
} from './store/rethinkdb';


const authRouter = createAuthMiddleware({
    jwtSecret: 'dskajfidsuafdsf87das9f9',
    getOrCreateUser,
    clientID: '2cbdd79900e64484d3f8',
    clientSecret: 'c306035d51a35d12c099ff82830cc8998951ab48',
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
app.use(express.static('public', {index: false}));

app.use(authRouter);

app.use(routes);

server.listen(process.env.PORT || 80, process.env.IP, () => console.log('Listening'));
