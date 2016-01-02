import {Authenticator} from 'passport';
import {OAuth2Strategy} from 'passport-google-oauth';
import jwt from 'jsonwebtoken';
import createRouter from 'express/lib/router';

import {
    LOCALSTORAGE_TOKEN_KEY,
    LOGIN_PATH,
    CALLBACK_PATH
} from './constants';


export default function createAuthMiddleware(opts) {
    opts = {
        // jwtSecret required
        // getOrCreateUser required
        // clientID required
        // clientSecret required
        // host required
        callbackPath: CALLBACK_PATH,
        protocol: 'https:',
        loginPath: LOGIN_PATH,
        tokenStorageKey: LOCALSTORAGE_TOKEN_KEY,
        maxAge: '90d',
        ...opts
    };
    const router = createRouter();
    const authenticator = new Authenticator();
    
    authenticator.use(new OAuth2Strategy(
        {
            clientID: opts.clientID,
            clientSecret: opts.clientSecret,
            callbackURL: opts.protocol + '//' + opts.host + opts.callbackPath,
            scope: 'email'
        },
        (accessToken, refreshToken, profile, done) => {
            return done(null, {
                displayName: profile.displayName,
                email: profile.emails[0].value
            });
        }
    ));
    
    router.use((req, res, next) => {
        let token = req.headers.authorization || '';
        
        try {
            req.user = jwt.verify(token, opts.jwtSecret, {algorithms: ['HS256'], maxAge: opts.maxAge});
        } catch(e) {
            //console.log('JWT verify error: ', e);
        }
        
        next();
    });
    
    router.get(opts.loginPath, authenticator.authenticate('google', {session: false}));
    
    router.get(opts.callbackPath, authenticator.authenticate('google', {session: false, failureRedirect: '/'}), (req, res) => {
        if(req.user) {
            opts.getOrCreateUser(req.user.email, req.user.displayName).then(user => {
                let token = jwt.sign(user, opts.jwtSecret, {algorithm: 'HS256'});
                res.send(`
                    <!DOCTYPE html>
                    <script>
                    localStorage.setItem('${opts.tokenStorageKey}', '${token}');
                    window.close();
                    </script>
                `);
            }, err => {
                res.status(500).send('User storage error')
            });
        } else {
            res.status(400).send('No user');
        }
    });
    
    return router;
}

export function authedOnlyMw(req, res, next) {
    if(!req.user) {
        res.status(401).send('Must be logged in to access this endpoint');
    } else {
        next();
    }
}