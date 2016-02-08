/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _http = __webpack_require__(1);

	var _http2 = _interopRequireDefault(_http);

	var _express = __webpack_require__(2);

	var _express2 = _interopRequireDefault(_express);

	var _socket = __webpack_require__(3);

	var _socket2 = _interopRequireDefault(_socket);

	var _middleware = __webpack_require__(4);

	var _middleware2 = _interopRequireDefault(_middleware);

	var _routes = __webpack_require__(85);

	var _routes2 = _interopRequireDefault(_routes);

	var _user = __webpack_require__(157);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var authRouter = (0, _middleware2.default)({
	    jwtSecret: 'dskajfidsuafdsf87das9f9',
	    getOrCreateUser: _user.getOrCreateUser,
	    clientID: '782271593008-ojlttrvpijmao9d5vac603ntvvb9cc3p.apps.googleusercontent.com',
	    clientSecret: 'utKlzH7q96Xa0tn1Tow7zSPL',
	    host: 'junklist-app-download13.c9users.io'
	});

	var app = (0, _express2.default)();
	var server = _http2.default.createServer(app);
	var io = (0, _socket2.default)(server);

	/*
	io.on('connection', socket => {
	    socket.on('disconnect', () => console.log('Cleanup'));
		// TODO
	});
	*/

	app.disable('x-powered-by');

	app.use(_express2.default.static('public', { index: false }));

	app.use(authRouter);

	app.use(_routes2.default);

	server.listen(process.env.PORT || 80, process.env.IP, function () {
	    return console.log('Listening');
	});

/***/ },
/* 1 */
/***/ function(module, exports) {

	module.exports = require("http");

/***/ },
/* 2 */
/***/ function(module, exports) {

	module.exports = express;

/***/ },
/* 3 */
/***/ function(module, exports) {

	module.exports = socket.io;

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.default = createAuthMiddleware;
	exports.authedOnlyMw = authedOnlyMw;

	var _passport = __webpack_require__(5);

	var _passportGoogleOauth = __webpack_require__(17);

	var _jsonwebtoken = __webpack_require__(46);

	var _jsonwebtoken2 = _interopRequireDefault(_jsonwebtoken);

	var _router = __webpack_require__(67);

	var _router2 = _interopRequireDefault(_router);

	var _constants = __webpack_require__(84);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function createAuthMiddleware(opts) {
	    opts = _extends({
	        // jwtSecret required
	        // getOrCreateUser required
	        // clientID required
	        // clientSecret required
	        // host required
	        callbackPath: _constants.CALLBACK_PATH,
	        protocol: 'https:',
	        loginPath: _constants.LOGIN_PATH,
	        tokenStorageKey: _constants.LOCALSTORAGE_TOKEN_KEY,
	        maxAge: '90d'
	    }, opts);
	    var router = (0, _router2.default)();
	    var authenticator = new _passport.Authenticator();

	    authenticator.use(new _passportGoogleOauth.OAuth2Strategy({
	        clientID: opts.clientID,
	        clientSecret: opts.clientSecret,
	        callbackURL: opts.protocol + '//' + opts.host + opts.callbackPath,
	        scope: 'email'
	    }, function (accessToken, refreshToken, profile, done) {
	        return done(null, {
	            displayName: profile.displayName,
	            email: profile.emails[0].value
	        });
	    }));

	    router.use(function (req, res, next) {
	        var token = req.headers.authorization || '';

	        try {
	            req.user = _jsonwebtoken2.default.verify(token, opts.jwtSecret, { algorithms: ['HS256'], maxAge: opts.maxAge });
	        } catch (e) {
	            //console.log('JWT verify error: ', e);
	        }

	        next();
	    });

	    router.get(opts.loginPath, authenticator.authenticate('google', { session: false }));

	    router.get(opts.callbackPath, authenticator.authenticate('google', { session: false, failureRedirect: '/' }), function (req, res) {
	        if (req.user) {
	            opts.getOrCreateUser(req.user.email, req.user.displayName).then(function (user) {
	                var token = _jsonwebtoken2.default.sign(user, opts.jwtSecret, { algorithm: 'HS256' });
	                res.send('\n                    <!DOCTYPE html>\n                    <script>\n                    localStorage.setItem(\'' + opts.tokenStorageKey + '\', \'' + token + '\');\n                    window.close();\n                    </script>\n                ');
	            }, function (err) {
	                res.status(500).send('User storage error');
	            });
	        } else {
	            res.status(400).send('No user');
	        }
	    });

	    return router;
	}

	function authedOnlyMw(req, res, next) {
	    if (!req.user) {
	        res.status(401).send('Must be logged in to access this endpoint');
	    } else {
	        next();
	    }
	}

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Module dependencies.
	 */
	var Passport = __webpack_require__(6)
	  , SessionStrategy = __webpack_require__(7);


	/**
	 * Export default singleton.
	 *
	 * @api public
	 */
	exports = module.exports = new Passport();

	/**
	 * Expose constructors.
	 */
	exports.Passport =
	exports.Authenticator = Passport;
	exports.Strategy = __webpack_require__(10);

	/**
	 * Expose strategies.
	 */
	exports.strategies = {};
	exports.strategies.SessionStrategy = SessionStrategy;


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Module dependencies.
	 */
	var SessionStrategy = __webpack_require__(7);


	/**
	 * `Authenticator` constructor.
	 *
	 * @api public
	 */
	function Authenticator() {
	  this._key = 'passport';
	  this._strategies = {};
	  this._serializers = [];
	  this._deserializers = [];
	  this._infoTransformers = [];
	  this._framework = null;
	  this._userProperty = 'user';
	  
	  this.init();
	}

	/**
	 * Initialize authenticator.
	 *
	 * @api protected
	 */
	Authenticator.prototype.init = function() {
	  this.framework(__webpack_require__(12)());
	  this.use(new SessionStrategy());
	};

	/**
	 * Utilize the given `strategy` with optional `name`, overridding the strategy's
	 * default name.
	 *
	 * Examples:
	 *
	 *     passport.use(new TwitterStrategy(...));
	 *
	 *     passport.use('api', new http.BasicStrategy(...));
	 *
	 * @param {String|Strategy} name
	 * @param {Strategy} strategy
	 * @return {Authenticator} for chaining
	 * @api public
	 */
	Authenticator.prototype.use = function(name, strategy) {
	  if (!strategy) {
	    strategy = name;
	    name = strategy.name;
	  }
	  if (!name) { throw new Error('Authentication strategies must have a name'); }
	  
	  this._strategies[name] = strategy;
	  return this;
	};

	/**
	 * Un-utilize the `strategy` with given `name`.
	 *
	 * In typical applications, the necessary authentication strategies are static,
	 * configured once and always available.  As such, there is often no need to
	 * invoke this function.
	 *
	 * However, in certain situations, applications may need dynamically configure
	 * and de-configure authentication strategies.  The `use()`/`unuse()`
	 * combination satisfies these scenarios.
	 *
	 * Examples:
	 *
	 *     passport.unuse('legacy-api');
	 *
	 * @param {String} name
	 * @return {Authenticator} for chaining
	 * @api public
	 */
	Authenticator.prototype.unuse = function(name) {
	  delete this._strategies[name];
	  return this;
	};

	/**
	 * Setup Passport to be used under framework.
	 *
	 * By default, Passport exposes middleware that operate using Connect-style
	 * middleware using a `fn(req, res, next)` signature.  Other popular frameworks
	 * have different expectations, and this function allows Passport to be adapted
	 * to operate within such environments.
	 *
	 * If you are using a Connect-compatible framework, including Express, there is
	 * no need to invoke this function.
	 *
	 * Examples:
	 *
	 *     passport.framework(require('hapi-passport')());
	 *
	 * @param {Object} name
	 * @return {Authenticator} for chaining
	 * @api public
	 */
	Authenticator.prototype.framework = function(fw) {
	  this._framework = fw;
	  return this;
	};

	/**
	 * Passport's primary initialization middleware.
	 *
	 * This middleware must be in use by the Connect/Express application for
	 * Passport to operate.
	 *
	 * Options:
	 *   - `userProperty`  Property to set on `req` upon login, defaults to _user_
	 *
	 * Examples:
	 *
	 *     app.use(passport.initialize());
	 *
	 *     app.use(passport.initialize({ userProperty: 'currentUser' }));
	 *
	 * @param {Object} options
	 * @return {Function} middleware
	 * @api public
	 */
	Authenticator.prototype.initialize = function(options) {
	  options = options || {};
	  this._userProperty = options.userProperty || 'user';
	  
	  return this._framework.initialize(this, options);
	};

	/**
	 * Middleware that will authenticate a request using the given `strategy` name,
	 * with optional `options` and `callback`.
	 *
	 * Examples:
	 *
	 *     passport.authenticate('local', { successRedirect: '/', failureRedirect: '/login' })(req, res);
	 *
	 *     passport.authenticate('local', function(err, user) {
	 *       if (!user) { return res.redirect('/login'); }
	 *       res.end('Authenticated!');
	 *     })(req, res);
	 *
	 *     passport.authenticate('basic', { session: false })(req, res);
	 *
	 *     app.get('/auth/twitter', passport.authenticate('twitter'), function(req, res) {
	 *       // request will be redirected to Twitter
	 *     });
	 *     app.get('/auth/twitter/callback', passport.authenticate('twitter'), function(req, res) {
	 *       res.json(req.user);
	 *     });
	 *
	 * @param {String} strategy
	 * @param {Object} options
	 * @param {Function} callback
	 * @return {Function} middleware
	 * @api public
	 */
	Authenticator.prototype.authenticate = function(strategy, options, callback) {
	  return this._framework.authenticate(this, strategy, options, callback);
	};

	/**
	 * Middleware that will authorize a third-party account using the given
	 * `strategy` name, with optional `options`.
	 *
	 * If authorization is successful, the result provided by the strategy's verify
	 * callback will be assigned to `req.account`.  The existing login session and
	 * `req.user` will be unaffected.
	 *
	 * This function is particularly useful when connecting third-party accounts
	 * to the local account of a user that is currently authenticated.
	 *
	 * Examples:
	 *
	 *    passport.authorize('twitter-authz', { failureRedirect: '/account' });
	 *
	 * @param {String} strategy
	 * @param {Object} options
	 * @return {Function} middleware
	 * @api public
	 */
	Authenticator.prototype.authorize = function(strategy, options, callback) {
	  options = options || {};
	  options.assignProperty = 'account';
	  
	  var fn = this._framework.authorize || this._framework.authenticate;
	  return fn(this, strategy, options, callback);
	};

	/**
	 * Middleware that will restore login state from a session.
	 *
	 * Web applications typically use sessions to maintain login state between
	 * requests.  For example, a user will authenticate by entering credentials into
	 * a form which is submitted to the server.  If the credentials are valid, a
	 * login session is established by setting a cookie containing a session
	 * identifier in the user's web browser.  The web browser will send this cookie
	 * in subsequent requests to the server, allowing a session to be maintained.
	 *
	 * If sessions are being utilized, and a login session has been established,
	 * this middleware will populate `req.user` with the current user.
	 *
	 * Note that sessions are not strictly required for Passport to operate.
	 * However, as a general rule, most web applications will make use of sessions.
	 * An exception to this rule would be an API server, which expects each HTTP
	 * request to provide credentials in an Authorization header.
	 *
	 * Examples:
	 *
	 *     app.use(connect.cookieParser());
	 *     app.use(connect.session({ secret: 'keyboard cat' }));
	 *     app.use(passport.initialize());
	 *     app.use(passport.session());
	 *
	 * Options:
	 *   - `pauseStream`      Pause the request stream before deserializing the user
	 *                        object from the session.  Defaults to _false_.  Should
	 *                        be set to true in cases where middleware consuming the
	 *                        request body is configured after passport and the
	 *                        deserializeUser method is asynchronous.
	 *
	 * @param {Object} options
	 * @return {Function} middleware
	 * @api public
	 */
	Authenticator.prototype.session = function(options) {
	  return this.authenticate('session', options);
	};

	/**
	 * Registers a function used to serialize user objects into the session.
	 *
	 * Examples:
	 *
	 *     passport.serializeUser(function(user, done) {
	 *       done(null, user.id);
	 *     });
	 *
	 * @api public
	 */
	Authenticator.prototype.serializeUser = function(fn, req, done) {
	  if (typeof fn === 'function') {
	    return this._serializers.push(fn);
	  }
	  
	  // private implementation that traverses the chain of serializers, attempting
	  // to serialize a user
	  var user = fn;

	  // For backwards compatibility
	  if (typeof req === 'function') {
	    done = req;
	    req = undefined;
	  }
	  
	  var stack = this._serializers;
	  (function pass(i, err, obj) {
	    // serializers use 'pass' as an error to skip processing
	    if ('pass' === err) {
	      err = undefined;
	    }
	    // an error or serialized object was obtained, done
	    if (err || obj || obj === 0) { return done(err, obj); }
	    
	    var layer = stack[i];
	    if (!layer) {
	      return done(new Error('Failed to serialize user into session'));
	    }
	    
	    
	    function serialized(e, o) {
	      pass(i + 1, e, o);
	    }
	    
	    try {
	      var arity = layer.length;
	      if (arity == 3) {
	        layer(req, user, serialized);
	      } else {
	        layer(user, serialized);
	      }
	    } catch(e) {
	      return done(e);
	    }
	  })(0);
	};

	/**
	 * Registers a function used to deserialize user objects out of the session.
	 *
	 * Examples:
	 *
	 *     passport.deserializeUser(function(id, done) {
	 *       User.findById(id, function (err, user) {
	 *         done(err, user);
	 *       });
	 *     });
	 *
	 * @api public
	 */
	Authenticator.prototype.deserializeUser = function(fn, req, done) {
	  if (typeof fn === 'function') {
	    return this._deserializers.push(fn);
	  }
	  
	  // private implementation that traverses the chain of deserializers,
	  // attempting to deserialize a user
	  var obj = fn;

	  // For backwards compatibility
	  if (typeof req === 'function') {
	    done = req;
	    req = undefined;
	  }
	  
	  var stack = this._deserializers;
	  (function pass(i, err, user) {
	    // deserializers use 'pass' as an error to skip processing
	    if ('pass' === err) {
	      err = undefined;
	    }
	    // an error or deserialized user was obtained, done
	    if (err || user) { return done(err, user); }
	    // a valid user existed when establishing the session, but that user has
	    // since been removed
	    if (user === null || user === false) { return done(null, false); }
	    
	    var layer = stack[i];
	    if (!layer) {
	      return done(new Error('Failed to deserialize user out of session'));
	    }
	    
	    
	    function deserialized(e, u) {
	      pass(i + 1, e, u);
	    }
	    
	    try {
	      var arity = layer.length;
	      if (arity == 3) {
	        layer(req, obj, deserialized);
	      } else {
	        layer(obj, deserialized);
	      }
	    } catch(e) {
	      return done(e);
	    }
	  })(0);
	};

	/**
	 * Registers a function used to transform auth info.
	 *
	 * In some circumstances authorization details are contained in authentication
	 * credentials or loaded as part of verification.
	 *
	 * For example, when using bearer tokens for API authentication, the tokens may
	 * encode (either directly or indirectly in a database), details such as scope
	 * of access or the client to which the token was issued.
	 *
	 * Such authorization details should be enforced separately from authentication.
	 * Because Passport deals only with the latter, this is the responsiblity of
	 * middleware or routes further along the chain.  However, it is not optimal to
	 * decode the same data or execute the same database query later.  To avoid
	 * this, Passport accepts optional `info` along with the authenticated `user`
	 * in a strategy's `success()` action.  This info is set at `req.authInfo`,
	 * where said later middlware or routes can access it.
	 *
	 * Optionally, applications can register transforms to proccess this info,
	 * which take effect prior to `req.authInfo` being set.  This is useful, for
	 * example, when the info contains a client ID.  The transform can load the
	 * client from the database and include the instance in the transformed info,
	 * allowing the full set of client properties to be convieniently accessed.
	 *
	 * If no transforms are registered, `info` supplied by the strategy will be left
	 * unmodified.
	 *
	 * Examples:
	 *
	 *     passport.transformAuthInfo(function(info, done) {
	 *       Client.findById(info.clientID, function (err, client) {
	 *         info.client = client;
	 *         done(err, info);
	 *       });
	 *     });
	 *
	 * @api public
	 */
	Authenticator.prototype.transformAuthInfo = function(fn, req, done) {
	  if (typeof fn === 'function') {
	    return this._infoTransformers.push(fn);
	  }
	  
	  // private implementation that traverses the chain of transformers,
	  // attempting to transform auth info
	  var info = fn;

	  // For backwards compatibility
	  if (typeof req === 'function') {
	    done = req;
	    req = undefined;
	  }
	  
	  var stack = this._infoTransformers;
	  (function pass(i, err, tinfo) {
	    // transformers use 'pass' as an error to skip processing
	    if ('pass' === err) {
	      err = undefined;
	    }
	    // an error or transformed info was obtained, done
	    if (err || tinfo) { return done(err, tinfo); }
	    
	    var layer = stack[i];
	    if (!layer) {
	      // if no transformers are registered (or they all pass), the default
	      // behavior is to use the un-transformed info as-is
	      return done(null, info);
	    }
	    
	    
	    function transformed(e, t) {
	      pass(i + 1, e, t);
	    }
	    
	    try {
	      var arity = layer.length;
	      if (arity == 1) {
	        // sync
	        var t = layer(info);
	        transformed(null, t);
	      } else if (arity == 3) {
	        layer(req, info, transformed);
	      } else {
	        layer(info, transformed);
	      }
	    } catch(e) {
	      return done(e);
	    }
	  })(0);
	};

	/**
	 * Return strategy with given `name`. 
	 *
	 * @param {String} name
	 * @return {Strategy}
	 * @api private
	 */
	Authenticator.prototype._strategy = function(name) {
	  return this._strategies[name];
	};


	/**
	 * Expose `Authenticator`.
	 */
	module.exports = Authenticator;


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Module dependencies.
	 */
	var pause = __webpack_require__(8)
	  , util = __webpack_require__(9)
	  , Strategy = __webpack_require__(10);


	/**
	 * `SessionStrategy` constructor.
	 *
	 * @api public
	 */
	function SessionStrategy() {
	  Strategy.call(this);
	  this.name = 'session';
	}

	/**
	 * Inherit from `Strategy`.
	 */
	util.inherits(SessionStrategy, Strategy);

	/**
	 * Authenticate request based on the current session state.
	 *
	 * The session authentication strategy uses the session to restore any login
	 * state across requests.  If a login session has been established, `req.user`
	 * will be populated with the current user.
	 *
	 * This strategy is registered automatically by Passport.
	 *
	 * @param {Object} req
	 * @param {Object} options
	 * @api protected
	 */
	SessionStrategy.prototype.authenticate = function(req, options) {
	  if (!req._passport) { return this.error(new Error('passport.initialize() middleware not in use')); }
	  options = options || {};

	  var self = this, 
	      su;
	  if (req._passport.session) {
	    su = req._passport.session.user;
	  }

	  if (su || su === 0) {
	    // NOTE: Stream pausing is desirable in the case where later middleware is
	    //       listening for events emitted from request.  For discussion on the
	    //       matter, refer to: https://github.com/jaredhanson/passport/pull/106
	    
	    var paused = options.pauseStream ? pause(req) : null;
	    req._passport.instance.deserializeUser(su, req, function(err, user) {
	      if (err) { return self.error(err); }
	      if (!user) {
	        delete req._passport.session.user;
	        self.pass();
	        if (paused) {
	          paused.resume();
	        }
	        return;
	      }
	      var property = req._passport.instance._userProperty || 'user';
	      req[property] = user;
	      self.pass();
	      if (paused) {
	        paused.resume();
	      }
	    });
	  } else {
	    self.pass();
	  }
	};


	/**
	 * Expose `SessionStrategy`.
	 */
	module.exports = SessionStrategy;


/***/ },
/* 8 */
/***/ function(module, exports) {

	
	module.exports = function(obj){
	  var onData
	    , onEnd
	    , events = [];

	  // buffer data
	  obj.on('data', onData = function(data, encoding){
	    events.push(['data', data, encoding]);
	  });

	  // buffer end
	  obj.on('end', onEnd = function(data, encoding){
	    events.push(['end', data, encoding]);
	  });

	  return {
	    end: function(){
	      obj.removeListener('data', onData);
	      obj.removeListener('end', onEnd);
	    },
	    resume: function(){
	      this.end();
	      for (var i = 0, len = events.length; i < len; ++i) {
	        obj.emit.apply(obj, events[i]);
	      }
	    }
	  };
	};

/***/ },
/* 9 */
/***/ function(module, exports) {

	module.exports = require("util");

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Module dependencies.
	 */
	var Strategy = __webpack_require__(11);


	/**
	 * Expose `Strategy` directly from package.
	 */
	exports = module.exports = Strategy;

	/**
	 * Export constructors.
	 */
	exports.Strategy = Strategy;


/***/ },
/* 11 */
/***/ function(module, exports) {

	/**
	 * Creates an instance of `Strategy`.
	 *
	 * @constructor
	 * @api public
	 */
	function Strategy() {
	}

	/**
	 * Authenticate request.
	 *
	 * This function must be overridden by subclasses.  In abstract form, it always
	 * throws an exception.
	 *
	 * @param {Object} req The request to authenticate.
	 * @param {Object} [options] Strategy-specific options.
	 * @api public
	 */
	Strategy.prototype.authenticate = function(req, options) {
	  throw new Error('Strategy#authenticate must be overridden by subclass');
	};


	/**
	 * Expose `Strategy`.
	 */
	module.exports = Strategy;


/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Module dependencies.
	 */
	var initialize = __webpack_require__(13)
	  , authenticate = __webpack_require__(14);
	  
	/**
	 * Framework support for Connect/Express.
	 *
	 * This module provides support for using Passport with Express.  It exposes
	 * middleware that conform to the `fn(req, res, next)` signature and extends
	 * Node's built-in HTTP request object with useful authentication-related
	 * functions.
	 *
	 * @return {Object}
	 * @api protected
	 */
	exports = module.exports = function() {
	  
	  // HTTP extensions.
	  exports.__monkeypatchNode();
	  
	  return {
	    initialize: initialize,
	    authenticate: authenticate
	  };
	};

	exports.__monkeypatchNode = function() {
	  var http = __webpack_require__(1);
	  var IncomingMessageExt = __webpack_require__(15);
	  
	  http.IncomingMessage.prototype.login =
	  http.IncomingMessage.prototype.logIn = IncomingMessageExt.logIn;
	  http.IncomingMessage.prototype.logout =
	  http.IncomingMessage.prototype.logOut = IncomingMessageExt.logOut;
	  http.IncomingMessage.prototype.isAuthenticated = IncomingMessageExt.isAuthenticated;
	  http.IncomingMessage.prototype.isUnauthenticated = IncomingMessageExt.isUnauthenticated;
	};


/***/ },
/* 13 */
/***/ function(module, exports) {

	/**
	 * Passport initialization.
	 *
	 * Intializes Passport for incoming requests, allowing authentication strategies
	 * to be applied.
	 *
	 * If sessions are being utilized, applications must set up Passport with
	 * functions to serialize a user into and out of a session.  For example, a
	 * common pattern is to serialize just the user ID into the session (due to the
	 * fact that it is desirable to store the minimum amount of data in a session).
	 * When a subsequent request arrives for the session, the full User object can
	 * be loaded from the database by ID.
	 *
	 * Note that additional middleware is required to persist login state, so we
	 * must use the `connect.session()` middleware _before_ `passport.initialize()`.
	 *
	 * If sessions are being used, this middleware must be in use by the
	 * Connect/Express application for Passport to operate.  If the application is
	 * entirely stateless (not using sessions), this middleware is not necessary,
	 * but its use will not have any adverse impact.
	 *
	 * Examples:
	 *
	 *     app.use(connect.cookieParser());
	 *     app.use(connect.session({ secret: 'keyboard cat' }));
	 *     app.use(passport.initialize());
	 *     app.use(passport.session());
	 *
	 *     passport.serializeUser(function(user, done) {
	 *       done(null, user.id);
	 *     });
	 *
	 *     passport.deserializeUser(function(id, done) {
	 *       User.findById(id, function (err, user) {
	 *         done(err, user);
	 *       });
	 *     });
	 *
	 * @return {Function}
	 * @api public
	 */
	module.exports = function initialize(passport) {
	  
	  return function initialize(req, res, next) {
	    req._passport = {};
	    req._passport.instance = passport;

	    if (req.session && req.session[passport._key]) {
	      // load data from existing session
	      req._passport.session = req.session[passport._key];
	    }

	    next();
	  };
	};


/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Module dependencies.
	 */
	var http = __webpack_require__(1)
	  , IncomingMessageExt = __webpack_require__(15)
	  , AuthenticationError = __webpack_require__(16);


	/**
	 * Authenticates requests.
	 *
	 * Applies the `name`ed strategy (or strategies) to the incoming request, in
	 * order to authenticate the request.  If authentication is successful, the user
	 * will be logged in and populated at `req.user` and a session will be
	 * established by default.  If authentication fails, an unauthorized response
	 * will be sent.
	 *
	 * Options:
	 *   - `session`          Save login state in session, defaults to _true_
	 *   - `successRedirect`  After successful login, redirect to given URL
	 *   - `failureRedirect`  After failed login, redirect to given URL
	 *   - `assignProperty`   Assign the object provided by the verify callback to given property
	 *
	 * An optional `callback` can be supplied to allow the application to overrride
	 * the default manner in which authentication attempts are handled.  The
	 * callback has the following signature, where `user` will be set to the
	 * authenticated user on a successful authentication attempt, or `false`
	 * otherwise.  An optional `info` argument will be passed, containing additional
	 * details provided by the strategy's verify callback.
	 *
	 *     app.get('/protected', function(req, res, next) {
	 *       passport.authenticate('local', function(err, user, info) {
	 *         if (err) { return next(err) }
	 *         if (!user) { return res.redirect('/signin') }
	 *         res.redirect('/account');
	 *       })(req, res, next);
	 *     });
	 *
	 * Note that if a callback is supplied, it becomes the application's
	 * responsibility to log-in the user, establish a session, and otherwise perform
	 * the desired operations.
	 *
	 * Examples:
	 *
	 *     passport.authenticate('local', { successRedirect: '/', failureRedirect: '/login' });
	 *
	 *     passport.authenticate('basic', { session: false });
	 *
	 *     passport.authenticate('twitter');
	 *
	 * @param {String|Array} name
	 * @param {Object} options
	 * @param {Function} callback
	 * @return {Function}
	 * @api public
	 */
	module.exports = function authenticate(passport, name, options, callback) {
	  if (typeof options == 'function') {
	    callback = options;
	    options = {};
	  }
	  options = options || {};
	  
	  var multi = true;
	  
	  // Cast `name` to an array, allowing authentication to pass through a chain of
	  // strategies.  The first strategy to succeed, redirect, or error will halt
	  // the chain.  Authentication failures will proceed through each strategy in
	  // series, ultimately failing if all strategies fail.
	  //
	  // This is typically used on API endpoints to allow clients to authenticate
	  // using their preferred choice of Basic, Digest, token-based schemes, etc.
	  // It is not feasible to construct a chain of multiple strategies that involve
	  // redirection (for example both Facebook and Twitter), since the first one to
	  // redirect will halt the chain.
	  if (!Array.isArray(name)) {
	    name = [ name ];
	    multi = false;
	  }
	  
	  return function authenticate(req, res, next) {
	    if (http.IncomingMessage.prototype.logIn
	        && http.IncomingMessage.prototype.logIn !== IncomingMessageExt.logIn) {
	      __webpack_require__(12).__monkeypatchNode();
	    }
	    
	    
	    // accumulator for failures from each strategy in the chain
	    var failures = [];
	    
	    function allFailed() {
	      if (callback) {
	        if (!multi) {
	          return callback(null, false, failures[0].challenge, failures[0].status);
	        } else {
	          var challenges = failures.map(function(f) { return f.challenge; });
	          var statuses = failures.map(function(f) { return f.status; });
	          return callback(null, false, challenges, statuses);
	        }
	      }
	      
	      // Strategies are ordered by priority.  For the purpose of flashing a
	      // message, the first failure will be displayed.
	      var failure = failures[0] || {}
	        , challenge = failure.challenge || {}
	        , msg;
	    
	      if (options.failureFlash) {
	        var flash = options.failureFlash;
	        if (typeof flash == 'string') {
	          flash = { type: 'error', message: flash };
	        }
	        flash.type = flash.type || 'error';
	      
	        var type = flash.type || challenge.type || 'error';
	        msg = flash.message || challenge.message || challenge;
	        if (typeof msg == 'string') {
	          req.flash(type, msg);
	        }
	      }
	      if (options.failureMessage) {
	        msg = options.failureMessage;
	        if (typeof msg == 'boolean') {
	          msg = challenge.message || challenge;
	        }
	        if (typeof msg == 'string') {
	          req.session.messages = req.session.messages || [];
	          req.session.messages.push(msg);
	        }
	      }
	      if (options.failureRedirect) {
	        return res.redirect(options.failureRedirect);
	      }
	    
	      // When failure handling is not delegated to the application, the default
	      // is to respond with 401 Unauthorized.  Note that the WWW-Authenticate
	      // header will be set according to the strategies in use (see
	      // actions#fail).  If multiple strategies failed, each of their challenges
	      // will be included in the response.
	      var rchallenge = []
	        , rstatus, status;
	      
	      for (var j = 0, len = failures.length; j < len; j++) {
	        failure = failures[j];
	        challenge = failure.challenge;
	        status = failure.status;
	          
	        rstatus = rstatus || status;
	        if (typeof challenge == 'string') {
	          rchallenge.push(challenge);
	        }
	      }
	    
	      res.statusCode = rstatus || 401;
	      if (res.statusCode == 401 && rchallenge.length) {
	        res.setHeader('WWW-Authenticate', rchallenge);
	      }
	      if (options.failWithError) {
	        return next(new AuthenticationError(http.STATUS_CODES[res.statusCode], rstatus));
	      }
	      res.end(http.STATUS_CODES[res.statusCode]);
	    }
	    
	    (function attempt(i) {
	      var layer = name[i];
	      // If no more strategies exist in the chain, authentication has failed.
	      if (!layer) { return allFailed(); }
	    
	      // Get the strategy, which will be used as prototype from which to create
	      // a new instance.  Action functions will then be bound to the strategy
	      // within the context of the HTTP request/response pair.
	      var prototype = passport._strategy(layer);
	      if (!prototype) { return next(new Error('Unknown authentication strategy "' + layer + '"')); }
	    
	      var strategy = Object.create(prototype);
	      
	      
	      // ----- BEGIN STRATEGY AUGMENTATION -----
	      // Augment the new strategy instance with action functions.  These action
	      // functions are bound via closure the the request/response pair.  The end
	      // goal of the strategy is to invoke *one* of these action methods, in
	      // order to indicate successful or failed authentication, redirect to a
	      // third-party identity provider, etc.
	      
	      /**
	       * Authenticate `user`, with optional `info`.
	       *
	       * Strategies should call this function to successfully authenticate a
	       * user.  `user` should be an object supplied by the application after it
	       * has been given an opportunity to verify credentials.  `info` is an
	       * optional argument containing additional user information.  This is
	       * useful for third-party authentication strategies to pass profile
	       * details.
	       *
	       * @param {Object} user
	       * @param {Object} info
	       * @api public
	       */
	      strategy.success = function(user, info) {
	        if (callback) {
	          return callback(null, user, info);
	        }
	      
	        info = info || {};
	        var msg;
	      
	        if (options.successFlash) {
	          var flash = options.successFlash;
	          if (typeof flash == 'string') {
	            flash = { type: 'success', message: flash };
	          }
	          flash.type = flash.type || 'success';
	        
	          var type = flash.type || info.type || 'success';
	          msg = flash.message || info.message || info;
	          if (typeof msg == 'string') {
	            req.flash(type, msg);
	          }
	        }
	        if (options.successMessage) {
	          msg = options.successMessage;
	          if (typeof msg == 'boolean') {
	            msg = info.message || info;
	          }
	          if (typeof msg == 'string') {
	            req.session.messages = req.session.messages || [];
	            req.session.messages.push(msg);
	          }
	        }
	        if (options.assignProperty) {
	          req[options.assignProperty] = user;
	          return next();
	        }
	      
	        req.logIn(user, options, function(err) {
	          if (err) { return next(err); }
	          
	          function complete() {
	            if (options.successReturnToOrRedirect) {
	              var url = options.successReturnToOrRedirect;
	              if (req.session && req.session.returnTo) {
	                url = req.session.returnTo;
	                delete req.session.returnTo;
	              }
	              return res.redirect(url);
	            }
	            if (options.successRedirect) {
	              return res.redirect(options.successRedirect);
	            }
	            next();
	          }
	          
	          if (options.authInfo !== false) {
	            passport.transformAuthInfo(info, req, function(err, tinfo) {
	              if (err) { return next(err); }
	              req.authInfo = tinfo;
	              complete();
	            });
	          } else {
	            complete();
	          }
	        });
	      };
	      
	      /**
	       * Fail authentication, with optional `challenge` and `status`, defaulting
	       * to 401.
	       *
	       * Strategies should call this function to fail an authentication attempt.
	       *
	       * @param {String} challenge
	       * @param {Number} status
	       * @api public
	       */
	      strategy.fail = function(challenge, status) {
	        if (typeof challenge == 'number') {
	          status = challenge;
	          challenge = undefined;
	        }
	        
	        // push this failure into the accumulator and attempt authentication
	        // using the next strategy
	        failures.push({ challenge: challenge, status: status });
	        attempt(i + 1);
	      };
	      
	      /**
	       * Redirect to `url` with optional `status`, defaulting to 302.
	       *
	       * Strategies should call this function to redirect the user (via their
	       * user agent) to a third-party website for authentication.
	       *
	       * @param {String} url
	       * @param {Number} status
	       * @api public
	       */
	      strategy.redirect = function(url, status) {
	        // NOTE: Do not use `res.redirect` from Express, because it can't decide
	        //       what it wants.
	        //
	        //       Express 2.x: res.redirect(url, status)
	        //       Express 3.x: res.redirect(status, url) -OR- res.redirect(url, status)
	        //         - as of 3.14.0, deprecated warnings are issued if res.redirect(url, status)
	        //           is used
	        //       Express 4.x: res.redirect(status, url)
	        //         - all versions (as of 4.8.7) continue to accept res.redirect(url, status)
	        //           but issue deprecated versions
	        
	        res.statusCode = status || 302;
	        res.setHeader('Location', url);
	        res.setHeader('Content-Length', '0');
	        res.end();
	      };
	      
	      /**
	       * Pass without making a success or fail decision.
	       *
	       * Under most circumstances, Strategies should not need to call this
	       * function.  It exists primarily to allow previous authentication state
	       * to be restored, for example from an HTTP session.
	       *
	       * @api public
	       */
	      strategy.pass = function() {
	        next();
	      };
	      
	      /**
	       * Internal error while performing authentication.
	       *
	       * Strategies should call this function when an internal error occurs
	       * during the process of performing authentication; for example, if the
	       * user directory is not available.
	       *
	       * @param {Error} err
	       * @api public
	       */
	      strategy.error = function(err) {
	        if (callback) {
	          return callback(err);
	        }
	        
	        next(err);
	      };
	      
	      // ----- END STRATEGY AUGMENTATION -----
	    
	      strategy.authenticate(req, options);
	    })(0); // attempt
	  };
	};


/***/ },
/* 15 */
/***/ function(module, exports) {

	/**
	 * Module dependencies.
	 */
	//var http = require('http')
	//  , req = http.IncomingMessage.prototype;


	var req = exports = module.exports = {};

	/**
	 * Intiate a login session for `user`.
	 *
	 * Options:
	 *   - `session`  Save login state in session, defaults to _true_
	 *
	 * Examples:
	 *
	 *     req.logIn(user, { session: false });
	 *
	 *     req.logIn(user, function(err) {
	 *       if (err) { throw err; }
	 *       // session saved
	 *     });
	 *
	 * @param {User} user
	 * @param {Object} options
	 * @param {Function} done
	 * @api public
	 */
	req.login =
	req.logIn = function(user, options, done) {
	  if (typeof options == 'function') {
	    done = options;
	    options = {};
	  }
	  options = options || {};
	  
	  var property = 'user';
	  if (this._passport && this._passport.instance) {
	    property = this._passport.instance._userProperty || 'user';
	  }
	  var session = (options.session === undefined) ? true : options.session;
	  
	  this[property] = user;
	  if (session) {
	    if (!this._passport) { throw new Error('passport.initialize() middleware not in use'); }
	    if (typeof done != 'function') { throw new Error('req#login requires a callback function'); }
	    
	    var self = this;
	    this._passport.instance.serializeUser(user, this, function(err, obj) {
	      if (err) { self[property] = null; return done(err); }
	      if (!self._passport.session) {
	        self._passport.session = {};
	      }
	      self._passport.session.user = obj;
	      if (!self.session) {
	        self.session = {};
	      }
	      self.session[self._passport.instance._key] = self._passport.session;
	      done();
	    });
	  } else {
	    done && done();
	  }
	};

	/**
	 * Terminate an existing login session.
	 *
	 * @api public
	 */
	req.logout =
	req.logOut = function() {
	  var property = 'user';
	  if (this._passport && this._passport.instance) {
	    property = this._passport.instance._userProperty || 'user';
	  }
	  
	  this[property] = null;
	  if (this._passport && this._passport.session) {
	    delete this._passport.session.user;
	  }
	};

	/**
	 * Test if request is authenticated.
	 *
	 * @return {Boolean}
	 * @api public
	 */
	req.isAuthenticated = function() {
	  var property = 'user';
	  if (this._passport && this._passport.instance) {
	    property = this._passport.instance._userProperty || 'user';
	  }
	  
	  return (this[property]) ? true : false;
	};

	/**
	 * Test if request is unauthenticated.
	 *
	 * @return {Boolean}
	 * @api public
	 */
	req.isUnauthenticated = function() {
	  return !this.isAuthenticated();
	};


/***/ },
/* 16 */
/***/ function(module, exports) {

	/**
	 * `AuthenticationError` error.
	 *
	 * @api private
	 */
	function AuthenticationError(message, status) {
	  Error.call(this);
	  Error.captureStackTrace(this, arguments.callee);
	  this.name = 'AuthenticationError';
	  this.message = message;
	  this.status = status || 401;
	}

	/**
	 * Inherit from `Error`.
	 */
	AuthenticationError.prototype.__proto__ = Error.prototype;


	/**
	 * Expose `AuthenticationError`.
	 */
	module.exports = AuthenticationError;


/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(module) {/**
	 * Module dependencies.
	 */
	var OAuthStrategy = __webpack_require__(19);
	var OAuth2Strategy = __webpack_require__(42);


	/**
	 * Framework version.
	 */
	__webpack_require__(43)(module, 'version');

	/**
	 * Expose constructors.
	 */
	exports.Strategy =
	exports.OAuthStrategy = OAuthStrategy;
	exports.OAuth2Strategy = OAuth2Strategy;

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(18)(module)))

/***/ },
/* 18 */
/***/ function(module, exports) {

	module.exports = function(module) {
		if(!module.webpackPolyfill) {
			module.deprecate = function() {};
			module.paths = [];
			// module.parent = undefined by default
			module.children = [];
			module.webpackPolyfill = 1;
		}
		return module;
	}


/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Module dependencies.
	 */
	var util = __webpack_require__(9)
	  , OAuthStrategy = __webpack_require__(20).OAuthStrategy
	  , InternalOAuthError = __webpack_require__(20).InternalOAuthError;


	/**
	 * `Strategy` constructor.
	 *
	 * The Google authentication strategy authenticates requests by delegating to
	 * Google using the OAuth protocol.
	 *
	 * Applications must supply a `verify` callback which accepts a `token`,
	 * `tokenSecret` and service-specific `profile`, and then calls the `done`
	 * callback supplying a `user`, which should be set to `false` if the
	 * credentials are not valid.  If an exception occured, `err` should be set.
	 *
	 * Options:
	 *   - `consumerKey`     identifies client to Google
	 *   - `consumerSecret`  secret used to establish ownership of the consumer key
	 *   - `callbackURL`     URL to which Google will redirect the user after obtaining authorization
	 *
	 * Examples:
	 *
	 *     passport.use(new GoogleStrategy({
	 *         consumerKey: '123-456-789',
	 *         consumerSecret: 'shhh-its-a-secret'
	 *         callbackURL: 'https://www.example.net/auth/google/callback'
	 *       },
	 *       function(token, tokenSecret, profile, done) {
	 *         User.findOrCreate(..., function (err, user) {
	 *           done(err, user);
	 *         });
	 *       }
	 *     ));
	 *
	 * @param {Object} options
	 * @param {Function} verify
	 * @api public
	 */
	function Strategy(options, verify) {
	  options = options || {};
	  options.requestTokenURL = options.requestTokenURL || 'https://www.google.com/accounts/OAuthGetRequestToken';
	  options.accessTokenURL = options.accessTokenURL || 'https://www.google.com/accounts/OAuthGetAccessToken';
	  options.userAuthorizationURL = options.userAuthorizationURL || 'https://www.google.com/accounts/OAuthAuthorizeToken';
	  options.sessionKey = options.sessionKey || 'oauth:google';

	  OAuthStrategy.call(this, options, verify);
	  this.name = 'google';
	}

	/**
	 * Inherit from `OAuthStrategy`.
	 */
	util.inherits(Strategy, OAuthStrategy);

	/**
	 * Retrieve user profile from Google.
	 *
	 * This function constructs a normalized profile, with the following properties:
	 *
	 *   - `id`
	 *   - `displayName`
	 *
	 * @param {String} token
	 * @param {String} tokenSecret
	 * @param {Object} params
	 * @param {Function} done
	 * @api protected
	 */
	Strategy.prototype.userProfile = function(token, tokenSecret, params, done) {
	  this._oauth.get('https://www.google.com/m8/feeds/contacts/default/full?max-results=1&alt=json', token, tokenSecret, function (err, body, res) {
	    if (err) { return done(new InternalOAuthError('failed to fetch user profile', err)); }
	    
	    try {
	      var json = JSON.parse(body);
	      
	      var profile = { provider: 'google' };
	      profile.id = json.feed.id['$t']
	      profile.displayName = json.feed.author[0].name['$t'];
	      profile.emails = [{ value: json.feed.author[0].email['$t'] }];
	      
	      profile._raw = body;
	      profile._json = json;
	      
	      done(null, profile);
	    } catch(e) {
	      done(e);
	    }
	  });
	}

	/**
	 * Return extra Google-specific parameters to be included in the request token
	 * request.
	 *
	 * @param {Object} options
	 * @return {Object}
	 * @api protected
	 */
	Strategy.prototype.requestTokenParams = function(options) {
	  var params = options || {};
	  
	  var scope = options.scope;
	  if (scope) {
	    if (Array.isArray(scope)) { scope = scope.join(' '); }
	    params['scope'] = scope;
	  }
	  return params;
	}


	/**
	 * Expose `Strategy`.
	 */
	module.exports = Strategy;


/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Module dependencies.
	 */
	var OAuthStrategy = __webpack_require__(21)
	  , OAuth2Strategy = __webpack_require__(35)
	  , InternalOAuthError = __webpack_require__(21).InternalOAuthError;


	/**
	 * Export constructors.
	 */
	exports.OAuthStrategy = OAuthStrategy;
	exports.OAuth2Strategy = OAuth2Strategy;

	/**
	 * Export errors.
	 */
	exports.InternalOAuthError = InternalOAuthError;


/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Module dependencies.
	 */
	var Strategy = __webpack_require__(22)
	  , InternalOAuthError = __webpack_require__(34);


	/**
	 * Expose `Strategy` directly from package.
	 */
	exports = module.exports = Strategy;

	/**
	 * Export constructors.
	 */
	exports.Strategy = Strategy;

	/**
	 * Export errors.
	 */
	exports.InternalOAuthError = InternalOAuthError;


/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Module dependencies.
	 */
	var passport = __webpack_require__(10)
	  , url = __webpack_require__(23)
	  , util = __webpack_require__(9)
	  , utils = __webpack_require__(24)
	  , OAuth = __webpack_require__(26).OAuth
	  , InternalOAuthError = __webpack_require__(34);


	/**
	 * Creates an instance of `OAuthStrategy`.
	 *
	 * The OAuth authentication strategy authenticates requests using the OAuth
	 * protocol.
	 *
	 * OAuth provides a facility for delegated authentication, whereby users can
	 * authenticate using a third-party service such as Twitter.  Delegating in this
	 * manner involves a sequence of events, including redirecting the user to the
	 * third-party service for authorization.  Once authorization has been obtained,
	 * the user is redirected back to the application and a token can be used to
	 * obtain credentials.
	 *
	 * Applications must supply a `verify` callback, for which the function
	 * signature is:
	 *
	 *     function(token, tokenSecret, profile, done) { ... }
	 *
	 * The verify callback is responsible for finding or creating the user, and
	 * invoking `done` with the following arguments:
	 *
	 *     done(err, user, info);
	 *
	 * `user` should be set to `false` to indicate an authentication failure.
	 * Additional `info` can optionally be passed as a third argument, typically
	 * used to display informational messages.  If an exception occured, `err`
	 * should be set.
	 *
	 * Options:
	 *
	 *   - `requestTokenURL`       URL used to obtain an unauthorized request token
	 *   - `accessTokenURL`        URL used to exchange a user-authorized request token for an access token
	 *   - `userAuthorizationURL`  URL used to obtain user authorization
	 *   - `consumerKey`           identifies client to service provider
	 *   - `consumerSecret`        secret used to establish ownership of the consumer key
	 *   - `callbackURL`           URL to which the service provider will redirect the user after obtaining authorization
	 *   - `passReqToCallback`     when `true`, `req` is the first argument to the verify callback (default: `false`)
	 *
	 * Examples:
	 *
	 *     passport.use(new OAuthStrategy({
	 *         requestTokenURL: 'https://www.example.com/oauth/request_token',
	 *         accessTokenURL: 'https://www.example.com/oauth/access_token',
	 *         userAuthorizationURL: 'https://www.example.com/oauth/authorize',
	 *         consumerKey: '123-456-789',
	 *         consumerSecret: 'shhh-its-a-secret'
	 *         callbackURL: 'https://www.example.net/auth/example/callback'
	 *       },
	 *       function(token, tokenSecret, profile, done) {
	 *         User.findOrCreate(..., function (err, user) {
	 *           done(err, user);
	 *         });
	 *       }
	 *     ));
	 *
	 * @constructor
	 * @param {Object} options
	 * @param {Function} verify
	 * @api public
	 */
	function OAuthStrategy(options, verify) {
	  if (typeof options == 'function') {
	    verify = options;
	    options = undefined;
	  }
	  options = options || {};
	  
	  if (!verify) { throw new TypeError('OAuthStrategy requires a verify callback'); }
	  if (!options.requestTokenURL) { throw new TypeError('OAuthStrategy requires a requestTokenURL option'); }
	  if (!options.accessTokenURL) { throw new TypeError('OAuthStrategy requires a accessTokenURL option'); }
	  if (!options.userAuthorizationURL) { throw new TypeError('OAuthStrategy requires a userAuthorizationURL option'); }
	  if (!options.consumerKey) { throw new TypeError('OAuthStrategy requires a consumerKey option'); }
	  if (options.consumerSecret === undefined) { throw new TypeError('OAuthStrategy requires a consumerSecret option'); }
	  
	  passport.Strategy.call(this);
	  this.name = 'oauth';
	  this._verify = verify;
	  
	  // NOTE: The _oauth property is considered "protected".  Subclasses are
	  //       allowed to use it when making protected resource requests to retrieve
	  //       the user profile.
	  this._oauth = new OAuth(options.requestTokenURL, options.accessTokenURL,
	                          options.consumerKey,  options.consumerSecret,
	                          '1.0', null, options.signatureMethod || 'HMAC-SHA1',
	                          null, options.customHeaders);
	  
	  this._userAuthorizationURL = options.userAuthorizationURL;
	  this._callbackURL = options.callbackURL;
	  this._key = options.sessionKey || 'oauth';
	  this._trustProxy = options.proxy;
	  this._passReqToCallback = options.passReqToCallback;
	  this._skipUserProfile = (options.skipUserProfile === undefined) ? false : options.skipUserProfile;
	}

	/**
	 * Inherit from `passport.Strategy`.
	 */
	util.inherits(OAuthStrategy, passport.Strategy);


	/**
	 * Authenticate request by delegating to a service provider using OAuth.
	 *
	 * @param {Object} req
	 * @api protected
	 */
	OAuthStrategy.prototype.authenticate = function(req, options) {
	  options = options || {};
	  if (!req.session) { return this.error(new Error('OAuthStrategy requires session support. Did you forget app.use(express.session(...))?')); }
	  
	  var self = this;
	  
	  if (req.query && req.query.oauth_token) {
	    // The request being authenticated contains an oauth_token parameter in the
	    // query portion of the URL.  This indicates that the service provider has
	    // redirected the user back to the application, after authenticating the
	    // user and obtaining their authorization.
	    //
	    // The value of the oauth_token parameter is the request token.  Together
	    // with knowledge of the token secret (stored in the session), the request
	    // token can be exchanged for an access token and token secret.
	    //
	    // This access token and token secret, along with the optional ability to
	    // fetch profile information from the service provider, is sufficient to
	    // establish the identity of the user.
	    
	    // Bail if the session does not contain the request token and corresponding
	    // secret.  If this happens, it is most likely caused by initiating OAuth
	    // from a different host than that of the callback endpoint (for example:
	    // initiating from 127.0.0.1 but handling callbacks at localhost).
	    if (!req.session[self._key]) { return self.error(new Error('Failed to find request token in session')); }
	    
	    var oauthToken = req.query.oauth_token;
	    var oauthVerifier = req.query.oauth_verifier || null;
	    var oauthTokenSecret = req.session[self._key].oauth_token_secret;
	    
	    // NOTE: The oauth_verifier parameter will be supplied in the query portion
	    //       of the redirect URL, if the server supports OAuth 1.0a.
	    
	    this._oauth.getOAuthAccessToken(oauthToken, oauthTokenSecret, oauthVerifier, function(err, token, tokenSecret, params) {
	      if (err) { return self.error(self._createOAuthError('Failed to obtain access token', err)); }
	      
	      // The request token has been exchanged for an access token.  Since the
	      // request token is a single-use token, that data can be removed from the
	      // session.
	      delete req.session[self._key].oauth_token;
	      delete req.session[self._key].oauth_token_secret;
	      if (Object.keys(req.session[self._key]).length === 0) {
	        delete req.session[self._key];
	      }
	      
	      self._loadUserProfile(token, tokenSecret, params, function(err, profile) {
	        if (err) { return self.error(err); }
	        
	        function verified(err, user, info) {
	          if (err) { return self.error(err); }
	          if (!user) { return self.fail(info); }
	          self.success(user, info);
	        }
	        
	        try {
	          if (self._passReqToCallback) {
	            var arity = self._verify.length;
	            if (arity == 6) {
	              self._verify(req, token, tokenSecret, params, profile, verified);
	            } else { // arity == 5
	              self._verify(req, token, tokenSecret, profile, verified);
	            }
	          } else {
	            var arity = self._verify.length;
	            if (arity == 5) {
	              self._verify(token, tokenSecret, params, profile, verified);
	            } else { // arity == 4
	              self._verify(token, tokenSecret, profile, verified);
	            }
	          }
	        } catch (ex) {
	          return self.error(ex);
	        }
	      });
	    });
	  } else {
	    // In order to authenticate via OAuth, the application must obtain a request
	    // token from the service provider and redirect the user to the service
	    // provider to obtain their authorization.  After authorization has been
	    // approved the user will be redirected back the application, at which point
	    // the application can exchange the request token for an access token.
	    //
	    // In order to successfully exchange the request token, its corresponding
	    // token secret needs to be known.  The token secret will be temporarily
	    // stored in the session, so that it can be retrieved upon the user being
	    // redirected back to the application.
	    
	    var params = this.requestTokenParams(options);
	    var callbackURL = options.callbackURL || this._callbackURL;
	    if (callbackURL) {
	      var parsed = url.parse(callbackURL);
	      if (!parsed.protocol) {
	        // The callback URL is relative, resolve a fully qualified URL from the
	        // URL of the originating request.
	        callbackURL = url.resolve(utils.originalURL(req, { proxy: this._trustProxy }), callbackURL);
	      }
	    }
	    params.oauth_callback = callbackURL;
	    
	    this._oauth.getOAuthRequestToken(params, function(err, token, tokenSecret, params) {
	      if (err) { return self.error(self._createOAuthError('Failed to obtain request token', err)); }
	      
	      // NOTE: params will contain an oauth_callback_confirmed property set to
	      //       true, if the server supports OAuth 1.0a.
	      //       { oauth_callback_confirmed: 'true' }

	      if (!req.session[self._key]) { req.session[self._key] = {}; }
	      req.session[self._key].oauth_token = token;
	      req.session[self._key].oauth_token_secret = tokenSecret;

	      var parsed = url.parse(self._userAuthorizationURL, true);
	      parsed.query.oauth_token = token;
	      utils.merge(parsed.query, self.userAuthorizationParams(options));
	      delete parsed.search;
	      var location = url.format(parsed);
	      self.redirect(location);
	    });
	  }
	};

	/**
	 * Retrieve user profile from service provider.
	 *
	 * OAuth-based authentication strategies can overrride this function in order to
	 * load the user's profile from the service provider.  This assists applications
	 * (and users of those applications) in the initial registration process by
	 * automatically submitting required information.
	 *
	 * @param {String} token
	 * @param {String} tokenSecret
	 * @param {Object} params
	 * @param {Function} done
	 * @api protected
	 */
	OAuthStrategy.prototype.userProfile = function(token, tokenSecret, params, done) {
	  return done(null, {});
	};

	/**
	 * Return extra parameters to be included in the request token request.
	 *
	 * Some OAuth providers require additional parameters to be included when
	 * issuing a request token.  Since these parameters are not standardized by the
	 * OAuth specification, OAuth-based authentication strategies can overrride this
	 * function in order to populate these parameters as required by the provider.
	 *
	 * @param {Object} options
	 * @return {Object}
	 * @api protected
	 */
	OAuthStrategy.prototype.requestTokenParams = function(options) {
	  return {};
	};

	/**
	 * Return extra parameters to be included in the user authorization request.
	 *
	 * Some OAuth providers allow additional, non-standard parameters to be included
	 * when requesting authorization.  Since these parameters are not standardized
	 * by the OAuth specification, OAuth-based authentication strategies can
	 * overrride this function in order to populate these parameters as required by
	 * the provider.
	 *
	 * @param {Object} options
	 * @return {Object}
	 * @api protected
	 */
	OAuthStrategy.prototype.userAuthorizationParams = function(options) {
	  return {};
	};

	/**
	 * Parse error response from OAuth endpoint.
	 *
	 * OAuth-based authentication strategies can overrride this function in order to
	 * parse error responses received from the request token and access token
	 * endpoints, allowing the most informative message to be displayed.
	 *
	 * If this function is not overridden, a generic error will be thrown.
	 *
	 * @param {String} body
	 * @param {Number} status
	 * @return {Error}
	 * @api protected
	 */
	OAuthStrategy.prototype.parseErrorResponse = function(body, status) {
	  return null;
	};

	/**
	 * Load user profile, contingent upon options.
	 *
	 * @param {String} accessToken
	 * @param {Function} done
	 * @api private
	 */
	OAuthStrategy.prototype._loadUserProfile = function(token, tokenSecret, params, done) {
	  var self = this;
	  
	  function loadIt() {
	    return self.userProfile(token, tokenSecret, params, done);
	  }
	  function skipIt() {
	    return done(null);
	  }
	  
	  if (typeof this._skipUserProfile == 'function' && this._skipUserProfile.length > 1) {
	    // async
	    this._skipUserProfile(token, tokenSecret, function(err, skip) {
	      if (err) { return done(err); }
	      if (!skip) { return loadIt(); }
	      return skipIt();
	    });
	  } else {
	    var skip = (typeof this._skipUserProfile == 'function') ? this._skipUserProfile() : this._skipUserProfile;
	    if (!skip) { return loadIt(); }
	    return skipIt();
	  }
	};

	/**
	 * Create an OAuth error.
	 *
	 * @param {String} message
	 * @param {Object|Error} err
	 * @api private
	 */
	OAuthStrategy.prototype._createOAuthError = function(message, err) {
	  var e;
	  if (err.statusCode && err.data) {
	    try {
	      e = this.parseErrorResponse(err.data, err.statusCode);
	    } catch (_) {}
	  }
	  if (!e) { e = new InternalOAuthError(message, err); }
	  return e;
	};


	/**
	 * Expose `OAuthStrategy`.
	 */
	module.exports = OAuthStrategy;


/***/ },
/* 23 */
/***/ function(module, exports) {

	module.exports = require("url");

/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	exports.merge = __webpack_require__(25);

	/**
	 * Reconstructs the original URL of the request.
	 *
	 * This function builds a URL that corresponds the original URL requested by the
	 * client, including the protocol (http or https) and host.
	 *
	 * If the request passed through any proxies that terminate SSL, the
	 * `X-Forwarded-Proto` header is used to detect if the request was encrypted to
	 * the proxy, assuming that the proxy has been flagged as trusted.
	 *
	 * @param {http.IncomingMessage} req
	 * @param {Object} [options]
	 * @return {String}
	 * @api private
	 */
	exports.originalURL = function(req, options) {
	  options = options || {};
	  var app = req.app;
	  if (app && app.get && app.get('trust proxy')) {
	    options.proxy = true;
	  }
	  var trustProxy = options.proxy;
	  
	  var proto = (req.headers['x-forwarded-proto'] || '').toLowerCase()
	    , tls = req.connection.encrypted || (trustProxy && 'https' == proto.split(/\s*,\s*/)[0])
	    , host = (trustProxy && req.headers['x-forwarded-host']) || req.headers.host
	    , protocol = tls ? 'https' : 'http'
	    , path = req.url || '';
	  return protocol + '://' + host + path;
	};


/***/ },
/* 25 */
/***/ function(module, exports) {

	/**
	 * Merge object b with object a.
	 *
	 *     var a = { foo: 'bar' }
	 *       , b = { bar: 'baz' };
	 *
	 *     merge(a, b);
	 *     // => { foo: 'bar', bar: 'baz' }
	 *
	 * @param {Object} a
	 * @param {Object} b
	 * @return {Object}
	 * @api public
	 */

	exports = module.exports = function(a, b){
	  if (a && b) {
	    for (var key in b) {
	      a[key] = b[key];
	    }
	  }
	  return a;
	};


/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	exports.OAuth = __webpack_require__(27).OAuth;
	exports.OAuthEcho = __webpack_require__(27).OAuthEcho;
	exports.OAuth2 = __webpack_require__(33).OAuth2;

/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	var crypto= __webpack_require__(28),
	    sha1= __webpack_require__(29),
	    http= __webpack_require__(1),
	    https= __webpack_require__(30),
	    URL= __webpack_require__(23),
	    querystring= __webpack_require__(31),
	    OAuthUtils= __webpack_require__(32);

	exports.OAuth= function(requestUrl, accessUrl, consumerKey, consumerSecret, version, authorize_callback, signatureMethod, nonceSize, customHeaders) {
	  this._isEcho = false;

	  this._requestUrl= requestUrl;
	  this._accessUrl= accessUrl;
	  this._consumerKey= consumerKey;
	  this._consumerSecret= this._encodeData( consumerSecret );
	  if (signatureMethod == "RSA-SHA1") {
	    this._privateKey = consumerSecret;
	  }
	  this._version= version;
	  if( authorize_callback === undefined ) {
	    this._authorize_callback= "oob";
	  }
	  else {
	    this._authorize_callback= authorize_callback;
	  }

	  if( signatureMethod != "PLAINTEXT" && signatureMethod != "HMAC-SHA1" && signatureMethod != "RSA-SHA1")
	    throw new Error("Un-supported signature method: " + signatureMethod )
	  this._signatureMethod= signatureMethod;
	  this._nonceSize= nonceSize || 32;
	  this._headers= customHeaders || {"Accept" : "*/*",
	                                   "Connection" : "close",
	                                   "User-Agent" : "Node authentication"}
	  this._clientOptions= this._defaultClientOptions= {"requestTokenHttpMethod": "POST",
	                                                    "accessTokenHttpMethod": "POST",
	                                                    "followRedirects": true};
	  this._oauthParameterSeperator = ",";
	};

	exports.OAuthEcho= function(realm, verify_credentials, consumerKey, consumerSecret, version, signatureMethod, nonceSize, customHeaders) {
	  this._isEcho = true;

	  this._realm= realm;
	  this._verifyCredentials = verify_credentials;
	  this._consumerKey= consumerKey;
	  this._consumerSecret= this._encodeData( consumerSecret );
	  if (signatureMethod == "RSA-SHA1") {
	    this._privateKey = consumerSecret;
	  }
	  this._version= version;

	  if( signatureMethod != "PLAINTEXT" && signatureMethod != "HMAC-SHA1" && signatureMethod != "RSA-SHA1")
	    throw new Error("Un-supported signature method: " + signatureMethod );
	  this._signatureMethod= signatureMethod;
	  this._nonceSize= nonceSize || 32;
	  this._headers= customHeaders || {"Accept" : "*/*",
	                                   "Connection" : "close",
	                                   "User-Agent" : "Node authentication"};
	  this._oauthParameterSeperator = ",";
	}

	exports.OAuthEcho.prototype = exports.OAuth.prototype;

	exports.OAuth.prototype._getTimestamp= function() {
	  return Math.floor( (new Date()).getTime() / 1000 );
	}

	exports.OAuth.prototype._encodeData= function(toEncode){
	 if( toEncode == null || toEncode == "" ) return ""
	 else {
	    var result= encodeURIComponent(toEncode);
	    // Fix the mismatch between OAuth's  RFC3986's and Javascript's beliefs in what is right and wrong ;)
	    return result.replace(/\!/g, "%21")
	                 .replace(/\'/g, "%27")
	                 .replace(/\(/g, "%28")
	                 .replace(/\)/g, "%29")
	                 .replace(/\*/g, "%2A");
	 }
	}

	exports.OAuth.prototype._decodeData= function(toDecode) {
	  if( toDecode != null ) {
	    toDecode = toDecode.replace(/\+/g, " ");
	  }
	  return decodeURIComponent( toDecode);
	}

	exports.OAuth.prototype._getSignature= function(method, url, parameters, tokenSecret) {
	  var signatureBase= this._createSignatureBase(method, url, parameters);
	  return this._createSignature( signatureBase, tokenSecret );
	}

	exports.OAuth.prototype._normalizeUrl= function(url) {
	  var parsedUrl= URL.parse(url, true)
	   var port ="";
	   if( parsedUrl.port ) {
	     if( (parsedUrl.protocol == "http:" && parsedUrl.port != "80" ) ||
	         (parsedUrl.protocol == "https:" && parsedUrl.port != "443") ) {
	           port= ":" + parsedUrl.port;
	         }
	   }

	  if( !parsedUrl.pathname  || parsedUrl.pathname == "" ) parsedUrl.pathname ="/";

	  return parsedUrl.protocol + "//" + parsedUrl.hostname + port + parsedUrl.pathname;
	}

	// Is the parameter considered an OAuth parameter
	exports.OAuth.prototype._isParameterNameAnOAuthParameter= function(parameter) {
	  var m = parameter.match('^oauth_');
	  if( m && ( m[0] === "oauth_" ) ) {
	    return true;
	  }
	  else {
	    return false;
	  }
	};

	// build the OAuth request authorization header
	exports.OAuth.prototype._buildAuthorizationHeaders= function(orderedParameters) {
	  var authHeader="OAuth ";
	  if( this._isEcho ) {
	    authHeader += 'realm="' + this._realm + '",';
	  }

	  for( var i= 0 ; i < orderedParameters.length; i++) {
	     // Whilst the all the parameters should be included within the signature, only the oauth_ arguments
	     // should appear within the authorization header.
	     if( this._isParameterNameAnOAuthParameter(orderedParameters[i][0]) ) {
	      authHeader+= "" + this._encodeData(orderedParameters[i][0])+"=\""+ this._encodeData(orderedParameters[i][1])+"\""+ this._oauthParameterSeperator;
	     }
	  }

	  authHeader= authHeader.substring(0, authHeader.length-this._oauthParameterSeperator.length);
	  return authHeader;
	}

	// Takes an object literal that represents the arguments, and returns an array
	// of argument/value pairs.
	exports.OAuth.prototype._makeArrayOfArgumentsHash= function(argumentsHash) {
	  var argument_pairs= [];
	  for(var key in argumentsHash ) {
	    if (argumentsHash.hasOwnProperty(key)) {
	       var value= argumentsHash[key];
	       if( Array.isArray(value) ) {
	         for(var i=0;i<value.length;i++) {
	           argument_pairs[argument_pairs.length]= [key, value[i]];
	         }
	       }
	       else {
	         argument_pairs[argument_pairs.length]= [key, value];
	       }
	    }
	  }
	  return argument_pairs;
	}

	// Sorts the encoded key value pairs by encoded name, then encoded value
	exports.OAuth.prototype._sortRequestParams= function(argument_pairs) {
	  // Sort by name, then value.
	  argument_pairs.sort(function(a,b) {
	      if ( a[0]== b[0] )  {
	        return a[1] < b[1] ? -1 : 1;
	      }
	      else return a[0] < b[0] ? -1 : 1;
	  });

	  return argument_pairs;
	}

	exports.OAuth.prototype._normaliseRequestParams= function(args) {
	  var argument_pairs= this._makeArrayOfArgumentsHash(args);
	  // First encode them #3.4.1.3.2 .1
	  for(var i=0;i<argument_pairs.length;i++) {
	    argument_pairs[i][0]= this._encodeData( argument_pairs[i][0] );
	    argument_pairs[i][1]= this._encodeData( argument_pairs[i][1] );
	  }

	  // Then sort them #3.4.1.3.2 .2
	  argument_pairs= this._sortRequestParams( argument_pairs );

	  // Then concatenate together #3.4.1.3.2 .3 & .4
	  var args= "";
	  for(var i=0;i<argument_pairs.length;i++) {
	      args+= argument_pairs[i][0];
	      args+= "="
	      args+= argument_pairs[i][1];
	      if( i < argument_pairs.length-1 ) args+= "&";
	  }
	  return args;
	}

	exports.OAuth.prototype._createSignatureBase= function(method, url, parameters) {
	  url= this._encodeData( this._normalizeUrl(url) );
	  parameters= this._encodeData( parameters );
	  return method.toUpperCase() + "&" + url + "&" + parameters;
	}

	exports.OAuth.prototype._createSignature= function(signatureBase, tokenSecret) {
	   if( tokenSecret === undefined ) var tokenSecret= "";
	   else tokenSecret= this._encodeData( tokenSecret );
	   // consumerSecret is already encoded
	   var key= this._consumerSecret + "&" + tokenSecret;

	   var hash= ""
	   if( this._signatureMethod == "PLAINTEXT" ) {
	     hash= key;
	   }
	   else if (this._signatureMethod == "RSA-SHA1") {
	     key = this._privateKey || "";
	     hash= crypto.createSign("RSA-SHA1").update(signatureBase).sign(key, 'base64');
	   }
	   else {
	       if( crypto.Hmac ) {
	         hash = crypto.createHmac("sha1", key).update(signatureBase).digest("base64");
	       }
	       else {
	         hash= sha1.HMACSHA1(key, signatureBase);
	       }
	   }
	   return hash;
	}
	exports.OAuth.prototype.NONCE_CHARS= ['a','b','c','d','e','f','g','h','i','j','k','l','m','n',
	              'o','p','q','r','s','t','u','v','w','x','y','z','A','B',
	              'C','D','E','F','G','H','I','J','K','L','M','N','O','P',
	              'Q','R','S','T','U','V','W','X','Y','Z','0','1','2','3',
	              '4','5','6','7','8','9'];

	exports.OAuth.prototype._getNonce= function(nonceSize) {
	   var result = [];
	   var chars= this.NONCE_CHARS;
	   var char_pos;
	   var nonce_chars_length= chars.length;

	   for (var i = 0; i < nonceSize; i++) {
	       char_pos= Math.floor(Math.random() * nonce_chars_length);
	       result[i]=  chars[char_pos];
	   }
	   return result.join('');
	}

	exports.OAuth.prototype._createClient= function( port, hostname, method, path, headers, sslEnabled ) {
	  var options = {
	    host: hostname,
	    port: port,
	    path: path,
	    method: method,
	    headers: headers
	  };
	  var httpModel;
	  if( sslEnabled ) {
	    httpModel= https;
	  } else {
	    httpModel= http;
	  }
	  return httpModel.request(options);
	}

	exports.OAuth.prototype._prepareParameters= function( oauth_token, oauth_token_secret, method, url, extra_params ) {
	  var oauthParameters= {
	      "oauth_timestamp":        this._getTimestamp(),
	      "oauth_nonce":            this._getNonce(this._nonceSize),
	      "oauth_version":          this._version,
	      "oauth_signature_method": this._signatureMethod,
	      "oauth_consumer_key":     this._consumerKey
	  };

	  if( oauth_token ) {
	    oauthParameters["oauth_token"]= oauth_token;
	  }

	  var sig;
	  if( this._isEcho ) {
	    sig = this._getSignature( "GET",  this._verifyCredentials,  this._normaliseRequestParams(oauthParameters), oauth_token_secret);
	  }
	  else {
	    if( extra_params ) {
	      for( var key in extra_params ) {
	        if (extra_params.hasOwnProperty(key)) oauthParameters[key]= extra_params[key];
	      }
	    }
	    var parsedUrl= URL.parse( url, false );

	    if( parsedUrl.query ) {
	      var key2;
	      var extraParameters= querystring.parse(parsedUrl.query);
	      for(var key in extraParameters ) {
	        var value= extraParameters[key];
	          if( typeof value == "object" ){
	            // TODO: This probably should be recursive
	            for(key2 in value){
	              oauthParameters[key + "[" + key2 + "]"] = value[key2];
	            }
	          } else {
	            oauthParameters[key]= value;
	          }
	        }
	    }

	    sig = this._getSignature( method,  url,  this._normaliseRequestParams(oauthParameters), oauth_token_secret);
	  }

	  var orderedParameters= this._sortRequestParams( this._makeArrayOfArgumentsHash(oauthParameters) );
	  orderedParameters[orderedParameters.length]= ["oauth_signature", sig];
	  return orderedParameters;
	}

	exports.OAuth.prototype._performSecureRequest= function( oauth_token, oauth_token_secret, method, url, extra_params, post_body, post_content_type,  callback ) {
	  var orderedParameters= this._prepareParameters(oauth_token, oauth_token_secret, method, url, extra_params);

	  if( !post_content_type ) {
	    post_content_type= "application/x-www-form-urlencoded";
	  }
	  var parsedUrl= URL.parse( url, false );
	  if( parsedUrl.protocol == "http:" && !parsedUrl.port ) parsedUrl.port= 80;
	  if( parsedUrl.protocol == "https:" && !parsedUrl.port ) parsedUrl.port= 443;

	  var headers= {};
	  var authorization = this._buildAuthorizationHeaders(orderedParameters);
	  if ( this._isEcho ) {
	    headers["X-Verify-Credentials-Authorization"]= authorization;
	  }
	  else {
	    headers["Authorization"]= authorization;
	  }

	  headers["Host"] = parsedUrl.host

	  for( var key in this._headers ) {
	    if (this._headers.hasOwnProperty(key)) {
	      headers[key]= this._headers[key];
	    }
	  }

	  // Filter out any passed extra_params that are really to do with OAuth
	  for(var key in extra_params) {
	    if( this._isParameterNameAnOAuthParameter( key ) ) {
	      delete extra_params[key];
	    }
	  }

	  if( (method == "POST" || method == "PUT")  && ( post_body == null && extra_params != null) ) {
	    // Fix the mismatch between the output of querystring.stringify() and this._encodeData()
	    post_body= querystring.stringify(extra_params)
	                       .replace(/\!/g, "%21")
	                       .replace(/\'/g, "%27")
	                       .replace(/\(/g, "%28")
	                       .replace(/\)/g, "%29")
	                       .replace(/\*/g, "%2A");
	  }

	  if( post_body ) {
	      if ( Buffer.isBuffer(post_body) ) {
	          headers["Content-length"]= post_body.length;
	      } else {
	          headers["Content-length"]= Buffer.byteLength(post_body);
	      }
	  } else {
	      headers["Content-length"]= 0;
	  }

	  headers["Content-Type"]= post_content_type;

	  var path;
	  if( !parsedUrl.pathname  || parsedUrl.pathname == "" ) parsedUrl.pathname ="/";
	  if( parsedUrl.query ) path= parsedUrl.pathname + "?"+ parsedUrl.query ;
	  else path= parsedUrl.pathname;

	  var request;
	  if( parsedUrl.protocol == "https:" ) {
	    request= this._createClient(parsedUrl.port, parsedUrl.hostname, method, path, headers, true);
	  }
	  else {
	    request= this._createClient(parsedUrl.port, parsedUrl.hostname, method, path, headers);
	  }

	  var clientOptions = this._clientOptions;
	  if( callback ) {
	    var data="";
	    var self= this;

	    // Some hosts *cough* google appear to close the connection early / send no content-length header
	    // allow this behaviour.
	    var allowEarlyClose= OAuthUtils.isAnEarlyCloseHost( parsedUrl.hostname );
	    var callbackCalled= false;
	    var passBackControl = function( response ) {
	      if(!callbackCalled) {
	        callbackCalled= true;
	        if ( response.statusCode >= 200 && response.statusCode <= 299 ) {
	          callback(null, data, response);
	        } else {
	          // Follow 301 or 302 redirects with Location HTTP header
	          if((response.statusCode == 301 || response.statusCode == 302) && clientOptions.followRedirects && response.headers && response.headers.location) {
	            self._performSecureRequest( oauth_token, oauth_token_secret, method, response.headers.location, extra_params, post_body, post_content_type,  callback);
	          }
	          else {
	            callback({ statusCode: response.statusCode, data: data }, data, response);
	          }
	        }
	      }
	    }

	    request.on('response', function (response) {
	      response.setEncoding('utf8');
	      response.on('data', function (chunk) {
	        data+=chunk;
	      });
	      response.on('end', function () {
	        passBackControl( response );
	      });
	      response.on('close', function () {
	        if( allowEarlyClose ) {
	          passBackControl( response );
	        }
	      });
	    });

	    request.on("error", function(err) {
	      if(!callbackCalled) {
	        callbackCalled= true;
	        callback( err )
	      }
	    });

	    if( (method == "POST" || method =="PUT") && post_body != null && post_body != "" ) {
	      request.write(post_body);
	    }
	    request.end();
	  }
	  else {
	    if( (method == "POST" || method =="PUT") && post_body != null && post_body != "" ) {
	      request.write(post_body);
	    }
	    return request;
	  }

	  return;
	}

	exports.OAuth.prototype.setClientOptions= function(options) {
	  var key,
	      mergedOptions= {},
	      hasOwnProperty= Object.prototype.hasOwnProperty;

	  for( key in this._defaultClientOptions ) {
	    if( !hasOwnProperty.call(options, key) ) {
	      mergedOptions[key]= this._defaultClientOptions[key];
	    } else {
	      mergedOptions[key]= options[key];
	    }
	  }

	  this._clientOptions= mergedOptions;
	};

	exports.OAuth.prototype.getOAuthAccessToken= function(oauth_token, oauth_token_secret, oauth_verifier,  callback) {
	  var extraParams= {};
	  if( typeof oauth_verifier == "function" ) {
	    callback= oauth_verifier;
	  } else {
	    extraParams.oauth_verifier= oauth_verifier;
	  }

	   this._performSecureRequest( oauth_token, oauth_token_secret, this._clientOptions.accessTokenHttpMethod, this._accessUrl, extraParams, null, null, function(error, data, response) {
	         if( error ) callback(error);
	         else {
	           var results= querystring.parse( data );
	           var oauth_access_token= results["oauth_token"];
	           delete results["oauth_token"];
	           var oauth_access_token_secret= results["oauth_token_secret"];
	           delete results["oauth_token_secret"];
	           callback(null, oauth_access_token, oauth_access_token_secret, results );
	         }
	   })
	}

	// Deprecated
	exports.OAuth.prototype.getProtectedResource= function(url, method, oauth_token, oauth_token_secret, callback) {
	  this._performSecureRequest( oauth_token, oauth_token_secret, method, url, null, "", null, callback );
	}

	exports.OAuth.prototype.delete= function(url, oauth_token, oauth_token_secret, callback) {
	  return this._performSecureRequest( oauth_token, oauth_token_secret, "DELETE", url, null, "", null, callback );
	}

	exports.OAuth.prototype.get= function(url, oauth_token, oauth_token_secret, callback) {
	  return this._performSecureRequest( oauth_token, oauth_token_secret, "GET", url, null, "", null, callback );
	}

	exports.OAuth.prototype._putOrPost= function(method, url, oauth_token, oauth_token_secret, post_body, post_content_type, callback) {
	  var extra_params= null;
	  if( typeof post_content_type == "function" ) {
	    callback= post_content_type;
	    post_content_type= null;
	  }
	  if ( typeof post_body != "string" && !Buffer.isBuffer(post_body) ) {
	    post_content_type= "application/x-www-form-urlencoded"
	    extra_params= post_body;
	    post_body= null;
	  }
	  return this._performSecureRequest( oauth_token, oauth_token_secret, method, url, extra_params, post_body, post_content_type, callback );
	}


	exports.OAuth.prototype.put= function(url, oauth_token, oauth_token_secret, post_body, post_content_type, callback) {
	  return this._putOrPost("PUT", url, oauth_token, oauth_token_secret, post_body, post_content_type, callback);
	}

	exports.OAuth.prototype.post= function(url, oauth_token, oauth_token_secret, post_body, post_content_type, callback) {
	  return this._putOrPost("POST", url, oauth_token, oauth_token_secret, post_body, post_content_type, callback);
	}

	/**
	 * Gets a request token from the OAuth provider and passes that information back
	 * to the calling code.
	 *
	 * The callback should expect a function of the following form:
	 *
	 * function(err, token, token_secret, parsedQueryString) {}
	 *
	 * This method has optional parameters so can be called in the following 2 ways:
	 *
	 * 1) Primary use case: Does a basic request with no extra parameters
	 *  getOAuthRequestToken( callbackFunction )
	 *
	 * 2) As above but allows for provision of extra parameters to be sent as part of the query to the server.
	 *  getOAuthRequestToken( extraParams, callbackFunction )
	 *
	 * N.B. This method will HTTP POST verbs by default, if you wish to override this behaviour you will
	 * need to provide a requestTokenHttpMethod option when creating the client.
	 *
	 **/
	exports.OAuth.prototype.getOAuthRequestToken= function( extraParams, callback ) {
	   if( typeof extraParams == "function" ){
	     callback = extraParams;
	     extraParams = {};
	   }
	  // Callbacks are 1.0A related
	  if( this._authorize_callback ) {
	    extraParams["oauth_callback"]= this._authorize_callback;
	  }
	  this._performSecureRequest( null, null, this._clientOptions.requestTokenHttpMethod, this._requestUrl, extraParams, null, null, function(error, data, response) {
	    if( error ) callback(error);
	    else {
	      var results= querystring.parse(data);

	      var oauth_token= results["oauth_token"];
	      var oauth_token_secret= results["oauth_token_secret"];
	      delete results["oauth_token"];
	      delete results["oauth_token_secret"];
	      callback(null, oauth_token, oauth_token_secret,  results );
	    }
	  });
	}

	exports.OAuth.prototype.signUrl= function(url, oauth_token, oauth_token_secret, method) {

	  if( method === undefined ) {
	    var method= "GET";
	  }

	  var orderedParameters= this._prepareParameters(oauth_token, oauth_token_secret, method, url, {});
	  var parsedUrl= URL.parse( url, false );

	  var query="";
	  for( var i= 0 ; i < orderedParameters.length; i++) {
	    query+= orderedParameters[i][0]+"="+ this._encodeData(orderedParameters[i][1]) + "&";
	  }
	  query= query.substring(0, query.length-1);

	  return parsedUrl.protocol + "//"+ parsedUrl.host + parsedUrl.pathname + "?" + query;
	};

	exports.OAuth.prototype.authHeader= function(url, oauth_token, oauth_token_secret, method) {
	  if( method === undefined ) {
	    var method= "GET";
	  }

	  var orderedParameters= this._prepareParameters(oauth_token, oauth_token_secret, method, url, {});
	  return this._buildAuthorizationHeaders(orderedParameters);
	};


/***/ },
/* 28 */
/***/ function(module, exports) {

	module.exports = require("crypto");

/***/ },
/* 29 */
/***/ function(module, exports) {

	/*
	 * A JavaScript implementation of the Secure Hash Algorithm, SHA-1, as defined
	 * in FIPS 180-1
	 * Version 2.2 Copyright Paul Johnston 2000 - 2009.
	 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
	 * Distributed under the BSD License
	 * See http://pajhome.org.uk/crypt/md5 for details.
	 */

	/*
	 * Configurable variables. You may need to tweak these to be compatible with
	 * the server-side, but the defaults work in most cases.
	 */
	var hexcase = 1;  /* hex output format. 0 - lowercase; 1 - uppercase        */
	var b64pad  = "="; /* base-64 pad character. "=" for strict RFC compliance   */

	/*
	 * These are the functions you'll usually want to call
	 * They take string arguments and return either hex or base-64 encoded strings
	 */
	function hex_sha1(s)    { return rstr2hex(rstr_sha1(str2rstr_utf8(s))); }
	function b64_sha1(s)    { return rstr2b64(rstr_sha1(str2rstr_utf8(s))); }
	function any_sha1(s, e) { return rstr2any(rstr_sha1(str2rstr_utf8(s)), e); }
	function hex_hmac_sha1(k, d)
	  { return rstr2hex(rstr_hmac_sha1(str2rstr_utf8(k), str2rstr_utf8(d))); }
	function b64_hmac_sha1(k, d)
	  { return rstr2b64(rstr_hmac_sha1(str2rstr_utf8(k), str2rstr_utf8(d))); }
	function any_hmac_sha1(k, d, e)
	  { return rstr2any(rstr_hmac_sha1(str2rstr_utf8(k), str2rstr_utf8(d)), e); }

	/*
	 * Perform a simple self-test to see if the VM is working
	 */
	function sha1_vm_test()
	{
	  return hex_sha1("abc").toLowerCase() == "a9993e364706816aba3e25717850c26c9cd0d89d";
	}

	/*
	 * Calculate the SHA1 of a raw string
	 */
	function rstr_sha1(s)
	{
	  return binb2rstr(binb_sha1(rstr2binb(s), s.length * 8));
	}

	/*
	 * Calculate the HMAC-SHA1 of a key and some data (raw strings)
	 */
	function rstr_hmac_sha1(key, data)
	{
	  var bkey = rstr2binb(key);
	  if(bkey.length > 16) bkey = binb_sha1(bkey, key.length * 8);

	  var ipad = Array(16), opad = Array(16);
	  for(var i = 0; i < 16; i++)
	  {
	    ipad[i] = bkey[i] ^ 0x36363636;
	    opad[i] = bkey[i] ^ 0x5C5C5C5C;
	  }

	  var hash = binb_sha1(ipad.concat(rstr2binb(data)), 512 + data.length * 8);
	  return binb2rstr(binb_sha1(opad.concat(hash), 512 + 160));
	}

	/*
	 * Convert a raw string to a hex string
	 */
	function rstr2hex(input)
	{
	  try { hexcase } catch(e) { hexcase=0; }
	  var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
	  var output = "";
	  var x;
	  for(var i = 0; i < input.length; i++)
	  {
	    x = input.charCodeAt(i);
	    output += hex_tab.charAt((x >>> 4) & 0x0F)
	           +  hex_tab.charAt( x        & 0x0F);
	  }
	  return output;
	}

	/*
	 * Convert a raw string to a base-64 string
	 */
	function rstr2b64(input)
	{
	  try { b64pad } catch(e) { b64pad=''; }
	  var tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
	  var output = "";
	  var len = input.length;
	  for(var i = 0; i < len; i += 3)
	  {
	    var triplet = (input.charCodeAt(i) << 16)
	                | (i + 1 < len ? input.charCodeAt(i+1) << 8 : 0)
	                | (i + 2 < len ? input.charCodeAt(i+2)      : 0);
	    for(var j = 0; j < 4; j++)
	    {
	      if(i * 8 + j * 6 > input.length * 8) output += b64pad;
	      else output += tab.charAt((triplet >>> 6*(3-j)) & 0x3F);
	    }
	  }
	  return output;
	}

	/*
	 * Convert a raw string to an arbitrary string encoding
	 */
	function rstr2any(input, encoding)
	{
	  var divisor = encoding.length;
	  var remainders = Array();
	  var i, q, x, quotient;

	  /* Convert to an array of 16-bit big-endian values, forming the dividend */
	  var dividend = Array(Math.ceil(input.length / 2));
	  for(i = 0; i < dividend.length; i++)
	  {
	    dividend[i] = (input.charCodeAt(i * 2) << 8) | input.charCodeAt(i * 2 + 1);
	  }

	  /*
	   * Repeatedly perform a long division. The binary array forms the dividend,
	   * the length of the encoding is the divisor. Once computed, the quotient
	   * forms the dividend for the next step. We stop when the dividend is zero.
	   * All remainders are stored for later use.
	   */
	  while(dividend.length > 0)
	  {
	    quotient = Array();
	    x = 0;
	    for(i = 0; i < dividend.length; i++)
	    {
	      x = (x << 16) + dividend[i];
	      q = Math.floor(x / divisor);
	      x -= q * divisor;
	      if(quotient.length > 0 || q > 0)
	        quotient[quotient.length] = q;
	    }
	    remainders[remainders.length] = x;
	    dividend = quotient;
	  }

	  /* Convert the remainders to the output string */
	  var output = "";
	  for(i = remainders.length - 1; i >= 0; i--)
	    output += encoding.charAt(remainders[i]);

	  /* Append leading zero equivalents */
	  var full_length = Math.ceil(input.length * 8 /
	                                    (Math.log(encoding.length) / Math.log(2)))
	  for(i = output.length; i < full_length; i++)
	    output = encoding[0] + output;

	  return output;
	}

	/*
	 * Encode a string as utf-8.
	 * For efficiency, this assumes the input is valid utf-16.
	 */
	function str2rstr_utf8(input)
	{
	  var output = "";
	  var i = -1;
	  var x, y;

	  while(++i < input.length)
	  {
	    /* Decode utf-16 surrogate pairs */
	    x = input.charCodeAt(i);
	    y = i + 1 < input.length ? input.charCodeAt(i + 1) : 0;
	    if(0xD800 <= x && x <= 0xDBFF && 0xDC00 <= y && y <= 0xDFFF)
	    {
	      x = 0x10000 + ((x & 0x03FF) << 10) + (y & 0x03FF);
	      i++;
	    }

	    /* Encode output as utf-8 */
	    if(x <= 0x7F)
	      output += String.fromCharCode(x);
	    else if(x <= 0x7FF)
	      output += String.fromCharCode(0xC0 | ((x >>> 6 ) & 0x1F),
	                                    0x80 | ( x         & 0x3F));
	    else if(x <= 0xFFFF)
	      output += String.fromCharCode(0xE0 | ((x >>> 12) & 0x0F),
	                                    0x80 | ((x >>> 6 ) & 0x3F),
	                                    0x80 | ( x         & 0x3F));
	    else if(x <= 0x1FFFFF)
	      output += String.fromCharCode(0xF0 | ((x >>> 18) & 0x07),
	                                    0x80 | ((x >>> 12) & 0x3F),
	                                    0x80 | ((x >>> 6 ) & 0x3F),
	                                    0x80 | ( x         & 0x3F));
	  }
	  return output;
	}

	/*
	 * Encode a string as utf-16
	 */
	function str2rstr_utf16le(input)
	{
	  var output = "";
	  for(var i = 0; i < input.length; i++)
	    output += String.fromCharCode( input.charCodeAt(i)        & 0xFF,
	                                  (input.charCodeAt(i) >>> 8) & 0xFF);
	  return output;
	}

	function str2rstr_utf16be(input)
	{
	  var output = "";
	  for(var i = 0; i < input.length; i++)
	    output += String.fromCharCode((input.charCodeAt(i) >>> 8) & 0xFF,
	                                   input.charCodeAt(i)        & 0xFF);
	  return output;
	}

	/*
	 * Convert a raw string to an array of big-endian words
	 * Characters >255 have their high-byte silently ignored.
	 */
	function rstr2binb(input)
	{
	  var output = Array(input.length >> 2);
	  for(var i = 0; i < output.length; i++)
	    output[i] = 0;
	  for(var i = 0; i < input.length * 8; i += 8)
	    output[i>>5] |= (input.charCodeAt(i / 8) & 0xFF) << (24 - i % 32);
	  return output;
	}

	/*
	 * Convert an array of big-endian words to a string
	 */
	function binb2rstr(input)
	{
	  var output = "";
	  for(var i = 0; i < input.length * 32; i += 8)
	    output += String.fromCharCode((input[i>>5] >>> (24 - i % 32)) & 0xFF);
	  return output;
	}

	/*
	 * Calculate the SHA-1 of an array of big-endian words, and a bit length
	 */
	function binb_sha1(x, len)
	{
	  /* append padding */
	  x[len >> 5] |= 0x80 << (24 - len % 32);
	  x[((len + 64 >> 9) << 4) + 15] = len;

	  var w = Array(80);
	  var a =  1732584193;
	  var b = -271733879;
	  var c = -1732584194;
	  var d =  271733878;
	  var e = -1009589776;

	  for(var i = 0; i < x.length; i += 16)
	  {
	    var olda = a;
	    var oldb = b;
	    var oldc = c;
	    var oldd = d;
	    var olde = e;

	    for(var j = 0; j < 80; j++)
	    {
	      if(j < 16) w[j] = x[i + j];
	      else w[j] = bit_rol(w[j-3] ^ w[j-8] ^ w[j-14] ^ w[j-16], 1);
	      var t = safe_add(safe_add(bit_rol(a, 5), sha1_ft(j, b, c, d)),
	                       safe_add(safe_add(e, w[j]), sha1_kt(j)));
	      e = d;
	      d = c;
	      c = bit_rol(b, 30);
	      b = a;
	      a = t;
	    }

	    a = safe_add(a, olda);
	    b = safe_add(b, oldb);
	    c = safe_add(c, oldc);
	    d = safe_add(d, oldd);
	    e = safe_add(e, olde);
	  }
	  return Array(a, b, c, d, e);

	}

	/*
	 * Perform the appropriate triplet combination function for the current
	 * iteration
	 */
	function sha1_ft(t, b, c, d)
	{
	  if(t < 20) return (b & c) | ((~b) & d);
	  if(t < 40) return b ^ c ^ d;
	  if(t < 60) return (b & c) | (b & d) | (c & d);
	  return b ^ c ^ d;
	}

	/*
	 * Determine the appropriate additive constant for the current iteration
	 */
	function sha1_kt(t)
	{
	  return (t < 20) ?  1518500249 : (t < 40) ?  1859775393 :
	         (t < 60) ? -1894007588 : -899497514;
	}

	/*
	 * Add integers, wrapping at 2^32. This uses 16-bit operations internally
	 * to work around bugs in some JS interpreters.
	 */
	function safe_add(x, y)
	{
	  var lsw = (x & 0xFFFF) + (y & 0xFFFF);
	  var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
	  return (msw << 16) | (lsw & 0xFFFF);
	}

	/*
	 * Bitwise rotate a 32-bit number to the left.
	 */
	function bit_rol(num, cnt)
	{
	  return (num << cnt) | (num >>> (32 - cnt));
	}

	exports.HMACSHA1= function(key, data) {
	  return b64_hmac_sha1(key, data);
	}

/***/ },
/* 30 */
/***/ function(module, exports) {

	module.exports = require("https");

/***/ },
/* 31 */
/***/ function(module, exports) {

	module.exports = require("querystring");

/***/ },
/* 32 */
/***/ function(module, exports) {

	// Returns true if this is a host that closes *before* it ends?!?!
	module.exports.isAnEarlyCloseHost= function( hostName ) {
	  return hostName && hostName.match(".*google(apis)?.com$")
	}

/***/ },
/* 33 */
/***/ function(module, exports, __webpack_require__) {

	var querystring= __webpack_require__(31),
	    crypto= __webpack_require__(28),
	    https= __webpack_require__(30),
	    http= __webpack_require__(1),
	    URL= __webpack_require__(23),
	    OAuthUtils= __webpack_require__(32);

	exports.OAuth2= function(clientId, clientSecret, baseSite, authorizePath, accessTokenPath, customHeaders) {
	  this._clientId= clientId;
	  this._clientSecret= clientSecret;
	  this._baseSite= baseSite;
	  this._authorizeUrl= authorizePath || "/oauth/authorize";
	  this._accessTokenUrl= accessTokenPath || "/oauth/access_token";
	  this._accessTokenName= "access_token";
	  this._authMethod= "Bearer";
	  this._customHeaders = customHeaders || {};
	  this._useAuthorizationHeaderForGET= false;
	}

	// This 'hack' method is required for sites that don't use
	// 'access_token' as the name of the access token (for requests).
	// ( http://tools.ietf.org/html/draft-ietf-oauth-v2-16#section-7 )
	// it isn't clear what the correct value should be atm, so allowing
	// for specific (temporary?) override for now.
	exports.OAuth2.prototype.setAccessTokenName= function ( name ) {
	  this._accessTokenName= name;
	}

	// Sets the authorization method for Authorization header.
	// e.g. Authorization: Bearer <token>  # "Bearer" is the authorization method.
	exports.OAuth2.prototype.setAuthMethod = function ( authMethod ) {
	  this._authMethod = authMethod;
	};


	// If you use the OAuth2 exposed 'get' method (and don't construct your own _request call )
	// this will specify whether to use an 'Authorize' header instead of passing the access_token as a query parameter
	exports.OAuth2.prototype.useAuthorizationHeaderforGET = function(useIt) {
	  this._useAuthorizationHeaderForGET= useIt;
	}

	exports.OAuth2.prototype._getAccessTokenUrl= function() {
	  return this._baseSite + this._accessTokenUrl; /* + "?" + querystring.stringify(params); */
	}

	// Build the authorization header. In particular, build the part after the colon.
	// e.g. Authorization: Bearer <token>  # Build "Bearer <token>"
	exports.OAuth2.prototype.buildAuthHeader= function(token) {
	  return this._authMethod + ' ' + token;
	};

	exports.OAuth2.prototype._chooseHttpLibrary= function( parsedUrl ) {
	  var http_library= https;
	  // As this is OAUth2, we *assume* https unless told explicitly otherwise.
	  if( parsedUrl.protocol != "https:" ) {
	    http_library= http;
	  }
	  return http_library;
	};

	exports.OAuth2.prototype._request= function(method, url, headers, post_body, access_token, callback) {

	  var parsedUrl= URL.parse( url, true );
	  if( parsedUrl.protocol == "https:" && !parsedUrl.port ) {
	    parsedUrl.port= 443;
	  }

	  var http_library= this._chooseHttpLibrary( parsedUrl );


	  var realHeaders= {};
	  for( var key in this._customHeaders ) {
	    realHeaders[key]= this._customHeaders[key];
	  }
	  if( headers ) {
	    for(var key in headers) {
	      realHeaders[key] = headers[key];
	    }
	  }
	  realHeaders['Host']= parsedUrl.host;

	  if (!realHeaders['User-Agent']) {
	    realHeaders['User-Agent'] = 'Node-oauth';
	  }

	  if( post_body ) {
	      if ( Buffer.isBuffer(post_body) ) {
	          realHeaders["Content-Length"]= post_body.length;
	      } else {
	          realHeaders["Content-Length"]= Buffer.byteLength(post_body);
	      }
	  } else {
	      realHeaders["Content-length"]= 0;
	  }

	  if( access_token && !('Authorization' in realHeaders)) {
	    if( ! parsedUrl.query ) parsedUrl.query= {};
	    parsedUrl.query[this._accessTokenName]= access_token;
	  }

	  var queryStr= querystring.stringify(parsedUrl.query);
	  if( queryStr ) queryStr=  "?" + queryStr;
	  var options = {
	    host:parsedUrl.hostname,
	    port: parsedUrl.port,
	    path: parsedUrl.pathname + queryStr,
	    method: method,
	    headers: realHeaders
	  };

	  this._executeRequest( http_library, options, post_body, callback );
	}

	exports.OAuth2.prototype._executeRequest= function( http_library, options, post_body, callback ) {
	  // Some hosts *cough* google appear to close the connection early / send no content-length header
	  // allow this behaviour.
	  var allowEarlyClose= OAuthUtils.isAnEarlyCloseHost(options.host);
	  var callbackCalled= false;
	  function passBackControl( response, result ) {
	    if(!callbackCalled) {
	      callbackCalled=true;
	      if( !(response.statusCode >= 200 && response.statusCode <= 299) && (response.statusCode != 301) && (response.statusCode != 302) ) {
	        callback({ statusCode: response.statusCode, data: result });
	      } else {
	        callback(null, result, response);
	      }
	    }
	  }

	  var result= "";

	  var request = http_library.request(options);
	  request.on('response', function (response) {
	    response.on("data", function (chunk) {
	      result+= chunk
	    });
	    response.on("close", function (err) {
	      if( allowEarlyClose ) {
	        passBackControl( response, result );
	      }
	    });
	    response.addListener("end", function () {
	      passBackControl( response, result );
	    });
	  });
	  request.on('error', function(e) {
	    callbackCalled= true;
	    callback(e);
	  });

	  if( (options.method == 'POST' || options.method == 'PUT') && post_body ) {
	     request.write(post_body);
	  }
	  request.end();
	}

	exports.OAuth2.prototype.getAuthorizeUrl= function( params ) {
	  var params= params || {};
	  params['client_id'] = this._clientId;
	  return this._baseSite + this._authorizeUrl + "?" + querystring.stringify(params);
	}

	exports.OAuth2.prototype.getOAuthAccessToken= function(code, params, callback) {
	  var params= params || {};
	  params['client_id'] = this._clientId;
	  params['client_secret'] = this._clientSecret;
	  var codeParam = (params.grant_type === 'refresh_token') ? 'refresh_token' : 'code';
	  params[codeParam]= code;

	  var post_data= querystring.stringify( params );
	  var post_headers= {
	       'Content-Type': 'application/x-www-form-urlencoded'
	   };


	  this._request("POST", this._getAccessTokenUrl(), post_headers, post_data, null, function(error, data, response) {
	    if( error )  callback(error);
	    else {
	      var results;
	      try {
	        // As of http://tools.ietf.org/html/draft-ietf-oauth-v2-07
	        // responses should be in JSON
	        results= JSON.parse( data );
	      }
	      catch(e) {
	        // .... However both Facebook + Github currently use rev05 of the spec
	        // and neither seem to specify a content-type correctly in their response headers :(
	        // clients of these services will suffer a *minor* performance cost of the exception
	        // being thrown
	        results= querystring.parse( data );
	      }
	      var access_token= results["access_token"];
	      var refresh_token= results["refresh_token"];
	      delete results["refresh_token"];
	      callback(null, access_token, refresh_token, results); // callback results =-=
	    }
	  });
	}

	// Deprecated
	exports.OAuth2.prototype.getProtectedResource= function(url, access_token, callback) {
	  this._request("GET", url, {}, "", access_token, callback );
	}

	exports.OAuth2.prototype.get= function(url, access_token, callback) {
	  if( this._useAuthorizationHeaderForGET ) {
	    var headers= {'Authorization': this.buildAuthHeader(access_token) }
	    access_token= null;
	  }
	  else {
	    headers= {};
	  }
	  this._request("GET", url, headers, "", access_token, callback );
	}


/***/ },
/* 34 */
/***/ function(module, exports) {

	/**
	 * `InternalOAuthError` error.
	 *
	 * InternalOAuthError wraps errors generated by node-oauth.  By wrapping these
	 * objects, error messages can be formatted in a manner that aids in debugging
	 * OAuth issues.
	 *
	 * @constructor
	 * @param {String} [message]
	 * @param {Object|Error} [err]
	 * @api public
	 */
	function InternalOAuthError(message, err) {
	  Error.call(this);
	  Error.captureStackTrace(this, arguments.callee);
	  this.name = 'InternalOAuthError';
	  this.message = message;
	  this.oauthError = err;
	}

	/**
	 * Inherit from `Error`.
	 */
	InternalOAuthError.prototype.__proto__ = Error.prototype;

	/**
	 * Returns a string representing the error.
	 *
	 * @return {String}
	 * @api public
	 */
	InternalOAuthError.prototype.toString = function() {
	  var m = this.name;
	  if (this.message) { m += ': ' + this.message; }
	  if (this.oauthError) {
	    if (this.oauthError instanceof Error) {
	      m = this.oauthError.toString();
	    } else if (this.oauthError.statusCode && this.oauthError.data) {
	      m += ' (status: ' + this.oauthError.statusCode + ' data: ' + this.oauthError.data + ')';
	    }
	  }
	  return m;
	};


	/**
	 * Expose `InternalOAuthError`.
	 */
	module.exports = InternalOAuthError;


/***/ },
/* 35 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Module dependencies.
	 */
	var Strategy = __webpack_require__(36)
	  , AuthorizationError = __webpack_require__(39)
	  , TokenError = __webpack_require__(40)
	  , InternalOAuthError = __webpack_require__(41);


	/**
	 * Expose `Strategy` directly from package.
	 */
	exports = module.exports = Strategy;

	/**
	 * Export constructors.
	 */
	exports.Strategy = Strategy;

	/**
	 * Export errors.
	 */
	exports.AuthorizationError = AuthorizationError;
	exports.TokenError = TokenError;
	exports.InternalOAuthError = InternalOAuthError;


/***/ },
/* 36 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Module dependencies.
	 */
	var passport = __webpack_require__(10)
	  , url = __webpack_require__(23)
	  , uid = __webpack_require__(37)
	  , util = __webpack_require__(9)
	  , utils = __webpack_require__(38)
	  , OAuth2 = __webpack_require__(26).OAuth2
	  , AuthorizationError = __webpack_require__(39)
	  , TokenError = __webpack_require__(40)
	  , InternalOAuthError = __webpack_require__(41);


	/**
	 * Creates an instance of `OAuth2Strategy`.
	 *
	 * The OAuth 2.0 authentication strategy authenticates requests using the OAuth
	 * 2.0 framework.
	 *
	 * OAuth 2.0 provides a facility for delegated authentication, whereby users can
	 * authenticate using a third-party service such as Facebook.  Delegating in
	 * this manner involves a sequence of events, including redirecting the user to
	 * the third-party service for authorization.  Once authorization has been
	 * granted, the user is redirected back to the application and an authorization
	 * code can be used to obtain credentials.
	 *
	 * Applications must supply a `verify` callback, for which the function
	 * signature is:
	 *
	 *     function(accessToken, refreshToken, profile, done) { ... }
	 *
	 * The verify callback is responsible for finding or creating the user, and
	 * invoking `done` with the following arguments:
	 *
	 *     done(err, user, info);
	 *
	 * `user` should be set to `false` to indicate an authentication failure.
	 * Additional `info` can optionally be passed as a third argument, typically
	 * used to display informational messages.  If an exception occured, `err`
	 * should be set.
	 *
	 * Options:
	 *
	 *   - `authorizationURL`  URL used to obtain an authorization grant
	 *   - `tokenURL`          URL used to obtain an access token
	 *   - `clientID`          identifies client to service provider
	 *   - `clientSecret`      secret used to establish ownership of the client identifer
	 *   - `callbackURL`       URL to which the service provider will redirect the user after obtaining authorization
	 *   - `passReqToCallback` when `true`, `req` is the first argument to the verify callback (default: `false`)
	 *
	 * Examples:
	 *
	 *     passport.use(new OAuth2Strategy({
	 *         authorizationURL: 'https://www.example.com/oauth2/authorize',
	 *         tokenURL: 'https://www.example.com/oauth2/token',
	 *         clientID: '123-456-789',
	 *         clientSecret: 'shhh-its-a-secret'
	 *         callbackURL: 'https://www.example.net/auth/example/callback'
	 *       },
	 *       function(accessToken, refreshToken, profile, done) {
	 *         User.findOrCreate(..., function (err, user) {
	 *           done(err, user);
	 *         });
	 *       }
	 *     ));
	 *
	 * @constructor
	 * @param {Object} options
	 * @param {Function} verify
	 * @api public
	 */
	function OAuth2Strategy(options, verify) {
	  if (typeof options == 'function') {
	    verify = options;
	    options = undefined;
	  }
	  options = options || {};
	  
	  if (!verify) { throw new TypeError('OAuth2Strategy requires a verify callback'); }
	  if (!options.authorizationURL) { throw new TypeError('OAuth2Strategy requires a authorizationURL option'); }
	  if (!options.tokenURL) { throw new TypeError('OAuth2Strategy requires a tokenURL option'); }
	  if (!options.clientID) { throw new TypeError('OAuth2Strategy requires a clientID option'); }
	  if (!options.clientSecret) { throw new TypeError('OAuth2Strategy requires a clientSecret option'); }
	  
	  passport.Strategy.call(this);
	  this.name = 'oauth2';
	  this._verify = verify;

	  // NOTE: The _oauth2 property is considered "protected".  Subclasses are
	  //       allowed to use it when making protected resource requests to retrieve
	  //       the user profile.
	  this._oauth2 = new OAuth2(options.clientID,  options.clientSecret,
	      '', options.authorizationURL, options.tokenURL, options.customHeaders);

	  this._callbackURL = options.callbackURL;
	  this._scope = options.scope;
	  this._scopeSeparator = options.scopeSeparator || ' ';
	  this._state = options.state;
	  this._key = options.sessionKey || ('oauth2:' + url.parse(options.authorizationURL).hostname);
	  this._trustProxy = options.proxy;
	  this._passReqToCallback = options.passReqToCallback;
	  this._skipUserProfile = (options.skipUserProfile === undefined) ? false : options.skipUserProfile;
	}

	/**
	 * Inherit from `passport.Strategy`.
	 */
	util.inherits(OAuth2Strategy, passport.Strategy);


	/**
	 * Authenticate request by delegating to a service provider using OAuth 2.0.
	 *
	 * @param {Object} req
	 * @api protected
	 */
	OAuth2Strategy.prototype.authenticate = function(req, options) {
	  options = options || {};
	  var self = this;
	  
	  if (req.query && req.query.error) {
	    if (req.query.error == 'access_denied') {
	      return this.fail({ message: req.query.error_description });
	    } else {
	      return this.error(new AuthorizationError(req.query.error_description, req.query.error, req.query.error_uri));
	    }
	  }
	  
	  var callbackURL = options.callbackURL || this._callbackURL;
	  if (callbackURL) {
	    var parsed = url.parse(callbackURL);
	    if (!parsed.protocol) {
	      // The callback URL is relative, resolve a fully qualified URL from the
	      // URL of the originating request.
	      callbackURL = url.resolve(utils.originalURL(req, { proxy: this._trustProxy }), callbackURL);
	    }
	  }
	  
	  if (req.query && req.query.code) {
	    var code = req.query.code;
	    
	    if (this._state) {
	      if (!req.session) { return this.error(new Error('OAuth2Strategy requires session support when using state. Did you forget app.use(express.session(...))?')); }
	      
	      var key = this._key;
	      if (!req.session[key]) {
	        return this.fail({ message: 'Unable to verify authorization request state.' }, 403);
	      }
	      var state = req.session[key].state;
	      if (!state) {
	        return this.fail({ message: 'Unable to verify authorization request state.' }, 403);
	      }
	      
	      delete req.session[key].state;
	      if (Object.keys(req.session[key]).length === 0) {
	        delete req.session[key];
	      }
	      
	      if (state !== req.query.state) {
	        return this.fail({ message: 'Invalid authorization request state.' }, 403);
	      }
	    }

	    var params = this.tokenParams(options);
	    params.grant_type = 'authorization_code';
	    params.redirect_uri = callbackURL;

	    this._oauth2.getOAuthAccessToken(code, params,
	      function(err, accessToken, refreshToken, params) {
	        if (err) { return self.error(self._createOAuthError('Failed to obtain access token', err)); }
	        
	        self._loadUserProfile(accessToken, function(err, profile) {
	          if (err) { return self.error(err); }
	          
	          function verified(err, user, info) {
	            if (err) { return self.error(err); }
	            if (!user) { return self.fail(info); }
	            self.success(user, info);
	          }
	          
	          try {
	            if (self._passReqToCallback) {
	              var arity = self._verify.length;
	              if (arity == 6) {
	                self._verify(req, accessToken, refreshToken, params, profile, verified);
	              } else { // arity == 5
	                self._verify(req, accessToken, refreshToken, profile, verified);
	              }
	            } else {
	              var arity = self._verify.length;
	              if (arity == 5) {
	                self._verify(accessToken, refreshToken, params, profile, verified);
	              } else { // arity == 4
	                self._verify(accessToken, refreshToken, profile, verified);
	              }
	            }
	          } catch (ex) {
	            return self.error(ex);
	          }
	        });
	      }
	    );
	  } else {
	    var params = this.authorizationParams(options);
	    params.response_type = 'code';
	    params.redirect_uri = callbackURL;
	    var scope = options.scope || this._scope;
	    if (scope) {
	      if (Array.isArray(scope)) { scope = scope.join(this._scopeSeparator); }
	      params.scope = scope;
	    }
	    var state = options.state;
	    if (state) {
	      params.state = state;
	    } else if (this._state) {
	      if (!req.session) { return this.error(new Error('OAuth2Strategy requires session support when using state. Did you forget app.use(express.session(...))?')); }
	      
	      var key = this._key;
	      state = uid(24);
	      if (!req.session[key]) { req.session[key] = {}; }
	      req.session[key].state = state;
	      params.state = state;
	    }
	    
	    var location = this._oauth2.getAuthorizeUrl(params);
	    this.redirect(location);
	  }
	};

	/**
	 * Retrieve user profile from service provider.
	 *
	 * OAuth 2.0-based authentication strategies can overrride this function in
	 * order to load the user's profile from the service provider.  This assists
	 * applications (and users of those applications) in the initial registration
	 * process by automatically submitting required information.
	 *
	 * @param {String} accessToken
	 * @param {Function} done
	 * @api protected
	 */
	OAuth2Strategy.prototype.userProfile = function(accessToken, done) {
	  return done(null, {});
	};

	/**
	 * Return extra parameters to be included in the authorization request.
	 *
	 * Some OAuth 2.0 providers allow additional, non-standard parameters to be
	 * included when requesting authorization.  Since these parameters are not
	 * standardized by the OAuth 2.0 specification, OAuth 2.0-based authentication
	 * strategies can overrride this function in order to populate these parameters
	 * as required by the provider.
	 *
	 * @param {Object} options
	 * @return {Object}
	 * @api protected
	 */
	OAuth2Strategy.prototype.authorizationParams = function(options) {
	  return {};
	};

	/**
	 * Return extra parameters to be included in the token request.
	 *
	 * Some OAuth 2.0 providers allow additional, non-standard parameters to be
	 * included when requesting an access token.  Since these parameters are not
	 * standardized by the OAuth 2.0 specification, OAuth 2.0-based authentication
	 * strategies can overrride this function in order to populate these parameters
	 * as required by the provider.
	 *
	 * @return {Object}
	 * @api protected
	 */
	OAuth2Strategy.prototype.tokenParams = function(options) {
	  return {};
	};

	/**
	 * Parse error response from OAuth 2.0 endpoint.
	 *
	 * OAuth 2.0-based authentication strategies can overrride this function in
	 * order to parse error responses received from the token endpoint, allowing the
	 * most informative message to be displayed.
	 *
	 * If this function is not overridden, the body will be parsed in accordance
	 * with RFC 6749, section 5.2.
	 *
	 * @param {String} body
	 * @param {Number} status
	 * @return {Error}
	 * @api protected
	 */
	OAuth2Strategy.prototype.parseErrorResponse = function(body, status) {
	  var json = JSON.parse(body);
	  if (json.error) {
	    return new TokenError(json.error_description, json.error, json.error_uri);
	  }
	  return null;
	};

	/**
	 * Load user profile, contingent upon options.
	 *
	 * @param {String} accessToken
	 * @param {Function} done
	 * @api private
	 */
	OAuth2Strategy.prototype._loadUserProfile = function(accessToken, done) {
	  var self = this;
	  
	  function loadIt() {
	    return self.userProfile(accessToken, done);
	  }
	  function skipIt() {
	    return done(null);
	  }
	  
	  if (typeof this._skipUserProfile == 'function' && this._skipUserProfile.length > 1) {
	    // async
	    this._skipUserProfile(accessToken, function(err, skip) {
	      if (err) { return done(err); }
	      if (!skip) { return loadIt(); }
	      return skipIt();
	    });
	  } else {
	    var skip = (typeof this._skipUserProfile == 'function') ? this._skipUserProfile() : this._skipUserProfile;
	    if (!skip) { return loadIt(); }
	    return skipIt();
	  }
	};

	/**
	 * Create an OAuth error.
	 *
	 * @param {String} message
	 * @param {Object|Error} err
	 * @api private
	 */
	OAuth2Strategy.prototype._createOAuthError = function(message, err) {
	  var e;
	  if (err.statusCode && err.data) {
	    try {
	      e = this.parseErrorResponse(err.data, err.statusCode);
	    } catch (_) {}
	  }
	  if (!e) { e = new InternalOAuthError(message, err); }
	  return e;
	};


	/**
	 * Expose `OAuth2Strategy`.
	 */
	module.exports = OAuth2Strategy;


/***/ },
/* 37 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Module dependencies
	 */

	var crypto = __webpack_require__(28);

	/**
	 * 62 characters in the ascii range that can be used in URLs without special
	 * encoding.
	 */
	var UIDCHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

	/**
	 * Make a Buffer into a string ready for use in URLs
	 *
	 * @param {String}
	 * @returns {String}
	 * @api private
	 */
	function tostr(bytes) {
	  var chars, r, i;

	  r = [];
	  for (i = 0; i < bytes.length; i++) {
	    r.push(UIDCHARS[bytes[i] % UIDCHARS.length]);
	  }

	  return r.join('');
	}

	/**
	 * Generate an Unique Id
	 *
	 * @param {Number} length  The number of chars of the uid
	 * @param {Number} cb (optional)  Callback for async uid generation
	 * @api public
	 */

	function uid(length, cb) {

	  if (typeof cb === 'undefined') {
	    return tostr(crypto.pseudoRandomBytes(length));
	  } else {
	    crypto.pseudoRandomBytes(length, function(err, bytes) {
	       if (err) return cb(err);
	       cb(null, tostr(bytes));
	    })
	  }
	}

	/**
	 * Exports
	 */

	module.exports = uid;


/***/ },
/* 38 */
/***/ function(module, exports) {

	/**
	 * Reconstructs the original URL of the request.
	 *
	 * This function builds a URL that corresponds the original URL requested by the
	 * client, including the protocol (http or https) and host.
	 *
	 * If the request passed through any proxies that terminate SSL, the
	 * `X-Forwarded-Proto` header is used to detect if the request was encrypted to
	 * the proxy, assuming that the proxy has been flagged as trusted.
	 *
	 * @param {http.IncomingMessage} req
	 * @param {Object} [options]
	 * @return {String}
	 * @api private
	 */
	exports.originalURL = function(req, options) {
	  options = options || {};
	  var app = req.app;
	  if (app && app.get && app.get('trust proxy')) {
	    options.proxy = true;
	  }
	  var trustProxy = options.proxy;
	  
	  var proto = (req.headers['x-forwarded-proto'] || '').toLowerCase()
	    , tls = req.connection.encrypted || (trustProxy && 'https' == proto.split(/\s*,\s*/)[0])
	    , host = (trustProxy && req.headers['x-forwarded-host']) || req.headers.host
	    , protocol = tls ? 'https' : 'http'
	    , path = req.url || '';
	  return protocol + '://' + host + path;
	};


/***/ },
/* 39 */
/***/ function(module, exports) {

	/**
	 * `AuthorizationError` error.
	 *
	 * AuthorizationError represents an error in response to an authorization
	 * request.  For details, refer to RFC 6749, section 4.1.2.1.
	 *
	 * References:
	 *   - [The OAuth 2.0 Authorization Framework](http://tools.ietf.org/html/rfc6749)
	 *
	 * @constructor
	 * @param {String} [message]
	 * @param {String} [code]
	 * @param {String} [uri]
	 * @param {Number} [status]
	 * @api public
	 */
	function AuthorizationError(message, code, uri, status) {
	  if (!status) {
	    switch (code) {
	      case 'access_denied': status = 403; break;
	      case 'server_error': status = 502; break;
	      case 'temporarily_unavailable': status = 503; break;
	    }
	  }
	  
	  Error.call(this);
	  Error.captureStackTrace(this, arguments.callee);
	  this.name = 'AuthorizationError';
	  this.message = message;
	  this.code = code || 'server_error';
	  this.uri = uri;
	  this.status = status || 500;
	}

	/**
	 * Inherit from `Error`.
	 */
	AuthorizationError.prototype.__proto__ = Error.prototype;


	/**
	 * Expose `AuthorizationError`.
	 */
	module.exports = AuthorizationError;


/***/ },
/* 40 */
/***/ function(module, exports) {

	/**
	 * `TokenError` error.
	 *
	 * TokenError represents an error received from a token endpoint.  For details,
	 * refer to RFC 6749, section 5.2.
	 *
	 * References:
	 *   - [The OAuth 2.0 Authorization Framework](http://tools.ietf.org/html/rfc6749)
	 *
	 * @constructor
	 * @param {String} [message]
	 * @param {String} [code]
	 * @param {String} [uri]
	 * @param {Number} [status]
	 * @api public
	 */
	function TokenError(message, code, uri, status) {
	  Error.call(this);
	  Error.captureStackTrace(this, arguments.callee);
	  this.name = 'TokenError';
	  this.message = message;
	  this.code = code || 'invalid_request';
	  this.uri = uri;
	  this.status = status || 500;
	}

	/**
	 * Inherit from `Error`.
	 */
	TokenError.prototype.__proto__ = Error.prototype;


	/**
	 * Expose `TokenError`.
	 */
	module.exports = TokenError;


/***/ },
/* 41 */
/***/ function(module, exports) {

	/**
	 * `InternalOAuthError` error.
	 *
	 * InternalOAuthError wraps errors generated by node-oauth.  By wrapping these
	 * objects, error messages can be formatted in a manner that aids in debugging
	 * OAuth issues.
	 *
	 * @constructor
	 * @param {String} [message]
	 * @param {Object|Error} [err]
	 * @api public
	 */
	function InternalOAuthError(message, err) {
	  Error.call(this);
	  Error.captureStackTrace(this, arguments.callee);
	  this.name = 'InternalOAuthError';
	  this.message = message;
	  this.oauthError = err;
	}

	/**
	 * Inherit from `Error`.
	 */
	InternalOAuthError.prototype.__proto__ = Error.prototype;

	/**
	 * Returns a string representing the error.
	 *
	 * @return {String}
	 * @api public
	 */
	InternalOAuthError.prototype.toString = function() {
	  var m = this.name;
	  if (this.message) { m += ': ' + this.message; }
	  if (this.oauthError) {
	    if (this.oauthError instanceof Error) {
	      m = this.oauthError.toString();
	    } else if (this.oauthError.statusCode && this.oauthError.data) {
	      m += ' (status: ' + this.oauthError.statusCode + ' data: ' + this.oauthError.data + ')';
	    }
	  }
	  return m;
	};


	/**
	 * Expose `InternalOAuthError`.
	 */
	module.exports = InternalOAuthError;


/***/ },
/* 42 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Module dependencies.
	 */
	var util = __webpack_require__(9)
	  , OAuth2Strategy = __webpack_require__(20).OAuth2Strategy
	  , InternalOAuthError = __webpack_require__(20).InternalOAuthError;

	var DEPRECATED_SCOPES = {
	  'https://www.googleapis.com/auth/userinfo.profile': 'profile',
	  'https://www.googleapis.com/auth/userinfo.email': 'email',
	};

	/**
	 * `Strategy` constructor.
	 *
	 * The Google authentication strategy authenticates requests by delegating to
	 * Google using the OAuth 2.0 protocol.
	 *
	 * Applications must supply a `verify` callback which accepts an `accessToken`,
	 * `refreshToken` and service-specific `profile`, and then calls the `done`
	 * callback supplying a `user`, which should be set to `false` if the
	 * credentials are not valid.  If an exception occured, `err` should be set.
	 *
	 * Options:
	 *   - `clientID`      your Google application's client id
	 *   - `clientSecret`  your Google application's client secret
	 *   - `callbackURL`   URL to which Google will redirect the user after granting authorization
	 *
	 * Examples:
	 *
	 *     passport.use(new GoogleStrategy({
	 *         clientID: '123-456-789',
	 *         clientSecret: 'shhh-its-a-secret'
	 *         callbackURL: 'https://www.example.net/auth/google/callback'
	 *       },
	 *       function(accessToken, refreshToken, profile, done) {
	 *         User.findOrCreate(..., function (err, user) {
	 *           done(err, user);
	 *         });
	 *       }
	 *     ));
	 *
	 * @param {Object} options
	 * @param {Function} verify
	 * @api public
	 */
	function Strategy(options, verify) {
	  options = options || {};
	  options.authorizationURL = options.authorizationURL || 'https://accounts.google.com/o/oauth2/auth';
	  options.tokenURL = options.tokenURL || 'https://accounts.google.com/o/oauth2/token';

	  OAuth2Strategy.call(this, options, verify);
	  this.name = 'google';
	  
	  //warn deprecated scopes
	  if (this._scope) {
	    var scopes = Array.isArray(this._scope) ? this._scope : [ this._scope ];
	    scopes.forEach(function(scope) {
	      var alt = DEPRECATED_SCOPES[scope];
	      if (!alt) return;
	      console.warn(scope + ' is deprecated. Switch to ' + alt);
	    });
	  }
	}

	/**
	 * Inherit from `OAuth2Strategy`.
	 */
	util.inherits(Strategy, OAuth2Strategy);


	/**
	 * Retrieve user profile from Google.
	 *
	 * This function constructs a normalized profile, with the following properties:
	 *
	 *   - `provider`         always set to `google`
	 *   - `id`
	 *   - `username`
	 *   - `displayName`
	 *
	 * @param {String} accessToken
	 * @param {Function} done
	 * @api protected
	 */
	Strategy.prototype.userProfile = function(accessToken, done) {
	  this._oauth2.get('https://www.googleapis.com/plus/v1/people/me', accessToken, function (err, body, res) {
	    if (err) { return done(new InternalOAuthError('failed to fetch user profile', err)); }

	    try {
	      var json = JSON.parse(body)
	        , i, len;

	      var profile = { provider: 'google' };
	      profile.id = json.id;
	      profile.displayName = json.displayName;
	      if (json.name) {
	        profile.name = { familyName: json.name.familyName,
	                         givenName: json.name.givenName };
	      }
	      if (json.emails) {
	        profile.emails = [];
	        for (i = 0, len = json.emails.length; i < len; ++i) {
	          profile.emails.push({ value: json.emails[i].value, type: json.emails[i].type })
	        }
	      }
	      if (json.image) {
	        profile.photos = [{ value: json.image.url }];
	      }
	      profile.gender = json.gender;
	      
	      profile._raw = body;
	      profile._json = json;

	      done(null, profile);
	    } catch(e) {
	      done(e);
	    }
	  });
	}

	/**
	 * Return extra Google-specific parameters to be included in the authorization
	 * request.
	 *
	 * @param {Object} options
	 * @return {Object}
	 * @api protected
	 */
	Strategy.prototype.authorizationParams = function(options) {
	  var params = {};
	  if (options.accessType) {
	    params['access_type'] = options.accessType;
	  }
	  if (options.approvalPrompt) {
	    params['approval_prompt'] = options.approvalPrompt;
	  }
	  if (options.prompt) {
	    // This parameter is undocumented in Google's official documentation.
	    // However, it was detailed by Breno de Medeiros (who works at Google) in
	    // this Stack Overflow answer:
	    //  http://stackoverflow.com/questions/14384354/force-google-account-chooser/14393492#14393492
	    params['prompt'] = options.prompt;
	  }
	  if (options.loginHint) {
	    // This parameter is derived from OpenID Connect, and supported by Google's
	    // OAuth 2.0 endpoint.
	    //   https://github.com/jaredhanson/passport-google-oauth/pull/8
	    //   https://bitbucket.org/openid/connect/commits/970a95b83add
	    params['login_hint'] = options.loginHint;
	  }
	  if (options.userID) {
	    // Undocumented, but supported by Google's OAuth 2.0 endpoint.  Appears to
	    // be equivalent to `login_hint`.
	    params['user_id'] = options.userID;
	  }
	  if (options.hostedDomain || options.hd) {
	    // This parameter is derived from Google's OAuth 1.0 endpoint, and (although
	    // undocumented) is supported by Google's OAuth 2.0 endpoint was well.
	    //   https://developers.google.com/accounts/docs/OAuth_ref
	    params['hd'] = options.hostedDomain || options.hd;
	  }
	  if (options.display) {
	    // Specify what kind of display consent screen to display to users.
	    //   https://developers.google.com/accounts/docs/OpenIDConnect#authenticationuriparameters
	    params['display'] = options.display;
	  }
	  if (options.requestVisibleActions) {
	    // Space separated list of allowed app actions
	    // as documented at:
	    //  https://developers.google.com/+/web/app-activities/#writing_an_app_activity_using_the_google_apis_client_libraries
	    //  https://developers.google.com/+/api/moment-types/
	    params['request_visible_actions'] = options.requestVisibleActions;
	  }
	  if (options.openIDRealm) {
	    // This parameter is needed when migrating users from Google's OpenID 2.0 to OAuth 2.0
	    //   https://developers.google.com/accounts/docs/OpenID?hl=ja#adjust-uri
	    params['openid.realm'] = options.openIDRealm;
	  }
	  return params;
	}


	/**
	 * Expose `Strategy`.
	 */
	module.exports = Strategy;


/***/ },
/* 43 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(module, __dirname) {/*
	 * pkginfo.js: Top-level include for the pkginfo module
	 *
	 * (C) 2011, Charlie Robbins
	 *
	 */
	 
	var fs = __webpack_require__(44),
	    path = __webpack_require__(45);

	//
	// ### function pkginfo ([options, 'property', 'property' ..])
	// #### @pmodule {Module} Parent module to read from.
	// #### @options {Object|Array|string} **Optional** Options used when exposing properties.
	// #### @arguments {string...} **Optional** Specified properties to expose.
	// Exposes properties from the package.json file for the parent module on 
	// it's exports. Valid usage:
	//
	// `require('pkginfo')()`
	//
	// `require('pkginfo')('version', 'author');`
	//
	// `require('pkginfo')(['version', 'author']);`
	//
	// `require('pkginfo')({ include: ['version', 'author'] });`
	//
	var pkginfo = module.exports = function (pmodule, options) {
	  var args = [].slice.call(arguments, 2).filter(function (arg) {
	    return typeof arg === 'string';
	  });
	  
	  //
	  // **Parse variable arguments**
	  //
	  if (Array.isArray(options)) {
	    //
	    // If the options passed in is an Array assume that
	    // it is the Array of properties to expose from the
	    // on the package.json file on the parent module.
	    //
	    options = { include: options };
	  }
	  else if (typeof options === 'string') {
	    //
	    // Otherwise if the first argument is a string, then
	    // assume that it is the first property to expose from
	    // the package.json file on the parent module.
	    //
	    options = { include: [options] };
	  }
	  
	  //
	  // **Setup default options**
	  //
	  options = options || {};
	  
	  // ensure that includes have been defined
	  options.include = options.include || [];
	  
	  if (args.length > 0) {
	    //
	    // If additional string arguments have been passed in
	    // then add them to the properties to expose on the 
	    // parent module. 
	    //
	    options.include = options.include.concat(args);
	  }
	  
	  var pkg = pkginfo.read(pmodule, options.dir).package;
	  Object.keys(pkg).forEach(function (key) {
	    if (options.include.length > 0 && !~options.include.indexOf(key)) {
	      return;
	    }
	    
	    if (!pmodule.exports[key]) {
	      pmodule.exports[key] = pkg[key];
	    }
	  });
	  
	  return pkginfo;
	};

	//
	// ### function find (dir)
	// #### @pmodule {Module} Parent module to read from.
	// #### @dir {string} **Optional** Directory to start search from.
	// Searches up the directory tree from `dir` until it finds a directory
	// which contains a `package.json` file. 
	//
	pkginfo.find = function (pmodule, dir) {
	  if (! dir) {
	    dir = path.dirname(pmodule.filename);
	  }
	  
	  var files = fs.readdirSync(dir);
	  
	  if (~files.indexOf('package.json')) {
	    return path.join(dir, 'package.json');
	  }
	  
	  if (dir === '/') {
	    throw new Error('Could not find package.json up from: ' + dir);
	  }
	  else if (!dir || dir === '.') {
	    throw new Error('Cannot find package.json from unspecified directory');
	  }
	  
	  return pkginfo.find(pmodule, path.dirname(dir));
	};

	//
	// ### function read (pmodule, dir)
	// #### @pmodule {Module} Parent module to read from.
	// #### @dir {string} **Optional** Directory to start search from.
	// Searches up the directory tree from `dir` until it finds a directory
	// which contains a `package.json` file and returns the package information.
	//
	pkginfo.read = function (pmodule, dir) { 
	  dir = pkginfo.find(pmodule, dir);
	  
	  var data = fs.readFileSync(dir).toString();
	      
	  return {
	    dir: dir, 
	    package: JSON.parse(data)
	  };
	};

	//
	// Call `pkginfo` on this module and expose version.
	//
	pkginfo(module, {
	  dir: __dirname,
	  include: ['version'],
	  target: pkginfo
	});
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(18)(module), "/"))

/***/ },
/* 44 */
/***/ function(module, exports) {

	module.exports = require("fs");

/***/ },
/* 45 */
/***/ function(module, exports) {

	module.exports = require("path");

/***/ },
/* 46 */
/***/ function(module, exports, __webpack_require__) {

	var jws = __webpack_require__(47);
	var ms = __webpack_require__(61);
	var timespan = __webpack_require__(62);
	var xtend = __webpack_require__(63);

	var JWT = module.exports;

	var JsonWebTokenError = JWT.JsonWebTokenError = __webpack_require__(64);
	var NotBeforeError = module.exports.NotBeforeError = __webpack_require__(65);
	var TokenExpiredError = JWT.TokenExpiredError = __webpack_require__(66);

	JWT.decode = function (jwt, options) {
	  options = options || {};
	  var decoded = jws.decode(jwt, options);
	  if (!decoded) { return null; }
	  var payload = decoded.payload;

	  //try parse the payload
	  if(typeof payload === 'string') {
	    try {
	      var obj = JSON.parse(payload);
	      if(typeof obj === 'object') {
	        payload = obj;
	      }
	    } catch (e) { }
	  }

	  //return header if `complete` option is enabled.  header includes claims
	  //such as `kid` and `alg` used to select the key within a JWKS needed to
	  //verify the signature
	  if (options.complete === true) {
	    return {
	      header: decoded.header,
	      payload: payload,
	      signature: decoded.signature
	    };
	  }
	  return payload;
	};

	var payload_options = [
	  'expiresIn',
	  'notBefore',
	  'expiresInMinutes',
	  'expiresInSeconds',
	  'audience',
	  'issuer',
	  'subject',
	  'jwtid'
	];

	JWT.sign = function(payload, secretOrPrivateKey, options, callback) {
	  options = options || {};
	  var header = {};

	  if (typeof payload === 'object') {
	    header.typ = 'JWT';
	    payload = xtend(payload);
	  } else {
	    var invalid_option = payload_options.filter(function (key) {
	      return typeof options[key] !== 'undefined';
	    })[0];

	    if (invalid_option) {
	      console.warn('invalid "' + invalid_option + '" option for ' + (typeof payload) + ' payload');
	    }
	  }


	  header.alg = options.algorithm || 'HS256';

	  if (options.headers) {
	    Object.keys(options.headers).forEach(function (k) {
	      header[k] = options.headers[k];
	    });
	  }

	  var timestamp = Math.floor(Date.now() / 1000);
	  if (!options.noTimestamp) {
	    payload.iat = payload.iat || timestamp;
	  }

	  if (typeof options.notBefore !== 'undefined') {
	    payload.nbf = timespan(options.notBefore);
	    if (typeof payload.nbf === 'undefined') {
	      throw new Error('"notBefore" should be a number of seconds or string representing a timespan eg: "1d", "20h", 60');
	    }
	  }

	  if (options.expiresInSeconds || options.expiresInMinutes) {
	    var deprecated_line;
	    try {
	      deprecated_line = /.*\((.*)\).*/.exec((new Error()).stack.split('\n')[2])[1];
	    } catch(err) {
	      deprecated_line = '';
	    }

	    console.warn('jsonwebtoken: expiresInMinutes and expiresInSeconds is deprecated. (' + deprecated_line + ')\n' +
	                 'Use "expiresIn" expressed in seconds.');

	    var expiresInSeconds = options.expiresInMinutes ?
	        options.expiresInMinutes * 60 :
	        options.expiresInSeconds;

	    payload.exp = timestamp + expiresInSeconds;
	  } else if (typeof options.expiresIn !== 'undefined') {
	    payload.exp = timespan(options.expiresIn);
	    if (typeof payload.exp === 'undefined') {
	      throw new Error('"expiresIn" should be a number of seconds or string representing a timespan eg: "1d", "20h", 60');
	    }
	  }

	  if (options.audience)
	    payload.aud = options.audience;

	  if (options.issuer)
	    payload.iss = options.issuer;

	  if (options.subject)
	    payload.sub = options.subject;

	  if (options.jwtid)
	    payload.jti = options.jwtid;

	  var encoding = 'utf8';
	  if (options.encoding) {
	    encoding = options.encoding;
	  }

	  if(typeof callback === 'function') {
	    jws.createSign({
	      header: header,
	      privateKey: secretOrPrivateKey,
	      payload: JSON.stringify(payload)
	    }).on('done', callback);
	  } else {
	    return jws.sign({header: header, payload: payload, secret: secretOrPrivateKey, encoding: encoding});
	  }
	};

	JWT.verify = function(jwtString, secretOrPublicKey, options, callback) {
	  if ((typeof options === 'function') && !callback) {
	    callback = options;
	    options = {};
	  }

	  if (!options) options = {};

	  var done;

	  if (callback) {
	    done = function() {
	      var args = Array.prototype.slice.call(arguments, 0);
	      return process.nextTick(function() {
	        callback.apply(null, args);
	      });
	    };
	  } else {
	    done = function(err, data) {
	      if (err) throw err;
	      return data;
	    };
	  }

	  if (!jwtString){
	    return done(new JsonWebTokenError('jwt must be provided'));
	  }

	  var parts = jwtString.split('.');

	  if (parts.length !== 3){
	    return done(new JsonWebTokenError('jwt malformed'));
	  }

	  if (parts[2].trim() === '' && secretOrPublicKey){
	    return done(new JsonWebTokenError('jwt signature is required'));
	  }

	  if (!secretOrPublicKey) {
	    return done(new JsonWebTokenError('secret or public key must be provided'));
	  }

	  if (!options.algorithms) {
	    options.algorithms = ~secretOrPublicKey.toString().indexOf('BEGIN CERTIFICATE') ||
	                         ~secretOrPublicKey.toString().indexOf('BEGIN PUBLIC KEY') ?
	                          [ 'RS256','RS384','RS512','ES256','ES384','ES512' ] :
	                         ~secretOrPublicKey.toString().indexOf('BEGIN RSA PUBLIC KEY') ?
	                          [ 'RS256','RS384','RS512' ] :
	                          [ 'HS256','HS384','HS512' ];

	  }

	  var decodedToken;
	  try {
	    decodedToken = jws.decode(jwtString);
	  } catch(err) {
	    return done(new JsonWebTokenError('invalid token'));
	  }

	  if (!decodedToken) {
	    return done(new JsonWebTokenError('invalid token'));
	  }

	  var header = decodedToken.header;

	  if (!~options.algorithms.indexOf(header.alg)) {
	    return done(new JsonWebTokenError('invalid algorithm'));
	  }

	  var valid;

	  try {
	    valid = jws.verify(jwtString, header.alg, secretOrPublicKey);
	  } catch (e) {
	    return done(e);
	  }

	  if (!valid)
	    return done(new JsonWebTokenError('invalid signature'));

	  var payload;

	  try {
	    payload = JWT.decode(jwtString);
	  } catch(err) {
	    return done(err);
	  }

	  if (typeof payload.nbf !== 'undefined' && !options.ignoreNotBefore) {
	    if (typeof payload.nbf !== 'number') {
	      return done(new JsonWebTokenError('invalid nbf value'));
	    }
	    if (payload.nbf > Math.floor(Date.now() / 1000)) {
	      return done(new NotBeforeError('jwt not active', new Date(payload.nbf * 1000)));
	    }
	  }

	  if (typeof payload.exp !== 'undefined' && !options.ignoreExpiration) {
	    if (typeof payload.exp !== 'number') {
	      return done(new JsonWebTokenError('invalid exp value'));
	    }
	    if (Math.floor(Date.now() / 1000) >= payload.exp)
	      return done(new TokenExpiredError('jwt expired', new Date(payload.exp * 1000)));
	  }

	  if (options.audience) {
	    var audiences = Array.isArray(options.audience)? options.audience : [options.audience];
	    var target = Array.isArray(payload.aud) ? payload.aud : [payload.aud];

	    var match = target.some(function(aud) { return audiences.indexOf(aud) != -1; });

	    if (!match)
	      return done(new JsonWebTokenError('jwt audience invalid. expected: ' + audiences.join(' or ')));
	  }

	  if (options.issuer) {
	    if (payload.iss !== options.issuer)
	      return done(new JsonWebTokenError('jwt issuer invalid. expected: ' + options.issuer));
	  }

	  if (options.maxAge) {
	    var maxAge = ms(options.maxAge);
	    if (typeof payload.iat !== 'number') {
	      return done(new JsonWebTokenError('iat required when maxAge is specified'));
	    }
	    if (Date.now() - (payload.iat * 1000) > maxAge) {
	      return done(new TokenExpiredError('maxAge exceeded', new Date(payload.iat * 1000 + maxAge)));
	    }
	  }

	  return done(null, payload);
	};


/***/ },
/* 47 */
/***/ function(module, exports, __webpack_require__) {

	/*global exports*/
	const SignStream = __webpack_require__(48);
	const VerifyStream = __webpack_require__(60);

	const ALGORITHMS = [
	  'HS256', 'HS384', 'HS512',
	  'RS256', 'RS384', 'RS512',
	  'ES256', 'ES384', 'ES512'
	];

	exports.ALGORITHMS = ALGORITHMS;
	exports.sign = SignStream.sign;
	exports.verify = VerifyStream.verify;
	exports.decode = VerifyStream.decode;
	exports.isValid = VerifyStream.isValid;
	exports.createSign = function createSign(opts) {
	  return new SignStream(opts);
	};
	exports.createVerify = function createVerify(opts) {
	  return new VerifyStream(opts);
	};


/***/ },
/* 48 */
/***/ function(module, exports, __webpack_require__) {

	/*global module*/
	const base64url = __webpack_require__(49);
	const DataStream = __webpack_require__(50);
	const jwa = __webpack_require__(53);
	const Stream = __webpack_require__(52);
	const toString = __webpack_require__(59);
	const util = __webpack_require__(9);

	function jwsSecuredInput(header, payload, encoding) {
	  encoding = encoding || 'utf8';
	  const encodedHeader = base64url(toString(header), 'binary');
	  const encodedPayload = base64url(toString(payload), encoding);
	  return util.format('%s.%s', encodedHeader, encodedPayload);
	}

	function jwsSign(opts) {
	  const header = opts.header;
	  const payload = opts.payload;
	  const secretOrKey = opts.secret || opts.privateKey;
	  const encoding = opts.encoding;
	  const algo = jwa(header.alg);
	  const securedInput = jwsSecuredInput(header, payload, encoding);
	  const signature = algo.sign(securedInput, secretOrKey);
	  return util.format('%s.%s', securedInput, signature);
	}

	function SignStream(opts) {
	  const secret = opts.secret||opts.privateKey||opts.key;
	  const secretStream = new DataStream(secret);
	  this.readable = true;
	  this.header = opts.header;
	  this.encoding = opts.encoding;
	  this.secret = this.privateKey = this.key = secretStream;
	  this.payload = new DataStream(opts.payload);
	  this.secret.once('close', function () {
	    if (!this.payload.writable && this.readable)
	      this.sign();
	  }.bind(this));

	  this.payload.once('close', function () {
	    if (!this.secret.writable && this.readable)
	      this.sign();
	  }.bind(this));
	}
	util.inherits(SignStream, Stream);

	SignStream.prototype.sign = function sign() {
	  try {
	    const signature = jwsSign({
	      header: this.header,
	      payload: this.payload.buffer,
	      secret: this.secret.buffer,
	      encoding: this.encoding
	    });
	    this.emit('done', signature);
	    this.emit('data', signature);
	    this.emit('end');
	    this.readable = false;
	    return signature;
	  } catch (e) {
	    this.readable = false;
	    this.emit('error', e);
	    this.emit('close');
	  }
	};

	SignStream.sign = jwsSign;

	module.exports = SignStream;


/***/ },
/* 49 */
/***/ function(module, exports) {

	function fromBase64(base64string) {
	  return (
	    base64string
	      .replace(/=/g, '')
	      .replace(/\+/g, '-')
	      .replace(/\//g, '_')
	  );
	}

	function toBase64(base64UrlString) {
	  if (Buffer.isBuffer(base64UrlString))
	    base64UrlString = base64UrlString.toString();

	  const b64str = padString(base64UrlString)
	    .replace(/\-/g, '+')
	    .replace(/_/g, '/');
	  return b64str;
	}

	function padString(string) {
	  const segmentLength = 4;
	  const stringLength = string.length;
	  const diff = string.length % segmentLength;
	  if (!diff)
	    return string;
	  var position = stringLength;
	  var padLength = segmentLength - diff;
	  const paddedStringLength = stringLength + padLength;
	  const buffer = Buffer(paddedStringLength);
	  buffer.write(string);
	  while (padLength--)
	    buffer.write('=', position++);
	  return buffer.toString();
	}

	function decodeBase64Url(base64UrlString, encoding) {
	  return Buffer(toBase64(base64UrlString), 'base64').toString(encoding);
	}

	function base64url(stringOrBuffer, encoding) {
	  return fromBase64(Buffer(stringOrBuffer, encoding).toString('base64'));
	}

	function toBuffer(base64string) {
	  return Buffer(toBase64(base64string), 'base64');
	}

	base64url.toBase64 = toBase64;
	base64url.fromBase64 = fromBase64;
	base64url.decode = decodeBase64Url;
	base64url.encode = base64url;
	base64url.toBuffer = toBuffer;

	module.exports = base64url;


/***/ },
/* 50 */
/***/ function(module, exports, __webpack_require__) {

	/*global module, process*/
	const Buffer = __webpack_require__(51).Buffer;
	const Stream = __webpack_require__(52);
	const util = __webpack_require__(9);

	function DataStream(data) {
	  this.buffer = null;
	  this.writable = true;
	  this.readable = true;

	  // No input
	  if (!data) {
	    this.buffer = new Buffer(0);
	    return this;
	  }

	  // Stream
	  if (typeof data.pipe === 'function') {
	    this.buffer = new Buffer(0);
	    data.pipe(this);
	    return this;
	  }

	  // Buffer or String
	  // or Object (assumedly a passworded key)
	  if (data.length || typeof data === 'object') {
	    this.buffer = data;
	    this.writable = false;
	    process.nextTick(function () {
	      this.emit('end', data);
	      this.readable = false;
	      this.emit('close');
	    }.bind(this));
	    return this;
	  }

	  throw new TypeError('Unexpected data type ('+ typeof data + ')');
	}
	util.inherits(DataStream, Stream);

	DataStream.prototype.write = function write(data) {
	  this.buffer = Buffer.concat([this.buffer, Buffer(data)]);
	  this.emit('data', data);
	};

	DataStream.prototype.end = function end(data) {
	  if (data)
	    this.write(data);
	  this.emit('end', data);
	  this.emit('close');
	  this.writable = false;
	  this.readable = false;
	};

	module.exports = DataStream;


/***/ },
/* 51 */
/***/ function(module, exports) {

	module.exports = require("buffer");

/***/ },
/* 52 */
/***/ function(module, exports) {

	module.exports = require("stream");

/***/ },
/* 53 */
/***/ function(module, exports, __webpack_require__) {

	const bufferEqual = __webpack_require__(54);
	const base64url = __webpack_require__(55);
	const crypto = __webpack_require__(28);
	const formatEcdsa = __webpack_require__(56);
	const util = __webpack_require__(9);

	const MSG_INVALID_ALGORITHM = '"%s" is not a valid algorithm.\n  Supported algorithms are:\n  "HS256", "HS384", "HS512", "RS256", "RS384", "RS512" and "none".'
	const MSG_INVALID_SECRET = 'secret must be a string or buffer';
	const MSG_INVALID_VERIFIER_KEY = 'key must be a string or a buffer';
	const MSG_INVALID_SIGNER_KEY = 'key must be a string, a buffer or an object';

	function typeError(template) {
	  const args = [].slice.call(arguments, 1);
	  const errMsg = util.format.bind(util, template).apply(null, args);
	  return new TypeError(errMsg);
	}

	function bufferOrString(obj) {
	  return Buffer.isBuffer(obj) || typeof obj === 'string';
	}

	function normalizeInput(thing) {
	  if (!bufferOrString(thing))
	    thing = JSON.stringify(thing);
	  return thing;
	}

	function createHmacSigner(bits) {
	  return function sign(thing, secret) {
	    if (!bufferOrString(secret))
	      throw typeError(MSG_INVALID_SECRET);
	    thing = normalizeInput(thing);
	    const hmac = crypto.createHmac('sha' + bits, secret);
	    const sig = (hmac.update(thing), hmac.digest('base64'))
	    return base64url.fromBase64(sig);
	  }
	}

	function createHmacVerifier(bits) {
	  return function verify(thing, signature, secret) {
	    const computedSig = createHmacSigner(bits)(thing, secret);
	    return bufferEqual(Buffer(signature), Buffer(computedSig));
	  }
	}

	function createKeySigner(bits) {
	 return function sign(thing, privateKey) {
	    if (!bufferOrString(privateKey) && !(typeof privateKey === 'object'))
	      throw typeError(MSG_INVALID_SIGNER_KEY);
	    thing = normalizeInput(thing);
	    // Even though we are specifying "RSA" here, this works with ECDSA
	    // keys as well.
	    const signer = crypto.createSign('RSA-SHA' + bits);
	    const sig = (signer.update(thing), signer.sign(privateKey, 'base64'));
	    return base64url.fromBase64(sig);
	  }
	}

	function createKeyVerifier(bits) {
	  return function verify(thing, signature, publicKey) {
	    if (!bufferOrString(publicKey))
	      throw typeError(MSG_INVALID_VERIFIER_KEY);
	    thing = normalizeInput(thing);
	    signature = base64url.toBase64(signature);
	    const verifier = crypto.createVerify('RSA-SHA' + bits);
	    verifier.update(thing);
	    return verifier.verify(publicKey, signature, 'base64');
	  }
	}

	function createECDSASigner(bits) {
	  const inner = createKeySigner(bits);
	  return function sign() {
	    var signature = inner.apply(null, arguments);
	    signature = formatEcdsa.derToJose(signature, 'ES' + bits);
	    return signature;
	  };
	}

	function createECDSAVerifer(bits) {
	  const inner = createKeyVerifier(bits);
	  return function verify(thing, signature, publicKey) {
	    signature = formatEcdsa.joseToDer(signature, 'ES' + bits).toString('base64');
	    const result = inner(thing, signature, publicKey);
	    return result;
	  };
	}

	function createNoneSigner() {
	  return function sign() {
	    return '';
	  }
	}

	function createNoneVerifier() {
	  return function verify(thing, signature) {
	    return signature === '';
	  }
	}

	module.exports = function jwa(algorithm) {
	  const signerFactories = {
	    hs: createHmacSigner,
	    rs: createKeySigner,
	    es: createECDSASigner,
	    none: createNoneSigner,
	  }
	  const verifierFactories = {
	    hs: createHmacVerifier,
	    rs: createKeyVerifier,
	    es: createECDSAVerifer,
	    none: createNoneVerifier,
	  }
	  const match = algorithm.match(/^(RS|ES|HS)(256|384|512)$|^(none)$/i);
	  if (!match)
	    throw typeError(MSG_INVALID_ALGORITHM, algorithm);
	  const algo = (match[1] || match[3]).toLowerCase();
	  const bits = match[2];

	  return {
	    sign: signerFactories[algo](bits),
	    verify: verifierFactories[algo](bits),
	  }
	};


/***/ },
/* 54 */
/***/ function(module, exports, __webpack_require__) {

	/*jshint node:true */
	'use strict';
	var Buffer = __webpack_require__(51).Buffer; // browserify
	var SlowBuffer = __webpack_require__(51).SlowBuffer;

	module.exports = bufferEq;

	function bufferEq(a, b) {

	  // shortcutting on type is necessary for correctness
	  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
	    return false;
	  }

	  // buffer sizes should be well-known information, so despite this
	  // shortcutting, it doesn't leak any information about the *contents* of the
	  // buffers.
	  if (a.length !== b.length) {
	    return false;
	  }

	  var c = 0;
	  for (var i = 0; i < a.length; i++) {
	    /*jshint bitwise:false */
	    c |= a[i] ^ b[i]; // XOR
	  }
	  return c === 0;
	}

	bufferEq.install = function() {
	  Buffer.prototype.equal = SlowBuffer.prototype.equal = function equal(that) {
	    return bufferEq(this, that);
	  };
	};

	var origBufEqual = Buffer.prototype.equal;
	var origSlowBufEqual = SlowBuffer.prototype.equal;
	bufferEq.restore = function() {
	  Buffer.prototype.equal = origBufEqual;
	  SlowBuffer.prototype.equal = origSlowBufEqual;
	};


/***/ },
/* 55 */
/***/ function(module, exports) {

	function fromBase64(base64string) {
	  return (
	    base64string
	      .replace(/=/g, '')
	      .replace(/\+/g, '-')
	      .replace(/\//g, '_')
	  );
	}

	function toBase64(base64UrlString) {
	  if (Buffer.isBuffer(base64UrlString))
	    base64UrlString = base64UrlString.toString()

	  const b64str = padString(base64UrlString)
	    .replace(/\-/g, '+')
	    .replace(/_/g, '/');
	  return b64str;
	}

	function padString(string) {
	  const segmentLength = 4;
	  const stringLength = string.length;
	  const diff = string.length % segmentLength;
	  if (!diff)
	    return string;
	  var position = stringLength;
	  var padLength = segmentLength - diff;
	  const paddedStringLength = stringLength + padLength;
	  const buffer = Buffer(paddedStringLength);
	  buffer.write(string);
	  while (padLength--)
	    buffer.write('=', position++);
	  return buffer.toString();
	}

	function decodeBase64Url(base64UrlString, encoding) {
	  return Buffer(toBase64(base64UrlString), 'base64').toString(encoding);
	}

	function base64url(stringOrBuffer) {
	  return fromBase64(Buffer(stringOrBuffer).toString('base64'));
	}

	function toBuffer(base64string) {
	  return Buffer(toBase64(base64string), 'base64');
	}

	base64url.toBase64 = toBase64;
	base64url.fromBase64 = fromBase64;
	base64url.decode = decodeBase64Url;
	base64url.toBuffer = toBuffer;

	module.exports = base64url;


/***/ },
/* 56 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var base64Url = __webpack_require__(57).escape;

	var getParamBytesForAlg = __webpack_require__(58);

	var MAX_OCTET = 0x80,
		CLASS_UNIVERSAL = 0,
		PRIMITIVE_BIT = 0x20,
		TAG_SEQ = 0x10,
		TAG_INT = 0x02,
		ENCODED_TAG_SEQ = (TAG_SEQ | PRIMITIVE_BIT) | (CLASS_UNIVERSAL << 6),
		ENCODED_TAG_INT = TAG_INT | (CLASS_UNIVERSAL << 6);

	function signatureAsBuffer(signature) {
		if (Buffer.isBuffer(signature)) {
			return signature;
		} else if ('string' === typeof signature) {
			return new Buffer(signature, 'base64');
		}

		throw new TypeError('ECDSA signature must be a Base64 string or a Buffer');
	}

	function derToJose(signature, alg) {
		signature = signatureAsBuffer(signature);
		var paramBytes = getParamBytesForAlg(alg);

		// the DER encoded param should at most be the param size, plus a padding
		// zero, since due to being a signed integer
		var maxEncodedParamLength = paramBytes + 1;

		var inputLength = signature.length;

		var offset = 0;
		if (signature[offset++] !== ENCODED_TAG_SEQ) {
			throw new Error('Could not find expected "seq"');
		}

		var seqLength = signature[offset++];
		if (seqLength === (MAX_OCTET | 1)) {
			seqLength = signature[offset++];
		}

		if (inputLength - offset < seqLength) {
			throw new Error('"seq" specified length of "' + seqLength + '", only "' + (inputLength - offset) + '" remaining');
		}

		if (signature[offset++] !== ENCODED_TAG_INT) {
			throw new Error('Could not find expected "int" for "r"');
		}

		var rLength = signature[offset++];

		if (inputLength - offset - 2 < rLength) {
			throw new Error('"r" specified length of "' + rLength + '", only "' + (inputLength - offset - 2) + '" available');
		}

		if (maxEncodedParamLength < rLength) {
			throw new Error('"r" specified length of "' + rLength + '", max of "' + maxEncodedParamLength + '" is acceptable');
		}

		var r = signature.slice(offset, offset + rLength);
		offset += r.length;

		if (signature[offset++] !== ENCODED_TAG_INT) {
			throw new Error('Could not find expected "int" for "s"');
		}

		var sLength = signature[offset++];

		if (inputLength - offset !== sLength) {
			throw new Error('"s" specified length of "' + sLength + '", expected "' + (inputLength - offset) + '"');
		}

		if (maxEncodedParamLength < sLength) {
			throw new Error('"s" specified length of "' + sLength + '", max of "' + maxEncodedParamLength + '" is acceptable');
		}

		var s = signature.slice(offset);
		offset += s.length;

		if (offset !== inputLength) {
			throw new Error('Expected to consume entire buffer, but "' + (inputLength - offset) + '" bytes remain');
		}

		var rPadding = paramBytes - r.length,
			sPadding = paramBytes - s.length;

		signature = new Buffer(rPadding + r.length + sPadding + s.length);

		for (offset = 0; offset < rPadding; ++offset) {
			signature[offset] = 0;
		}
		r.copy(signature, offset, Math.max(-rPadding, 0));

		offset = paramBytes;

		for (var o = offset; offset < o + sPadding; ++offset) {
			signature[offset] = 0;
		}
		s.copy(signature, offset, Math.max(-sPadding, 0));

		signature = signature.toString('base64');
		signature = base64Url(signature);

		return signature;
	}

	function reduceBuffer(buf) {
		var padding = 0;
		for (var n = buf.length; padding < n && buf[padding] === 0;) {
			++padding;
		}

		var needsSign = buf[padding] >= MAX_OCTET;
		if (needsSign) {
			--padding;

			if (padding < 0) {
				var old = buf;
				buf = new Buffer(1 + buf.length);
				buf[0] = 0;
				old.copy(buf, 1);

				return buf;
			}
		}

		if (padding === 0) {
			return buf;
		}

		buf = buf.slice(padding);
		return buf;
	}

	function joseToDer(signature, alg) {
		signature = signatureAsBuffer(signature);
		var paramBytes = getParamBytesForAlg(alg);

		var signatureBytes = signature.length;
		if (signatureBytes !== paramBytes * 2) {
			throw new TypeError('"' + alg + '" signatures must be "' + paramBytes * 2 + '" bytes, saw "' + signatureBytes + '"');
		}

		var r = reduceBuffer(signature.slice(0, paramBytes));
		var s = reduceBuffer(signature.slice(paramBytes));

		var rsBytes = 1 + 1 + r.length + 1 + 1 + s.length;

		var shortLength = rsBytes < MAX_OCTET;

		signature = new Buffer((shortLength ? 2 : 3) + rsBytes);

		var offset = 0;
		signature[offset++] = ENCODED_TAG_SEQ;
		if (shortLength) {
			// Bit 8 has value "0"
			// bits 7-1 give the length.
			signature[offset++] = rsBytes;
		} else {
			// Bit 8 of first octet has value "1"
			// bits 7-1 give the number of additional length octets.
			signature[offset++] = MAX_OCTET	| 1;
			// length, base 256
			signature[offset++] = rsBytes & 0xff;
		}
		signature[offset++] = ENCODED_TAG_INT;
		signature[offset++] = r.length;
		r.copy(signature, offset);
		offset += r.length;
		signature[offset++] = ENCODED_TAG_INT;
		signature[offset++] = s.length;
		s.copy(signature, offset);

		return signature;
	}

	module.exports = {
		derToJose: derToJose,
		joseToDer: joseToDer
	};


/***/ },
/* 57 */
/***/ function(module, exports) {

	'use strict';

	var base64url = module.exports;

	base64url.unescape = function unescape (str) {
	  return (str + Array(5 - str.length % 4)
	    .join('='))
	    .replace(/\-/g, '+')
	    .replace(/_/g, '/');
	};

	base64url.escape = function escape (str) {
	  return str.replace(/\+/g, '-')
	    .replace(/\//g, '_')
	    .replace(/=/g, '');
	};

	base64url.encode = function encode (str) {
	  return this.escape(new Buffer(str).toString('base64'));
	};

	base64url.decode = function decode (str) {
	  return new Buffer(this.unescape(str), 'base64').toString();
	};


/***/ },
/* 58 */
/***/ function(module, exports) {

	'use strict';

	function getParamSize(keySize) {
		var result = ((keySize / 8) | 0) + (keySize % 8 === 0 ? 0 : 1);
		return result;
	}

	var paramBytesForAlg = {
		ES256: getParamSize(256),
		ES384: getParamSize(384),
		ES512: getParamSize(521)
	};

	function getParamBytesForAlg(alg) {
		var paramBytes = paramBytesForAlg[alg];
		if (paramBytes) {
			return paramBytes;
		}

		throw new Error('Unknown algorithm "' + alg + '"');
	}

	module.exports = getParamBytesForAlg;


/***/ },
/* 59 */
/***/ function(module, exports, __webpack_require__) {

	/*global module*/
	const Buffer = __webpack_require__(51).Buffer;

	module.exports = function toString(obj) {
	  if (typeof obj === 'string')
	    return obj;
	  if (typeof obj === 'number' || Buffer.isBuffer(obj))
	    return obj.toString();
	  return JSON.stringify(obj);
	};


/***/ },
/* 60 */
/***/ function(module, exports, __webpack_require__) {

	/*global module*/
	const base64url = __webpack_require__(49);
	const DataStream = __webpack_require__(50);
	const jwa = __webpack_require__(53);
	const Stream = __webpack_require__(52);
	const toString = __webpack_require__(59);
	const util = __webpack_require__(9);
	const JWS_REGEX = /^[a-zA-Z0-9\-_]+?\.[a-zA-Z0-9\-_]+?\.([a-zA-Z0-9\-_]+)?$/;

	function isObject(thing) {
	  return Object.prototype.toString.call(thing) === '[object Object]';
	}

	function safeJsonParse(thing) {
	  if (isObject(thing))
	    return thing;
	  try { return JSON.parse(thing); }
	  catch (e) { return undefined; }
	}

	function headerFromJWS(jwsSig) {
	  const encodedHeader = jwsSig.split('.', 1)[0];
	  return safeJsonParse(base64url.decode(encodedHeader, 'binary'));
	}

	function securedInputFromJWS(jwsSig) {
	  return jwsSig.split('.', 2).join('.');
	}

	function signatureFromJWS(jwsSig) {
	  return jwsSig.split('.')[2];
	}

	function payloadFromJWS(jwsSig, encoding) {
	  encoding = encoding || 'utf8';
	  const payload = jwsSig.split('.')[1];
	  return base64url.decode(payload, encoding);
	}

	function isValidJws(string) {
	  return JWS_REGEX.test(string) && !!headerFromJWS(string);
	}

	function jwsVerify(jwsSig, algorithm, secretOrKey) {
	  if (!algorithm) {
	    var err = new Error("Missing algorithm parameter for jws.verify");
	    err.code = "MISSING_ALGORITHM";
	    throw err;
	  }
	  jwsSig = toString(jwsSig);
	  const signature = signatureFromJWS(jwsSig);
	  const securedInput = securedInputFromJWS(jwsSig);
	  const algo = jwa(algorithm);
	  return algo.verify(securedInput, signature, secretOrKey);
	}

	function jwsDecode(jwsSig, opts) {
	  opts = opts || {};
	  jwsSig = toString(jwsSig);

	  if (!isValidJws(jwsSig))
	    return null;

	  const header = headerFromJWS(jwsSig);

	  if (!header)
	    return null;

	  var payload = payloadFromJWS(jwsSig);
	  if (header.typ === 'JWT' || opts.json)
	    payload = JSON.parse(payload, opts.encoding);

	  return {
	    header: header,
	    payload: payload,
	    signature: signatureFromJWS(jwsSig)
	  };
	}

	function VerifyStream(opts) {
	  opts = opts || {};
	  const secretOrKey = opts.secret||opts.publicKey||opts.key;
	  const secretStream = new DataStream(secretOrKey);
	  this.readable = true;
	  this.algorithm = opts.algorithm;
	  this.encoding = opts.encoding;
	  this.secret = this.publicKey = this.key = secretStream;
	  this.signature = new DataStream(opts.signature);
	  this.secret.once('close', function () {
	    if (!this.signature.writable && this.readable)
	      this.verify();
	  }.bind(this));

	  this.signature.once('close', function () {
	    if (!this.secret.writable && this.readable)
	      this.verify();
	  }.bind(this));
	}
	util.inherits(VerifyStream, Stream);
	VerifyStream.prototype.verify = function verify() {
	  try {
	    const valid = jwsVerify(this.signature.buffer, this.algorithm, this.key.buffer);
	    const obj = jwsDecode(this.signature.buffer, this.encoding);
	    this.emit('done', valid, obj);
	    this.emit('data', valid);
	    this.emit('end');
	    this.readable = false;
	    return valid;
	  } catch (e) {
	    this.readable = false;
	    this.emit('error', e);
	    this.emit('close');
	  }
	};

	VerifyStream.decode = jwsDecode;
	VerifyStream.isValid = isValidJws;
	VerifyStream.verify = jwsVerify;

	module.exports = VerifyStream;


/***/ },
/* 61 */
/***/ function(module, exports) {

	/**
	 * Helpers.
	 */

	var s = 1000;
	var m = s * 60;
	var h = m * 60;
	var d = h * 24;
	var y = d * 365.25;

	/**
	 * Parse or format the given `val`.
	 *
	 * Options:
	 *
	 *  - `long` verbose formatting [false]
	 *
	 * @param {String|Number} val
	 * @param {Object} options
	 * @return {String|Number}
	 * @api public
	 */

	module.exports = function(val, options){
	  options = options || {};
	  if ('string' == typeof val) return parse(val);
	  return options.long
	    ? long(val)
	    : short(val);
	};

	/**
	 * Parse the given `str` and return milliseconds.
	 *
	 * @param {String} str
	 * @return {Number}
	 * @api private
	 */

	function parse(str) {
	  str = '' + str;
	  if (str.length > 10000) return;
	  var match = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(str);
	  if (!match) return;
	  var n = parseFloat(match[1]);
	  var type = (match[2] || 'ms').toLowerCase();
	  switch (type) {
	    case 'years':
	    case 'year':
	    case 'yrs':
	    case 'yr':
	    case 'y':
	      return n * y;
	    case 'days':
	    case 'day':
	    case 'd':
	      return n * d;
	    case 'hours':
	    case 'hour':
	    case 'hrs':
	    case 'hr':
	    case 'h':
	      return n * h;
	    case 'minutes':
	    case 'minute':
	    case 'mins':
	    case 'min':
	    case 'm':
	      return n * m;
	    case 'seconds':
	    case 'second':
	    case 'secs':
	    case 'sec':
	    case 's':
	      return n * s;
	    case 'milliseconds':
	    case 'millisecond':
	    case 'msecs':
	    case 'msec':
	    case 'ms':
	      return n;
	  }
	}

	/**
	 * Short format for `ms`.
	 *
	 * @param {Number} ms
	 * @return {String}
	 * @api private
	 */

	function short(ms) {
	  if (ms >= d) return Math.round(ms / d) + 'd';
	  if (ms >= h) return Math.round(ms / h) + 'h';
	  if (ms >= m) return Math.round(ms / m) + 'm';
	  if (ms >= s) return Math.round(ms / s) + 's';
	  return ms + 'ms';
	}

	/**
	 * Long format for `ms`.
	 *
	 * @param {Number} ms
	 * @return {String}
	 * @api private
	 */

	function long(ms) {
	  return plural(ms, d, 'day')
	    || plural(ms, h, 'hour')
	    || plural(ms, m, 'minute')
	    || plural(ms, s, 'second')
	    || ms + ' ms';
	}

	/**
	 * Pluralization helper.
	 */

	function plural(ms, n, name) {
	  if (ms < n) return;
	  if (ms < n * 1.5) return Math.floor(ms / n) + ' ' + name;
	  return Math.ceil(ms / n) + ' ' + name + 's';
	}


/***/ },
/* 62 */
/***/ function(module, exports, __webpack_require__) {

	var ms = __webpack_require__(61);

	module.exports = function (time) {
	  var timestamp = Math.floor(Date.now() / 1000);

	  if (typeof time === 'string') {
	    var milliseconds = ms(time);
	    if (typeof milliseconds === 'undefined') {
	      return;
	    }
	    return Math.floor(timestamp + milliseconds / 1000);
	  } else if (typeof time === 'number' ) {
	    return timestamp + time;
	  } else {
	    return;
	  }

	};

/***/ },
/* 63 */
/***/ function(module, exports) {

	module.exports = extend

	var hasOwnProperty = Object.prototype.hasOwnProperty;

	function extend() {
	    var target = {}

	    for (var i = 0; i < arguments.length; i++) {
	        var source = arguments[i]

	        for (var key in source) {
	            if (hasOwnProperty.call(source, key)) {
	                target[key] = source[key]
	            }
	        }
	    }

	    return target
	}


/***/ },
/* 64 */
/***/ function(module, exports) {

	var JsonWebTokenError = function (message, error) {
	  Error.call(this, message);
	  Error.captureStackTrace(this, this.constructor);
	  this.name = 'JsonWebTokenError';
	  this.message = message;
	  if (error) this.inner = error;
	};

	JsonWebTokenError.prototype = Object.create(Error.prototype);
	JsonWebTokenError.prototype.constructor = JsonWebTokenError;

	module.exports = JsonWebTokenError;

/***/ },
/* 65 */
/***/ function(module, exports, __webpack_require__) {

	var JsonWebTokenError = __webpack_require__(64);

	var NotBeforeError = function (message, date) {
	  JsonWebTokenError.call(this, message);
	  this.name = 'NotBeforeError';
	  this.date = date;
	};

	NotBeforeError.prototype = Object.create(JsonWebTokenError.prototype);

	NotBeforeError.prototype.constructor = NotBeforeError;

	module.exports = NotBeforeError;

/***/ },
/* 66 */
/***/ function(module, exports, __webpack_require__) {

	var JsonWebTokenError = __webpack_require__(64);

	var TokenExpiredError = function (message, expiredAt) {
	  JsonWebTokenError.call(this, message);
	  this.name = 'TokenExpiredError';
	  this.expiredAt = expiredAt;
	};

	TokenExpiredError.prototype = Object.create(JsonWebTokenError.prototype);

	TokenExpiredError.prototype.constructor = TokenExpiredError;

	module.exports = TokenExpiredError;

/***/ },
/* 67 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * express
	 * Copyright(c) 2009-2013 TJ Holowaychuk
	 * Copyright(c) 2013 Roman Shtylman
	 * Copyright(c) 2014-2015 Douglas Christopher Wilson
	 * MIT Licensed
	 */

	'use strict';

	/**
	 * Module dependencies.
	 * @private
	 */

	var Route = __webpack_require__(68);
	var Layer = __webpack_require__(74);
	var methods = __webpack_require__(76);
	var mixin = __webpack_require__(25);
	var debug = __webpack_require__(69)('express:router');
	var deprecate = __webpack_require__(77)('express');
	var flatten = __webpack_require__(73);
	var parseUrl = __webpack_require__(83);

	/**
	 * Module variables.
	 * @private
	 */

	var objectRegExp = /^\[object (\S+)\]$/;
	var slice = Array.prototype.slice;
	var toString = Object.prototype.toString;

	/**
	 * Initialize a new `Router` with the given `options`.
	 *
	 * @param {Object} options
	 * @return {Router} which is an callable function
	 * @public
	 */

	var proto = module.exports = function(options) {
	  var opts = options || {};

	  function router(req, res, next) {
	    router.handle(req, res, next);
	  }

	  // mixin Router class functions
	  router.__proto__ = proto;

	  router.params = {};
	  router._params = [];
	  router.caseSensitive = opts.caseSensitive;
	  router.mergeParams = opts.mergeParams;
	  router.strict = opts.strict;
	  router.stack = [];

	  return router;
	};

	/**
	 * Map the given param placeholder `name`(s) to the given callback.
	 *
	 * Parameter mapping is used to provide pre-conditions to routes
	 * which use normalized placeholders. For example a _:user_id_ parameter
	 * could automatically load a user's information from the database without
	 * any additional code,
	 *
	 * The callback uses the same signature as middleware, the only difference
	 * being that the value of the placeholder is passed, in this case the _id_
	 * of the user. Once the `next()` function is invoked, just like middleware
	 * it will continue on to execute the route, or subsequent parameter functions.
	 *
	 * Just like in middleware, you must either respond to the request or call next
	 * to avoid stalling the request.
	 *
	 *  app.param('user_id', function(req, res, next, id){
	 *    User.find(id, function(err, user){
	 *      if (err) {
	 *        return next(err);
	 *      } else if (!user) {
	 *        return next(new Error('failed to load user'));
	 *      }
	 *      req.user = user;
	 *      next();
	 *    });
	 *  });
	 *
	 * @param {String} name
	 * @param {Function} fn
	 * @return {app} for chaining
	 * @public
	 */

	proto.param = function param(name, fn) {
	  // param logic
	  if (typeof name === 'function') {
	    deprecate('router.param(fn): Refactor to use path params');
	    this._params.push(name);
	    return;
	  }

	  // apply param functions
	  var params = this._params;
	  var len = params.length;
	  var ret;

	  if (name[0] === ':') {
	    deprecate('router.param(' + JSON.stringify(name) + ', fn): Use router.param(' + JSON.stringify(name.substr(1)) + ', fn) instead');
	    name = name.substr(1);
	  }

	  for (var i = 0; i < len; ++i) {
	    if (ret = params[i](name, fn)) {
	      fn = ret;
	    }
	  }

	  // ensure we end up with a
	  // middleware function
	  if ('function' != typeof fn) {
	    throw new Error('invalid param() call for ' + name + ', got ' + fn);
	  }

	  (this.params[name] = this.params[name] || []).push(fn);
	  return this;
	};

	/**
	 * Dispatch a req, res into the router.
	 * @private
	 */

	proto.handle = function handle(req, res, out) {
	  var self = this;

	  debug('dispatching %s %s', req.method, req.url);

	  var search = 1 + req.url.indexOf('?');
	  var pathlength = search ? search - 1 : req.url.length;
	  var fqdn = req.url[0] !== '/' && 1 + req.url.substr(0, pathlength).indexOf('://');
	  var protohost = fqdn ? req.url.substr(0, req.url.indexOf('/', 2 + fqdn)) : '';
	  var idx = 0;
	  var removed = '';
	  var slashAdded = false;
	  var paramcalled = {};

	  // store options for OPTIONS request
	  // only used if OPTIONS request
	  var options = [];

	  // middleware and routes
	  var stack = self.stack;

	  // manage inter-router variables
	  var parentParams = req.params;
	  var parentUrl = req.baseUrl || '';
	  var done = restore(out, req, 'baseUrl', 'next', 'params');

	  // setup next layer
	  req.next = next;

	  // for options requests, respond with a default if nothing else responds
	  if (req.method === 'OPTIONS') {
	    done = wrap(done, function(old, err) {
	      if (err || options.length === 0) return old(err);
	      sendOptionsResponse(res, options, old);
	    });
	  }

	  // setup basic req values
	  req.baseUrl = parentUrl;
	  req.originalUrl = req.originalUrl || req.url;

	  next();

	  function next(err) {
	    var layerError = err === 'route'
	      ? null
	      : err;

	    // remove added slash
	    if (slashAdded) {
	      req.url = req.url.substr(1);
	      slashAdded = false;
	    }

	    // restore altered req.url
	    if (removed.length !== 0) {
	      req.baseUrl = parentUrl;
	      req.url = protohost + removed + req.url.substr(protohost.length);
	      removed = '';
	    }

	    // no more matching layers
	    if (idx >= stack.length) {
	      setImmediate(done, layerError);
	      return;
	    }

	    // get pathname of request
	    var path = getPathname(req);

	    if (path == null) {
	      return done(layerError);
	    }

	    // find next matching layer
	    var layer;
	    var match;
	    var route;

	    while (match !== true && idx < stack.length) {
	      layer = stack[idx++];
	      match = matchLayer(layer, path);
	      route = layer.route;

	      if (typeof match !== 'boolean') {
	        // hold on to layerError
	        layerError = layerError || match;
	      }

	      if (match !== true) {
	        continue;
	      }

	      if (!route) {
	        // process non-route handlers normally
	        continue;
	      }

	      if (layerError) {
	        // routes do not match with a pending error
	        match = false;
	        continue;
	      }

	      var method = req.method;
	      var has_method = route._handles_method(method);

	      // build up automatic options response
	      if (!has_method && method === 'OPTIONS') {
	        appendMethods(options, route._options());
	      }

	      // don't even bother matching route
	      if (!has_method && method !== 'HEAD') {
	        match = false;
	        continue;
	      }
	    }

	    // no match
	    if (match !== true) {
	      return done(layerError);
	    }

	    // store route for dispatch on change
	    if (route) {
	      req.route = route;
	    }

	    // Capture one-time layer values
	    req.params = self.mergeParams
	      ? mergeParams(layer.params, parentParams)
	      : layer.params;
	    var layerPath = layer.path;

	    // this should be done for the layer
	    self.process_params(layer, paramcalled, req, res, function (err) {
	      if (err) {
	        return next(layerError || err);
	      }

	      if (route) {
	        return layer.handle_request(req, res, next);
	      }

	      trim_prefix(layer, layerError, layerPath, path);
	    });
	  }

	  function trim_prefix(layer, layerError, layerPath, path) {
	    var c = path[layerPath.length];
	    if (c && '/' !== c && '.' !== c) return next(layerError);

	     // Trim off the part of the url that matches the route
	     // middleware (.use stuff) needs to have the path stripped
	    if (layerPath.length !== 0) {
	      debug('trim prefix (%s) from url %s', layerPath, req.url);
	      removed = layerPath;
	      req.url = protohost + req.url.substr(protohost.length + removed.length);

	      // Ensure leading slash
	      if (!fqdn && req.url[0] !== '/') {
	        req.url = '/' + req.url;
	        slashAdded = true;
	      }

	      // Setup base URL (no trailing slash)
	      req.baseUrl = parentUrl + (removed[removed.length - 1] === '/'
	        ? removed.substring(0, removed.length - 1)
	        : removed);
	    }

	    debug('%s %s : %s', layer.name, layerPath, req.originalUrl);

	    if (layerError) {
	      layer.handle_error(layerError, req, res, next);
	    } else {
	      layer.handle_request(req, res, next);
	    }
	  }
	};

	/**
	 * Process any parameters for the layer.
	 * @private
	 */

	proto.process_params = function process_params(layer, called, req, res, done) {
	  var params = this.params;

	  // captured parameters from the layer, keys and values
	  var keys = layer.keys;

	  // fast track
	  if (!keys || keys.length === 0) {
	    return done();
	  }

	  var i = 0;
	  var name;
	  var paramIndex = 0;
	  var key;
	  var paramVal;
	  var paramCallbacks;
	  var paramCalled;

	  // process params in order
	  // param callbacks can be async
	  function param(err) {
	    if (err) {
	      return done(err);
	    }

	    if (i >= keys.length ) {
	      return done();
	    }

	    paramIndex = 0;
	    key = keys[i++];

	    if (!key) {
	      return done();
	    }

	    name = key.name;
	    paramVal = req.params[name];
	    paramCallbacks = params[name];
	    paramCalled = called[name];

	    if (paramVal === undefined || !paramCallbacks) {
	      return param();
	    }

	    // param previously called with same value or error occurred
	    if (paramCalled && (paramCalled.match === paramVal
	      || (paramCalled.error && paramCalled.error !== 'route'))) {
	      // restore value
	      req.params[name] = paramCalled.value;

	      // next param
	      return param(paramCalled.error);
	    }

	    called[name] = paramCalled = {
	      error: null,
	      match: paramVal,
	      value: paramVal
	    };

	    paramCallback();
	  }

	  // single param callbacks
	  function paramCallback(err) {
	    var fn = paramCallbacks[paramIndex++];

	    // store updated value
	    paramCalled.value = req.params[key.name];

	    if (err) {
	      // store error
	      paramCalled.error = err;
	      param(err);
	      return;
	    }

	    if (!fn) return param();

	    try {
	      fn(req, res, paramCallback, paramVal, key.name);
	    } catch (e) {
	      paramCallback(e);
	    }
	  }

	  param();
	};

	/**
	 * Use the given middleware function, with optional path, defaulting to "/".
	 *
	 * Use (like `.all`) will run for any http METHOD, but it will not add
	 * handlers for those methods so OPTIONS requests will not consider `.use`
	 * functions even if they could respond.
	 *
	 * The other difference is that _route_ path is stripped and not visible
	 * to the handler function. The main effect of this feature is that mounted
	 * handlers can operate without any code changes regardless of the "prefix"
	 * pathname.
	 *
	 * @public
	 */

	proto.use = function use(fn) {
	  var offset = 0;
	  var path = '/';

	  // default path to '/'
	  // disambiguate router.use([fn])
	  if (typeof fn !== 'function') {
	    var arg = fn;

	    while (Array.isArray(arg) && arg.length !== 0) {
	      arg = arg[0];
	    }

	    // first arg is the path
	    if (typeof arg !== 'function') {
	      offset = 1;
	      path = fn;
	    }
	  }

	  var callbacks = flatten(slice.call(arguments, offset));

	  if (callbacks.length === 0) {
	    throw new TypeError('Router.use() requires middleware functions');
	  }

	  for (var i = 0; i < callbacks.length; i++) {
	    var fn = callbacks[i];

	    if (typeof fn !== 'function') {
	      throw new TypeError('Router.use() requires middleware function but got a ' + gettype(fn));
	    }

	    // add the middleware
	    debug('use %s %s', path, fn.name || '<anonymous>');

	    var layer = new Layer(path, {
	      sensitive: this.caseSensitive,
	      strict: false,
	      end: false
	    }, fn);

	    layer.route = undefined;

	    this.stack.push(layer);
	  }

	  return this;
	};

	/**
	 * Create a new Route for the given path.
	 *
	 * Each route contains a separate middleware stack and VERB handlers.
	 *
	 * See the Route api documentation for details on adding handlers
	 * and middleware to routes.
	 *
	 * @param {String} path
	 * @return {Route}
	 * @public
	 */

	proto.route = function route(path) {
	  var route = new Route(path);

	  var layer = new Layer(path, {
	    sensitive: this.caseSensitive,
	    strict: this.strict,
	    end: true
	  }, route.dispatch.bind(route));

	  layer.route = route;

	  this.stack.push(layer);
	  return route;
	};

	// create Router#VERB functions
	methods.concat('all').forEach(function(method){
	  proto[method] = function(path){
	    var route = this.route(path)
	    route[method].apply(route, slice.call(arguments, 1));
	    return this;
	  };
	});

	// append methods to a list of methods
	function appendMethods(list, addition) {
	  for (var i = 0; i < addition.length; i++) {
	    var method = addition[i];
	    if (list.indexOf(method) === -1) {
	      list.push(method);
	    }
	  }
	}

	// get pathname of request
	function getPathname(req) {
	  try {
	    return parseUrl(req).pathname;
	  } catch (err) {
	    return undefined;
	  }
	}

	// get type for error message
	function gettype(obj) {
	  var type = typeof obj;

	  if (type !== 'object') {
	    return type;
	  }

	  // inspect [[Class]] for objects
	  return toString.call(obj)
	    .replace(objectRegExp, '$1');
	}

	/**
	 * Match path to a layer.
	 *
	 * @param {Layer} layer
	 * @param {string} path
	 * @private
	 */

	function matchLayer(layer, path) {
	  try {
	    return layer.match(path);
	  } catch (err) {
	    return err;
	  }
	}

	// merge params with parent params
	function mergeParams(params, parent) {
	  if (typeof parent !== 'object' || !parent) {
	    return params;
	  }

	  // make copy of parent for base
	  var obj = mixin({}, parent);

	  // simple non-numeric merging
	  if (!(0 in params) || !(0 in parent)) {
	    return mixin(obj, params);
	  }

	  var i = 0;
	  var o = 0;

	  // determine numeric gaps
	  while (i in params) {
	    i++;
	  }

	  while (o in parent) {
	    o++;
	  }

	  // offset numeric indices in params before merge
	  for (i--; i >= 0; i--) {
	    params[i + o] = params[i];

	    // create holes for the merge when necessary
	    if (i < o) {
	      delete params[i];
	    }
	  }

	  return mixin(obj, params);
	}

	// restore obj props after function
	function restore(fn, obj) {
	  var props = new Array(arguments.length - 2);
	  var vals = new Array(arguments.length - 2);

	  for (var i = 0; i < props.length; i++) {
	    props[i] = arguments[i + 2];
	    vals[i] = obj[props[i]];
	  }

	  return function(err){
	    // restore vals
	    for (var i = 0; i < props.length; i++) {
	      obj[props[i]] = vals[i];
	    }

	    return fn.apply(this, arguments);
	  };
	}

	// send an OPTIONS response
	function sendOptionsResponse(res, options, next) {
	  try {
	    var body = options.join(',');
	    res.set('Allow', body);
	    res.send(body);
	  } catch (err) {
	    next(err);
	  }
	}

	// wrap a function
	function wrap(old, fn) {
	  return function proxy() {
	    var args = new Array(arguments.length + 1);

	    args[0] = old;
	    for (var i = 0, len = arguments.length; i < len; i++) {
	      args[i + 1] = arguments[i];
	    }

	    fn.apply(this, args);
	  };
	}


/***/ },
/* 68 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * express
	 * Copyright(c) 2009-2013 TJ Holowaychuk
	 * Copyright(c) 2013 Roman Shtylman
	 * Copyright(c) 2014-2015 Douglas Christopher Wilson
	 * MIT Licensed
	 */

	'use strict';

	/**
	 * Module dependencies.
	 * @private
	 */

	var debug = __webpack_require__(69)('express:router:route');
	var flatten = __webpack_require__(73);
	var Layer = __webpack_require__(74);
	var methods = __webpack_require__(76);

	/**
	 * Module variables.
	 * @private
	 */

	var slice = Array.prototype.slice;
	var toString = Object.prototype.toString;

	/**
	 * Module exports.
	 * @public
	 */

	module.exports = Route;

	/**
	 * Initialize `Route` with the given `path`,
	 *
	 * @param {String} path
	 * @public
	 */

	function Route(path) {
	  this.path = path;
	  this.stack = [];

	  debug('new %s', path);

	  // route handlers for various http methods
	  this.methods = {};
	}

	/**
	 * Determine if the route handles a given method.
	 * @private
	 */

	Route.prototype._handles_method = function _handles_method(method) {
	  if (this.methods._all) {
	    return true;
	  }

	  var name = method.toLowerCase();

	  if (name === 'head' && !this.methods['head']) {
	    name = 'get';
	  }

	  return Boolean(this.methods[name]);
	};

	/**
	 * @return {Array} supported HTTP methods
	 * @private
	 */

	Route.prototype._options = function _options() {
	  var methods = Object.keys(this.methods);

	  // append automatic head
	  if (this.methods.get && !this.methods.head) {
	    methods.push('head');
	  }

	  for (var i = 0; i < methods.length; i++) {
	    // make upper case
	    methods[i] = methods[i].toUpperCase();
	  }

	  return methods;
	};

	/**
	 * dispatch req, res into this route
	 * @private
	 */

	Route.prototype.dispatch = function dispatch(req, res, done) {
	  var idx = 0;
	  var stack = this.stack;
	  if (stack.length === 0) {
	    return done();
	  }

	  var method = req.method.toLowerCase();
	  if (method === 'head' && !this.methods['head']) {
	    method = 'get';
	  }

	  req.route = this;

	  next();

	  function next(err) {
	    if (err && err === 'route') {
	      return done();
	    }

	    var layer = stack[idx++];
	    if (!layer) {
	      return done(err);
	    }

	    if (layer.method && layer.method !== method) {
	      return next(err);
	    }

	    if (err) {
	      layer.handle_error(err, req, res, next);
	    } else {
	      layer.handle_request(req, res, next);
	    }
	  }
	};

	/**
	 * Add a handler for all HTTP verbs to this route.
	 *
	 * Behaves just like middleware and can respond or call `next`
	 * to continue processing.
	 *
	 * You can use multiple `.all` call to add multiple handlers.
	 *
	 *   function check_something(req, res, next){
	 *     next();
	 *   };
	 *
	 *   function validate_user(req, res, next){
	 *     next();
	 *   };
	 *
	 *   route
	 *   .all(validate_user)
	 *   .all(check_something)
	 *   .get(function(req, res, next){
	 *     res.send('hello world');
	 *   });
	 *
	 * @param {function} handler
	 * @return {Route} for chaining
	 * @api public
	 */

	Route.prototype.all = function all() {
	  var handles = flatten(slice.call(arguments));

	  for (var i = 0; i < handles.length; i++) {
	    var handle = handles[i];

	    if (typeof handle !== 'function') {
	      var type = toString.call(handle);
	      var msg = 'Route.all() requires callback functions but got a ' + type;
	      throw new TypeError(msg);
	    }

	    var layer = Layer('/', {}, handle);
	    layer.method = undefined;

	    this.methods._all = true;
	    this.stack.push(layer);
	  }

	  return this;
	};

	methods.forEach(function(method){
	  Route.prototype[method] = function(){
	    var handles = flatten(slice.call(arguments));

	    for (var i = 0; i < handles.length; i++) {
	      var handle = handles[i];

	      if (typeof handle !== 'function') {
	        var type = toString.call(handle);
	        var msg = 'Route.' + method + '() requires callback functions but got a ' + type;
	        throw new Error(msg);
	      }

	      debug('%s %s', method, this.path);

	      var layer = Layer('/', {}, handle);
	      layer.method = method;

	      this.methods[method] = true;
	      this.stack.push(layer);
	    }

	    return this;
	  };
	});


/***/ },
/* 69 */
/***/ function(module, exports, __webpack_require__) {

	
	/**
	 * Module dependencies.
	 */

	var tty = __webpack_require__(70);
	var util = __webpack_require__(9);

	/**
	 * This is the Node.js implementation of `debug()`.
	 *
	 * Expose `debug()` as the module.
	 */

	exports = module.exports = __webpack_require__(71);
	exports.log = log;
	exports.formatArgs = formatArgs;
	exports.save = save;
	exports.load = load;
	exports.useColors = useColors;

	/**
	 * Colors.
	 */

	exports.colors = [6, 2, 3, 4, 5, 1];

	/**
	 * The file descriptor to write the `debug()` calls to.
	 * Set the `DEBUG_FD` env variable to override with another value. i.e.:
	 *
	 *   $ DEBUG_FD=3 node script.js 3>debug.log
	 */

	var fd = parseInt(process.env.DEBUG_FD, 10) || 2;
	var stream = 1 === fd ? process.stdout :
	             2 === fd ? process.stderr :
	             createWritableStdioStream(fd);

	/**
	 * Is stdout a TTY? Colored output is enabled when `true`.
	 */

	function useColors() {
	  var debugColors = (process.env.DEBUG_COLORS || '').trim().toLowerCase();
	  if (0 === debugColors.length) {
	    return tty.isatty(fd);
	  } else {
	    return '0' !== debugColors
	        && 'no' !== debugColors
	        && 'false' !== debugColors
	        && 'disabled' !== debugColors;
	  }
	}

	/**
	 * Map %o to `util.inspect()`, since Node doesn't do that out of the box.
	 */

	var inspect = (4 === util.inspect.length ?
	  // node <= 0.8.x
	  function (v, colors) {
	    return util.inspect(v, void 0, void 0, colors);
	  } :
	  // node > 0.8.x
	  function (v, colors) {
	    return util.inspect(v, { colors: colors });
	  }
	);

	exports.formatters.o = function(v) {
	  return inspect(v, this.useColors)
	    .replace(/\s*\n\s*/g, ' ');
	};

	/**
	 * Adds ANSI color escape codes if enabled.
	 *
	 * @api public
	 */

	function formatArgs() {
	  var args = arguments;
	  var useColors = this.useColors;
	  var name = this.namespace;

	  if (useColors) {
	    var c = this.color;

	    args[0] = '  \u001b[3' + c + ';1m' + name + ' '
	      + '\u001b[0m'
	      + args[0] + '\u001b[3' + c + 'm'
	      + ' +' + exports.humanize(this.diff) + '\u001b[0m';
	  } else {
	    args[0] = new Date().toUTCString()
	      + ' ' + name + ' ' + args[0];
	  }
	  return args;
	}

	/**
	 * Invokes `console.error()` with the specified arguments.
	 */

	function log() {
	  return stream.write(util.format.apply(this, arguments) + '\n');
	}

	/**
	 * Save `namespaces`.
	 *
	 * @param {String} namespaces
	 * @api private
	 */

	function save(namespaces) {
	  if (null == namespaces) {
	    // If you set a process.env field to null or undefined, it gets cast to the
	    // string 'null' or 'undefined'. Just delete instead.
	    delete process.env.DEBUG;
	  } else {
	    process.env.DEBUG = namespaces;
	  }
	}

	/**
	 * Load `namespaces`.
	 *
	 * @return {String} returns the previously persisted debug modes
	 * @api private
	 */

	function load() {
	  return process.env.DEBUG;
	}

	/**
	 * Copied from `node/src/node.js`.
	 *
	 * XXX: It's lame that node doesn't expose this API out-of-the-box. It also
	 * relies on the undocumented `tty_wrap.guessHandleType()` which is also lame.
	 */

	function createWritableStdioStream (fd) {
	  var stream;
	  var tty_wrap = process.binding('tty_wrap');

	  // Note stream._type is used for test-module-load-list.js

	  switch (tty_wrap.guessHandleType(fd)) {
	    case 'TTY':
	      stream = new tty.WriteStream(fd);
	      stream._type = 'tty';

	      // Hack to have stream not keep the event loop alive.
	      // See https://github.com/joyent/node/issues/1726
	      if (stream._handle && stream._handle.unref) {
	        stream._handle.unref();
	      }
	      break;

	    case 'FILE':
	      var fs = __webpack_require__(44);
	      stream = new fs.SyncWriteStream(fd, { autoClose: false });
	      stream._type = 'fs';
	      break;

	    case 'PIPE':
	    case 'TCP':
	      var net = __webpack_require__(72);
	      stream = new net.Socket({
	        fd: fd,
	        readable: false,
	        writable: true
	      });

	      // FIXME Should probably have an option in net.Socket to create a
	      // stream from an existing fd which is writable only. But for now
	      // we'll just add this hack and set the `readable` member to false.
	      // Test: ./node test/fixtures/echo.js < /etc/passwd
	      stream.readable = false;
	      stream.read = null;
	      stream._type = 'pipe';

	      // FIXME Hack to have stream not keep the event loop alive.
	      // See https://github.com/joyent/node/issues/1726
	      if (stream._handle && stream._handle.unref) {
	        stream._handle.unref();
	      }
	      break;

	    default:
	      // Probably an error on in uv_guess_handle()
	      throw new Error('Implement me. Unknown stream file type!');
	  }

	  // For supporting legacy API we put the FD here.
	  stream.fd = fd;

	  stream._isStdio = true;

	  return stream;
	}

	/**
	 * Enable namespaces listed in `process.env.DEBUG` initially.
	 */

	exports.enable(load());


/***/ },
/* 70 */
/***/ function(module, exports) {

	module.exports = require("tty");

/***/ },
/* 71 */
/***/ function(module, exports, __webpack_require__) {

	
	/**
	 * This is the common logic for both the Node.js and web browser
	 * implementations of `debug()`.
	 *
	 * Expose `debug()` as the module.
	 */

	exports = module.exports = debug;
	exports.coerce = coerce;
	exports.disable = disable;
	exports.enable = enable;
	exports.enabled = enabled;
	exports.humanize = __webpack_require__(61);

	/**
	 * The currently active debug mode names, and names to skip.
	 */

	exports.names = [];
	exports.skips = [];

	/**
	 * Map of special "%n" handling functions, for the debug "format" argument.
	 *
	 * Valid key names are a single, lowercased letter, i.e. "n".
	 */

	exports.formatters = {};

	/**
	 * Previously assigned color.
	 */

	var prevColor = 0;

	/**
	 * Previous log timestamp.
	 */

	var prevTime;

	/**
	 * Select a color.
	 *
	 * @return {Number}
	 * @api private
	 */

	function selectColor() {
	  return exports.colors[prevColor++ % exports.colors.length];
	}

	/**
	 * Create a debugger with the given `namespace`.
	 *
	 * @param {String} namespace
	 * @return {Function}
	 * @api public
	 */

	function debug(namespace) {

	  // define the `disabled` version
	  function disabled() {
	  }
	  disabled.enabled = false;

	  // define the `enabled` version
	  function enabled() {

	    var self = enabled;

	    // set `diff` timestamp
	    var curr = +new Date();
	    var ms = curr - (prevTime || curr);
	    self.diff = ms;
	    self.prev = prevTime;
	    self.curr = curr;
	    prevTime = curr;

	    // add the `color` if not set
	    if (null == self.useColors) self.useColors = exports.useColors();
	    if (null == self.color && self.useColors) self.color = selectColor();

	    var args = Array.prototype.slice.call(arguments);

	    args[0] = exports.coerce(args[0]);

	    if ('string' !== typeof args[0]) {
	      // anything else let's inspect with %o
	      args = ['%o'].concat(args);
	    }

	    // apply any `formatters` transformations
	    var index = 0;
	    args[0] = args[0].replace(/%([a-z%])/g, function(match, format) {
	      // if we encounter an escaped % then don't increase the array index
	      if (match === '%%') return match;
	      index++;
	      var formatter = exports.formatters[format];
	      if ('function' === typeof formatter) {
	        var val = args[index];
	        match = formatter.call(self, val);

	        // now we need to remove `args[index]` since it's inlined in the `format`
	        args.splice(index, 1);
	        index--;
	      }
	      return match;
	    });

	    if ('function' === typeof exports.formatArgs) {
	      args = exports.formatArgs.apply(self, args);
	    }
	    var logFn = enabled.log || exports.log || console.log.bind(console);
	    logFn.apply(self, args);
	  }
	  enabled.enabled = true;

	  var fn = exports.enabled(namespace) ? enabled : disabled;

	  fn.namespace = namespace;

	  return fn;
	}

	/**
	 * Enables a debug mode by namespaces. This can include modes
	 * separated by a colon and wildcards.
	 *
	 * @param {String} namespaces
	 * @api public
	 */

	function enable(namespaces) {
	  exports.save(namespaces);

	  var split = (namespaces || '').split(/[\s,]+/);
	  var len = split.length;

	  for (var i = 0; i < len; i++) {
	    if (!split[i]) continue; // ignore empty strings
	    namespaces = split[i].replace(/\*/g, '.*?');
	    if (namespaces[0] === '-') {
	      exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
	    } else {
	      exports.names.push(new RegExp('^' + namespaces + '$'));
	    }
	  }
	}

	/**
	 * Disable debug output.
	 *
	 * @api public
	 */

	function disable() {
	  exports.enable('');
	}

	/**
	 * Returns true if the given mode name is enabled, false otherwise.
	 *
	 * @param {String} name
	 * @return {Boolean}
	 * @api public
	 */

	function enabled(name) {
	  var i, len;
	  for (i = 0, len = exports.skips.length; i < len; i++) {
	    if (exports.skips[i].test(name)) {
	      return false;
	    }
	  }
	  for (i = 0, len = exports.names.length; i < len; i++) {
	    if (exports.names[i].test(name)) {
	      return true;
	    }
	  }
	  return false;
	}

	/**
	 * Coerce `val`.
	 *
	 * @param {Mixed} val
	 * @return {Mixed}
	 * @api private
	 */

	function coerce(val) {
	  if (val instanceof Error) return val.stack || val.message;
	  return val;
	}


/***/ },
/* 72 */
/***/ function(module, exports) {

	module.exports = require("net");

/***/ },
/* 73 */
/***/ function(module, exports) {

	'use strict'

	/**
	 * Expose `arrayFlatten`.
	 */
	module.exports = arrayFlatten

	/**
	 * Recursive flatten function with depth.
	 *
	 * @param  {Array}  array
	 * @param  {Array}  result
	 * @param  {Number} depth
	 * @return {Array}
	 */
	function flattenWithDepth (array, result, depth) {
	  for (var i = 0; i < array.length; i++) {
	    var value = array[i]

	    if (depth > 0 && Array.isArray(value)) {
	      flattenWithDepth(value, result, depth - 1)
	    } else {
	      result.push(value)
	    }
	  }

	  return result
	}

	/**
	 * Recursive flatten function. Omitting depth is slightly faster.
	 *
	 * @param  {Array} array
	 * @param  {Array} result
	 * @return {Array}
	 */
	function flattenForever (array, result) {
	  for (var i = 0; i < array.length; i++) {
	    var value = array[i]

	    if (Array.isArray(value)) {
	      flattenForever(value, result)
	    } else {
	      result.push(value)
	    }
	  }

	  return result
	}

	/**
	 * Flatten an array, with the ability to define a depth.
	 *
	 * @param  {Array}  array
	 * @param  {Number} depth
	 * @return {Array}
	 */
	function arrayFlatten (array, depth) {
	  if (depth == null) {
	    return flattenForever(array, [])
	  }

	  return flattenWithDepth(array, [], depth)
	}


/***/ },
/* 74 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * express
	 * Copyright(c) 2009-2013 TJ Holowaychuk
	 * Copyright(c) 2013 Roman Shtylman
	 * Copyright(c) 2014-2015 Douglas Christopher Wilson
	 * MIT Licensed
	 */

	'use strict';

	/**
	 * Module dependencies.
	 * @private
	 */

	var pathRegexp = __webpack_require__(75);
	var debug = __webpack_require__(69)('express:router:layer');

	/**
	 * Module variables.
	 * @private
	 */

	var hasOwnProperty = Object.prototype.hasOwnProperty;

	/**
	 * Module exports.
	 * @public
	 */

	module.exports = Layer;

	function Layer(path, options, fn) {
	  if (!(this instanceof Layer)) {
	    return new Layer(path, options, fn);
	  }

	  debug('new %s', path);
	  var opts = options || {};

	  this.handle = fn;
	  this.name = fn.name || '<anonymous>';
	  this.params = undefined;
	  this.path = undefined;
	  this.regexp = pathRegexp(path, this.keys = [], opts);

	  if (path === '/' && opts.end === false) {
	    this.regexp.fast_slash = true;
	  }
	}

	/**
	 * Handle the error for the layer.
	 *
	 * @param {Error} error
	 * @param {Request} req
	 * @param {Response} res
	 * @param {function} next
	 * @api private
	 */

	Layer.prototype.handle_error = function handle_error(error, req, res, next) {
	  var fn = this.handle;

	  if (fn.length !== 4) {
	    // not a standard error handler
	    return next(error);
	  }

	  try {
	    fn(error, req, res, next);
	  } catch (err) {
	    next(err);
	  }
	};

	/**
	 * Handle the request for the layer.
	 *
	 * @param {Request} req
	 * @param {Response} res
	 * @param {function} next
	 * @api private
	 */

	Layer.prototype.handle_request = function handle(req, res, next) {
	  var fn = this.handle;

	  if (fn.length > 3) {
	    // not a standard request handler
	    return next();
	  }

	  try {
	    fn(req, res, next);
	  } catch (err) {
	    next(err);
	  }
	};

	/**
	 * Check if this route matches `path`, if so
	 * populate `.params`.
	 *
	 * @param {String} path
	 * @return {Boolean}
	 * @api private
	 */

	Layer.prototype.match = function match(path) {
	  if (path == null) {
	    // no path, nothing matches
	    this.params = undefined;
	    this.path = undefined;
	    return false;
	  }

	  if (this.regexp.fast_slash) {
	    // fast path non-ending match for / (everything matches)
	    this.params = {};
	    this.path = '';
	    return true;
	  }

	  var m = this.regexp.exec(path);

	  if (!m) {
	    this.params = undefined;
	    this.path = undefined;
	    return false;
	  }

	  // store values
	  this.params = {};
	  this.path = m[0];

	  var keys = this.keys;
	  var params = this.params;

	  for (var i = 1; i < m.length; i++) {
	    var key = keys[i - 1];
	    var prop = key.name;
	    var val = decode_param(m[i]);

	    if (val !== undefined || !(hasOwnProperty.call(params, prop))) {
	      params[prop] = val;
	    }
	  }

	  return true;
	};

	/**
	 * Decode param value.
	 *
	 * @param {string} val
	 * @return {string}
	 * @private
	 */

	function decode_param(val) {
	  if (typeof val !== 'string' || val.length === 0) {
	    return val;
	  }

	  try {
	    return decodeURIComponent(val);
	  } catch (err) {
	    if (err instanceof URIError) {
	      err.message = 'Failed to decode param \'' + val + '\'';
	      err.status = err.statusCode = 400;
	    }

	    throw err;
	  }
	}


/***/ },
/* 75 */
/***/ function(module, exports) {

	/**
	 * Expose `pathtoRegexp`.
	 */

	module.exports = pathtoRegexp;

	/**
	 * Match matching groups in a regular expression.
	 */
	var MATCHING_GROUP_REGEXP = /\((?!\?)/g;

	/**
	 * Normalize the given path string,
	 * returning a regular expression.
	 *
	 * An empty array should be passed,
	 * which will contain the placeholder
	 * key names. For example "/user/:id" will
	 * then contain ["id"].
	 *
	 * @param  {String|RegExp|Array} path
	 * @param  {Array} keys
	 * @param  {Object} options
	 * @return {RegExp}
	 * @api private
	 */

	function pathtoRegexp(path, keys, options) {
	  options = options || {};
	  keys = keys || [];
	  var strict = options.strict;
	  var end = options.end !== false;
	  var flags = options.sensitive ? '' : 'i';
	  var extraOffset = 0;
	  var keysOffset = keys.length;
	  var i = 0;
	  var name = 0;
	  var m;

	  if (path instanceof RegExp) {
	    while (m = MATCHING_GROUP_REGEXP.exec(path.source)) {
	      keys.push({
	        name: name++,
	        optional: false,
	        offset: m.index
	      });
	    }

	    return path;
	  }

	  if (Array.isArray(path)) {
	    // Map array parts into regexps and return their source. We also pass
	    // the same keys and options instance into every generation to get
	    // consistent matching groups before we join the sources together.
	    path = path.map(function (value) {
	      return pathtoRegexp(value, keys, options).source;
	    });

	    return new RegExp('(?:' + path.join('|') + ')', flags);
	  }

	  path = ('^' + path + (strict ? '' : path[path.length - 1] === '/' ? '?' : '/?'))
	    .replace(/\/\(/g, '/(?:')
	    .replace(/([\/\.])/g, '\\$1')
	    .replace(/(\\\/)?(\\\.)?:(\w+)(\(.*?\))?(\*)?(\?)?/g, function (match, slash, format, key, capture, star, optional, offset) {
	      slash = slash || '';
	      format = format || '';
	      capture = capture || '([^\\/' + format + ']+?)';
	      optional = optional || '';

	      keys.push({
	        name: key,
	        optional: !!optional,
	        offset: offset + extraOffset
	      });

	      var result = ''
	        + (optional ? '' : slash)
	        + '(?:'
	        + format + (optional ? slash : '') + capture
	        + (star ? '((?:[\\/' + format + '].+?)?)' : '')
	        + ')'
	        + optional;

	      extraOffset += result.length - match.length;

	      return result;
	    })
	    .replace(/\*/g, function (star, index) {
	      var len = keys.length

	      while (len-- > keysOffset && keys[len].offset > index) {
	        keys[len].offset += 3; // Replacement length minus asterisk length.
	      }

	      return '(.*)';
	    });

	  // This is a workaround for handling unnamed matching groups.
	  while (m = MATCHING_GROUP_REGEXP.exec(path)) {
	    var escapeCount = 0;
	    var index = m.index;

	    while (path.charAt(--index) === '\\') {
	      escapeCount++;
	    }

	    // It's possible to escape the bracket.
	    if (escapeCount % 2 === 1) {
	      continue;
	    }

	    if (keysOffset + i === keys.length || keys[keysOffset + i].offset > m.index) {
	      keys.splice(keysOffset + i, 0, {
	        name: name++, // Unnamed matching groups must be consistently linear.
	        optional: false,
	        offset: m.index
	      });
	    }

	    i++;
	  }

	  // If the path is non-ending, match until the end or a slash.
	  path += (end ? '$' : (path[path.length - 1] === '/' ? '' : '(?=\\/|$)'));

	  return new RegExp(path, flags);
	};


/***/ },
/* 76 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * methods
	 * Copyright(c) 2013-2014 TJ Holowaychuk
	 * Copyright(c) 2015-2016 Douglas Christopher Wilson
	 * MIT Licensed
	 */

	'use strict';

	/**
	 * Module dependencies.
	 * @private
	 */

	var http = __webpack_require__(1);

	/**
	 * Module exports.
	 * @public
	 */

	module.exports = getCurrentNodeMethods() || getBasicNodeMethods();

	/**
	 * Get the current Node.js methods.
	 * @private
	 */

	function getCurrentNodeMethods() {
	  return http.METHODS && http.METHODS.map(function lowerCaseMethod(method) {
	    return method.toLowerCase();
	  });
	}

	/**
	 * Get the "basic" Node.js methods, a snapshot from Node.js 0.10.
	 * @private
	 */

	function getBasicNodeMethods() {
	  return [
	    'get',
	    'post',
	    'put',
	    'head',
	    'delete',
	    'options',
	    'trace',
	    'copy',
	    'lock',
	    'mkcol',
	    'move',
	    'purge',
	    'propfind',
	    'proppatch',
	    'unlock',
	    'report',
	    'mkactivity',
	    'checkout',
	    'merge',
	    'm-search',
	    'notify',
	    'subscribe',
	    'unsubscribe',
	    'patch',
	    'search',
	    'connect'
	  ];
	}


/***/ },
/* 77 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * depd
	 * Copyright(c) 2014-2015 Douglas Christopher Wilson
	 * MIT Licensed
	 */

	/**
	 * Module dependencies.
	 */

	var callSiteToString = __webpack_require__(78).callSiteToString
	var eventListenerCount = __webpack_require__(78).eventListenerCount
	var relative = __webpack_require__(45).relative

	/**
	 * Module exports.
	 */

	module.exports = depd

	/**
	 * Get the path to base files on.
	 */

	var basePath = process.cwd()

	/**
	 * Determine if namespace is contained in the string.
	 */

	function containsNamespace(str, namespace) {
	  var val = str.split(/[ ,]+/)

	  namespace = String(namespace).toLowerCase()

	  for (var i = 0 ; i < val.length; i++) {
	    if (!(str = val[i])) continue;

	    // namespace contained
	    if (str === '*' || str.toLowerCase() === namespace) {
	      return true
	    }
	  }

	  return false
	}

	/**
	 * Convert a data descriptor to accessor descriptor.
	 */

	function convertDataDescriptorToAccessor(obj, prop, message) {
	  var descriptor = Object.getOwnPropertyDescriptor(obj, prop)
	  var value = descriptor.value

	  descriptor.get = function getter() { return value }

	  if (descriptor.writable) {
	    descriptor.set = function setter(val) { return value = val }
	  }

	  delete descriptor.value
	  delete descriptor.writable

	  Object.defineProperty(obj, prop, descriptor)

	  return descriptor
	}

	/**
	 * Create arguments string to keep arity.
	 */

	function createArgumentsString(arity) {
	  var str = ''

	  for (var i = 0; i < arity; i++) {
	    str += ', arg' + i
	  }

	  return str.substr(2)
	}

	/**
	 * Create stack string from stack.
	 */

	function createStackString(stack) {
	  var str = this.name + ': ' + this.namespace

	  if (this.message) {
	    str += ' deprecated ' + this.message
	  }

	  for (var i = 0; i < stack.length; i++) {
	    str += '\n    at ' + callSiteToString(stack[i])
	  }

	  return str
	}

	/**
	 * Create deprecate for namespace in caller.
	 */

	function depd(namespace) {
	  if (!namespace) {
	    throw new TypeError('argument namespace is required')
	  }

	  var stack = getStack()
	  var site = callSiteLocation(stack[1])
	  var file = site[0]

	  function deprecate(message) {
	    // call to self as log
	    log.call(deprecate, message)
	  }

	  deprecate._file = file
	  deprecate._ignored = isignored(namespace)
	  deprecate._namespace = namespace
	  deprecate._traced = istraced(namespace)
	  deprecate._warned = Object.create(null)

	  deprecate.function = wrapfunction
	  deprecate.property = wrapproperty

	  return deprecate
	}

	/**
	 * Determine if namespace is ignored.
	 */

	function isignored(namespace) {
	  /* istanbul ignore next: tested in a child processs */
	  if (process.noDeprecation) {
	    // --no-deprecation support
	    return true
	  }

	  var str = process.env.NO_DEPRECATION || ''

	  // namespace ignored
	  return containsNamespace(str, namespace)
	}

	/**
	 * Determine if namespace is traced.
	 */

	function istraced(namespace) {
	  /* istanbul ignore next: tested in a child processs */
	  if (process.traceDeprecation) {
	    // --trace-deprecation support
	    return true
	  }

	  var str = process.env.TRACE_DEPRECATION || ''

	  // namespace traced
	  return containsNamespace(str, namespace)
	}

	/**
	 * Display deprecation message.
	 */

	function log(message, site) {
	  var haslisteners = eventListenerCount(process, 'deprecation') !== 0

	  // abort early if no destination
	  if (!haslisteners && this._ignored) {
	    return
	  }

	  var caller
	  var callFile
	  var callSite
	  var i = 0
	  var seen = false
	  var stack = getStack()
	  var file = this._file

	  if (site) {
	    // provided site
	    callSite = callSiteLocation(stack[1])
	    callSite.name = site.name
	    file = callSite[0]
	  } else {
	    // get call site
	    i = 2
	    site = callSiteLocation(stack[i])
	    callSite = site
	  }

	  // get caller of deprecated thing in relation to file
	  for (; i < stack.length; i++) {
	    caller = callSiteLocation(stack[i])
	    callFile = caller[0]

	    if (callFile === file) {
	      seen = true
	    } else if (callFile === this._file) {
	      file = this._file
	    } else if (seen) {
	      break
	    }
	  }

	  var key = caller
	    ? site.join(':') + '__' + caller.join(':')
	    : undefined

	  if (key !== undefined && key in this._warned) {
	    // already warned
	    return
	  }

	  this._warned[key] = true

	  // generate automatic message from call site
	  if (!message) {
	    message = callSite === site || !callSite.name
	      ? defaultMessage(site)
	      : defaultMessage(callSite)
	  }

	  // emit deprecation if listeners exist
	  if (haslisteners) {
	    var err = DeprecationError(this._namespace, message, stack.slice(i))
	    process.emit('deprecation', err)
	    return
	  }

	  // format and write message
	  var format = process.stderr.isTTY
	    ? formatColor
	    : formatPlain
	  var msg = format.call(this, message, caller, stack.slice(i))
	  process.stderr.write(msg + '\n', 'utf8')

	  return
	}

	/**
	 * Get call site location as array.
	 */

	function callSiteLocation(callSite) {
	  var file = callSite.getFileName() || '<anonymous>'
	  var line = callSite.getLineNumber()
	  var colm = callSite.getColumnNumber()

	  if (callSite.isEval()) {
	    file = callSite.getEvalOrigin() + ', ' + file
	  }

	  var site = [file, line, colm]

	  site.callSite = callSite
	  site.name = callSite.getFunctionName()

	  return site
	}

	/**
	 * Generate a default message from the site.
	 */

	function defaultMessage(site) {
	  var callSite = site.callSite
	  var funcName = site.name

	  // make useful anonymous name
	  if (!funcName) {
	    funcName = '<anonymous@' + formatLocation(site) + '>'
	  }

	  var context = callSite.getThis()
	  var typeName = context && callSite.getTypeName()

	  // ignore useless type name
	  if (typeName === 'Object') {
	    typeName = undefined
	  }

	  // make useful type name
	  if (typeName === 'Function') {
	    typeName = context.name || typeName
	  }

	  return typeName && callSite.getMethodName()
	    ? typeName + '.' + funcName
	    : funcName
	}

	/**
	 * Format deprecation message without color.
	 */

	function formatPlain(msg, caller, stack) {
	  var timestamp = new Date().toUTCString()

	  var formatted = timestamp
	    + ' ' + this._namespace
	    + ' deprecated ' + msg

	  // add stack trace
	  if (this._traced) {
	    for (var i = 0; i < stack.length; i++) {
	      formatted += '\n    at ' + callSiteToString(stack[i])
	    }

	    return formatted
	  }

	  if (caller) {
	    formatted += ' at ' + formatLocation(caller)
	  }

	  return formatted
	}

	/**
	 * Format deprecation message with color.
	 */

	function formatColor(msg, caller, stack) {
	  var formatted = '\x1b[36;1m' + this._namespace + '\x1b[22;39m' // bold cyan
	    + ' \x1b[33;1mdeprecated\x1b[22;39m' // bold yellow
	    + ' \x1b[0m' + msg + '\x1b[39m' // reset

	  // add stack trace
	  if (this._traced) {
	    for (var i = 0; i < stack.length; i++) {
	      formatted += '\n    \x1b[36mat ' + callSiteToString(stack[i]) + '\x1b[39m' // cyan
	    }

	    return formatted
	  }

	  if (caller) {
	    formatted += ' \x1b[36m' + formatLocation(caller) + '\x1b[39m' // cyan
	  }

	  return formatted
	}

	/**
	 * Format call site location.
	 */

	function formatLocation(callSite) {
	  return relative(basePath, callSite[0])
	    + ':' + callSite[1]
	    + ':' + callSite[2]
	}

	/**
	 * Get the stack as array of call sites.
	 */

	function getStack() {
	  var limit = Error.stackTraceLimit
	  var obj = {}
	  var prep = Error.prepareStackTrace

	  Error.prepareStackTrace = prepareObjectStackTrace
	  Error.stackTraceLimit = Math.max(10, limit)

	  // capture the stack
	  Error.captureStackTrace(obj)

	  // slice this function off the top
	  var stack = obj.stack.slice(1)

	  Error.prepareStackTrace = prep
	  Error.stackTraceLimit = limit

	  return stack
	}

	/**
	 * Capture call site stack from v8.
	 */

	function prepareObjectStackTrace(obj, stack) {
	  return stack
	}

	/**
	 * Return a wrapped function in a deprecation message.
	 */

	function wrapfunction(fn, message) {
	  if (typeof fn !== 'function') {
	    throw new TypeError('argument fn must be a function')
	  }

	  var args = createArgumentsString(fn.length)
	  var deprecate = this
	  var stack = getStack()
	  var site = callSiteLocation(stack[1])

	  site.name = fn.name

	  var deprecatedfn = eval('(function (' + args + ') {\n'
	    + '"use strict"\n'
	    + 'log.call(deprecate, message, site)\n'
	    + 'return fn.apply(this, arguments)\n'
	    + '})')

	  return deprecatedfn
	}

	/**
	 * Wrap property in a deprecation message.
	 */

	function wrapproperty(obj, prop, message) {
	  if (!obj || (typeof obj !== 'object' && typeof obj !== 'function')) {
	    throw new TypeError('argument obj must be object')
	  }

	  var descriptor = Object.getOwnPropertyDescriptor(obj, prop)

	  if (!descriptor) {
	    throw new TypeError('must call property on owner object')
	  }

	  if (!descriptor.configurable) {
	    throw new TypeError('property must be configurable')
	  }

	  var deprecate = this
	  var stack = getStack()
	  var site = callSiteLocation(stack[1])

	  // set site name
	  site.name = prop

	  // convert data descriptor
	  if ('value' in descriptor) {
	    descriptor = convertDataDescriptorToAccessor(obj, prop, message)
	  }

	  var get = descriptor.get
	  var set = descriptor.set

	  // wrap getter
	  if (typeof get === 'function') {
	    descriptor.get = function getter() {
	      log.call(deprecate, message, site)
	      return get.apply(this, arguments)
	    }
	  }

	  // wrap setter
	  if (typeof set === 'function') {
	    descriptor.set = function setter() {
	      log.call(deprecate, message, site)
	      return set.apply(this, arguments)
	    }
	  }

	  Object.defineProperty(obj, prop, descriptor)
	}

	/**
	 * Create DeprecationError for deprecation
	 */

	function DeprecationError(namespace, message, stack) {
	  var error = new Error()
	  var stackString

	  Object.defineProperty(error, 'constructor', {
	    value: DeprecationError
	  })

	  Object.defineProperty(error, 'message', {
	    configurable: true,
	    enumerable: false,
	    value: message,
	    writable: true
	  })

	  Object.defineProperty(error, 'name', {
	    enumerable: false,
	    configurable: true,
	    value: 'DeprecationError',
	    writable: true
	  })

	  Object.defineProperty(error, 'namespace', {
	    configurable: true,
	    enumerable: false,
	    value: namespace,
	    writable: true
	  })

	  Object.defineProperty(error, 'stack', {
	    configurable: true,
	    enumerable: false,
	    get: function () {
	      if (stackString !== undefined) {
	        return stackString
	      }

	      // prepare stack trace
	      return stackString = createStackString.call(this, stack)
	    },
	    set: function setter(val) {
	      stackString = val
	    }
	  })

	  return error
	}


/***/ },
/* 78 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * depd
	 * Copyright(c) 2014-2015 Douglas Christopher Wilson
	 * MIT Licensed
	 */

	'use strict'

	/**
	 * Module dependencies.
	 * @private
	 */

	var Buffer = __webpack_require__(51)
	var EventEmitter = __webpack_require__(79).EventEmitter

	/**
	 * Module exports.
	 * @public
	 */

	lazyProperty(module.exports, 'bufferConcat', function bufferConcat() {
	  return Buffer.concat || __webpack_require__(80)
	})

	lazyProperty(module.exports, 'callSiteToString', function callSiteToString() {
	  var limit = Error.stackTraceLimit
	  var obj = {}
	  var prep = Error.prepareStackTrace

	  function prepareObjectStackTrace(obj, stack) {
	    return stack
	  }

	  Error.prepareStackTrace = prepareObjectStackTrace
	  Error.stackTraceLimit = 2

	  // capture the stack
	  Error.captureStackTrace(obj)

	  // slice the stack
	  var stack = obj.stack.slice()

	  Error.prepareStackTrace = prep
	  Error.stackTraceLimit = limit

	  return stack[0].toString ? toString : __webpack_require__(81)
	})

	lazyProperty(module.exports, 'eventListenerCount', function eventListenerCount() {
	  return EventEmitter.listenerCount || __webpack_require__(82)
	})

	/**
	 * Define a lazy property.
	 */

	function lazyProperty(obj, prop, getter) {
	  function get() {
	    var val = getter()

	    Object.defineProperty(obj, prop, {
	      configurable: true,
	      enumerable: true,
	      value: val
	    })

	    return val
	  }

	  Object.defineProperty(obj, prop, {
	    configurable: true,
	    enumerable: true,
	    get: get
	  })
	}

	/**
	 * Call toString() on the obj
	 */

	function toString(obj) {
	  return obj.toString()
	}


/***/ },
/* 79 */
/***/ function(module, exports) {

	module.exports = require("events");

/***/ },
/* 80 */
/***/ function(module, exports) {

	/*!
	 * depd
	 * Copyright(c) 2014 Douglas Christopher Wilson
	 * MIT Licensed
	 */

	'use strict'

	/**
	 * Module exports.
	 */

	module.exports = bufferConcat

	/**
	 * Concatenate an array of Buffers.
	 */

	function bufferConcat(bufs) {
	  var length = 0

	  for (var i = 0, len = bufs.length; i < len; i++) {
	    length += bufs[i].length
	  }

	  var buf = new Buffer(length)
	  var pos = 0

	  for (var i = 0, len = bufs.length; i < len; i++) {
	    bufs[i].copy(buf, pos)
	    pos += bufs[i].length
	  }

	  return buf
	}


/***/ },
/* 81 */
/***/ function(module, exports) {

	/*!
	 * depd
	 * Copyright(c) 2014 Douglas Christopher Wilson
	 * MIT Licensed
	 */

	'use strict'

	/**
	 * Module exports.
	 */

	module.exports = callSiteToString

	/**
	 * Format a CallSite file location to a string.
	 */

	function callSiteFileLocation(callSite) {
	  var fileName
	  var fileLocation = ''

	  if (callSite.isNative()) {
	    fileLocation = 'native'
	  } else if (callSite.isEval()) {
	    fileName = callSite.getScriptNameOrSourceURL()
	    if (!fileName) {
	      fileLocation = callSite.getEvalOrigin()
	    }
	  } else {
	    fileName = callSite.getFileName()
	  }

	  if (fileName) {
	    fileLocation += fileName

	    var lineNumber = callSite.getLineNumber()
	    if (lineNumber != null) {
	      fileLocation += ':' + lineNumber

	      var columnNumber = callSite.getColumnNumber()
	      if (columnNumber) {
	        fileLocation += ':' + columnNumber
	      }
	    }
	  }

	  return fileLocation || 'unknown source'
	}

	/**
	 * Format a CallSite to a string.
	 */

	function callSiteToString(callSite) {
	  var addSuffix = true
	  var fileLocation = callSiteFileLocation(callSite)
	  var functionName = callSite.getFunctionName()
	  var isConstructor = callSite.isConstructor()
	  var isMethodCall = !(callSite.isToplevel() || isConstructor)
	  var line = ''

	  if (isMethodCall) {
	    var methodName = callSite.getMethodName()
	    var typeName = getConstructorName(callSite)

	    if (functionName) {
	      if (typeName && functionName.indexOf(typeName) !== 0) {
	        line += typeName + '.'
	      }

	      line += functionName

	      if (methodName && functionName.lastIndexOf('.' + methodName) !== functionName.length - methodName.length - 1) {
	        line += ' [as ' + methodName + ']'
	      }
	    } else {
	      line += typeName + '.' + (methodName || '<anonymous>')
	    }
	  } else if (isConstructor) {
	    line += 'new ' + (functionName || '<anonymous>')
	  } else if (functionName) {
	    line += functionName
	  } else {
	    addSuffix = false
	    line += fileLocation
	  }

	  if (addSuffix) {
	    line += ' (' + fileLocation + ')'
	  }

	  return line
	}

	/**
	 * Get constructor name of reviver.
	 */

	function getConstructorName(obj) {
	  var receiver = obj.receiver
	  return (receiver.constructor && receiver.constructor.name) || null
	}


/***/ },
/* 82 */
/***/ function(module, exports) {

	/*!
	 * depd
	 * Copyright(c) 2015 Douglas Christopher Wilson
	 * MIT Licensed
	 */

	'use strict'

	/**
	 * Module exports.
	 * @public
	 */

	module.exports = eventListenerCount

	/**
	 * Get the count of listeners on an event emitter of a specific type.
	 */

	function eventListenerCount(emitter, type) {
	  return emitter.listeners(type).length
	}


/***/ },
/* 83 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * parseurl
	 * Copyright(c) 2014 Jonathan Ong
	 * Copyright(c) 2014 Douglas Christopher Wilson
	 * MIT Licensed
	 */

	'use strict'

	/**
	 * Module dependencies.
	 */

	var url = __webpack_require__(23)
	var parse = url.parse
	var Url = url.Url

	/**
	 * Pattern for a simple path case.
	 * See: https://github.com/joyent/node/pull/7878
	 */

	var simplePathRegExp = /^(\/\/?(?!\/)[^\?#\s]*)(\?[^#\s]*)?$/

	/**
	 * Exports.
	 */

	module.exports = parseurl
	module.exports.original = originalurl

	/**
	 * Parse the `req` url with memoization.
	 *
	 * @param {ServerRequest} req
	 * @return {Object}
	 * @api public
	 */

	function parseurl(req) {
	  var url = req.url

	  if (url === undefined) {
	    // URL is undefined
	    return undefined
	  }

	  var parsed = req._parsedUrl

	  if (fresh(url, parsed)) {
	    // Return cached URL parse
	    return parsed
	  }

	  // Parse the URL
	  parsed = fastparse(url)
	  parsed._raw = url

	  return req._parsedUrl = parsed
	};

	/**
	 * Parse the `req` original url with fallback and memoization.
	 *
	 * @param {ServerRequest} req
	 * @return {Object}
	 * @api public
	 */

	function originalurl(req) {
	  var url = req.originalUrl

	  if (typeof url !== 'string') {
	    // Fallback
	    return parseurl(req)
	  }

	  var parsed = req._parsedOriginalUrl

	  if (fresh(url, parsed)) {
	    // Return cached URL parse
	    return parsed
	  }

	  // Parse the URL
	  parsed = fastparse(url)
	  parsed._raw = url

	  return req._parsedOriginalUrl = parsed
	};

	/**
	 * Parse the `str` url with fast-path short-cut.
	 *
	 * @param {string} str
	 * @return {Object}
	 * @api private
	 */

	function fastparse(str) {
	  // Try fast path regexp
	  // See: https://github.com/joyent/node/pull/7878
	  var simplePath = typeof str === 'string' && simplePathRegExp.exec(str)

	  // Construct simple URL
	  if (simplePath) {
	    var pathname = simplePath[1]
	    var search = simplePath[2] || null
	    var url = Url !== undefined
	      ? new Url()
	      : {}
	    url.path = str
	    url.href = str
	    url.pathname = pathname
	    url.search = search
	    url.query = search && search.substr(1)

	    return url
	  }

	  return parse(str)
	}

	/**
	 * Determine if parsed is still fresh for url.
	 *
	 * @param {string} url
	 * @param {object} parsedUrl
	 * @return {boolean}
	 * @api private
	 */

	function fresh(url, parsedUrl) {
	  return typeof parsedUrl === 'object'
	    && parsedUrl !== null
	    && (Url === undefined || parsedUrl instanceof Url)
	    && parsedUrl._raw === url
	}


/***/ },
/* 84 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	var SET_TOKEN = exports.SET_TOKEN = '__SET_TOKEN_FLUX_AUTH';
	var LOCALSTORAGE_TOKEN_KEY = exports.LOCALSTORAGE_TOKEN_KEY = 'auth_token';
	var LOGIN_PATH = exports.LOGIN_PATH = '/auth/login/google';
	var CALLBACK_PATH = exports.CALLBACK_PATH = '/auth/callback/google';

/***/ },
/* 85 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _express = __webpack_require__(2);

	var _express2 = _interopRequireDefault(_express);

	var _item = __webpack_require__(86);

	var _jsonorhtml = __webpack_require__(141);

	var _jsonorhtml2 = _interopRequireDefault(_jsonorhtml);

	var _serveapp = __webpack_require__(143);

	var _serveapp2 = _interopRequireDefault(_serveapp);

	var _item2 = __webpack_require__(144);

	var _item3 = _interopRequireDefault(_item2);

	var _itemImages = __webpack_require__(146);

	var _itemImages2 = _interopRequireDefault(_itemImages);

	var _request = __webpack_require__(154);

	var _request2 = _interopRequireDefault(_request);

	var _user = __webpack_require__(156);

	var _user2 = _interopRequireDefault(_user);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var router = _express2.default.Router();

	router.get('/', (0, _jsonorhtml2.default)(function (req, res) {
	    (0, _item.getFrontPageItems)().then(function (items) {
	        return res.json(items);
	    }, function (err) {
	        return res.status(500).send('Database error');
	    });
	}, _serveapp2.default));

	router.get('/dashboard', _serveapp2.default);

	router.get('/create', _serveapp2.default);

	(0, _item3.default)(router);
	(0, _itemImages2.default)(router);
	(0, _request2.default)(router);
	(0, _user2.default)(router);

	exports.default = router;

/***/ },
/* 86 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.getFrontPageItems = getFrontPageItems;
	exports.getUserItems = getUserItems;
	exports.getItem = getItem;
	exports.putItem = putItem;

	var _revalidator = __webpack_require__(87);

	var _validator = __webpack_require__(88);

	var _validator2 = _interopRequireDefault(_validator);

	var _rethinkdb = __webpack_require__(89);

	var _rethinkdb2 = _interopRequireDefault(_rethinkdb);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var r = (0, _rethinkdb2.default)();

	var ItemSchema = {
	    properties: {
	        description: {
	            type: 'string'
	        },
	        image: {
	            type: 'string',
	            allowEmpty: true,
	            conform: function conform(v) {
	                return v.length === 0 || _validator2.default.isUUID(v);
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

	function getFrontPageItems() {
	    return r.table('items').orderBy({ index: r.desc('timeAdded') }).limit(18).run().then(function (cursor) {
	        return cursor.toArray();
	    }).then(null, function (err) {
	        console.log('getFrontPageItems err', err);
	        throw 'Database error';
	    });
	}

	function getUserItems(userId) {
	    return r.table('items').getAll(userId, { index: 'owner' }).orderBy(r.desc('timeAdded')).run().then(function (cursor) {
	        return cursor.toArray();
	    }).then(null, function (err) {
	        console.log('getUserItems err', err);
	        throw 'Database error';
	    });
	}

	function getItem(id) {
	    return r.table('items').get(id).run().then(null, function (err) {
	        throw 'Database error';
	    });
	}

	function putItem(userId, itemId, item) {
	    if (!_validator2.default.isUUID(itemId)) {
	        return Promise.reject('Invalid id');
	    }
	    var itemValid = (0, _revalidator.validate)(item, ItemSchema);
	    if (!itemValid.valid) {
	        console.log(itemValid.errors);
	        return Promise.reject('Invalid item');
	    }

	    // If item by that id already exists and has owner of userId, update properties
	    return r.table('items').filter({
	        id: itemId,
	        owner: userId
	    }).update({
	        description: item.description,
	        city: item.city,
	        text: item.text,
	        image: item.image
	    }).run().then(function (_ref) {
	        var replaced = _ref.replaced;

	        // Otherwise, try to insert it as a new item
	        if (replaced === 0) {
	            return r.table('items').insert({
	                id: itemId,
	                description: item.description,
	                city: item.city,
	                text: item.text,
	                image: item.image,
	                timeAdded: Date.now(),
	                owner: userId
	            }).run().then(null, function (err) {
	                return itemId;
	            });
	        }
	        // TODO: Other errors should be in the form of responses
	        return itemId;
	    }).then(null, function (err) {
	        throw 'Database error';
	    });
	}

/***/ },
/* 87 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(module) {(function (exports) {
	  exports.validate = validate;
	  exports.mixin = mixin;

	  //
	  // ### function validate (object, schema, options)
	  // #### {Object} object the object to validate.
	  // #### {Object} schema (optional) the JSON Schema to validate against.
	  // #### {Object} options (optional) options controlling the validation
	  //      process. See {@link #validate.defaults) for details.
	  // Validate <code>object</code> against a JSON Schema.
	  // If <code>object</code> is self-describing (i.e. has a
	  // <code>$schema</code> property), it will also be validated
	  // against the referenced schema. [TODO]: This behaviour bay be
	  // suppressed by setting the {@link #validate.options.???}
	  // option to <code>???</code>.[/TODO]
	  //
	  // If <code>schema</code> is not specified, and <code>object</code>
	  // is not self-describing, validation always passes.
	  //
	  // <strong>Note:</strong> in order to pass options but no schema,
	  // <code>schema</code> <em>must</em> be specified in the call to
	  // <code>validate()</code>; otherwise, <code>options</code> will
	  // be interpreted as the schema. <code>schema</code> may be passed
	  // as <code>null</code>, <code>undefinded</code>, or the empty object
	  // (<code>{}</code>) in this case.
	  //
	  function validate(object, schema, options) {
	    options = mixin({}, validate.defaults, options);
	    var errors = [];

	    if (schema.type === 'array')
	      validateProperty(object, object, '', schema, options, errors);
	    else
	      validateObject(object, schema, options, errors);

	    //
	    // TODO: self-described validation
	    // if (! options.selfDescribing) { ... }
	    //

	    return {
	      valid: !(errors.length),
	      errors: errors
	    };
	  };

	  /**
	   * Default validation options. Defaults can be overridden by
	   * passing an 'options' hash to {@link #validate}. They can
	   * also be set globally be changing the values in
	   * <code>validate.defaults</code> directly.
	   */
	  validate.defaults = {
	      /**
	       * <p>
	       * Enforce 'format' constraints.
	       * </p><p>
	       * <em>Default: <code>true</code></em>
	       * </p>
	       */
	      validateFormats: true,
	      /**
	       * <p>
	       * When {@link #validateFormats} is <code>true</code>,
	       * treat unrecognized formats as validation errors.
	       * </p><p>
	       * <em>Default: <code>false</code></em>
	       * </p>
	       *
	       * @see validation.formats for default supported formats.
	       */
	      validateFormatsStrict: false,
	      /**
	       * <p>
	       * When {@link #validateFormats} is <code>true</code>,
	       * also validate formats defined in {@link #validate.formatExtensions}.
	       * </p><p>
	       * <em>Default: <code>true</code></em>
	       * </p>
	       */
	      validateFormatExtensions: true,
	      /**
	       * <p>
	       * When {@link #additionalProperties} is <code>true</code>,
	       * allow additional unvisited properties on the object.
	       * </p><p>
	       * <em>Default: <code>true</code></em>
	       * </p>
	       */
	      additionalProperties: true
	  };

	  /**
	   * Default messages to include with validation errors.
	   */
	  validate.messages = {
	      required:             "is required",
	      allowEmpty:           "must not be empty",
	      minLength:            "is too short (minimum is %{expected} characters)",
	      maxLength:            "is too long (maximum is %{expected} characters)",
	      pattern:              "invalid input",
	      minimum:              "must be greater than or equal to %{expected}",
	      maximum:              "must be less than or equal to %{expected}",
	      exclusiveMinimum:     "must be greater than %{expected}",
	      exclusiveMaximum:     "must be less than %{expected}",
	      divisibleBy:          "must be divisible by %{expected}",
	      minItems:             "must contain more than %{expected} items",
	      maxItems:             "must contain less than %{expected} items",
	      uniqueItems:          "must hold a unique set of values",
	      format:               "is not a valid %{expected}",
	      conform:              "must conform to given constraint",
	      type:                 "must be of %{expected} type",
	      additionalProperties: "must not exist"
	  };
	  validate.messages['enum'] = "must be present in given enumerator";

	  /**
	   *
	   */
	  validate.formats = {
	    'email':          /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i,
	    'ip-address':     /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/i,
	    'ipv6':           /^([0-9A-Fa-f]{1,4}:){7}[0-9A-Fa-f]{1,4}$/,
	    'date-time':      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:.\d{1,3})?Z$/,
	    'date':           /^\d{4}-\d{2}-\d{2}$/,
	    'time':           /^\d{2}:\d{2}:\d{2}$/,
	    'color':          /^#[a-z0-9]{6}|#[a-z0-9]{3}|(?:rgb\(\s*(?:[+-]?\d+%?)\s*,\s*(?:[+-]?\d+%?)\s*,\s*(?:[+-]?\d+%?)\s*\))aqua|black|blue|fuchsia|gray|green|lime|maroon|navy|olive|orange|purple|red|silver|teal|white|yellow$/i,
	    //'style':        (not supported)
	    //'phone':        (not supported)
	    //'uri':          (not supported)
	    'host-name':      /^(([a-zA-Z]|[a-zA-Z][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z]|[A-Za-z][A-Za-z0-9\-]*[A-Za-z0-9])/,
	    'utc-millisec':   {
	      test: function (value) {
	        return typeof(value) === 'number' && value >= 0;
	      }
	    },
	    'regex':          {
	      test: function (value) {
	        try { new RegExp(value) }
	        catch (e) { return false }

	        return true;
	      }
	    }
	  };

	  /**
	   *
	   */
	  validate.formatExtensions = {
	    'url': /^(https?|ftp|git):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i
	  };

	  function mixin(obj) {
	    var sources = Array.prototype.slice.call(arguments, 1);
	    while (sources.length) {
	      var source = sources.shift();
	      if (!source) { continue }

	      if (typeof(source) !== 'object') {
	        throw new TypeError('mixin non-object');
	      }

	      for (var p in source) {
	        if (source.hasOwnProperty(p)) {
	          obj[p] = source[p];
	        }
	      }
	    }

	    return obj;
	  };

	  function validateObject(object, schema, options, errors) {
	    var props, allProps = Object.keys(object),
	        visitedProps = [];

	    // see 5.2
	    if (schema.properties) {
	      props = schema.properties;
	      for (var p in props) {
	        if (props.hasOwnProperty(p)) {
	          visitedProps.push(p);
	          validateProperty(object, object[p], p, props[p], options, errors);
	        }
	      }
	    }

	    // see 5.3
	    if (schema.patternProperties) {
	      props = schema.patternProperties;
	      for (var p in props) {
	        if (props.hasOwnProperty(p)) {
	          var re = new RegExp(p);

	          // Find all object properties that are matching `re`
	          for (var k in object) {
	            if (object.hasOwnProperty(k)) {
	              if (re.exec(k) !== null) {
	                validateProperty(object, object[k], k, props[p], options, errors);
	                visitedProps.push(k);
	              }
	            }
	          }
	        }
	      }
	    }

	    //if additionalProperties is not defined set default value
	    if (schema.additionalProperties === undefined) {
	      schema.additionalProperties = options.additionalProperties;
	    }

	    // see 5.4
	    if (undefined !== schema.additionalProperties) {
	      var i, l;

	      var unvisitedProps = allProps.filter(function(k){
	        return -1 === visitedProps.indexOf(k);
	      });

	      // Prevent additional properties; each unvisited property is therefore an error
	      if (schema.additionalProperties === false && unvisitedProps.length > 0) {
	        for (i = 0, l = unvisitedProps.length; i < l; i++) {
	          error("additionalProperties", unvisitedProps[i], object[unvisitedProps[i]], false, errors);
	        }
	      }
	      // additionalProperties is a schema and validate unvisited properties against that schema
	      else if (typeof schema.additionalProperties == "object" && unvisitedProps.length > 0) {
	        for (i = 0, l = unvisitedProps.length; i < l; i++) {
	          validateProperty(object, object[unvisitedProps[i]], unvisitedProps[i], schema.unvisitedProperties, options, errors);
	        }
	      }
	    }

	  };

	  function validateProperty(object, value, property, schema, options, errors) {
	    var format,
	        valid,
	        spec,
	        type;

	    function constrain(name, value, assert) {
	      if (schema[name] !== undefined && !assert(value, schema[name])) {
	        error(name, property, value, schema, errors);
	      }
	    }

	    if (value === undefined) {
	      if (schema.required && schema.type !== 'any') {
	        return error('required', property, undefined, schema, errors);
	      } else {
	        return;
	      }
	    }

	    if (options.cast) {
	      if (('integer' === schema.type || 'number' === schema.type) && value == +value) {
	        value = +value;
	        object[property] = value;
	      }

	      if ('boolean' === schema.type) {
	        if ('true' === value || '1' === value || 1 === value) {
	          value = true;
	          object[property] = value;
	        }

	        if ('false' === value || '0' === value || 0 === value) {
	          value = false;
	          object[property] = value;
	        }
	      }
	    }

	    if (schema.format && options.validateFormats) {
	      format = schema.format;

	      if (options.validateFormatExtensions) { spec = validate.formatExtensions[format] }
	      if (!spec) { spec = validate.formats[format] }
	      if (!spec) {
	        if (options.validateFormatsStrict) {
	          return error('format', property, value, schema, errors);
	        }
	      }
	      else {
	        if (!spec.test(value)) {
	          return error('format', property, value, schema, errors);
	        }
	      }
	    }

	    if (schema['enum'] && schema['enum'].indexOf(value) === -1) {
	      error('enum', property, value, schema, errors);
	    }

	    // Dependencies (see 5.8)
	    if (typeof schema.dependencies === 'string' &&
	        object[schema.dependencies] === undefined) {
	      error('dependencies', property, null, schema, errors);
	    }

	    if (isArray(schema.dependencies)) {
	      for (var i = 0, l = schema.dependencies.length; i < l; i++) {
	        if (object[schema.dependencies[i]] === undefined) {
	          error('dependencies', property, null, schema, errors);
	        }
	      }
	    }

	    if (typeof schema.dependencies === 'object') {
	      validateObject(object, schema.dependencies, options, errors);
	    }

	    checkType(value, schema.type, function(err, type) {
	      if (err) return error('type', property, typeof value, schema, errors);

	      constrain('conform', value, function (a, e) { return e(a, object) });

	      switch (type || (isArray(value) ? 'array' : typeof value)) {
	        case 'string':
	          constrain('allowEmpty', value,        function (a, e) { return e ? e : a !== '' });
	          constrain('minLength',  value.length, function (a, e) { return a >= e });
	          constrain('maxLength',  value.length, function (a, e) { return a <= e });
	          constrain('pattern',    value,        function (a, e) {
	            e = typeof e === 'string'
	              ? e = new RegExp(e)
	              : e;
	            return e.test(a)
	          });
	          break;
	        case 'integer':
	        case 'number':
	          constrain('minimum',     value, function (a, e) { return a >= e });
	          constrain('maximum',     value, function (a, e) { return a <= e });
	          constrain('exclusiveMinimum', value, function (a, e) { return a > e });
	          constrain('exclusiveMaximum', value, function (a, e) { return a < e });
	          constrain('divisibleBy', value, function (a, e) {
	            var multiplier = Math.max((a - Math.floor(a)).toString().length - 2, (e - Math.floor(e)).toString().length - 2);
	            multiplier = multiplier > 0 ? Math.pow(10, multiplier) : 1;
	            return (a * multiplier) % (e * multiplier) === 0
	          });
	          break;
	        case 'array':
	          constrain('items', value, function (a, e) {
	            var nestedErrors;
	            for (var i = 0, l = a.length; i < l; i++) {
	              nestedErrors = [];
	              validateProperty(object, a[i], property, e, options, nestedErrors);
	              nestedErrors.forEach(function (err) {
	                err.property =
	                  (property ? property + '.' : '') +
	                  i +
	                  (err.property ? '.' + err.property.replace(property + '.', '') : '');
	              });
	              nestedErrors.unshift(0, 0);
	              Array.prototype.splice.apply(errors, nestedErrors);
	            }
	            return true;
	          });
	          constrain('minItems', value, function (a, e) { return a.length >= e });
	          constrain('maxItems', value, function (a, e) { return a.length <= e });
	          constrain('uniqueItems', value, function (a, e) {
	            if (!e) return true;

	            var h = {};

	            for (var i = 0, l = a.length; i < l; i++) {
	              var key = JSON.stringify(a[i]);
	              if (h[key]) return false;
	              h[key] = true;
	            }

	            return true;
	          });
	          break;
	        case 'object':
	          // Recursive validation
	          if (schema.properties || schema.patternProperties || schema.additionalProperties) {
	            var nestedErrors = [];
	            validateObject(value, schema, options, nestedErrors);
	            nestedErrors.forEach(function (e) {
	              e.property = property + '.' + e.property
	            });
	            nestedErrors.unshift(0, 0);
	            Array.prototype.splice.apply(errors, nestedErrors);
	          }
	          break;
	      }
	    });
	  };

	  function checkType(val, type, callback) {
	    var result = false,
	        types = isArray(type) ? type : [type];

	    // No type - no check
	    if (type === undefined) return callback(null, type);

	    // Go through available types
	    // And fine first matching
	    for (var i = 0, l = types.length; i < l; i++) {
	      type = types[i].toLowerCase().trim();
	      if (type === 'string' ? typeof val === 'string' :
	          type === 'array' ? isArray(val) :
	          type === 'object' ? val && typeof val === 'object' &&
	                             !isArray(val) :
	          type === 'number' ? typeof val === 'number' :
	          type === 'integer' ? typeof val === 'number' && Math.floor(val) === val :
	          type === 'null' ? val === null :
	          type === 'boolean'? typeof val === 'boolean' :
	          type === 'date' ? isDate(val) :
	          type === 'any' ? typeof val !== 'undefined' : false) {
	        return callback(null, type);
	      }
	    };

	    callback(true);
	  };

	  function error(attribute, property, actual, schema, errors) {
	    var lookup = { expected: schema[attribute], actual: actual, attribute: attribute, property: property };
	    var message = schema.messages && schema.messages[attribute] || schema.message || validate.messages[attribute] || "no default message";
	    message = message.replace(/%\{([a-z]+)\}/ig, function (_, match) { return lookup[match.toLowerCase()] || ''; });
	    errors.push({
	      attribute: attribute,
	      property:  property,
	      expected:  schema[attribute],
	      actual:    actual,
	      message:   message
	    });
	  };

	  function isArray(value) {
	    var s = typeof value;
	    if (s === 'object') {
	      if (value) {
	        if (typeof value.length === 'number' &&
	           !(value.propertyIsEnumerable('length')) &&
	           typeof value.splice === 'function') {
	           return true;
	        }
	      }
	    }
	    return false;
	  }

	  function isDate(value) {
	    var s = typeof value;
	    if (s === 'object') {
	      if (value) {
	        if (typeof value.getTime === 'function') {
	          return true;
	        }
	      }
	    }

	    return false;
	  }

	})(typeof module === 'object' && module && module.exports ? module.exports : window);

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(18)(module)))

/***/ },
/* 88 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * Copyright (c) 2015 Chris O'Hara <cohara87@gmail.com>
	 *
	 * Permission is hereby granted, free of charge, to any person obtaining
	 * a copy of this software and associated documentation files (the
	 * "Software"), to deal in the Software without restriction, including
	 * without limitation the rights to use, copy, modify, merge, publish,
	 * distribute, sublicense, and/or sell copies of the Software, and to
	 * permit persons to whom the Software is furnished to do so, subject to
	 * the following conditions:
	 *
	 * The above copyright notice and this permission notice shall be
	 * included in all copies or substantial portions of the Software.
	 *
	 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
	 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
	 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
	 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
	 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
	 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
	 */

	(function (name, definition) {
	    if (true) {
	        module.exports = definition();
	    } else if (typeof define === 'function' && typeof define.amd === 'object') {
	        define(definition);
	    } else if (typeof define === 'function' && typeof define.petal === 'object') {
	        define(name, [], definition);
	    } else {
	        this[name] = definition();
	    }
	})('validator', function (validator) {

	    'use strict';

	    validator = { version: '4.7.1', coerce: true };

	    var emailUserPart = /^[a-z\d!#\$%&'\*\+\-\/=\?\^_`{\|}~]+$/i;
	    var quotedEmailUser = /^([\s\x01-\x08\x0b\x0c\x0e-\x1f\x7f\x21\x23-\x5b\x5d-\x7e]|(\\[\x01-\x09\x0b\x0c\x0d-\x7f]))*$/i;

	    var emailUserUtf8Part = /^[a-z\d!#\$%&'\*\+\-\/=\?\^_`{\|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+$/i;
	    var quotedEmailUserUtf8 = /^([\s\x01-\x08\x0b\x0c\x0e-\x1f\x7f\x21\x23-\x5b\x5d-\x7e\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|(\\[\x01-\x09\x0b\x0c\x0d-\x7f\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))*$/i;

	    var displayName = /^[a-z\d!#\$%&'\*\+\-\/=\?\^_`{\|}~\.\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+[a-z\d!#\$%&'\*\+\-\/=\?\^_`{\|}~\.\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF\s]*<(.+)>$/i;

	    var creditCard = /^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|6(?:011|5[0-9][0-9])[0-9]{12}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35\d{3})\d{11})$/;

	    var isin = /^[A-Z]{2}[0-9A-Z]{9}[0-9]$/;

	    var isbn10Maybe = /^(?:[0-9]{9}X|[0-9]{10})$/
	      , isbn13Maybe = /^(?:[0-9]{13})$/;

	    var macAddress = /^([0-9a-fA-F][0-9a-fA-F]:){5}([0-9a-fA-F][0-9a-fA-F])$/;

	    var ipv4Maybe = /^(\d+)\.(\d+)\.(\d+)\.(\d+)$/
	      , ipv6Block = /^[0-9A-F]{1,4}$/i;

	    var uuid = {
	        '3': /^[0-9A-F]{8}-[0-9A-F]{4}-3[0-9A-F]{3}-[0-9A-F]{4}-[0-9A-F]{12}$/i
	      , '4': /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i
	      , '5': /^[0-9A-F]{8}-[0-9A-F]{4}-5[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i
	      , all: /^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/i
	    };

	    var alpha = {
	        'en-US': /^[A-Z]+$/i,
	        'de-DE': /^[A-ZÄÖÜß]+$/i,
	      }
	      , alphanumeric = {
	        'en-US': /^[0-9A-Z]+$/i,
	        'de-DE': /^[0-9A-ZÄÖÜß]+$/i
	      }
	      , numeric = /^[-+]?[0-9]+$/
	      , int = /^(?:[-+]?(?:0|[1-9][0-9]*))$/
	      , float = /^(?:[-+]?(?:[0-9]+))?(?:\.[0-9]*)?(?:[eE][\+\-]?(?:[0-9]+))?$/
	      , hexadecimal = /^[0-9A-F]+$/i
	      , decimal = /^[-+]?([0-9]+|\.[0-9]+|[0-9]+\.[0-9]+)$/
	      , hexcolor = /^#?([0-9A-F]{3}|[0-9A-F]{6})$/i;

	    var ascii = /^[\x00-\x7F]+$/
	      , multibyte = /[^\x00-\x7F]/
	      , fullWidth = /[^\u0020-\u007E\uFF61-\uFF9F\uFFA0-\uFFDC\uFFE8-\uFFEE0-9a-zA-Z]/
	      , halfWidth = /[\u0020-\u007E\uFF61-\uFF9F\uFFA0-\uFFDC\uFFE8-\uFFEE0-9a-zA-Z]/;

	    var surrogatePair = /[\uD800-\uDBFF][\uDC00-\uDFFF]/;

	    var base64 = /^(?:[A-Z0-9+\/]{4})*(?:[A-Z0-9+\/]{2}==|[A-Z0-9+\/]{3}=|[A-Z0-9+\/]{4})$/i;

	    var phones = {
	      'zh-CN': /^(\+?0?86\-?)?((13\d|14[57]|15[^4,\D]|17[678]|18\d)\d{8}|170[059]\d{7})$/,
	      'zh-TW': /^(\+?886\-?|0)?9\d{8}$/,
	      'en-ZA': /^(\+?27|0)\d{9}$/,
	      'en-AU': /^(\+?61|0)4\d{8}$/,
	      'en-HK': /^(\+?852\-?)?[569]\d{3}\-?\d{4}$/,
	      'fr-FR': /^(\+?33|0)[67]\d{8}$/,
	      'pt-PT': /^(\+?351)?9[1236]\d{7}$/,
	      'el-GR': /^(\+?30)?(69\d{8})$/,
	      'en-GB': /^(\+?44|0)7\d{9}$/,
	      'en-US': /^(\+?1)?[2-9]\d{2}[2-9](?!11)\d{6}$/,
	      'en-ZM': /^(\+?26)?09[567]\d{7}$/,
	      'ru-RU': /^(\+?7|8)?9\d{9}$/,
	      'nb-NO': /^(\+?47)?[49]\d{7}$/,
	      'nn-NO': /^(\+?47)?[49]\d{7}$/,
	      'vi-VN': /^(\+?84|0)?((1(2([0-9])|6([2-9])|88|99))|(9((?!5)[0-9])))([0-9]{7})$/,
	      'en-NZ': /^(\+?64|0)2\d{7,9}$/,
	      'en-IN': /^(\+?91|0)?[789]\d{9}$/,
	      'es-ES': /^(\+?34)?(6\d{1}|7[1234])\d{7}$/,
	      'de-DE': /^(\+?49[ \.\-])?([\(]{1}[0-9]{1,6}[\)])?([0-9 \.\-\/]{3,20})((x|ext|extension)[ ]?[0-9]{1,4})?$/,
	      'fi-FI': /^(\+?358|0)\s?(4(0|1|2|4|5)?|50)\s?(\d\s?){4,8}\d$/
	    };

	    // from http://goo.gl/0ejHHW
	    var iso8601 = /^([\+-]?\d{4}(?!\d{2}\b))((-?)((0[1-9]|1[0-2])(\3([12]\d|0[1-9]|3[01]))?|W([0-4]\d|5[0-2])(-?[1-7])?|(00[1-9]|0[1-9]\d|[12]\d{2}|3([0-5]\d|6[1-6])))([T\s]((([01]\d|2[0-3])((:?)[0-5]\d)?|24\:?00)([\.,]\d+(?!:))?)?(\17[0-5]\d([\.,]\d+)?)?([zZ]|([\+-])([01]\d|2[0-3]):?([0-5]\d)?)?)?)?$/;

	    validator.extend = function (name, fn) {
	        validator[name] = function () {
	            var args = Array.prototype.slice.call(arguments);
	            args[0] = validator.toString(args[0]);
	            return fn.apply(validator, args);
	        };
	    };

	    //Right before exporting the validator object, pass each of the builtins
	    //through extend() so that their first argument is coerced to a string
	    validator.init = function () {
	        for (var name in validator) {
	            if (typeof validator[name] !== 'function' || name === 'toString' ||
	                    name === 'toDate' || name === 'extend' || name === 'init') {
	                continue;
	            }
	            validator.extend(name, validator[name]);
	        }
	    };

	    var depd = null;
	    validator.deprecation = function (msg) {
	        if (depd === null) {
	            if (false) {
	                return;
	            }
	            depd = __webpack_require__(77)('validator');
	        }
	        depd(msg);
	    };

	    validator.toString = function (input) {
	        if (typeof input !== 'string') {
	            // The library validates strings only. Currently it coerces all input to a string, but this
	            // will go away in an upcoming major version change. Print a deprecation notice for now
	            if (!validator.coerce) {
	                throw new Error('this library validates strings only');
	            }
	            validator.deprecation('you tried to validate a ' + typeof input + ' but this library ' +
	                    '(validator.js) validates strings only. Please update your code as this will ' +
	                    'be an error soon.');
	        }
	        if (typeof input === 'object' && input !== null) {
	            if (typeof input.toString === 'function') {
	                input = input.toString();
	            } else {
	                input = '[object Object]';
	            }
	        } else if (input === null || typeof input === 'undefined' || (isNaN(input) && !input.length)) {
	            input = '';
	        }
	        return '' + input;
	    };

	    validator.toDate = function (date) {
	        if (Object.prototype.toString.call(date) === '[object Date]') {
	            return date;
	        }
	        date = Date.parse(date);
	        return !isNaN(date) ? new Date(date) : null;
	    };

	    validator.toFloat = function (str) {
	        return parseFloat(str);
	    };

	    validator.toInt = function (str, radix) {
	        return parseInt(str, radix || 10);
	    };

	    validator.toBoolean = function (str, strict) {
	        if (strict) {
	            return str === '1' || str === 'true';
	        }
	        return str !== '0' && str !== 'false' && str !== '';
	    };

	    validator.equals = function (str, comparison) {
	        return str === validator.toString(comparison);
	    };

	    validator.contains = function (str, elem) {
	        return str.indexOf(validator.toString(elem)) >= 0;
	    };

	    validator.matches = function (str, pattern, modifiers) {
	        if (Object.prototype.toString.call(pattern) !== '[object RegExp]') {
	            pattern = new RegExp(pattern, modifiers);
	        }
	        return pattern.test(str);
	    };

	    var default_email_options = {
	        allow_display_name: false,
	        allow_utf8_local_part: true,
	        require_tld: true
	    };

	    validator.isEmail = function (str, options) {
	        options = merge(options, default_email_options);

	        if (options.allow_display_name) {
	            var display_email = str.match(displayName);
	            if (display_email) {
	                str = display_email[1];
	            }
	        }

	        var parts = str.split('@')
	          , domain = parts.pop()
	          , user = parts.join('@');

	        var lower_domain = domain.toLowerCase();
	        if (lower_domain === 'gmail.com' || lower_domain === 'googlemail.com') {
	            user = user.replace(/\./g, '').toLowerCase();
	        }

	        if (!validator.isByteLength(user, {max: 64}) ||
	                !validator.isByteLength(domain, {max: 256})) {
	            return false;
	        }

	        if (!validator.isFQDN(domain, {require_tld: options.require_tld})) {
	            return false;
	        }

	        if (user[0] === '"') {
	            user = user.slice(1, user.length - 1);
	            return options.allow_utf8_local_part ?
	                quotedEmailUserUtf8.test(user) :
	                quotedEmailUser.test(user);
	        }

	        var pattern = options.allow_utf8_local_part ?
	            emailUserUtf8Part : emailUserPart;

	        var user_parts = user.split('.');
	        for (var i = 0; i < user_parts.length; i++) {
	            if (!pattern.test(user_parts[i])) {
	                return false;
	            }
	        }

	        return true;
	    };

	    var default_url_options = {
	        protocols: [ 'http', 'https', 'ftp' ]
	      , require_tld: true
	      , require_protocol: false
	      , require_valid_protocol: true
	      , allow_underscores: false
	      , allow_trailing_dot: false
	      , allow_protocol_relative_urls: false
	    };

	    validator.isURL = function (url, options) {
	        if (!url || url.length >= 2083 || /\s/.test(url)) {
	            return false;
	        }
	        if (url.indexOf('mailto:') === 0) {
	            return false;
	        }
	        options = merge(options, default_url_options);
	        var protocol, auth, host, hostname, port,
	            port_str, split;
	        split = url.split('://');
	        if (split.length > 1) {
	            protocol = split.shift();
	            if (options.require_valid_protocol && options.protocols.indexOf(protocol) === -1) {
	                return false;
	            }
	        } else if (options.require_protocol) {
	            return false;
	        }  else if (options.allow_protocol_relative_urls && url.substr(0, 2) === '//') {
	            split[0] = url.substr(2);
	        }
	        url = split.join('://');
	        split = url.split('#');
	        url = split.shift();

	        split = url.split('?');
	        url = split.shift();

	        split = url.split('/');
	        url = split.shift();
	        split = url.split('@');
	        if (split.length > 1) {
	            auth = split.shift();
	            if (auth.indexOf(':') >= 0 && auth.split(':').length > 2) {
	                return false;
	            }
	        }
	        hostname = split.join('@');
	        split = hostname.split(':');
	        host = split.shift();
	        if (split.length) {
	            port_str = split.join(':');
	            port = parseInt(port_str, 10);
	            if (!/^[0-9]+$/.test(port_str) || port <= 0 || port > 65535) {
	                return false;
	            }
	        }
	        if (!validator.isIP(host) && !validator.isFQDN(host, options) &&
	                host !== 'localhost') {
	            return false;
	        }
	        if (options.host_whitelist &&
	                options.host_whitelist.indexOf(host) === -1) {
	            return false;
	        }
	        if (options.host_blacklist &&
	                options.host_blacklist.indexOf(host) !== -1) {
	            return false;
	        }
	        return true;
	    };

	    validator.isMACAddress = function (str) {
	        return macAddress.test(str);
	    };

	    validator.isIP = function (str, version) {
	        version = version ? version + '' : '';
	        if (!version) {
	            return validator.isIP(str, 4) || validator.isIP(str, 6);
	        } else if (version === '4') {
	            if (!ipv4Maybe.test(str)) {
	                return false;
	            }
	            var parts = str.split('.').sort(function (a, b) {
	                return a - b;
	            });
	            return parts[3] <= 255;
	        } else if (version === '6') {
	            var blocks = str.split(':');
	            var foundOmissionBlock = false; // marker to indicate ::

	            // At least some OS accept the last 32 bits of an IPv6 address
	            // (i.e. 2 of the blocks) in IPv4 notation, and RFC 3493 says
	            // that '::ffff:a.b.c.d' is valid for IPv4-mapped IPv6 addresses,
	            // and '::a.b.c.d' is deprecated, but also valid.
	            var foundIPv4TransitionBlock = validator.isIP(blocks[blocks.length - 1], 4);
	            var expectedNumberOfBlocks = foundIPv4TransitionBlock ? 7 : 8;

	            if (blocks.length > expectedNumberOfBlocks)
	                return false;

	            // initial or final ::
	            if (str === '::') {
	                return true;
	            } else if (str.substr(0, 2) === '::') {
	                blocks.shift();
	                blocks.shift();
	                foundOmissionBlock = true;
	            } else if (str.substr(str.length - 2) === '::') {
	                blocks.pop();
	                blocks.pop();
	                foundOmissionBlock = true;
	            }

	            for (var i = 0; i < blocks.length; ++i) {
	                // test for a :: which can not be at the string start/end
	                // since those cases have been handled above
	                if (blocks[i] === '' && i > 0 && i < blocks.length -1) {
	                    if (foundOmissionBlock)
	                        return false; // multiple :: in address
	                    foundOmissionBlock = true;
	                } else if (foundIPv4TransitionBlock && i == blocks.length - 1) {
	                    // it has been checked before that the last
	                    // block is a valid IPv4 address
	                } else if (!ipv6Block.test(blocks[i])) {
	                    return false;
	                }
	            }

	            if (foundOmissionBlock) {
	                return blocks.length >= 1;
	            } else {
	                return blocks.length === expectedNumberOfBlocks;
	            }
	        }
	        return false;
	    };

	    var default_fqdn_options = {
	        require_tld: true
	      , allow_underscores: false
	      , allow_trailing_dot: false
	    };

	    validator.isFQDN = function (str, options) {
	        options = merge(options, default_fqdn_options);

	        /* Remove the optional trailing dot before checking validity */
	        if (options.allow_trailing_dot && str[str.length - 1] === '.') {
	            str = str.substring(0, str.length - 1);
	        }
	        var parts = str.split('.');
	        if (options.require_tld) {
	            var tld = parts.pop();
	            if (!parts.length || !/^([a-z\u00a1-\uffff]{2,}|xn[a-z0-9-]{2,})$/i.test(tld)) {
	                return false;
	            }
	        }
	        for (var part, i = 0; i < parts.length; i++) {
	            part = parts[i];
	            if (options.allow_underscores) {
	                if (part.indexOf('__') >= 0) {
	                    return false;
	                }
	                part = part.replace(/_/g, '');
	            }
	            if (!/^[a-z\u00a1-\uffff0-9-]+$/i.test(part)) {
	                return false;
	            }
	            if (/[\uff01-\uff5e]/.test(part)) {
	                // disallow full-width chars
	                return false;
	            }
	            if (part[0] === '-' || part[part.length - 1] === '-') {
	                return false;
	            }
	            if (part.indexOf('---') >= 0 && part.slice(0, 4) !== 'xn--') {
	                return false;
	            }
	        }
	        return true;
	    };

	    validator.isBoolean = function(str) {
	        return (['true', 'false', '1', '0'].indexOf(str) >= 0);
	    };

	    validator.isAlpha = function (str, locale) {
	        locale = locale || 'en-US';
	        return alpha[locale].test(str);
	    };

	    validator.isAlphanumeric = function (str, locale) {
	        locale = locale || 'en-US';
	        return alphanumeric[locale].test(str);
	    };

	    validator.isNumeric = function (str) {
	        return numeric.test(str);
	    };

	    validator.isDecimal = function (str) {
	        return str !== '' && decimal.test(str);
	    };

	    validator.isHexadecimal = function (str) {
	        return hexadecimal.test(str);
	    };

	    validator.isHexColor = function (str) {
	        return hexcolor.test(str);
	    };

	    validator.isLowercase = function (str) {
	        return str === str.toLowerCase();
	    };

	    validator.isUppercase = function (str) {
	        return str === str.toUpperCase();
	    };

	    validator.isInt = function (str, options) {
	        options = options || {};
	        return int.test(str) && (!options.hasOwnProperty('min') || str >= options.min) && (!options.hasOwnProperty('max') || str <= options.max);
	    };

	    validator.isFloat = function (str, options) {
	        options = options || {};
	        if (str === '' || str === '.') {
	            return false;
	        }
	        return float.test(str) && (!options.hasOwnProperty('min') || str >= options.min) && (!options.hasOwnProperty('max') || str <= options.max);
	    };

	    validator.isDivisibleBy = function (str, num) {
	        return validator.toFloat(str) % parseInt(num, 10) === 0;
	    };

	    validator.isNull = function (str) {
	        return str.length === 0;
	    };

	    validator.isLength = function (str, options) {
	        var min, max;
	        if (typeof(options) === 'object') {
	            min = options.min || 0;
	            max = options.max;
	        } else { // backwards compatibility: isLength(str, min [, max])
	            min = arguments[1];
	            max = arguments[2];
	        }
	        var surrogatePairs = str.match(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g) || [];
	        var len = str.length - surrogatePairs.length;
	        return len >= min && (typeof max === 'undefined' || len <= max);
	    };
	    validator.isByteLength = function (str, options) {
	        var min, max;
	        if (typeof(options) === 'object') {
	            min = options.min || 0;
	            max = options.max;
	        } else { // backwards compatibility: isByteLength(str, min [, max])
	            min = arguments[1];
	            max = arguments[2];
	        }
	        var len = encodeURI(str).split(/%..|./).length - 1;
	        return len >= min && (typeof max === 'undefined' || len <= max);
	    };

	    validator.isUUID = function (str, version) {
	        var pattern = uuid[version ? version : 'all'];
	        return pattern && pattern.test(str);
	    };

	    function getTimezoneOffset(str) {
	        var iso8601Parts = str.match(iso8601)
	          , timezone, sign, hours, minutes;
	        if (!iso8601Parts) {
	            str = str.toLowerCase();
	            timezone = str.match(/(?:\s|gmt\s*)(-|\+)(\d{1,4})(\s|$)/);
	            if (!timezone) {
	                return str.indexOf('gmt') !== -1 ? 0 : null;
	            }
	            sign = timezone[1];
	            var offset = timezone[2];
	            if (offset.length === 3) {
	                offset = '0' + offset;
	            }
	            if (offset.length <= 2) {
	                hours = 0;
	                minutes = parseInt(offset);
	            } else {
	                hours = parseInt(offset.slice(0, 2));
	                minutes = parseInt(offset.slice(2, 4));
	            }
	        } else {
	            timezone = iso8601Parts[21];
	            if (!timezone) {
	                // if no hour/minute was provided, the date is GMT
	                return !iso8601Parts[12] ? 0 : null;
	            }
	            if (timezone === 'z' || timezone === 'Z') {
	                return 0;
	            }
	            sign = iso8601Parts[22];
	            if (timezone.indexOf(':') !== -1) {
	                hours = parseInt(iso8601Parts[23]);
	                minutes = parseInt(iso8601Parts[24]);
	            } else {
	                hours = 0;
	                minutes = parseInt(iso8601Parts[23]);
	            }
	        }
	        return (hours * 60 + minutes) * (sign === '-' ? 1 : -1);
	    }

	    validator.isDate = function (str) {
	        var normalizedDate = new Date(Date.parse(str));
	        if (isNaN(normalizedDate)) {
	            return false;
	        }

	        // normalizedDate is in the user's timezone. Apply the input
	        // timezone offset to the date so that the year and day match
	        // the input
	        var timezoneOffset = getTimezoneOffset(str);
	        if (timezoneOffset !== null) {
	            var timezoneDifference = normalizedDate.getTimezoneOffset() -
	                timezoneOffset;
	            normalizedDate = new Date(normalizedDate.getTime() +
	                60000 * timezoneDifference);
	        }

	        var day = String(normalizedDate.getDate());
	        var dayOrYear, dayOrYearMatches, year;
	        //check for valid double digits that could be late days
	        //check for all matches since a string like '12/23' is a valid date
	        //ignore everything with nearby colons
	        dayOrYearMatches = str.match(/(^|[^:\d])[23]\d([^:\d]|$)/g);
	        if (!dayOrYearMatches) {
	            return true;
	        }
	        dayOrYear = dayOrYearMatches.map(function(digitString) {
	            return digitString.match(/\d+/g)[0];
	        }).join('/');

	        year = String(normalizedDate.getFullYear()).slice(-2);
	        if (dayOrYear === day || dayOrYear === year) {
	            return true;
	        } else if ((dayOrYear === (day + '/' + year)) || (dayOrYear === (year + '/' + day))) {
	            return true;
	        }
	        return false;
	    };

	    validator.isAfter = function (str, date) {
	        var comparison = validator.toDate(date || new Date())
	          , original = validator.toDate(str);
	        return !!(original && comparison && original > comparison);
	    };

	    validator.isBefore = function (str, date) {
	        var comparison = validator.toDate(date || new Date())
	          , original = validator.toDate(str);
	        return !!(original && comparison && original < comparison);
	    };

	    validator.isIn = function (str, options) {
	        var i;
	        if (Object.prototype.toString.call(options) === '[object Array]') {
	            var array = [];
	            for (i in options) {
	                array[i] = validator.toString(options[i]);
	            }
	            return array.indexOf(str) >= 0;
	        } else if (typeof options === 'object') {
	            return options.hasOwnProperty(str);
	        } else if (options && typeof options.indexOf === 'function') {
	            return options.indexOf(str) >= 0;
	        }
	        return false;
	    };

	    validator.isWhitelisted = function (str, chars) {
	        for (var i = str.length - 1; i >= 0; i--) {
	            if (chars.indexOf(str[i]) === -1) {
	                return false;
	            }
	        }

	        return true;
	    };

	    validator.isCreditCard = function (str) {
	        var sanitized = str.replace(/[^0-9]+/g, '');
	        if (!creditCard.test(sanitized)) {
	            return false;
	        }
	        var sum = 0, digit, tmpNum, shouldDouble;
	        for (var i = sanitized.length - 1; i >= 0; i--) {
	            digit = sanitized.substring(i, (i + 1));
	            tmpNum = parseInt(digit, 10);
	            if (shouldDouble) {
	                tmpNum *= 2;
	                if (tmpNum >= 10) {
	                    sum += ((tmpNum % 10) + 1);
	                } else {
	                    sum += tmpNum;
	                }
	            } else {
	                sum += tmpNum;
	            }
	            shouldDouble = !shouldDouble;
	        }
	        return !!((sum % 10) === 0 ? sanitized : false);
	    };

	    validator.isISIN = function (str) {
	        if (!isin.test(str)) {
	            return false;
	        }

	        var checksumStr = str.replace(/[A-Z]/g, function(character) {
	            return parseInt(character, 36);
	        });

	        var sum = 0, digit, tmpNum, shouldDouble = true;
	        for (var i = checksumStr.length - 2; i >= 0; i--) {
	            digit = checksumStr.substring(i, (i + 1));
	            tmpNum = parseInt(digit, 10);
	            if (shouldDouble) {
	                tmpNum *= 2;
	                if (tmpNum >= 10) {
	                    sum += tmpNum + 1;
	                } else {
	                    sum += tmpNum;
	                }
	            } else {
	                sum += tmpNum;
	            }
	            shouldDouble = !shouldDouble;
	        }

	        return parseInt(str.substr(str.length - 1), 10) === (10000 - sum) % 10;
	    };

	    validator.isISBN = function (str, version) {
	        version = version ? version + '' : '';
	        if (!version) {
	            return validator.isISBN(str, 10) || validator.isISBN(str, 13);
	        }
	        var sanitized = str.replace(/[\s-]+/g, '')
	          , checksum = 0, i;
	        if (version === '10') {
	            if (!isbn10Maybe.test(sanitized)) {
	                return false;
	            }
	            for (i = 0; i < 9; i++) {
	                checksum += (i + 1) * sanitized.charAt(i);
	            }
	            if (sanitized.charAt(9) === 'X') {
	                checksum += 10 * 10;
	            } else {
	                checksum += 10 * sanitized.charAt(9);
	            }
	            if ((checksum % 11) === 0) {
	                return !!sanitized;
	            }
	        } else  if (version === '13') {
	            if (!isbn13Maybe.test(sanitized)) {
	                return false;
	            }
	            var factor = [ 1, 3 ];
	            for (i = 0; i < 12; i++) {
	                checksum += factor[i % 2] * sanitized.charAt(i);
	            }
	            if (sanitized.charAt(12) - ((10 - (checksum % 10)) % 10) === 0) {
	                return !!sanitized;
	            }
	        }
	        return false;
	    };

	    validator.isMobilePhone = function(str, locale) {
	        if (locale in phones) {
	            return phones[locale].test(str);
	        }
	        return false;
	    };

	    var default_currency_options = {
	        symbol: '$'
	      , require_symbol: false
	      , allow_space_after_symbol: false
	      , symbol_after_digits: false
	      , allow_negatives: true
	      , parens_for_negatives: false
	      , negative_sign_before_digits: false
	      , negative_sign_after_digits: false
	      , allow_negative_sign_placeholder: false
	      , thousands_separator: ','
	      , decimal_separator: '.'
	      , allow_space_after_digits: false
	    };

	    validator.isCurrency = function (str, options) {
	        options = merge(options, default_currency_options);

	        return currencyRegex(options).test(str);
	    };

	    validator.isJSON = function (str) {
	        try {
	            var obj = JSON.parse(str);
	            return !!obj && typeof obj === 'object';
	        } catch (e) {}
	        return false;
	    };

	    validator.isMultibyte = function (str) {
	        return multibyte.test(str);
	    };

	    validator.isAscii = function (str) {
	        return ascii.test(str);
	    };

	    validator.isFullWidth = function (str) {
	        return fullWidth.test(str);
	    };

	    validator.isHalfWidth = function (str) {
	        return halfWidth.test(str);
	    };

	    validator.isVariableWidth = function (str) {
	        return fullWidth.test(str) && halfWidth.test(str);
	    };

	    validator.isSurrogatePair = function (str) {
	        return surrogatePair.test(str);
	    };

	    validator.isBase64 = function (str) {
	        return base64.test(str);
	    };

	    validator.isMongoId = function (str) {
	        return validator.isHexadecimal(str) && str.length === 24;
	    };

	    validator.isISO8601 = function (str) {
	        return iso8601.test(str);
	    };

	    validator.ltrim = function (str, chars) {
	        var pattern = chars ? new RegExp('^[' + chars + ']+', 'g') : /^\s+/g;
	        return str.replace(pattern, '');
	    };

	    validator.rtrim = function (str, chars) {
	        var pattern = chars ? new RegExp('[' + chars + ']+$', 'g') : /\s+$/g;
	        return str.replace(pattern, '');
	    };

	    validator.trim = function (str, chars) {
	        var pattern = chars ? new RegExp('^[' + chars + ']+|[' + chars + ']+$', 'g') : /^\s+|\s+$/g;
	        return str.replace(pattern, '');
	    };

	    validator.escape = function (str) {
	        return (str.replace(/&/g, '&amp;')
	            .replace(/"/g, '&quot;')
	            .replace(/'/g, '&#x27;')
	            .replace(/</g, '&lt;')
	            .replace(/>/g, '&gt;')
	            .replace(/\//g, '&#x2F;')
	            .replace(/\`/g, '&#96;'));
	    };

	    validator.stripLow = function (str, keep_new_lines) {
	        var chars = keep_new_lines ? '\\x00-\\x09\\x0B\\x0C\\x0E-\\x1F\\x7F' : '\\x00-\\x1F\\x7F';
	        return validator.blacklist(str, chars);
	    };

	    validator.whitelist = function (str, chars) {
	        return str.replace(new RegExp('[^' + chars + ']+', 'g'), '');
	    };

	    validator.blacklist = function (str, chars) {
	        return str.replace(new RegExp('[' + chars + ']+', 'g'), '');
	    };

	    var default_normalize_email_options = {
	        lowercase: true,
	        remove_dots: true,
	        remove_extension: true
	    };

	    validator.normalizeEmail = function (email, options) {
	        options = merge(options, default_normalize_email_options);
	        if (!validator.isEmail(email)) {
	            return false;
	        }
	        var parts = email.split('@', 2);
	        parts[1] = parts[1].toLowerCase();
	        if (parts[1] === 'gmail.com' || parts[1] === 'googlemail.com') {
	            if (options.remove_extension) {
	                parts[0] = parts[0].split('+')[0];
	            }
	            if (options.remove_dots) {
	                parts[0] = parts[0].replace(/\./g, '');
	            }
	            if (!parts[0].length) {
	                return false;
	            }
	            parts[0] = parts[0].toLowerCase();
	            parts[1] = 'gmail.com';
	        } else if (options.lowercase) {
	            parts[0] = parts[0].toLowerCase();
	        }
	        return parts.join('@');
	    };

	    function merge(obj, defaults) {
	        obj = obj || {};
	        for (var key in defaults) {
	            if (typeof obj[key] === 'undefined') {
	                obj[key] = defaults[key];
	            }
	        }
	        return obj;
	    }

	    function currencyRegex(options) {
	        var symbol = '(\\' + options.symbol.replace(/\./g, '\\.') + ')' + (options.require_symbol ? '' : '?')
	            , negative = '-?'
	            , whole_dollar_amount_without_sep = '[1-9]\\d*'
	            , whole_dollar_amount_with_sep = '[1-9]\\d{0,2}(\\' + options.thousands_separator + '\\d{3})*'
	            , valid_whole_dollar_amounts = ['0', whole_dollar_amount_without_sep, whole_dollar_amount_with_sep]
	            , whole_dollar_amount = '(' + valid_whole_dollar_amounts.join('|') + ')?'
	            , decimal_amount = '(\\' + options.decimal_separator + '\\d{2})?';
	        var pattern = whole_dollar_amount + decimal_amount;
	        // default is negative sign before symbol, but there are two other options (besides parens)
	        if (options.allow_negatives && !options.parens_for_negatives) {
	            if (options.negative_sign_after_digits) {
	                pattern += negative;
	            }
	            else if (options.negative_sign_before_digits) {
	                pattern = negative + pattern;
	            }
	        }
	        // South African Rand, for example, uses R 123 (space) and R-123 (no space)
	        if (options.allow_negative_sign_placeholder) {
	            pattern = '( (?!\\-))?' + pattern;
	        }
	        else if (options.allow_space_after_symbol) {
	            pattern = ' ?' + pattern;
	        }
	        else if (options.allow_space_after_digits) {
	            pattern += '( (?!$))?';
	        }
	        if (options.symbol_after_digits) {
	            pattern += symbol;
	        } else {
	            pattern = symbol + pattern;
	        }
	        if (options.allow_negatives) {
	            if (options.parens_for_negatives) {
	                pattern = '(\\(' + pattern + '\\)|' + pattern + ')';
	            }
	            else if (!(options.negative_sign_before_digits || options.negative_sign_after_digits)) {
	                pattern = negative + pattern;
	            }
	        }
	        return new RegExp(
	            '^' +
	            // ensure there's a dollar and/or decimal amount, and that it doesn't start with a space or a negative sign followed by a space
	            '(?!-? )(?=.*\\d)' +
	            pattern +
	            '$'
	        );
	    }

	    validator.init();

	    return validator;

	});


/***/ },
/* 89 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _rethinkdbdash = __webpack_require__(90);

	var _rethinkdbdash2 = _interopRequireDefault(_rethinkdbdash);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var r = (0, _rethinkdbdash2.default)({ cursor: true, db: 'junk' });

	exports.default = function () {
	  return r;
	};

/***/ },
/* 90 */
/***/ function(module, exports, __webpack_require__) {

	var Promise = __webpack_require__(91);

	var helper = __webpack_require__(127);
	var Connection = __webpack_require__(129);
	var Term = __webpack_require__(135);
	var Error = __webpack_require__(131);
	var PoolMaster = __webpack_require__(138);
	var termTypes = __webpack_require__(128).Term.TermType;

	function r(options) {
	  var self = this;
	  var _r = function(x) {
	    return new Term(_r).expr(x);
	  }
	  helper.changeProto(_r, self);

	  Term.prototype._setNestingLevel(r.prototype.nestingLevel);
	  Term.prototype._setArrayLimit(r.prototype.arrayLimit);

	  _r.row = new Term(_r).row();

	  _r.monday = new Term(_r).monday();
	  _r.tuesday = new Term(_r).tuesday();
	  _r.wednesday = new Term(_r).wednesday();
	  _r.thursday = new Term(_r).thursday();
	  _r.friday = new Term(_r).friday();
	  _r.saturday = new Term(_r).saturday();
	  _r.sunday =  new Term(_r).sunday();

	  _r.january = new Term(_r).january();
	  _r.february = new Term(_r).february();
	  _r.march = new Term(_r).march();
	  _r.april = new Term(_r).april();
	  _r.may = new Term(_r).may();
	  _r.june = new Term(_r).june();
	  _r.july = new Term(_r).july();
	  _r.august = new Term(_r).august();
	  _r.september = new Term(_r).september();
	  _r.october = new Term(_r).october();
	  _r.november = new Term(_r).november();
	  _r.december = new Term(_r).december();
	  _r.minval = new Term(_r).minval();
	  _r.maxval = new Term(_r).maxval();

	  _r.nextVarId = 1;
	  _r._Term = Term;
	  return _r;
	};
	r.prototype._host = 'localhost';
	r.prototype._port = 28015;
	r.prototype._authKey = '';
	r.prototype._timeoutConnect = 20;

	r.prototype._nestingLevel = 100;
	r.prototype._arrayLimit = 100000;
	r.prototype._db = 'test';
	r.prototype._useOutdated = false;
	r.prototype._timeFormat = 'native';
	r.prototype._profile = false;


	r.prototype.setNestingLevel = function(nestingLevel) {
	  if (typeof nestingLevel !== 'number') throw new Error.ReqlDriverError('The first argument of `setNestingLevel` must be a number.')
	  this.nestingLevel = nestingLevel;
	}
	r.prototype.setArrayLimit = function(arrayLimit) {
	  if (typeof arrayLimit !== 'number') throw new Error.ReqlDriverError('The first argument of `setArrayLimit` must be a number.')
	  this.arrayLimit = arrayLimit;
	}

	r.prototype.connect = function(options, callback) {
	  if (typeof options === 'function') {
	    callback = options;
	    options = {};
	  }
	  var self = this;

	  var p = new Promise(function(resolve, reject) {
	    new Connection(self, options, resolve, reject);
	  }).nodeify(callback);
	  return p;
	};

	r.prototype.createPools = function(options) {
	  this._poolMaster = new PoolMaster(this, options);
	  return this;
	}

	r.prototype.getPoolMaster = function() {
	  return this._poolMaster;
	}
	r.prototype.getPool = function(i) {
	  if (i === undefined) {
	    if (this.getPoolMaster().getPools().length === 1) {
	      return this.getPoolMaster().getPools()[0];
	    }
	    else {
	      throw new Error('You have multiple pools. Use `getPool(index)` or `getPools()`');
	    }
	  }
	  else {
	    return this.getPoolMaster().getPools()[i];
	  }
	}

	r.prototype.expr = function(expression, nestingLevel) {
	  if (Term.prototype._fastArityRange(arguments.length, 1, 2) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    Term.prototype._arityRange(_args, 1, 2, 'expr', this);
	  }
	  var _nestingLevel = nestingLevel || this.nestingLevel;
	  return new Term(this).expr(expression, _nestingLevel);
	};
	r.prototype.db = function(db) {
	  if (Term.prototype._fastArity(arguments.length, 1) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    Term.prototype._arity(_args, 1, 'r.db', this);
	  }
	  return new Term(this).db(db);
	};
	r.prototype.table = function(table, options) {
	  if (Term.prototype._fastArityRange(arguments.length, 1, 2) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    Term.prototype._arityRange(_args, 1, 2, 'table', this);
	  }
	  return new Term(this).table(table, options);
	};
	r.prototype.js = function(jsString, options) {
	  if (Term.prototype._fastArityRange(arguments.length, 1, 2) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    Term.prototype._arityRange(_args, 1, 2, 'r.js', this);
	  }
	  return new Term(this).js(jsString, options);
	};
	r.prototype.tableCreate = function(table, options) {
	  if (Term.prototype._fastArityRange(arguments.length, 1, 2) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    Term.prototype._arityRange(_args, 1, 2, 'r.tableCreate', this);
	  }
	  return new Term(this).tableCreate(table, options);
	};
	r.prototype.tableDrop = function(db) {
	  if (Term.prototype._fastArity(arguments.length, 1) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    Term.prototype._arity(_args, 1, 'r.tableDrop', this);
	  }
	  return new Term(this).tableDrop(db);
	};
	r.prototype.tableList = function() {
	  if (Term.prototype._fastArity(arguments.length, 0) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    Term.prototype._arity(_args, 0, 'r.tableList', this);
	  }
	  return new Term(this).tableList();
	};
	r.prototype.dbCreate = function(db) {
	  if (Term.prototype._fastArity(arguments.length, 1) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    Term.prototype._arity(_args, 1, 'dbCreate', this);
	  }
	  return new Term(this).dbCreate(db);
	};
	r.prototype.dbDrop = function(db) {
	  if (Term.prototype._fastArity(arguments.length, 1) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    Term.prototype._arity(_args, 1, 'dbDrop', this);
	  }
	  return new Term(this).dbDrop(db);
	};
	r.prototype.dbList = function() {
	  if (Term.prototype._fastArity(arguments.length, 0) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    Term.prototype._arity(_args, 0, 'dbList', this);
	  }
	  return new Term(this).dbList();
	};
	r.prototype.literal = function(obj) {
	  if (Term.prototype._fastArityRange(arguments.length, 0, 1) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    Term.prototype._arityRange(_args, 1, 2, 'r.literal', this);
	  }
	  if (obj === undefined) {
	    return new Term(this).literal();
	  }
	  else {
	    return new Term(this).literal(obj);
	  }
	};
	r.prototype.desc = function(field) {
	  if (Term.prototype._fastArity(arguments.length, 1) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    Term.prototype._arity(_args, 1, 'r.desc', this);
	  }
	  return new Term(this).desc(field);
	};
	r.prototype.asc = function(field) {
	  if (Term.prototype._fastArity(arguments.length, 1) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    Term.prototype._arity(_args, 1, 'r.asc', this);
	  }
	  return new Term(this).asc(field);
	};
	r.prototype.union = function() {
	  var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}

	  var term = new Term(this).expr(_args[0]);
	  return term.union.apply(term, _args.slice(1));
	};
	r.prototype.add = function() {
	  var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	  Term.prototype._arityRange(_args, 2, Infinity, 'r.add', this);

	  var term = new Term(this).expr(_args[0]);
	  return term.add.apply(term, _args.slice(1));
	};
	r.prototype.sub = function() {
	  var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	  Term.prototype._arityRange(_args, 2, Infinity, 'r.sub', this);

	  var term = new Term(this).expr(_args[0]);
	  return term.sub.apply(term, _args.slice(1));
	};
	r.prototype.div = function() {
	  var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	  Term.prototype._arityRange(_args, 2, Infinity, 'r.div', this);

	  var term = new Term(this).expr(_args[0]);
	  return term.div.apply(term, _args.slice(1));
	};
	r.prototype.mul = function() {
	  var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	  Term.prototype._arityRange(_args, 2, Infinity, 'r.mul', this);

	  var term = new Term(this).expr(_args[0]);
	  return term.mul.apply(term, _args.slice(1));
	};
	r.prototype.mod = function(a, b) {
	  if (Term.prototype._fastArity(arguments.length, 2) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    Term.prototype._arity(_args, 2, 'r.mod', this);
	  }

	  return new Term(this).expr(a).mod(b);
	};
	r.prototype.and = function() {
	  var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	  Term.prototype._arityRange(_args, 1, Infinity, 'r.and', this);

	  var term = new Term(this).expr(_args[0]);
	  return term.and.apply(term, _args.slice(1));
	};
	r.prototype.or = function() {
	  var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	  Term.prototype._arityRange(_args, 1, Infinity, 'r.or', this);

	  var term = new Term(this).expr(_args[0]);
	  return term.or.apply(term, _args.slice(1));
	};
	r.prototype.eq = function() {
	  var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	  Term.prototype._arityRange(_args, 2, Infinity, 'r.eq', this);

	  var term = new Term(this).expr(_args[0]);
	  return term.eq.apply(term, _args.slice(1));
	};
	r.prototype.ne = function() {
	  var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	  Term.prototype._arityRange(_args, 2, Infinity, 'r.ne', this);

	  var term = new Term(this).expr(_args[0]);
	  return term.ne.apply(term, _args.slice(1));
	};
	r.prototype.gt = function() {
	  var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	  Term.prototype._arityRange(_args, 2, Infinity, 'r.gt', this);

	  var term = new Term(this).expr(_args[0]);
	  return term.gt.apply(term, _args.slice(1));
	};
	r.prototype.ge = function() {
	  var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	  Term.prototype._arityRange(_args, 2, Infinity, 'r.ge', this);

	  var term = new Term(this).expr(_args[0]);
	  return term.ge.apply(term, _args.slice(1));
	};
	r.prototype.lt = function() {
	  var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	  Term.prototype._arityRange(_args, 2, Infinity, 'r.lt', this);

	  var term = new Term(this).expr(_args[0]);
	  return term.lt.apply(term, _args.slice(1));
	};
	r.prototype.le = function() {
	  var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	  Term.prototype._arityRange(_args, 2, Infinity, 'r.le', this);

	  var term = new Term(this).expr(_args[0]);
	  return term.le.apply(term, _args.slice(1));
	};
	r.prototype.not = function(bool) {
	  if (Term.prototype._fastArity(arguments.length, 1) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    Term.prototype._arity(_args, 1, 'r.not', this);
	  }
	  return new Term(this).expr(bool).not();
	}
	r.prototype.floor = function(num) {
	  if (Term.prototype._fastArity(arguments.length, 1) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    Term.prototype._arity(_args, 1, 'r.floor', this);
	  }
	  return new Term(this).expr(num).floor();
	}
	r.prototype.ceil = function(num) {
	  if (Term.prototype._fastArity(arguments.length, 1) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    Term.prototype._arity(_args, 1, 'r.ceil', this);
	  }
	  return new Term(this).expr(num).ceil();
	}
	r.prototype.round = function(num) {
	  if (Term.prototype._fastArity(arguments.length, 1) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    Term.prototype._arity(_args, 1, 'r.round', this);
	  }
	  return new Term(this).expr(num).round();
	}


	r.prototype.now = function() {
	  if (Term.prototype._fastArity(arguments.length, 0) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    Term.prototype._arity(_args, 0, 'now', this);
	  }
	  return new Term(this).now();
	}
	r.prototype.time = function() {
	  var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	  var term = new Term(this);
	  return term.time.apply(term, _args);
	}
	r.prototype.epochTime = function(epochTime) {
	  if (Term.prototype._fastArity(arguments.length, 1) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    Term.prototype._arity(_args, 1, 'r.epochTime', this);
	  }
	  return new Term(this).epochTime(epochTime);
	}
	r.prototype.ISO8601 = function(isoTime, options) {
	  if (Term.prototype._fastArityRange(arguments.length, 1, 2) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    Term.prototype._arityRange(_args, 1, 2, 'r.ISO8601', this);
	  }
	  return new Term(this).ISO8601(isoTime, options);
	}
	r.prototype.branch = function(predicate, trueBranch, falseBranch) {
	  var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	  Term.prototype._arityRange(_args, 3, Infinity, 'r.branch', this);

	  var term = new Term(this).expr(predicate);
	  return term.branch.apply(term, _args.slice(1));
	}
	r.prototype.error = function(errorStr) {
	  if (Term.prototype._fastArityRange(arguments.length, 0, 1) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    Term.prototype._arityRange(_args, 0, 1, 'r.error', this);
	  }
	  var term = new Term(this);
	  term._query.push(termTypes.ERROR);
	  if (errorStr !== undefined) {
	    term._query.push([new Term(this).expr(errorStr)._query]);
	  }
	  return term;

	}
	r.prototype.json = function(json) {
	  if (Term.prototype._fastArity(arguments.length, 1) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    Term.prototype._arity(_args, 1, 'r.json', this);
	  }
	  return new Term(this).json(json);
	}

	r.prototype.object = function() {
	  var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	  var term = new Term(this);
	  return term.object.apply(term, _args);
	}
	r.prototype.args = function() {
	  var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	  var term = new Term(this);
	  return term.args.apply(term, _args);
	}
	r.prototype.random = function() {
	  var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	  var term = new Term(this);
	  return term.random.apply(term, _args);
	}
	r.prototype.http = function() {
	  var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	  var term = new Term(this);
	  return term.http.apply(term, _args);
	}
	r.prototype.do = function() {
	  var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	  Term.prototype._arityRange(_args, 2, Infinity, 'r.do', this);

	  var term = new Term(this).expr(_args[0]);
	  return term.do.apply(term, _args.slice(1));
	}
	r.prototype.binary = function(bin) {
	  if (Term.prototype._fastArity(arguments.length, 1) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    Term.prototype._arity(_args, 1, 'r.binary', this);
	  }
	  var term = new Term(this);
	  return term.binary(bin);
	}
	r.prototype.uuid = function() {
	  var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	  Term.prototype._arityRange(_args, 0, 1, 'r.uuid', this);
	  var term = new Term(this);
	  return term.uuid(_args[0]);
	}

	r.prototype.line = function() {
	  var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	  Term.prototype._arityRange(_args, 2, Infinity, 'r.line', this);

	  var term = new Term(this);
	  return term.line.apply(term, _args);
	}
	r.prototype.point = function(longitude, latitude) {
	  if (Term.prototype._fastArity(arguments.length, 2) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    Term.prototype._arity(_args, 2, 'r.point', this);
	  }
	  return new Term(this).point(longitude, latitude);
	}
	r.prototype.polygon = function() {
	  var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	  Term.prototype._arityRange(_args, 3, Infinity, 'r.polygon', this);

	  var term = new Term(this);
	  return term.polygon.apply(term, _args);
	}
	r.prototype.circle = function(center, radius, options) {
	  if (Term.prototype._fastArityRange(arguments.length, 2, 3) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    Term.prototype._arityRange(_args, 2, 3, 'r.circle', this);
	  }
	  var term = new Term(this);
	  if (options !== undefined) {
	    return term.circle(center, radius, options);
	  }
	  else {
	    return term.circle(center, radius);
	  }
	}
	r.prototype.geojson = function(value) {
	  if (Term.prototype._fastArity(arguments.length, 1) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    Term.prototype._arity(_args, 1, 'r.geojson', this);
	  }
	  var term = new Term(this);
	  return term.geojson(value);
	}
	r.prototype.range = function(start, end) {
	  var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	  Term.prototype._arityRange(_args, 1, 2, 'r.range', this);

	  var term = new Term(this);
	  if (end !== undefined) {
	    return term.range(start, end);
	  }
	  else {
	    return term.range(start);
	  }
	}
	r.prototype.wait = function() {
	  var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	  Term.prototype._arityRange(_args, 0, 1, 'r.wait', this);

	  var term = new Term(this);
	  return term.wait(_args[0]);
	}
	r.prototype.reconfigure = function(config) {
	  if (Term.prototype._fastArity(arguments.length, 1) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    Term.prototype._arity(_args, 1, 'r.reconfigure', this);
	  }
	  var term = new Term(this);
	  return term.reconfigure(config);
	}
	r.prototype.rebalance = function(config) {
	  if (Term.prototype._fastArity(arguments.length, 0) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    Term.prototype._arity(_args, 0, 'r.rebalance', this);
	  }
	  var term = new Term(this);
	  return term.rebalance();
	}
	r.prototype.map = function() {
	  var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	  Term.prototype._arityRange(_args, 1, Infinity, 'r.map', this);

	  var term = new Term(this);
	  return term.map.apply(term, _args);
	};
	r.prototype.typeOf = function(value) {
	  if (Term.prototype._fastArity(arguments.length, 1) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    Term.prototype._arity(_args, 1, 'r.typeOf', this);
	  }
	  var term = new Term(this);
	  return term.expr(value).typeOf();
	}


	r.prototype.Error = Error;


	function main(options) {
	  var _r = new r();

	  if (!helper.isPlainObject(options)) options = {};
	  if (options.pool !== false) _r.createPools(options);
	  _r._options = {};
	  if (options.cursor === true) _r._options.cursor = true;
	  if (options.stream === true) _r._options.stream = true;
	  if (options.optionalRun === false) {
	    delete _r._Term.prototype.then
	    delete _r._Term.prototype.error
	    delete _r._Term.prototype.catch
	    delete _r._Term.prototype.finally
	  }
	  return _r;
	}
	module.exports = main;


/***/ },
/* 91 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var old;
	if (typeof Promise !== "undefined") old = Promise;
	function noConflict() {
	    try { if (Promise === bluebird) Promise = old; }
	    catch (e) {}
	    return bluebird;
	}
	var bluebird = __webpack_require__(92)();
	bluebird.noConflict = noConflict;
	module.exports = bluebird;


/***/ },
/* 92 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	module.exports = function() {
	var makeSelfResolutionError = function () {
	    return new TypeError("circular promise resolution chain\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
	};
	var reflectHandler = function() {
	    return new Promise.PromiseInspection(this._target());
	};
	var apiRejection = function(msg) {
	    return Promise.reject(new TypeError(msg));
	};
	function Proxyable() {}
	var UNDEFINED_BINDING = {};
	var util = __webpack_require__(93);

	var getDomain;
	if (util.isNode) {
	    getDomain = function() {
	        var ret = process.domain;
	        if (ret === undefined) ret = null;
	        return ret;
	    };
	} else {
	    getDomain = function() {
	        return null;
	    };
	}
	util.notEnumerableProp(Promise, "_getDomain", getDomain);

	var es5 = __webpack_require__(94);
	var Async = __webpack_require__(95);
	var async = new Async();
	es5.defineProperty(Promise, "_async", {value: async});
	var errors = __webpack_require__(98);
	var TypeError = Promise.TypeError = errors.TypeError;
	Promise.RangeError = errors.RangeError;
	var CancellationError = Promise.CancellationError = errors.CancellationError;
	Promise.TimeoutError = errors.TimeoutError;
	Promise.OperationalError = errors.OperationalError;
	Promise.RejectionError = errors.OperationalError;
	Promise.AggregateError = errors.AggregateError;
	var INTERNAL = function(){};
	var APPLY = {};
	var NEXT_FILTER = {};
	var tryConvertToPromise = __webpack_require__(99)(Promise, INTERNAL);
	var PromiseArray =
	    __webpack_require__(100)(Promise, INTERNAL,
	                               tryConvertToPromise, apiRejection, Proxyable);
	var Context = __webpack_require__(101)(Promise);
	 /*jshint unused:false*/
	var createContext = Context.create;
	var debug = __webpack_require__(102)(Promise, Context);
	var CapturedTrace = debug.CapturedTrace;
	var PassThroughHandlerContext =
	    __webpack_require__(103)(Promise, tryConvertToPromise);
	var catchFilter = __webpack_require__(104)(NEXT_FILTER);
	var nodebackForPromise = __webpack_require__(105);
	var errorObj = util.errorObj;
	var tryCatch = util.tryCatch;
	function check(self, executor) {
	    if (typeof executor !== "function") {
	        throw new TypeError("expecting a function but got " + util.classString(executor));
	    }
	    if (self.constructor !== Promise) {
	        throw new TypeError("the promise constructor cannot be invoked directly\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
	    }
	}

	function Promise(executor) {
	    this._bitField = 0;
	    this._fulfillmentHandler0 = undefined;
	    this._rejectionHandler0 = undefined;
	    this._promise0 = undefined;
	    this._receiver0 = undefined;
	    if (executor !== INTERNAL) {
	        check(this, executor);
	        this._resolveFromExecutor(executor);
	    }
	    this._promiseCreated();
	}

	Promise.prototype.toString = function () {
	    return "[object Promise]";
	};

	Promise.prototype.caught = Promise.prototype["catch"] = function (fn) {
	    var len = arguments.length;
	    if (len > 1) {
	        var catchInstances = new Array(len - 1),
	            j = 0, i;
	        for (i = 0; i < len - 1; ++i) {
	            var item = arguments[i];
	            if (util.isObject(item)) {
	                catchInstances[j++] = item;
	            } else {
	                return apiRejection("expecting an object but got " + util.classString(item));
	            }
	        }
	        catchInstances.length = j;
	        fn = arguments[i];
	        return this.then(undefined, catchFilter(catchInstances, fn, this));
	    }
	    return this.then(undefined, fn);
	};

	Promise.prototype.reflect = function () {
	    return this._then(reflectHandler,
	        reflectHandler, undefined, this, undefined);
	};

	Promise.prototype.then = function (didFulfill, didReject) {
	    if (debug.warnings() && arguments.length > 0 &&
	        typeof didFulfill !== "function" &&
	        typeof didReject !== "function") {
	        var msg = ".then() only accepts functions but was passed: " +
	                util.classString(didFulfill);
	        if (arguments.length > 1) {
	            msg += ", " + util.classString(didReject);
	        }
	        this._warn(msg);
	    }
	    return this._then(didFulfill, didReject, undefined, undefined, undefined);
	};

	Promise.prototype.done = function (didFulfill, didReject) {
	    var promise =
	        this._then(didFulfill, didReject, undefined, undefined, undefined);
	    promise._setIsFinal();
	};

	Promise.prototype.spread = function (fn) {
	    if (typeof fn !== "function") {
	        return apiRejection("expecting a function but got " + util.classString(fn));
	    }
	    return this.all()._then(fn, undefined, undefined, APPLY, undefined);
	};

	Promise.prototype.toJSON = function () {
	    var ret = {
	        isFulfilled: false,
	        isRejected: false,
	        fulfillmentValue: undefined,
	        rejectionReason: undefined
	    };
	    if (this.isFulfilled()) {
	        ret.fulfillmentValue = this.value();
	        ret.isFulfilled = true;
	    } else if (this.isRejected()) {
	        ret.rejectionReason = this.reason();
	        ret.isRejected = true;
	    }
	    return ret;
	};

	Promise.prototype.all = function () {
	    if (arguments.length > 0) {
	        this._warn(".all() was passed arguments but it does not take any");
	    }
	    return new PromiseArray(this).promise();
	};

	Promise.prototype.error = function (fn) {
	    return this.caught(util.originatesFromRejection, fn);
	};

	Promise.is = function (val) {
	    return val instanceof Promise;
	};

	Promise.fromNode = Promise.fromCallback = function(fn) {
	    var ret = new Promise(INTERNAL);
	    ret._captureStackTrace();
	    var multiArgs = arguments.length > 1 ? !!Object(arguments[1]).multiArgs
	                                         : false;
	    var result = tryCatch(fn)(nodebackForPromise(ret, multiArgs));
	    if (result === errorObj) {
	        ret._rejectCallback(result.e, true);
	    }
	    if (!ret._isFateSealed()) ret._setAsyncGuaranteed();
	    return ret;
	};

	Promise.all = function (promises) {
	    return new PromiseArray(promises).promise();
	};

	Promise.cast = function (obj) {
	    var ret = tryConvertToPromise(obj);
	    if (!(ret instanceof Promise)) {
	        ret = new Promise(INTERNAL);
	        ret._captureStackTrace();
	        ret._setFulfilled();
	        ret._rejectionHandler0 = obj;
	    }
	    return ret;
	};

	Promise.resolve = Promise.fulfilled = Promise.cast;

	Promise.reject = Promise.rejected = function (reason) {
	    var ret = new Promise(INTERNAL);
	    ret._captureStackTrace();
	    ret._rejectCallback(reason, true);
	    return ret;
	};

	Promise.setScheduler = function(fn) {
	    if (typeof fn !== "function") {
	        throw new TypeError("expecting a function but got " + util.classString(fn));
	    }
	    var prev = async._schedule;
	    async._schedule = fn;
	    return prev;
	};

	Promise.prototype._then = function (
	    didFulfill,
	    didReject,
	    _,    receiver,
	    internalData
	) {
	    var haveInternalData = internalData !== undefined;
	    var promise = haveInternalData ? internalData : new Promise(INTERNAL);
	    var target = this._target();
	    var bitField = target._bitField;

	    if (!haveInternalData) {
	        promise._propagateFrom(this, 3);
	        promise._captureStackTrace();
	        if (receiver === undefined &&
	            ((this._bitField & 2097152) !== 0)) {
	            if (!((bitField & 50397184) === 0)) {
	                receiver = this._boundValue();
	            } else {
	                receiver = target === this ? undefined : this._boundTo;
	            }
	        }
	    }

	    var domain = getDomain();
	    if (!((bitField & 50397184) === 0)) {
	        var handler, value, settler = target._settlePromiseCtx;
	        if (((bitField & 33554432) !== 0)) {
	            value = target._rejectionHandler0;
	            handler = didFulfill;
	        } else if (((bitField & 16777216) !== 0)) {
	            value = target._fulfillmentHandler0;
	            handler = didReject;
	            target._unsetRejectionIsUnhandled();
	        } else {
	            settler = target._settlePromiseLateCancellationObserver;
	            value = new CancellationError("late cancellation observer");
	            target._attachExtraTrace(value);
	            handler = didReject;
	        }

	        async.invoke(settler, target, {
	            handler: domain === null ? handler
	                : (typeof handler === "function" && domain.bind(handler)),
	            promise: promise,
	            receiver: receiver,
	            value: value
	        });
	    } else {
	        target._addCallbacks(didFulfill, didReject, promise, receiver, domain);
	    }

	    return promise;
	};

	Promise.prototype._length = function () {
	    return this._bitField & 65535;
	};

	Promise.prototype._isFateSealed = function () {
	    return (this._bitField & 117506048) !== 0;
	};

	Promise.prototype._isFollowing = function () {
	    return (this._bitField & 67108864) === 67108864;
	};

	Promise.prototype._setLength = function (len) {
	    this._bitField = (this._bitField & -65536) |
	        (len & 65535);
	};

	Promise.prototype._setFulfilled = function () {
	    this._bitField = this._bitField | 33554432;
	};

	Promise.prototype._setRejected = function () {
	    this._bitField = this._bitField | 16777216;
	};

	Promise.prototype._setFollowing = function () {
	    this._bitField = this._bitField | 67108864;
	};

	Promise.prototype._setIsFinal = function () {
	    this._bitField = this._bitField | 4194304;
	};

	Promise.prototype._isFinal = function () {
	    return (this._bitField & 4194304) > 0;
	};

	Promise.prototype._unsetCancelled = function() {
	    this._bitField = this._bitField & (~65536);
	};

	Promise.prototype._setCancelled = function() {
	    this._bitField = this._bitField | 65536;
	};

	Promise.prototype._setAsyncGuaranteed = function() {
	    this._bitField = this._bitField | 134217728;
	};

	Promise.prototype._receiverAt = function (index) {
	    var ret = index === 0 ? this._receiver0 : this[
	            index * 4 - 4 + 3];
	    if (ret === UNDEFINED_BINDING) {
	        return undefined;
	    } else if (ret === undefined && this._isBound()) {
	        return this._boundValue();
	    }
	    return ret;
	};

	Promise.prototype._promiseAt = function (index) {
	    return this[
	            index * 4 - 4 + 2];
	};

	Promise.prototype._fulfillmentHandlerAt = function (index) {
	    return this[
	            index * 4 - 4 + 0];
	};

	Promise.prototype._rejectionHandlerAt = function (index) {
	    return this[
	            index * 4 - 4 + 1];
	};

	Promise.prototype._boundValue = function() {};

	Promise.prototype._migrateCallback0 = function (follower) {
	    var bitField = follower._bitField;
	    var fulfill = follower._fulfillmentHandler0;
	    var reject = follower._rejectionHandler0;
	    var promise = follower._promise0;
	    var receiver = follower._receiverAt(0);
	    if (receiver === undefined) receiver = UNDEFINED_BINDING;
	    this._addCallbacks(fulfill, reject, promise, receiver, null);
	};

	Promise.prototype._migrateCallbackAt = function (follower, index) {
	    var fulfill = follower._fulfillmentHandlerAt(index);
	    var reject = follower._rejectionHandlerAt(index);
	    var promise = follower._promiseAt(index);
	    var receiver = follower._receiverAt(index);
	    if (receiver === undefined) receiver = UNDEFINED_BINDING;
	    this._addCallbacks(fulfill, reject, promise, receiver, null);
	};

	Promise.prototype._addCallbacks = function (
	    fulfill,
	    reject,
	    promise,
	    receiver,
	    domain
	) {
	    var index = this._length();

	    if (index >= 65535 - 4) {
	        index = 0;
	        this._setLength(0);
	    }

	    if (index === 0) {
	        this._promise0 = promise;
	        this._receiver0 = receiver;
	        if (typeof fulfill === "function") {
	            this._fulfillmentHandler0 =
	                domain === null ? fulfill : domain.bind(fulfill);
	        }
	        if (typeof reject === "function") {
	            this._rejectionHandler0 =
	                domain === null ? reject : domain.bind(reject);
	        }
	    } else {
	        var base = index * 4 - 4;
	        this[base + 2] = promise;
	        this[base + 3] = receiver;
	        if (typeof fulfill === "function") {
	            this[base + 0] =
	                domain === null ? fulfill : domain.bind(fulfill);
	        }
	        if (typeof reject === "function") {
	            this[base + 1] =
	                domain === null ? reject : domain.bind(reject);
	        }
	    }
	    this._setLength(index + 1);
	    return index;
	};

	Promise.prototype._proxy = function (proxyable, arg) {
	    this._addCallbacks(undefined, undefined, arg, proxyable, null);
	};

	Promise.prototype._resolveCallback = function(value, shouldBind) {
	    if (((this._bitField & 117506048) !== 0)) return;
	    if (value === this)
	        return this._rejectCallback(makeSelfResolutionError(), false);
	    var maybePromise = tryConvertToPromise(value, this);
	    if (!(maybePromise instanceof Promise)) return this._fulfill(value);

	    if (shouldBind) this._propagateFrom(maybePromise, 2);

	    var promise = maybePromise._target();
	    var bitField = promise._bitField;
	    if (((bitField & 50397184) === 0)) {
	        var len = this._length();
	        if (len > 0) promise._migrateCallback0(this);
	        for (var i = 1; i < len; ++i) {
	            promise._migrateCallbackAt(this, i);
	        }
	        this._setFollowing();
	        this._setLength(0);
	        this._setFollowee(promise);
	    } else if (((bitField & 33554432) !== 0)) {
	        this._fulfill(promise._value());
	    } else if (((bitField & 16777216) !== 0)) {
	        this._reject(promise._reason());
	    } else {
	        var reason = new CancellationError("late cancellation observer");
	        promise._attachExtraTrace(reason);
	        this._reject(reason);
	    }
	};

	Promise.prototype._rejectCallback =
	function(reason, synchronous, ignoreNonErrorWarnings) {
	    var trace = util.ensureErrorObject(reason);
	    var hasStack = trace === reason;
	    if (!hasStack && !ignoreNonErrorWarnings && debug.warnings()) {
	        var message = "a promise was rejected with a non-error: " +
	            util.classString(reason);
	        this._warn(message, true);
	    }
	    this._attachExtraTrace(trace, synchronous ? hasStack : false);
	    this._reject(reason);
	};

	Promise.prototype._resolveFromExecutor = function (executor) {
	    var promise = this;
	    this._captureStackTrace();
	    this._pushContext();
	    var synchronous = true;
	    var r = this._execute(executor, function(value) {
	        promise._resolveCallback(value);
	    }, function (reason) {
	        promise._rejectCallback(reason, synchronous);
	    });
	    synchronous = false;
	    this._popContext();

	    if (r !== undefined) {
	        promise._rejectCallback(r, true);
	    }
	};

	Promise.prototype._settlePromiseFromHandler = function (
	    handler, receiver, value, promise
	) {
	    var bitField = promise._bitField;
	    if (((bitField & 65536) !== 0)) return;
	    promise._pushContext();
	    var x;
	    if (receiver === APPLY) {
	        if (!value || typeof value.length !== "number") {
	            x = errorObj;
	            x.e = new TypeError("cannot .spread() a non-array: " +
	                                    util.classString(value));
	        } else {
	            x = tryCatch(handler).apply(this._boundValue(), value);
	        }
	    } else {
	        x = tryCatch(handler).call(receiver, value);
	    }
	    var promiseCreated = promise._popContext();
	    bitField = promise._bitField;
	    if (((bitField & 65536) !== 0)) return;

	    if (x === NEXT_FILTER) {
	        promise._reject(value);
	    } else if (x === errorObj || x === promise) {
	        var err = x === promise ? makeSelfResolutionError() : x.e;
	        promise._rejectCallback(err, false);
	    } else {
	        debug.checkForgottenReturns(x, promiseCreated, "",  promise, this);
	        promise._resolveCallback(x);
	    }
	};

	Promise.prototype._target = function() {
	    var ret = this;
	    while (ret._isFollowing()) ret = ret._followee();
	    return ret;
	};

	Promise.prototype._followee = function() {
	    return this._rejectionHandler0;
	};

	Promise.prototype._setFollowee = function(promise) {
	    this._rejectionHandler0 = promise;
	};

	Promise.prototype._settlePromise = function(promise, handler, receiver, value) {
	    var isPromise = promise instanceof Promise;
	    var bitField = this._bitField;
	    var asyncGuaranteed = ((bitField & 134217728) !== 0);
	    if (((bitField & 65536) !== 0)) {
	        if (isPromise) promise._invokeInternalOnCancel();

	        if (receiver instanceof PassThroughHandlerContext) {
	            receiver.cancelPromise = promise;
	            if (tryCatch(handler).call(receiver, value) === errorObj) {
	                promise._reject(errorObj.e);
	            }
	        } else if (handler === reflectHandler) {
	            promise._fulfill(reflectHandler.call(receiver));
	        } else if (receiver instanceof Proxyable) {
	            receiver._promiseCancelled(promise);
	        } else if (isPromise || promise instanceof PromiseArray) {
	            promise._cancel();
	        } else {
	            receiver.cancel();
	        }
	    } else if (typeof handler === "function") {
	        if (!isPromise) {
	            handler.call(receiver, value, promise);
	        } else {
	            if (asyncGuaranteed) promise._setAsyncGuaranteed();
	            this._settlePromiseFromHandler(handler, receiver, value, promise);
	        }
	    } else if (receiver instanceof Proxyable) {
	        if (!receiver._isResolved()) {
	            if (((bitField & 33554432) !== 0)) {
	                receiver._promiseFulfilled(value, promise);
	            } else {
	                receiver._promiseRejected(value, promise);
	            }
	        }
	    } else if (isPromise) {
	        if (asyncGuaranteed) promise._setAsyncGuaranteed();
	        if (((bitField & 33554432) !== 0)) {
	            promise._fulfill(value);
	        } else {
	            promise._reject(value);
	        }
	    }
	};

	Promise.prototype._settlePromiseLateCancellationObserver = function(ctx) {
	    var handler = ctx.handler;
	    var promise = ctx.promise;
	    var receiver = ctx.receiver;
	    var value = ctx.value;
	    if (typeof handler === "function") {
	        if (!(promise instanceof Promise)) {
	            handler.call(receiver, value, promise);
	        } else {
	            this._settlePromiseFromHandler(handler, receiver, value, promise);
	        }
	    } else if (promise instanceof Promise) {
	        promise._reject(value);
	    }
	};

	Promise.prototype._settlePromiseCtx = function(ctx) {
	    this._settlePromise(ctx.promise, ctx.handler, ctx.receiver, ctx.value);
	};

	Promise.prototype._settlePromise0 = function(handler, value, bitField) {
	    var promise = this._promise0;
	    var receiver = this._receiverAt(0);
	    this._promise0 = undefined;
	    this._receiver0 = undefined;
	    this._settlePromise(promise, handler, receiver, value);
	};

	Promise.prototype._clearCallbackDataAtIndex = function(index) {
	    var base = index * 4 - 4;
	    this[base + 2] =
	    this[base + 3] =
	    this[base + 0] =
	    this[base + 1] = undefined;
	};

	Promise.prototype._fulfill = function (value) {
	    var bitField = this._bitField;
	    if (((bitField & 117506048) >>> 16)) return;
	    if (value === this) {
	        var err = makeSelfResolutionError();
	        this._attachExtraTrace(err);
	        return this._reject(err);
	    }
	    this._setFulfilled();
	    this._rejectionHandler0 = value;

	    if ((bitField & 65535) > 0) {
	        if (((bitField & 134217728) !== 0)) {
	            this._settlePromises();
	        } else {
	            async.settlePromises(this);
	        }
	    }
	};

	Promise.prototype._reject = function (reason) {
	    var bitField = this._bitField;
	    if (((bitField & 117506048) >>> 16)) return;
	    this._setRejected();
	    this._fulfillmentHandler0 = reason;

	    if (this._isFinal()) {
	        return async.fatalError(reason, util.isNode);
	    }

	    if ((bitField & 65535) > 0) {
	        if (((bitField & 134217728) !== 0)) {
	            this._settlePromises();
	        } else {
	            async.settlePromises(this);
	        }
	    } else {
	        this._ensurePossibleRejectionHandled();
	    }
	};

	Promise.prototype._fulfillPromises = function (len, value) {
	    for (var i = 1; i < len; i++) {
	        var handler = this._fulfillmentHandlerAt(i);
	        var promise = this._promiseAt(i);
	        var receiver = this._receiverAt(i);
	        this._clearCallbackDataAtIndex(i);
	        this._settlePromise(promise, handler, receiver, value);
	    }
	};

	Promise.prototype._rejectPromises = function (len, reason) {
	    for (var i = 1; i < len; i++) {
	        var handler = this._rejectionHandlerAt(i);
	        var promise = this._promiseAt(i);
	        var receiver = this._receiverAt(i);
	        this._clearCallbackDataAtIndex(i);
	        this._settlePromise(promise, handler, receiver, reason);
	    }
	};

	Promise.prototype._settlePromises = function () {
	    var bitField = this._bitField;
	    var len = (bitField & 65535);

	    if (len > 0) {
	        if (((bitField & 16842752) !== 0)) {
	            var reason = this._fulfillmentHandler0;
	            this._settlePromise0(this._rejectionHandler0, reason, bitField);
	            this._rejectPromises(len, reason);
	        } else {
	            var value = this._rejectionHandler0;
	            this._settlePromise0(this._fulfillmentHandler0, value, bitField);
	            this._fulfillPromises(len, value);
	        }
	        this._setLength(0);
	    }
	    this._clearCancellationData();
	};

	Promise.prototype._settledValue = function() {
	    var bitField = this._bitField;
	    if (((bitField & 33554432) !== 0)) {
	        return this._rejectionHandler0;
	    } else if (((bitField & 16777216) !== 0)) {
	        return this._fulfillmentHandler0;
	    }
	};

	function deferResolve(v) {this.promise._resolveCallback(v);}
	function deferReject(v) {this.promise._rejectCallback(v, false);}

	Promise.defer = Promise.pending = function() {
	    debug.deprecated("Promise.defer", "new Promise");
	    var promise = new Promise(INTERNAL);
	    return {
	        promise: promise,
	        resolve: deferResolve,
	        reject: deferReject
	    };
	};

	util.notEnumerableProp(Promise,
	                       "_makeSelfResolutionError",
	                       makeSelfResolutionError);

	__webpack_require__(106)(Promise, INTERNAL, tryConvertToPromise, apiRejection,
	    debug);
	__webpack_require__(107)(Promise, INTERNAL, tryConvertToPromise, debug);
	__webpack_require__(108)(Promise, PromiseArray, apiRejection, debug);
	__webpack_require__(109)(Promise);
	__webpack_require__(110)(Promise);
	__webpack_require__(111)(
	    Promise, PromiseArray, tryConvertToPromise, INTERNAL, debug);
	Promise.Promise = Promise;
	__webpack_require__(112)(Promise, PromiseArray, apiRejection, tryConvertToPromise, INTERNAL, debug);
	__webpack_require__(113)(Promise, apiRejection, tryConvertToPromise, createContext, INTERNAL, debug);
	__webpack_require__(114)(Promise, INTERNAL, debug);
	__webpack_require__(115)(Promise, apiRejection, INTERNAL, tryConvertToPromise, Proxyable, debug);
	__webpack_require__(116)(Promise);
	__webpack_require__(117)(Promise);
	__webpack_require__(118)(Promise, PromiseArray, tryConvertToPromise, apiRejection);
	__webpack_require__(119)(Promise, INTERNAL, tryConvertToPromise, apiRejection);
	__webpack_require__(120)(Promise, PromiseArray, apiRejection, tryConvertToPromise, INTERNAL, debug);
	__webpack_require__(121)(Promise, PromiseArray, debug);
	__webpack_require__(122)(Promise, PromiseArray, apiRejection);
	__webpack_require__(123)(Promise, INTERNAL);
	__webpack_require__(124)(Promise);
	__webpack_require__(125)(Promise, INTERNAL);
	__webpack_require__(126)(Promise, INTERNAL);
	                                                         
	    util.toFastProperties(Promise);                                          
	    util.toFastProperties(Promise.prototype);                                
	    function fillTypes(value) {                                              
	        var p = new Promise(INTERNAL);                                       
	        p._fulfillmentHandler0 = value;                                      
	        p._rejectionHandler0 = value;                                        
	        p._promise0 = value;                                                 
	        p._receiver0 = value;                                                
	    }                                                                        
	    // Complete slack tracking, opt out of field-type tracking and           
	    // stabilize map                                                         
	    fillTypes({a: 1});                                                       
	    fillTypes({b: 2});                                                       
	    fillTypes({c: 3});                                                       
	    fillTypes(1);                                                            
	    fillTypes(function(){});                                                 
	    fillTypes(undefined);                                                    
	    fillTypes(false);                                                        
	    fillTypes(new Promise(INTERNAL));                                        
	    debug.setBounds(Async.firstLineError, util.lastLineError);               
	    return Promise;                                                          

	};


/***/ },
/* 93 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var es5 = __webpack_require__(94);
	var canEvaluate = typeof navigator == "undefined";

	var errorObj = {e: {}};
	var tryCatchTarget;
	function tryCatcher() {
	    try {
	        var target = tryCatchTarget;
	        tryCatchTarget = null;
	        return target.apply(this, arguments);
	    } catch (e) {
	        errorObj.e = e;
	        return errorObj;
	    }
	}
	function tryCatch(fn) {
	    tryCatchTarget = fn;
	    return tryCatcher;
	}

	var inherits = function(Child, Parent) {
	    var hasProp = {}.hasOwnProperty;

	    function T() {
	        this.constructor = Child;
	        this.constructor$ = Parent;
	        for (var propertyName in Parent.prototype) {
	            if (hasProp.call(Parent.prototype, propertyName) &&
	                propertyName.charAt(propertyName.length-1) !== "$"
	           ) {
	                this[propertyName + "$"] = Parent.prototype[propertyName];
	            }
	        }
	    }
	    T.prototype = Parent.prototype;
	    Child.prototype = new T();
	    return Child.prototype;
	};


	function isPrimitive(val) {
	    return val == null || val === true || val === false ||
	        typeof val === "string" || typeof val === "number";

	}

	function isObject(value) {
	    return typeof value === "function" ||
	           typeof value === "object" && value !== null;
	}

	function maybeWrapAsError(maybeError) {
	    if (!isPrimitive(maybeError)) return maybeError;

	    return new Error(safeToString(maybeError));
	}

	function withAppended(target, appendee) {
	    var len = target.length;
	    var ret = new Array(len + 1);
	    var i;
	    for (i = 0; i < len; ++i) {
	        ret[i] = target[i];
	    }
	    ret[i] = appendee;
	    return ret;
	}

	function getDataPropertyOrDefault(obj, key, defaultValue) {
	    if (es5.isES5) {
	        var desc = Object.getOwnPropertyDescriptor(obj, key);

	        if (desc != null) {
	            return desc.get == null && desc.set == null
	                    ? desc.value
	                    : defaultValue;
	        }
	    } else {
	        return {}.hasOwnProperty.call(obj, key) ? obj[key] : undefined;
	    }
	}

	function notEnumerableProp(obj, name, value) {
	    if (isPrimitive(obj)) return obj;
	    var descriptor = {
	        value: value,
	        configurable: true,
	        enumerable: false,
	        writable: true
	    };
	    es5.defineProperty(obj, name, descriptor);
	    return obj;
	}

	function thrower(r) {
	    throw r;
	}

	var inheritedDataKeys = (function() {
	    var excludedPrototypes = [
	        Array.prototype,
	        Object.prototype,
	        Function.prototype
	    ];

	    var isExcludedProto = function(val) {
	        for (var i = 0; i < excludedPrototypes.length; ++i) {
	            if (excludedPrototypes[i] === val) {
	                return true;
	            }
	        }
	        return false;
	    };

	    if (es5.isES5) {
	        var getKeys = Object.getOwnPropertyNames;
	        return function(obj) {
	            var ret = [];
	            var visitedKeys = Object.create(null);
	            while (obj != null && !isExcludedProto(obj)) {
	                var keys;
	                try {
	                    keys = getKeys(obj);
	                } catch (e) {
	                    return ret;
	                }
	                for (var i = 0; i < keys.length; ++i) {
	                    var key = keys[i];
	                    if (visitedKeys[key]) continue;
	                    visitedKeys[key] = true;
	                    var desc = Object.getOwnPropertyDescriptor(obj, key);
	                    if (desc != null && desc.get == null && desc.set == null) {
	                        ret.push(key);
	                    }
	                }
	                obj = es5.getPrototypeOf(obj);
	            }
	            return ret;
	        };
	    } else {
	        var hasProp = {}.hasOwnProperty;
	        return function(obj) {
	            if (isExcludedProto(obj)) return [];
	            var ret = [];

	            /*jshint forin:false */
	            enumeration: for (var key in obj) {
	                if (hasProp.call(obj, key)) {
	                    ret.push(key);
	                } else {
	                    for (var i = 0; i < excludedPrototypes.length; ++i) {
	                        if (hasProp.call(excludedPrototypes[i], key)) {
	                            continue enumeration;
	                        }
	                    }
	                    ret.push(key);
	                }
	            }
	            return ret;
	        };
	    }

	})();

	var thisAssignmentPattern = /this\s*\.\s*\S+\s*=/;
	function isClass(fn) {
	    try {
	        if (typeof fn === "function") {
	            var keys = es5.names(fn.prototype);

	            var hasMethods = es5.isES5 && keys.length > 1;
	            var hasMethodsOtherThanConstructor = keys.length > 0 &&
	                !(keys.length === 1 && keys[0] === "constructor");
	            var hasThisAssignmentAndStaticMethods =
	                thisAssignmentPattern.test(fn + "") && es5.names(fn).length > 0;

	            if (hasMethods || hasMethodsOtherThanConstructor ||
	                hasThisAssignmentAndStaticMethods) {
	                return true;
	            }
	        }
	        return false;
	    } catch (e) {
	        return false;
	    }
	}

	function toFastProperties(obj) {
	    /*jshint -W027,-W055,-W031*/
	    function FakeConstructor() {}
	    FakeConstructor.prototype = obj;
	    var l = 8;
	    while (l--) new FakeConstructor();
	    return obj;
	    eval(obj);
	}

	var rident = /^[a-z$_][a-z$_0-9]*$/i;
	function isIdentifier(str) {
	    return rident.test(str);
	}

	function filledRange(count, prefix, suffix) {
	    var ret = new Array(count);
	    for(var i = 0; i < count; ++i) {
	        ret[i] = prefix + i + suffix;
	    }
	    return ret;
	}

	function safeToString(obj) {
	    try {
	        return obj + "";
	    } catch (e) {
	        return "[no string representation]";
	    }
	}

	function markAsOriginatingFromRejection(e) {
	    try {
	        notEnumerableProp(e, "isOperational", true);
	    }
	    catch(ignore) {}
	}

	function originatesFromRejection(e) {
	    if (e == null) return false;
	    return ((e instanceof Error["__BluebirdErrorTypes__"].OperationalError) ||
	        e["isOperational"] === true);
	}

	function canAttachTrace(obj) {
	    return obj instanceof Error && es5.propertyIsWritable(obj, "stack");
	}

	var ensureErrorObject = (function() {
	    if (!("stack" in new Error())) {
	        return function(value) {
	            if (canAttachTrace(value)) return value;
	            try {throw new Error(safeToString(value));}
	            catch(err) {return err;}
	        };
	    } else {
	        return function(value) {
	            if (canAttachTrace(value)) return value;
	            return new Error(safeToString(value));
	        };
	    }
	})();

	function classString(obj) {
	    return {}.toString.call(obj);
	}

	function copyDescriptors(from, to, filter) {
	    var keys = es5.names(from);
	    for (var i = 0; i < keys.length; ++i) {
	        var key = keys[i];
	        if (filter(key)) {
	            try {
	                es5.defineProperty(to, key, es5.getDescriptor(from, key));
	            } catch (ignore) {}
	        }
	    }
	}

	var asArray = function(v) {
	    if (es5.isArray(v)) {
	        return v;
	    }
	    return null;
	};

	if (typeof Symbol !== "undefined" && Symbol.iterator) {
	    var ArrayFrom = typeof Array.from === "function" ? function(v) {
	        return Array.from(v);
	    } : function(v) {
	        var ret = [];
	        var it = v[Symbol.iterator]();
	        var itResult;
	        while (!((itResult = it.next()).done)) {
	            ret.push(itResult.value);
	        }
	        return ret;
	    };

	    asArray = function(v) {
	        if (es5.isArray(v)) {
	            return v;
	        } else if (v != null && typeof v[Symbol.iterator] === "function") {
	            return ArrayFrom(v);
	        }
	        return null;
	    };
	}

	var isNode = typeof process !== "undefined" &&
	        classString(process).toLowerCase() === "[object process]";

	function env(key, def) {
	    return isNode ? process.env[key] : def;
	}

	var ret = {
	    isClass: isClass,
	    isIdentifier: isIdentifier,
	    inheritedDataKeys: inheritedDataKeys,
	    getDataPropertyOrDefault: getDataPropertyOrDefault,
	    thrower: thrower,
	    isArray: es5.isArray,
	    asArray: asArray,
	    notEnumerableProp: notEnumerableProp,
	    isPrimitive: isPrimitive,
	    isObject: isObject,
	    canEvaluate: canEvaluate,
	    errorObj: errorObj,
	    tryCatch: tryCatch,
	    inherits: inherits,
	    withAppended: withAppended,
	    maybeWrapAsError: maybeWrapAsError,
	    toFastProperties: toFastProperties,
	    filledRange: filledRange,
	    toString: safeToString,
	    canAttachTrace: canAttachTrace,
	    ensureErrorObject: ensureErrorObject,
	    originatesFromRejection: originatesFromRejection,
	    markAsOriginatingFromRejection: markAsOriginatingFromRejection,
	    classString: classString,
	    copyDescriptors: copyDescriptors,
	    hasDevTools: typeof chrome !== "undefined" && chrome &&
	                 typeof chrome.loadTimes === "function",
	    isNode: isNode,
	    env: env
	};
	ret.isRecentNode = ret.isNode && (function() {
	    var version = process.versions.node.split(".").map(Number);
	    return (version[0] === 0 && version[1] > 10) || (version[0] > 0);
	})();

	if (ret.isNode) ret.toFastProperties(process);

	try {throw new Error(); } catch (e) {ret.lastLineError = e;}
	module.exports = ret;


/***/ },
/* 94 */
/***/ function(module, exports) {

	var isES5 = (function(){
	    "use strict";
	    return this === undefined;
	})();

	if (isES5) {
	    module.exports = {
	        freeze: Object.freeze,
	        defineProperty: Object.defineProperty,
	        getDescriptor: Object.getOwnPropertyDescriptor,
	        keys: Object.keys,
	        names: Object.getOwnPropertyNames,
	        getPrototypeOf: Object.getPrototypeOf,
	        isArray: Array.isArray,
	        isES5: isES5,
	        propertyIsWritable: function(obj, prop) {
	            var descriptor = Object.getOwnPropertyDescriptor(obj, prop);
	            return !!(!descriptor || descriptor.writable || descriptor.set);
	        }
	    };
	} else {
	    var has = {}.hasOwnProperty;
	    var str = {}.toString;
	    var proto = {}.constructor.prototype;

	    var ObjectKeys = function (o) {
	        var ret = [];
	        for (var key in o) {
	            if (has.call(o, key)) {
	                ret.push(key);
	            }
	        }
	        return ret;
	    };

	    var ObjectGetDescriptor = function(o, key) {
	        return {value: o[key]};
	    };

	    var ObjectDefineProperty = function (o, key, desc) {
	        o[key] = desc.value;
	        return o;
	    };

	    var ObjectFreeze = function (obj) {
	        return obj;
	    };

	    var ObjectGetPrototypeOf = function (obj) {
	        try {
	            return Object(obj).constructor.prototype;
	        }
	        catch (e) {
	            return proto;
	        }
	    };

	    var ArrayIsArray = function (obj) {
	        try {
	            return str.call(obj) === "[object Array]";
	        }
	        catch(e) {
	            return false;
	        }
	    };

	    module.exports = {
	        isArray: ArrayIsArray,
	        keys: ObjectKeys,
	        names: ObjectKeys,
	        defineProperty: ObjectDefineProperty,
	        getDescriptor: ObjectGetDescriptor,
	        freeze: ObjectFreeze,
	        getPrototypeOf: ObjectGetPrototypeOf,
	        isES5: isES5,
	        propertyIsWritable: function() {
	            return true;
	        }
	    };
	}


/***/ },
/* 95 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var firstLineError;
	try {throw new Error(); } catch (e) {firstLineError = e;}
	var schedule = __webpack_require__(96);
	var Queue = __webpack_require__(97);
	var util = __webpack_require__(93);

	function Async() {
	    this._isTickUsed = false;
	    this._lateQueue = new Queue(16);
	    this._normalQueue = new Queue(16);
	    this._haveDrainedQueues = false;
	    this._trampolineEnabled = true;
	    var self = this;
	    this.drainQueues = function () {
	        self._drainQueues();
	    };
	    this._schedule = schedule;
	}

	Async.prototype.enableTrampoline = function() {
	    this._trampolineEnabled = true;
	};

	Async.prototype.disableTrampolineIfNecessary = function() {
	    if (util.hasDevTools) {
	        this._trampolineEnabled = false;
	    }
	};

	Async.prototype.haveItemsQueued = function () {
	    return this._isTickUsed || this._haveDrainedQueues;
	};


	Async.prototype.fatalError = function(e, isNode) {
	    if (isNode) {
	        process.stderr.write("Fatal " + (e instanceof Error ? e.stack : e));
	        process.exit(2);
	    } else {
	        this.throwLater(e);
	    }
	};

	Async.prototype.throwLater = function(fn, arg) {
	    if (arguments.length === 1) {
	        arg = fn;
	        fn = function () { throw arg; };
	    }
	    if (typeof setTimeout !== "undefined") {
	        setTimeout(function() {
	            fn(arg);
	        }, 0);
	    } else try {
	        this._schedule(function() {
	            fn(arg);
	        });
	    } catch (e) {
	        throw new Error("No async scheduler available\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
	    }
	};

	function AsyncInvokeLater(fn, receiver, arg) {
	    this._lateQueue.push(fn, receiver, arg);
	    this._queueTick();
	}

	function AsyncInvoke(fn, receiver, arg) {
	    this._normalQueue.push(fn, receiver, arg);
	    this._queueTick();
	}

	function AsyncSettlePromises(promise) {
	    this._normalQueue._pushOne(promise);
	    this._queueTick();
	}

	if (!util.hasDevTools) {
	    Async.prototype.invokeLater = AsyncInvokeLater;
	    Async.prototype.invoke = AsyncInvoke;
	    Async.prototype.settlePromises = AsyncSettlePromises;
	} else {
	    Async.prototype.invokeLater = function (fn, receiver, arg) {
	        if (this._trampolineEnabled) {
	            AsyncInvokeLater.call(this, fn, receiver, arg);
	        } else {
	            this._schedule(function() {
	                setTimeout(function() {
	                    fn.call(receiver, arg);
	                }, 100);
	            });
	        }
	    };

	    Async.prototype.invoke = function (fn, receiver, arg) {
	        if (this._trampolineEnabled) {
	            AsyncInvoke.call(this, fn, receiver, arg);
	        } else {
	            this._schedule(function() {
	                fn.call(receiver, arg);
	            });
	        }
	    };

	    Async.prototype.settlePromises = function(promise) {
	        if (this._trampolineEnabled) {
	            AsyncSettlePromises.call(this, promise);
	        } else {
	            this._schedule(function() {
	                promise._settlePromises();
	            });
	        }
	    };
	}

	Async.prototype.invokeFirst = function (fn, receiver, arg) {
	    this._normalQueue.unshift(fn, receiver, arg);
	    this._queueTick();
	};

	Async.prototype._drainQueue = function(queue) {
	    while (queue.length() > 0) {
	        var fn = queue.shift();
	        if (typeof fn !== "function") {
	            fn._settlePromises();
	            continue;
	        }
	        var receiver = queue.shift();
	        var arg = queue.shift();
	        fn.call(receiver, arg);
	    }
	};

	Async.prototype._drainQueues = function () {
	    this._drainQueue(this._normalQueue);
	    this._reset();
	    this._haveDrainedQueues = true;
	    this._drainQueue(this._lateQueue);
	};

	Async.prototype._queueTick = function () {
	    if (!this._isTickUsed) {
	        this._isTickUsed = true;
	        this._schedule(this.drainQueues);
	    }
	};

	Async.prototype._reset = function () {
	    this._isTickUsed = false;
	};

	module.exports = Async;
	module.exports.firstLineError = firstLineError;


/***/ },
/* 96 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var util = __webpack_require__(93);
	var schedule;
	var noAsyncScheduler = function() {
	    throw new Error("No async scheduler available\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
	};
	if (util.isNode && typeof MutationObserver === "undefined") {
	    var GlobalSetImmediate = global.setImmediate;
	    var ProcessNextTick = process.nextTick;
	    schedule = util.isRecentNode
	                ? function(fn) { GlobalSetImmediate.call(global, fn); }
	                : function(fn) { ProcessNextTick.call(process, fn); };
	} else if ((typeof MutationObserver !== "undefined") &&
	          !(typeof window !== "undefined" &&
	            window.navigator &&
	            window.navigator.standalone)) {
	    schedule = (function() {
	        var div = document.createElement("div");
	        var opts = {attributes: true};
	        var toggleScheduled = false;
	        var div2 = document.createElement("div");
	        var o2 = new MutationObserver(function() {
	            div.classList.toggle("foo");
	          toggleScheduled = false;
	        });
	        o2.observe(div2, opts);

	        var scheduleToggle = function() {
	            if (toggleScheduled) return;
	          toggleScheduled = true;
	          div2.classList.toggle("foo");
	        };

	        return function schedule(fn) {
	          var o = new MutationObserver(function() {
	            o.disconnect();
	            fn();
	          });
	          o.observe(div, opts);
	          scheduleToggle();
	        };
	    })();
	} else if (typeof setImmediate !== "undefined") {
	    schedule = function (fn) {
	        setImmediate(fn);
	    };
	} else if (typeof setTimeout !== "undefined") {
	    schedule = function (fn) {
	        setTimeout(fn, 0);
	    };
	} else {
	    schedule = noAsyncScheduler;
	}
	module.exports = schedule;


/***/ },
/* 97 */
/***/ function(module, exports) {

	"use strict";
	function arrayMove(src, srcIndex, dst, dstIndex, len) {
	    for (var j = 0; j < len; ++j) {
	        dst[j + dstIndex] = src[j + srcIndex];
	        src[j + srcIndex] = void 0;
	    }
	}

	function Queue(capacity) {
	    this._capacity = capacity;
	    this._length = 0;
	    this._front = 0;
	}

	Queue.prototype._willBeOverCapacity = function (size) {
	    return this._capacity < size;
	};

	Queue.prototype._pushOne = function (arg) {
	    var length = this.length();
	    this._checkCapacity(length + 1);
	    var i = (this._front + length) & (this._capacity - 1);
	    this[i] = arg;
	    this._length = length + 1;
	};

	Queue.prototype._unshiftOne = function(value) {
	    var capacity = this._capacity;
	    this._checkCapacity(this.length() + 1);
	    var front = this._front;
	    var i = (((( front - 1 ) &
	                    ( capacity - 1) ) ^ capacity ) - capacity );
	    this[i] = value;
	    this._front = i;
	    this._length = this.length() + 1;
	};

	Queue.prototype.unshift = function(fn, receiver, arg) {
	    this._unshiftOne(arg);
	    this._unshiftOne(receiver);
	    this._unshiftOne(fn);
	};

	Queue.prototype.push = function (fn, receiver, arg) {
	    var length = this.length() + 3;
	    if (this._willBeOverCapacity(length)) {
	        this._pushOne(fn);
	        this._pushOne(receiver);
	        this._pushOne(arg);
	        return;
	    }
	    var j = this._front + length - 3;
	    this._checkCapacity(length);
	    var wrapMask = this._capacity - 1;
	    this[(j + 0) & wrapMask] = fn;
	    this[(j + 1) & wrapMask] = receiver;
	    this[(j + 2) & wrapMask] = arg;
	    this._length = length;
	};

	Queue.prototype.shift = function () {
	    var front = this._front,
	        ret = this[front];

	    this[front] = undefined;
	    this._front = (front + 1) & (this._capacity - 1);
	    this._length--;
	    return ret;
	};

	Queue.prototype.length = function () {
	    return this._length;
	};

	Queue.prototype._checkCapacity = function (size) {
	    if (this._capacity < size) {
	        this._resizeTo(this._capacity << 1);
	    }
	};

	Queue.prototype._resizeTo = function (capacity) {
	    var oldCapacity = this._capacity;
	    this._capacity = capacity;
	    var front = this._front;
	    var length = this._length;
	    var moveItemsCount = (front + length) & (oldCapacity - 1);
	    arrayMove(this, 0, this, oldCapacity, moveItemsCount);
	};

	module.exports = Queue;


/***/ },
/* 98 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var es5 = __webpack_require__(94);
	var Objectfreeze = es5.freeze;
	var util = __webpack_require__(93);
	var inherits = util.inherits;
	var notEnumerableProp = util.notEnumerableProp;

	function subError(nameProperty, defaultMessage) {
	    function SubError(message) {
	        if (!(this instanceof SubError)) return new SubError(message);
	        notEnumerableProp(this, "message",
	            typeof message === "string" ? message : defaultMessage);
	        notEnumerableProp(this, "name", nameProperty);
	        if (Error.captureStackTrace) {
	            Error.captureStackTrace(this, this.constructor);
	        } else {
	            Error.call(this);
	        }
	    }
	    inherits(SubError, Error);
	    return SubError;
	}

	var _TypeError, _RangeError;
	var Warning = subError("Warning", "warning");
	var CancellationError = subError("CancellationError", "cancellation error");
	var TimeoutError = subError("TimeoutError", "timeout error");
	var AggregateError = subError("AggregateError", "aggregate error");
	try {
	    _TypeError = TypeError;
	    _RangeError = RangeError;
	} catch(e) {
	    _TypeError = subError("TypeError", "type error");
	    _RangeError = subError("RangeError", "range error");
	}

	var methods = ("join pop push shift unshift slice filter forEach some " +
	    "every map indexOf lastIndexOf reduce reduceRight sort reverse").split(" ");

	for (var i = 0; i < methods.length; ++i) {
	    if (typeof Array.prototype[methods[i]] === "function") {
	        AggregateError.prototype[methods[i]] = Array.prototype[methods[i]];
	    }
	}

	es5.defineProperty(AggregateError.prototype, "length", {
	    value: 0,
	    configurable: false,
	    writable: true,
	    enumerable: true
	});
	AggregateError.prototype["isOperational"] = true;
	var level = 0;
	AggregateError.prototype.toString = function() {
	    var indent = Array(level * 4 + 1).join(" ");
	    var ret = "\n" + indent + "AggregateError of:" + "\n";
	    level++;
	    indent = Array(level * 4 + 1).join(" ");
	    for (var i = 0; i < this.length; ++i) {
	        var str = this[i] === this ? "[Circular AggregateError]" : this[i] + "";
	        var lines = str.split("\n");
	        for (var j = 0; j < lines.length; ++j) {
	            lines[j] = indent + lines[j];
	        }
	        str = lines.join("\n");
	        ret += str + "\n";
	    }
	    level--;
	    return ret;
	};

	function OperationalError(message) {
	    if (!(this instanceof OperationalError))
	        return new OperationalError(message);
	    notEnumerableProp(this, "name", "OperationalError");
	    notEnumerableProp(this, "message", message);
	    this.cause = message;
	    this["isOperational"] = true;

	    if (message instanceof Error) {
	        notEnumerableProp(this, "message", message.message);
	        notEnumerableProp(this, "stack", message.stack);
	    } else if (Error.captureStackTrace) {
	        Error.captureStackTrace(this, this.constructor);
	    }

	}
	inherits(OperationalError, Error);

	var errorTypes = Error["__BluebirdErrorTypes__"];
	if (!errorTypes) {
	    errorTypes = Objectfreeze({
	        CancellationError: CancellationError,
	        TimeoutError: TimeoutError,
	        OperationalError: OperationalError,
	        RejectionError: OperationalError,
	        AggregateError: AggregateError
	    });
	    notEnumerableProp(Error, "__BluebirdErrorTypes__", errorTypes);
	}

	module.exports = {
	    Error: Error,
	    TypeError: _TypeError,
	    RangeError: _RangeError,
	    CancellationError: errorTypes.CancellationError,
	    OperationalError: errorTypes.OperationalError,
	    TimeoutError: errorTypes.TimeoutError,
	    AggregateError: errorTypes.AggregateError,
	    Warning: Warning
	};


/***/ },
/* 99 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	module.exports = function(Promise, INTERNAL) {
	var util = __webpack_require__(93);
	var errorObj = util.errorObj;
	var isObject = util.isObject;

	function tryConvertToPromise(obj, context) {
	    if (isObject(obj)) {
	        if (obj instanceof Promise) return obj;
	        var then = getThen(obj);
	        if (then === errorObj) {
	            if (context) context._pushContext();
	            var ret = Promise.reject(then.e);
	            if (context) context._popContext();
	            return ret;
	        } else if (typeof then === "function") {
	            if (isAnyBluebirdPromise(obj)) {
	                var ret = new Promise(INTERNAL);
	                obj._then(
	                    ret._fulfill,
	                    ret._reject,
	                    undefined,
	                    ret,
	                    null
	                );
	                return ret;
	            }
	            return doThenable(obj, then, context);
	        }
	    }
	    return obj;
	}

	function doGetThen(obj) {
	    return obj.then;
	}

	function getThen(obj) {
	    try {
	        return doGetThen(obj);
	    } catch (e) {
	        errorObj.e = e;
	        return errorObj;
	    }
	}

	var hasProp = {}.hasOwnProperty;
	function isAnyBluebirdPromise(obj) {
	    return hasProp.call(obj, "_promise0");
	}

	function doThenable(x, then, context) {
	    var promise = new Promise(INTERNAL);
	    var ret = promise;
	    if (context) context._pushContext();
	    promise._captureStackTrace();
	    if (context) context._popContext();
	    var synchronous = true;
	    var result = util.tryCatch(then).call(x, resolve, reject);
	    synchronous = false;

	    if (promise && result === errorObj) {
	        promise._rejectCallback(result.e, true, true);
	        promise = null;
	    }

	    function resolve(value) {
	        if (!promise) return;
	        promise._resolveCallback(value);
	        promise = null;
	    }

	    function reject(reason) {
	        if (!promise) return;
	        promise._rejectCallback(reason, synchronous, true);
	        promise = null;
	    }
	    return ret;
	}

	return tryConvertToPromise;
	};


/***/ },
/* 100 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	module.exports = function(Promise, INTERNAL, tryConvertToPromise,
	    apiRejection, Proxyable) {
	var util = __webpack_require__(93);
	var isArray = util.isArray;

	function toResolutionValue(val) {
	    switch(val) {
	    case -2: return [];
	    case -3: return {};
	    }
	}

	function PromiseArray(values) {
	    var promise = this._promise = new Promise(INTERNAL);
	    if (values instanceof Promise) {
	        promise._propagateFrom(values, 3);
	    }
	    promise._setOnCancel(this);
	    this._values = values;
	    this._length = 0;
	    this._totalResolved = 0;
	    this._init(undefined, -2);
	}
	util.inherits(PromiseArray, Proxyable);

	PromiseArray.prototype.length = function () {
	    return this._length;
	};

	PromiseArray.prototype.promise = function () {
	    return this._promise;
	};

	PromiseArray.prototype._init = function init(_, resolveValueIfEmpty) {
	    var values = tryConvertToPromise(this._values, this._promise);
	    if (values instanceof Promise) {
	        values = values._target();
	        var bitField = values._bitField;
	        ;
	        this._values = values;

	        if (((bitField & 50397184) === 0)) {
	            this._promise._setAsyncGuaranteed();
	            return values._then(
	                init,
	                this._reject,
	                undefined,
	                this,
	                resolveValueIfEmpty
	           );
	        } else if (((bitField & 33554432) !== 0)) {
	            values = values._value();
	        } else if (((bitField & 16777216) !== 0)) {
	            return this._reject(values._reason());
	        } else {
	            return this._cancel();
	        }
	    }
	    values = util.asArray(values);
	    if (values === null) {
	        var err = apiRejection(
	            "expecting an array or an iterable object but got " + util.classString(values)).reason();
	        this._promise._rejectCallback(err, false);
	        return;
	    }

	    if (values.length === 0) {
	        if (resolveValueIfEmpty === -5) {
	            this._resolveEmptyArray();
	        }
	        else {
	            this._resolve(toResolutionValue(resolveValueIfEmpty));
	        }
	        return;
	    }
	    this._iterate(values);
	};

	PromiseArray.prototype._iterate = function(values) {
	    var len = this.getActualLength(values.length);
	    this._length = len;
	    this._values = this.shouldCopyValues() ? new Array(len) : this._values;
	    var result = this._promise;
	    var isResolved = false;
	    var bitField = null;
	    for (var i = 0; i < len; ++i) {
	        var maybePromise = tryConvertToPromise(values[i], result);

	        if (maybePromise instanceof Promise) {
	            maybePromise = maybePromise._target();
	            bitField = maybePromise._bitField;
	        } else {
	            bitField = null;
	        }

	        if (isResolved) {
	            if (bitField !== null) {
	                maybePromise.suppressUnhandledRejections();
	            }
	        } else if (bitField !== null) {
	            if (((bitField & 50397184) === 0)) {
	                maybePromise._proxy(this, i);
	                this._values[i] = maybePromise;
	            } else if (((bitField & 33554432) !== 0)) {
	                isResolved = this._promiseFulfilled(maybePromise._value(), i);
	            } else if (((bitField & 16777216) !== 0)) {
	                isResolved = this._promiseRejected(maybePromise._reason(), i);
	            } else {
	                isResolved = this._promiseCancelled(i);
	            }
	        } else {
	            isResolved = this._promiseFulfilled(maybePromise, i);
	        }
	    }
	    if (!isResolved) result._setAsyncGuaranteed();
	};

	PromiseArray.prototype._isResolved = function () {
	    return this._values === null;
	};

	PromiseArray.prototype._resolve = function (value) {
	    this._values = null;
	    this._promise._fulfill(value);
	};

	PromiseArray.prototype._cancel = function() {
	    if (this._isResolved() || !this._promise.isCancellable()) return;
	    this._values = null;
	    this._promise._cancel();
	};

	PromiseArray.prototype._reject = function (reason) {
	    this._values = null;
	    this._promise._rejectCallback(reason, false);
	};

	PromiseArray.prototype._promiseFulfilled = function (value, index) {
	    this._values[index] = value;
	    var totalResolved = ++this._totalResolved;
	    if (totalResolved >= this._length) {
	        this._resolve(this._values);
	        return true;
	    }
	    return false;
	};

	PromiseArray.prototype._promiseCancelled = function() {
	    this._cancel();
	    return true;
	};

	PromiseArray.prototype._promiseRejected = function (reason) {
	    this._totalResolved++;
	    this._reject(reason);
	    return true;
	};

	PromiseArray.prototype._resultCancelled = function() {
	    if (this._isResolved()) return;
	    var values = this._values;
	    this._cancel();
	    if (values instanceof Promise) {
	        values.cancel();
	    } else {
	        for (var i = 0; i < values.length; ++i) {
	            if (values[i] instanceof Promise) {
	                values[i].cancel();
	            }
	        }
	    }
	};

	PromiseArray.prototype.shouldCopyValues = function () {
	    return true;
	};

	PromiseArray.prototype.getActualLength = function (len) {
	    return len;
	};

	return PromiseArray;
	};


/***/ },
/* 101 */
/***/ function(module, exports) {

	"use strict";
	module.exports = function(Promise) {
	var longStackTraces = false;
	var contextStack = [];

	Promise.prototype._promiseCreated = function() {};
	Promise.prototype._pushContext = function() {};
	Promise.prototype._popContext = function() {return null;};
	Promise._peekContext = Promise.prototype._peekContext = function() {};

	function Context() {
	    this._trace = new Context.CapturedTrace(peekContext());
	}
	Context.prototype._pushContext = function () {
	    if (this._trace !== undefined) {
	        this._trace._promiseCreated = null;
	        contextStack.push(this._trace);
	    }
	};

	Context.prototype._popContext = function () {
	    if (this._trace !== undefined) {
	        var trace = contextStack.pop();
	        var ret = trace._promiseCreated;
	        trace._promiseCreated = null;
	        return ret;
	    }
	    return null;
	};

	function createContext() {
	    if (longStackTraces) return new Context();
	}

	function peekContext() {
	    var lastIndex = contextStack.length - 1;
	    if (lastIndex >= 0) {
	        return contextStack[lastIndex];
	    }
	    return undefined;
	}
	Context.CapturedTrace = null;
	Context.create = createContext;
	Context.deactivateLongStackTraces = function() {};
	Context.activateLongStackTraces = function() {
	    var Promise_pushContext = Promise.prototype._pushContext;
	    var Promise_popContext = Promise.prototype._popContext;
	    var Promise_PeekContext = Promise._peekContext;
	    var Promise_peekContext = Promise.prototype._peekContext;
	    var Promise_promiseCreated = Promise.prototype._promiseCreated;
	    Context.deactivateLongStackTraces = function() {
	        Promise.prototype._pushContext = Promise_pushContext;
	        Promise.prototype._popContext = Promise_popContext;
	        Promise._peekContext = Promise_PeekContext;
	        Promise.prototype._peekContext = Promise_peekContext;
	        Promise.prototype._promiseCreated = Promise_promiseCreated;
	        longStackTraces = false;
	    };
	    longStackTraces = true;
	    Promise.prototype._pushContext = Context.prototype._pushContext;
	    Promise.prototype._popContext = Context.prototype._popContext;
	    Promise._peekContext = Promise.prototype._peekContext = peekContext;
	    Promise.prototype._promiseCreated = function() {
	        var ctx = this._peekContext();
	        if (ctx && ctx._promiseCreated == null) ctx._promiseCreated = this;
	    };
	};
	return Context;
	};


/***/ },
/* 102 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	module.exports = function(Promise, Context) {
	var getDomain = Promise._getDomain;
	var async = Promise._async;
	var Warning = __webpack_require__(98).Warning;
	var util = __webpack_require__(93);
	var canAttachTrace = util.canAttachTrace;
	var unhandledRejectionHandled;
	var possiblyUnhandledRejection;
	var bluebirdFramePattern =
	    /[\\\/]bluebird[\\\/]js[\\\/](release|debug|instrumented)/;
	var stackFramePattern = null;
	var formatStack = null;
	var indentStackFrames = false;
	var printWarning;
	var debugging = !!(util.env("BLUEBIRD_DEBUG") != 0 &&
	                        (false ||
	                         util.env("BLUEBIRD_DEBUG") ||
	                         util.env("NODE_ENV") === "development"));

	var warnings = !!(util.env("BLUEBIRD_WARNINGS") != 0 &&
	    (debugging || util.env("BLUEBIRD_WARNINGS")));

	var longStackTraces = !!(util.env("BLUEBIRD_LONG_STACK_TRACES") != 0 &&
	    (debugging || util.env("BLUEBIRD_LONG_STACK_TRACES")));

	var wForgottenReturn = util.env("BLUEBIRD_W_FORGOTTEN_RETURN") != 0 &&
	    (warnings || !!util.env("BLUEBIRD_W_FORGOTTEN_RETURN"));

	Promise.prototype.suppressUnhandledRejections = function() {
	    var target = this._target();
	    target._bitField = ((target._bitField & (~1048576)) |
	                      524288);
	};

	Promise.prototype._ensurePossibleRejectionHandled = function () {
	    if ((this._bitField & 524288) !== 0) return;
	    this._setRejectionIsUnhandled();
	    async.invokeLater(this._notifyUnhandledRejection, this, undefined);
	};

	Promise.prototype._notifyUnhandledRejectionIsHandled = function () {
	    fireRejectionEvent("rejectionHandled",
	                                  unhandledRejectionHandled, undefined, this);
	};

	Promise.prototype._setReturnedNonUndefined = function() {
	    this._bitField = this._bitField | 268435456;
	};

	Promise.prototype._returnedNonUndefined = function() {
	    return (this._bitField & 268435456) !== 0;
	};

	Promise.prototype._notifyUnhandledRejection = function () {
	    if (this._isRejectionUnhandled()) {
	        var reason = this._settledValue();
	        this._setUnhandledRejectionIsNotified();
	        fireRejectionEvent("unhandledRejection",
	                                      possiblyUnhandledRejection, reason, this);
	    }
	};

	Promise.prototype._setUnhandledRejectionIsNotified = function () {
	    this._bitField = this._bitField | 262144;
	};

	Promise.prototype._unsetUnhandledRejectionIsNotified = function () {
	    this._bitField = this._bitField & (~262144);
	};

	Promise.prototype._isUnhandledRejectionNotified = function () {
	    return (this._bitField & 262144) > 0;
	};

	Promise.prototype._setRejectionIsUnhandled = function () {
	    this._bitField = this._bitField | 1048576;
	};

	Promise.prototype._unsetRejectionIsUnhandled = function () {
	    this._bitField = this._bitField & (~1048576);
	    if (this._isUnhandledRejectionNotified()) {
	        this._unsetUnhandledRejectionIsNotified();
	        this._notifyUnhandledRejectionIsHandled();
	    }
	};

	Promise.prototype._isRejectionUnhandled = function () {
	    return (this._bitField & 1048576) > 0;
	};

	Promise.prototype._warn = function(message, shouldUseOwnTrace, promise) {
	    return warn(message, shouldUseOwnTrace, promise || this);
	};

	Promise.onPossiblyUnhandledRejection = function (fn) {
	    var domain = getDomain();
	    possiblyUnhandledRejection =
	        typeof fn === "function" ? (domain === null ? fn : domain.bind(fn))
	                                 : undefined;
	};

	Promise.onUnhandledRejectionHandled = function (fn) {
	    var domain = getDomain();
	    unhandledRejectionHandled =
	        typeof fn === "function" ? (domain === null ? fn : domain.bind(fn))
	                                 : undefined;
	};

	var disableLongStackTraces = function() {};
	Promise.longStackTraces = function () {
	    if (async.haveItemsQueued() && !config.longStackTraces) {
	        throw new Error("cannot enable long stack traces after promises have been created\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
	    }
	    if (!config.longStackTraces && longStackTracesIsSupported()) {
	        var Promise_captureStackTrace = Promise.prototype._captureStackTrace;
	        var Promise_attachExtraTrace = Promise.prototype._attachExtraTrace;
	        config.longStackTraces = true;
	        disableLongStackTraces = function() {
	            if (async.haveItemsQueued() && !config.longStackTraces) {
	                throw new Error("cannot enable long stack traces after promises have been created\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
	            }
	            Promise.prototype._captureStackTrace = Promise_captureStackTrace;
	            Promise.prototype._attachExtraTrace = Promise_attachExtraTrace;
	            Context.deactivateLongStackTraces();
	            async.enableTrampoline();
	            config.longStackTraces = false;
	        };
	        Promise.prototype._captureStackTrace = longStackTracesCaptureStackTrace;
	        Promise.prototype._attachExtraTrace = longStackTracesAttachExtraTrace;
	        Context.activateLongStackTraces();
	        async.disableTrampolineIfNecessary();
	    }
	};

	Promise.hasLongStackTraces = function () {
	    return config.longStackTraces && longStackTracesIsSupported();
	};

	Promise.config = function(opts) {
	    opts = Object(opts);
	    if ("longStackTraces" in opts) {
	        if (opts.longStackTraces) {
	            Promise.longStackTraces();
	        } else if (!opts.longStackTraces && Promise.hasLongStackTraces()) {
	            disableLongStackTraces();
	        }
	    }
	    if ("warnings" in opts) {
	        var warningsOption = opts.warnings;
	        config.warnings = !!warningsOption;
	        wForgottenReturn = config.warnings;

	        if (util.isObject(warningsOption)) {
	            if ("wForgottenReturn" in warningsOption) {
	                wForgottenReturn = !!warningsOption.wForgottenReturn;
	            }
	        }
	    }
	    if ("cancellation" in opts && opts.cancellation && !config.cancellation) {
	        if (async.haveItemsQueued()) {
	            throw new Error(
	                "cannot enable cancellation after promises are in use");
	        }
	        Promise.prototype._clearCancellationData =
	            cancellationClearCancellationData;
	        Promise.prototype._propagateFrom = cancellationPropagateFrom;
	        Promise.prototype._onCancel = cancellationOnCancel;
	        Promise.prototype._setOnCancel = cancellationSetOnCancel;
	        Promise.prototype._attachCancellationCallback =
	            cancellationAttachCancellationCallback;
	        Promise.prototype._execute = cancellationExecute;
	        propagateFromFunction = cancellationPropagateFrom;
	        config.cancellation = true;
	    }
	};

	Promise.prototype._execute = function(executor, resolve, reject) {
	    try {
	        executor(resolve, reject);
	    } catch (e) {
	        return e;
	    }
	};
	Promise.prototype._onCancel = function () {};
	Promise.prototype._setOnCancel = function (handler) { ; };
	Promise.prototype._attachCancellationCallback = function(onCancel) {
	    ;
	};
	Promise.prototype._captureStackTrace = function () {};
	Promise.prototype._attachExtraTrace = function () {};
	Promise.prototype._clearCancellationData = function() {};
	Promise.prototype._propagateFrom = function (parent, flags) {
	    ;
	    ;
	};

	function cancellationExecute(executor, resolve, reject) {
	    var promise = this;
	    try {
	        executor(resolve, reject, function(onCancel) {
	            if (typeof onCancel !== "function") {
	                throw new TypeError("onCancel must be a function, got: " +
	                                    util.toString(onCancel));
	            }
	            promise._attachCancellationCallback(onCancel);
	        });
	    } catch (e) {
	        return e;
	    }
	}

	function cancellationAttachCancellationCallback(onCancel) {
	    if (!this.isCancellable()) return this;

	    var previousOnCancel = this._onCancel();
	    if (previousOnCancel !== undefined) {
	        if (util.isArray(previousOnCancel)) {
	            previousOnCancel.push(onCancel);
	        } else {
	            this._setOnCancel([previousOnCancel, onCancel]);
	        }
	    } else {
	        this._setOnCancel(onCancel);
	    }
	}

	function cancellationOnCancel() {
	    return this._onCancelField;
	}

	function cancellationSetOnCancel(onCancel) {
	    this._onCancelField = onCancel;
	}

	function cancellationClearCancellationData() {
	    this._cancellationParent = undefined;
	    this._onCancelField = undefined;
	}

	function cancellationPropagateFrom(parent, flags) {
	    if ((flags & 1) !== 0) {
	        this._cancellationParent = parent;
	        var branchesRemainingToCancel = parent._branchesRemainingToCancel;
	        if (branchesRemainingToCancel === undefined) {
	            branchesRemainingToCancel = 0;
	        }
	        parent._branchesRemainingToCancel = branchesRemainingToCancel + 1;
	    }
	    if ((flags & 2) !== 0 && parent._isBound()) {
	        this._setBoundTo(parent._boundTo);
	    }
	}

	function bindingPropagateFrom(parent, flags) {
	    if ((flags & 2) !== 0 && parent._isBound()) {
	        this._setBoundTo(parent._boundTo);
	    }
	}
	var propagateFromFunction = bindingPropagateFrom;

	function boundValueFunction() {
	    var ret = this._boundTo;
	    if (ret !== undefined) {
	        if (ret instanceof Promise) {
	            if (ret.isFulfilled()) {
	                return ret.value();
	            } else {
	                return undefined;
	            }
	        }
	    }
	    return ret;
	}

	function longStackTracesCaptureStackTrace() {
	    this._trace = new CapturedTrace(this._peekContext());
	}

	function longStackTracesAttachExtraTrace(error, ignoreSelf) {
	    if (canAttachTrace(error)) {
	        var trace = this._trace;
	        if (trace !== undefined) {
	            if (ignoreSelf) trace = trace._parent;
	        }
	        if (trace !== undefined) {
	            trace.attachExtraTrace(error);
	        } else if (!error.__stackCleaned__) {
	            var parsed = parseStackAndMessage(error);
	            util.notEnumerableProp(error, "stack",
	                parsed.message + "\n" + parsed.stack.join("\n"));
	            util.notEnumerableProp(error, "__stackCleaned__", true);
	        }
	    }
	}

	function checkForgottenReturns(returnValue, promiseCreated, name, promise,
	                               parent) {
	    if (returnValue === undefined && promiseCreated !== null &&
	        wForgottenReturn) {
	        if (parent !== undefined && parent._returnedNonUndefined()) return;

	        if (name) name = name + " ";
	        var msg = "a promise was created in a " + name +
	            "handler but was not returned from it";
	        promise._warn(msg, true, promiseCreated);
	    }
	}

	function deprecated(name, replacement) {
	    var message = name +
	        " is deprecated and will be removed in a future version.";
	    if (replacement) message += " Use " + replacement + " instead.";
	    return warn(message);
	}

	function warn(message, shouldUseOwnTrace, promise) {
	    if (!config.warnings) return;
	    var warning = new Warning(message);
	    var ctx;
	    if (shouldUseOwnTrace) {
	        promise._attachExtraTrace(warning);
	    } else if (config.longStackTraces && (ctx = Promise._peekContext())) {
	        ctx.attachExtraTrace(warning);
	    } else {
	        var parsed = parseStackAndMessage(warning);
	        warning.stack = parsed.message + "\n" + parsed.stack.join("\n");
	    }
	    formatAndLogError(warning, "", true);
	}

	function reconstructStack(message, stacks) {
	    for (var i = 0; i < stacks.length - 1; ++i) {
	        stacks[i].push("From previous event:");
	        stacks[i] = stacks[i].join("\n");
	    }
	    if (i < stacks.length) {
	        stacks[i] = stacks[i].join("\n");
	    }
	    return message + "\n" + stacks.join("\n");
	}

	function removeDuplicateOrEmptyJumps(stacks) {
	    for (var i = 0; i < stacks.length; ++i) {
	        if (stacks[i].length === 0 ||
	            ((i + 1 < stacks.length) && stacks[i][0] === stacks[i+1][0])) {
	            stacks.splice(i, 1);
	            i--;
	        }
	    }
	}

	function removeCommonRoots(stacks) {
	    var current = stacks[0];
	    for (var i = 1; i < stacks.length; ++i) {
	        var prev = stacks[i];
	        var currentLastIndex = current.length - 1;
	        var currentLastLine = current[currentLastIndex];
	        var commonRootMeetPoint = -1;

	        for (var j = prev.length - 1; j >= 0; --j) {
	            if (prev[j] === currentLastLine) {
	                commonRootMeetPoint = j;
	                break;
	            }
	        }

	        for (var j = commonRootMeetPoint; j >= 0; --j) {
	            var line = prev[j];
	            if (current[currentLastIndex] === line) {
	                current.pop();
	                currentLastIndex--;
	            } else {
	                break;
	            }
	        }
	        current = prev;
	    }
	}

	function cleanStack(stack) {
	    var ret = [];
	    for (var i = 0; i < stack.length; ++i) {
	        var line = stack[i];
	        var isTraceLine = "    (No stack trace)" === line ||
	            stackFramePattern.test(line);
	        var isInternalFrame = isTraceLine && shouldIgnore(line);
	        if (isTraceLine && !isInternalFrame) {
	            if (indentStackFrames && line.charAt(0) !== " ") {
	                line = "    " + line;
	            }
	            ret.push(line);
	        }
	    }
	    return ret;
	}

	function stackFramesAsArray(error) {
	    var stack = error.stack.replace(/\s+$/g, "").split("\n");
	    for (var i = 0; i < stack.length; ++i) {
	        var line = stack[i];
	        if ("    (No stack trace)" === line || stackFramePattern.test(line)) {
	            break;
	        }
	    }
	    if (i > 0) {
	        stack = stack.slice(i);
	    }
	    return stack;
	}

	function parseStackAndMessage(error) {
	    var stack = error.stack;
	    var message = error.toString();
	    stack = typeof stack === "string" && stack.length > 0
	                ? stackFramesAsArray(error) : ["    (No stack trace)"];
	    return {
	        message: message,
	        stack: cleanStack(stack)
	    };
	}

	function formatAndLogError(error, title, isSoft) {
	    if (typeof console !== "undefined") {
	        var message;
	        if (util.isObject(error)) {
	            var stack = error.stack;
	            message = title + formatStack(stack, error);
	        } else {
	            message = title + String(error);
	        }
	        if (typeof printWarning === "function") {
	            printWarning(message, isSoft);
	        } else if (typeof console.log === "function" ||
	            typeof console.log === "object") {
	            console.log(message);
	        }
	    }
	}

	function fireRejectionEvent(name, localHandler, reason, promise) {
	    var localEventFired = false;
	    try {
	        if (typeof localHandler === "function") {
	            localEventFired = true;
	            if (name === "rejectionHandled") {
	                localHandler(promise);
	            } else {
	                localHandler(reason, promise);
	            }
	        }
	    } catch (e) {
	        async.throwLater(e);
	    }

	    var globalEventFired = false;
	    try {
	        globalEventFired = fireGlobalEvent(name, reason, promise);
	    } catch (e) {
	        globalEventFired = true;
	        async.throwLater(e);
	    }

	    var domEventFired = false;
	    if (fireDomEvent) {
	        try {
	            domEventFired = fireDomEvent(name.toLowerCase(), {
	                reason: reason,
	                promise: promise
	            });
	        } catch (e) {
	            domEventFired = true;
	            async.throwLater(e);
	        }
	    }

	    if (!globalEventFired && !localEventFired && !domEventFired &&
	        name === "unhandledRejection") {
	        formatAndLogError(reason, "Unhandled rejection ");
	    }
	}

	function formatNonError(obj) {
	    var str;
	    if (typeof obj === "function") {
	        str = "[function " +
	            (obj.name || "anonymous") +
	            "]";
	    } else {
	        str = obj && typeof obj.toString === "function"
	            ? obj.toString() : util.toString(obj);
	        var ruselessToString = /\[object [a-zA-Z0-9$_]+\]/;
	        if (ruselessToString.test(str)) {
	            try {
	                var newStr = JSON.stringify(obj);
	                str = newStr;
	            }
	            catch(e) {

	            }
	        }
	        if (str.length === 0) {
	            str = "(empty array)";
	        }
	    }
	    return ("(<" + snip(str) + ">, no stack trace)");
	}

	function snip(str) {
	    var maxChars = 41;
	    if (str.length < maxChars) {
	        return str;
	    }
	    return str.substr(0, maxChars - 3) + "...";
	}

	function longStackTracesIsSupported() {
	    return typeof captureStackTrace === "function";
	}

	var shouldIgnore = function() { return false; };
	var parseLineInfoRegex = /[\/<\(]([^:\/]+):(\d+):(?:\d+)\)?\s*$/;
	function parseLineInfo(line) {
	    var matches = line.match(parseLineInfoRegex);
	    if (matches) {
	        return {
	            fileName: matches[1],
	            line: parseInt(matches[2], 10)
	        };
	    }
	}

	function setBounds(firstLineError, lastLineError) {
	    if (!longStackTracesIsSupported()) return;
	    var firstStackLines = firstLineError.stack.split("\n");
	    var lastStackLines = lastLineError.stack.split("\n");
	    var firstIndex = -1;
	    var lastIndex = -1;
	    var firstFileName;
	    var lastFileName;
	    for (var i = 0; i < firstStackLines.length; ++i) {
	        var result = parseLineInfo(firstStackLines[i]);
	        if (result) {
	            firstFileName = result.fileName;
	            firstIndex = result.line;
	            break;
	        }
	    }
	    for (var i = 0; i < lastStackLines.length; ++i) {
	        var result = parseLineInfo(lastStackLines[i]);
	        if (result) {
	            lastFileName = result.fileName;
	            lastIndex = result.line;
	            break;
	        }
	    }
	    if (firstIndex < 0 || lastIndex < 0 || !firstFileName || !lastFileName ||
	        firstFileName !== lastFileName || firstIndex >= lastIndex) {
	        return;
	    }

	    shouldIgnore = function(line) {
	        if (bluebirdFramePattern.test(line)) return true;
	        var info = parseLineInfo(line);
	        if (info) {
	            if (info.fileName === firstFileName &&
	                (firstIndex <= info.line && info.line <= lastIndex)) {
	                return true;
	            }
	        }
	        return false;
	    };
	}

	function CapturedTrace(parent) {
	    this._parent = parent;
	    this._promisesCreated = 0;
	    var length = this._length = 1 + (parent === undefined ? 0 : parent._length);
	    captureStackTrace(this, CapturedTrace);
	    if (length > 32) this.uncycle();
	}
	util.inherits(CapturedTrace, Error);
	Context.CapturedTrace = CapturedTrace;

	CapturedTrace.prototype.uncycle = function() {
	    var length = this._length;
	    if (length < 2) return;
	    var nodes = [];
	    var stackToIndex = {};

	    for (var i = 0, node = this; node !== undefined; ++i) {
	        nodes.push(node);
	        node = node._parent;
	    }
	    length = this._length = i;
	    for (var i = length - 1; i >= 0; --i) {
	        var stack = nodes[i].stack;
	        if (stackToIndex[stack] === undefined) {
	            stackToIndex[stack] = i;
	        }
	    }
	    for (var i = 0; i < length; ++i) {
	        var currentStack = nodes[i].stack;
	        var index = stackToIndex[currentStack];
	        if (index !== undefined && index !== i) {
	            if (index > 0) {
	                nodes[index - 1]._parent = undefined;
	                nodes[index - 1]._length = 1;
	            }
	            nodes[i]._parent = undefined;
	            nodes[i]._length = 1;
	            var cycleEdgeNode = i > 0 ? nodes[i - 1] : this;

	            if (index < length - 1) {
	                cycleEdgeNode._parent = nodes[index + 1];
	                cycleEdgeNode._parent.uncycle();
	                cycleEdgeNode._length =
	                    cycleEdgeNode._parent._length + 1;
	            } else {
	                cycleEdgeNode._parent = undefined;
	                cycleEdgeNode._length = 1;
	            }
	            var currentChildLength = cycleEdgeNode._length + 1;
	            for (var j = i - 2; j >= 0; --j) {
	                nodes[j]._length = currentChildLength;
	                currentChildLength++;
	            }
	            return;
	        }
	    }
	};

	CapturedTrace.prototype.attachExtraTrace = function(error) {
	    if (error.__stackCleaned__) return;
	    this.uncycle();
	    var parsed = parseStackAndMessage(error);
	    var message = parsed.message;
	    var stacks = [parsed.stack];

	    var trace = this;
	    while (trace !== undefined) {
	        stacks.push(cleanStack(trace.stack.split("\n")));
	        trace = trace._parent;
	    }
	    removeCommonRoots(stacks);
	    removeDuplicateOrEmptyJumps(stacks);
	    util.notEnumerableProp(error, "stack", reconstructStack(message, stacks));
	    util.notEnumerableProp(error, "__stackCleaned__", true);
	};

	var captureStackTrace = (function stackDetection() {
	    var v8stackFramePattern = /^\s*at\s*/;
	    var v8stackFormatter = function(stack, error) {
	        if (typeof stack === "string") return stack;

	        if (error.name !== undefined &&
	            error.message !== undefined) {
	            return error.toString();
	        }
	        return formatNonError(error);
	    };

	    if (typeof Error.stackTraceLimit === "number" &&
	        typeof Error.captureStackTrace === "function") {
	        Error.stackTraceLimit += 6;
	        stackFramePattern = v8stackFramePattern;
	        formatStack = v8stackFormatter;
	        var captureStackTrace = Error.captureStackTrace;

	        shouldIgnore = function(line) {
	            return bluebirdFramePattern.test(line);
	        };
	        return function(receiver, ignoreUntil) {
	            Error.stackTraceLimit += 6;
	            captureStackTrace(receiver, ignoreUntil);
	            Error.stackTraceLimit -= 6;
	        };
	    }
	    var err = new Error();

	    if (typeof err.stack === "string" &&
	        err.stack.split("\n")[0].indexOf("stackDetection@") >= 0) {
	        stackFramePattern = /@/;
	        formatStack = v8stackFormatter;
	        indentStackFrames = true;
	        return function captureStackTrace(o) {
	            o.stack = new Error().stack;
	        };
	    }

	    var hasStackAfterThrow;
	    try { throw new Error(); }
	    catch(e) {
	        hasStackAfterThrow = ("stack" in e);
	    }
	    if (!("stack" in err) && hasStackAfterThrow &&
	        typeof Error.stackTraceLimit === "number") {
	        stackFramePattern = v8stackFramePattern;
	        formatStack = v8stackFormatter;
	        return function captureStackTrace(o) {
	            Error.stackTraceLimit += 6;
	            try { throw new Error(); }
	            catch(e) { o.stack = e.stack; }
	            Error.stackTraceLimit -= 6;
	        };
	    }

	    formatStack = function(stack, error) {
	        if (typeof stack === "string") return stack;

	        if ((typeof error === "object" ||
	            typeof error === "function") &&
	            error.name !== undefined &&
	            error.message !== undefined) {
	            return error.toString();
	        }
	        return formatNonError(error);
	    };

	    return null;

	})([]);

	var fireDomEvent;
	var fireGlobalEvent = (function() {
	    if (util.isNode) {
	        return function(name, reason, promise) {
	            if (name === "rejectionHandled") {
	                return process.emit(name, promise);
	            } else {
	                return process.emit(name, reason, promise);
	            }
	        };
	    } else {
	        var globalObject = typeof self !== "undefined" ? self :
	                     typeof window !== "undefined" ? window :
	                     typeof global !== "undefined" ? global :
	                     this !== undefined ? this : null;

	        if (!globalObject) {
	            return function() {
	                return false;
	            };
	        }

	        try {
	            var event = document.createEvent("CustomEvent");
	            event.initCustomEvent("testingtheevent", false, true, {});
	            globalObject.dispatchEvent(event);
	            fireDomEvent = function(type, detail) {
	                var event = document.createEvent("CustomEvent");
	                event.initCustomEvent(type, false, true, detail);
	                return !globalObject.dispatchEvent(event);
	            };
	        } catch (e) {}

	        var toWindowMethodNameMap = {};
	        toWindowMethodNameMap["unhandledRejection"] = ("on" +
	            "unhandledRejection").toLowerCase();
	        toWindowMethodNameMap["rejectionHandled"] = ("on" +
	            "rejectionHandled").toLowerCase();

	        return function(name, reason, promise) {
	            var methodName = toWindowMethodNameMap[name];
	            var method = globalObject[methodName];
	            if (!method) return false;
	            if (name === "rejectionHandled") {
	                method.call(globalObject, promise);
	            } else {
	                method.call(globalObject, reason, promise);
	            }
	            return true;
	        };
	    }
	})();

	if (typeof console !== "undefined" && typeof console.warn !== "undefined") {
	    printWarning = function (message) {
	        console.warn(message);
	    };
	    if (util.isNode && process.stderr.isTTY) {
	        printWarning = function(message, isSoft) {
	            var color = isSoft ? "\u001b[33m" : "\u001b[31m";
	            console.warn(color + message + "\u001b[0m\n");
	        };
	    } else if (!util.isNode && typeof (new Error().stack) === "string") {
	        printWarning = function(message, isSoft) {
	            console.warn("%c" + message,
	                        isSoft ? "color: darkorange" : "color: red");
	        };
	    }
	}

	var config = {
	    warnings: warnings,
	    longStackTraces: false,
	    cancellation: false
	};

	if (longStackTraces) Promise.longStackTraces();

	return {
	    longStackTraces: function() {
	        return config.longStackTraces;
	    },
	    warnings: function() {
	        return config.warnings;
	    },
	    cancellation: function() {
	        return config.cancellation;
	    },
	    propagateFromFunction: function() {
	        return propagateFromFunction;
	    },
	    boundValueFunction: function() {
	        return boundValueFunction;
	    },
	    checkForgottenReturns: checkForgottenReturns,
	    setBounds: setBounds,
	    warn: warn,
	    deprecated: deprecated,
	    CapturedTrace: CapturedTrace
	};
	};


/***/ },
/* 103 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	module.exports = function(Promise, tryConvertToPromise) {
	var util = __webpack_require__(93);
	var CancellationError = Promise.CancellationError;
	var errorObj = util.errorObj;

	function PassThroughHandlerContext(promise, type, handler) {
	    this.promise = promise;
	    this.type = type;
	    this.handler = handler;
	    this.called = false;
	    this.cancelPromise = null;
	}

	function FinallyHandlerCancelReaction(finallyHandler) {
	    this.finallyHandler = finallyHandler;
	}

	FinallyHandlerCancelReaction.prototype._resultCancelled = function() {
	    checkCancel(this.finallyHandler);
	};

	function checkCancel(ctx, reason) {
	    if (ctx.cancelPromise != null) {
	        if (arguments.length > 1) {
	            ctx.cancelPromise._reject(reason);
	        } else {
	            ctx.cancelPromise._cancel();
	        }
	        ctx.cancelPromise = null;
	        return true;
	    }
	    return false;
	}

	function succeed() {
	    return finallyHandler.call(this, this.promise._target()._settledValue());
	}
	function fail(reason) {
	    if (checkCancel(this, reason)) return;
	    errorObj.e = reason;
	    return errorObj;
	}
	function finallyHandler(reasonOrValue) {
	    var promise = this.promise;
	    var handler = this.handler;

	    if (!this.called) {
	        this.called = true;
	        var ret = this.type === 0
	            ? handler.call(promise._boundValue())
	            : handler.call(promise._boundValue(), reasonOrValue);
	        if (ret !== undefined) {
	            promise._setReturnedNonUndefined();
	            var maybePromise = tryConvertToPromise(ret, promise);
	            if (maybePromise instanceof Promise) {
	                if (this.cancelPromise != null) {
	                    if (maybePromise.isCancelled()) {
	                        var reason =
	                            new CancellationError("late cancellation observer");
	                        promise._attachExtraTrace(reason);
	                        errorObj.e = reason;
	                        return errorObj;
	                    } else if (maybePromise.isPending()) {
	                        maybePromise._attachCancellationCallback(
	                            new FinallyHandlerCancelReaction(this));
	                    }
	                }
	                return maybePromise._then(
	                    succeed, fail, undefined, this, undefined);
	            }
	        }
	    }

	    if (promise.isRejected()) {
	        checkCancel(this);
	        errorObj.e = reasonOrValue;
	        return errorObj;
	    } else {
	        checkCancel(this);
	        return reasonOrValue;
	    }
	}

	Promise.prototype._passThrough = function(handler, type, success, fail) {
	    if (typeof handler !== "function") return this.then();
	    return this._then(success,
	                      fail,
	                      undefined,
	                      new PassThroughHandlerContext(this, type, handler),
	                      undefined);
	};

	Promise.prototype.lastly =
	Promise.prototype["finally"] = function (handler) {
	    return this._passThrough(handler,
	                             0,
	                             finallyHandler,
	                             finallyHandler);
	};

	Promise.prototype.tap = function (handler) {
	    return this._passThrough(handler, 1, finallyHandler);
	};

	return PassThroughHandlerContext;
	};


/***/ },
/* 104 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	module.exports = function(NEXT_FILTER) {
	var util = __webpack_require__(93);
	var getKeys = __webpack_require__(94).keys;
	var tryCatch = util.tryCatch;
	var errorObj = util.errorObj;

	function catchFilter(instances, cb, promise) {
	    return function(e) {
	        var boundTo = promise._boundValue();
	        predicateLoop: for (var i = 0; i < instances.length; ++i) {
	            var item = instances[i];

	            if (item === Error ||
	                (item != null && item.prototype instanceof Error)) {
	                if (e instanceof item) {
	                    return tryCatch(cb).call(boundTo, e);
	                }
	            } else if (typeof item === "function") {
	                var matchesPredicate = tryCatch(item).call(boundTo, e);
	                if (matchesPredicate === errorObj) {
	                    return matchesPredicate;
	                } else if (matchesPredicate) {
	                    return tryCatch(cb).call(boundTo, e);
	                }
	            } else if (util.isObject(e)) {
	                var keys = getKeys(item);
	                for (var j = 0; j < keys.length; ++j) {
	                    var key = keys[j];
	                    if (item[key] != e[key]) {
	                        continue predicateLoop;
	                    }
	                }
	                return tryCatch(cb).call(boundTo, e);
	            }
	        }
	        return NEXT_FILTER;
	    };
	}

	return catchFilter;
	};


/***/ },
/* 105 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var util = __webpack_require__(93);
	var maybeWrapAsError = util.maybeWrapAsError;
	var errors = __webpack_require__(98);
	var OperationalError = errors.OperationalError;
	var es5 = __webpack_require__(94);

	function isUntypedError(obj) {
	    return obj instanceof Error &&
	        es5.getPrototypeOf(obj) === Error.prototype;
	}

	var rErrorKey = /^(?:name|message|stack|cause)$/;
	function wrapAsOperationalError(obj) {
	    var ret;
	    if (isUntypedError(obj)) {
	        ret = new OperationalError(obj);
	        ret.name = obj.name;
	        ret.message = obj.message;
	        ret.stack = obj.stack;
	        var keys = es5.keys(obj);
	        for (var i = 0; i < keys.length; ++i) {
	            var key = keys[i];
	            if (!rErrorKey.test(key)) {
	                ret[key] = obj[key];
	            }
	        }
	        return ret;
	    }
	    util.markAsOriginatingFromRejection(obj);
	    return obj;
	}

	function nodebackForPromise(promise, multiArgs) {
	    return function(err, value) {
	        if (promise === null) return;
	        if (err) {
	            var wrapped = wrapAsOperationalError(maybeWrapAsError(err));
	            promise._attachExtraTrace(wrapped);
	            promise._reject(wrapped);
	        } else if (!multiArgs) {
	            promise._fulfill(value);
	        } else {
	            var $_len = arguments.length;var args = new Array($_len - 1); for(var $_i = 1; $_i < $_len; ++$_i) {args[$_i - 1] = arguments[$_i];};
	            promise._fulfill(args);
	        }
	        promise = null;
	    };
	}

	module.exports = nodebackForPromise;


/***/ },
/* 106 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	module.exports =
	function(Promise, INTERNAL, tryConvertToPromise, apiRejection, debug) {
	var util = __webpack_require__(93);
	var tryCatch = util.tryCatch;

	Promise.method = function (fn) {
	    if (typeof fn !== "function") {
	        throw new Promise.TypeError("expecting a function but got " + util.classString(fn));
	    }
	    return function () {
	        var ret = new Promise(INTERNAL);
	        ret._captureStackTrace();
	        ret._pushContext();
	        var value = tryCatch(fn).apply(this, arguments);
	        var promiseCreated = ret._popContext();
	        debug.checkForgottenReturns(
	            value, promiseCreated, "Promise.method", ret);
	        ret._resolveFromSyncValue(value);
	        return ret;
	    };
	};

	Promise.attempt = Promise["try"] = function (fn) {
	    if (typeof fn !== "function") {
	        return apiRejection("expecting a function but got " + util.classString(fn));
	    }
	    var ret = new Promise(INTERNAL);
	    ret._captureStackTrace();
	    ret._pushContext();
	    var value;
	    if (arguments.length > 1) {
	        debug.deprecated("calling Promise.try with more than 1 argument");
	        var arg = arguments[1];
	        var ctx = arguments[2];
	        value = util.isArray(arg) ? tryCatch(fn).apply(ctx, arg)
	                                  : tryCatch(fn).call(ctx, arg);
	    } else {
	        value = tryCatch(fn)();
	    }
	    var promiseCreated = ret._popContext();
	    debug.checkForgottenReturns(
	        value, promiseCreated, "Promise.try", ret);
	    ret._resolveFromSyncValue(value);
	    return ret;
	};

	Promise.prototype._resolveFromSyncValue = function (value) {
	    if (value === util.errorObj) {
	        this._rejectCallback(value.e, false);
	    } else {
	        this._resolveCallback(value, true);
	    }
	};
	};


/***/ },
/* 107 */
/***/ function(module, exports) {

	"use strict";
	module.exports = function(Promise, INTERNAL, tryConvertToPromise, debug) {
	var calledBind = false;
	var rejectThis = function(_, e) {
	    this._reject(e);
	};

	var targetRejected = function(e, context) {
	    context.promiseRejectionQueued = true;
	    context.bindingPromise._then(rejectThis, rejectThis, null, this, e);
	};

	var bindingResolved = function(thisArg, context) {
	    if (((this._bitField & 50397184) === 0)) {
	        this._resolveCallback(context.target);
	    }
	};

	var bindingRejected = function(e, context) {
	    if (!context.promiseRejectionQueued) this._reject(e);
	};

	Promise.prototype.bind = function (thisArg) {
	    if (!calledBind) {
	        calledBind = true;
	        Promise.prototype._propagateFrom = debug.propagateFromFunction();
	        Promise.prototype._boundValue = debug.boundValueFunction();
	    }
	    var maybePromise = tryConvertToPromise(thisArg);
	    var ret = new Promise(INTERNAL);
	    ret._propagateFrom(this, 1);
	    var target = this._target();
	    ret._setBoundTo(maybePromise);
	    if (maybePromise instanceof Promise) {
	        var context = {
	            promiseRejectionQueued: false,
	            promise: ret,
	            target: target,
	            bindingPromise: maybePromise
	        };
	        target._then(INTERNAL, targetRejected, undefined, ret, context);
	        maybePromise._then(
	            bindingResolved, bindingRejected, undefined, ret, context);
	        ret._setOnCancel(maybePromise);
	    } else {
	        ret._resolveCallback(target);
	    }
	    return ret;
	};

	Promise.prototype._setBoundTo = function (obj) {
	    if (obj !== undefined) {
	        this._bitField = this._bitField | 2097152;
	        this._boundTo = obj;
	    } else {
	        this._bitField = this._bitField & (~2097152);
	    }
	};

	Promise.prototype._isBound = function () {
	    return (this._bitField & 2097152) === 2097152;
	};

	Promise.bind = function (thisArg, value) {
	    return Promise.resolve(value).bind(thisArg);
	};
	};


/***/ },
/* 108 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	module.exports = function(Promise, PromiseArray, apiRejection, debug) {
	var util = __webpack_require__(93);
	var tryCatch = util.tryCatch;
	var errorObj = util.errorObj;
	var async = Promise._async;

	Promise.prototype["break"] = Promise.prototype.cancel = function() {
	    if (!debug.cancellation()) return this._warn("cancellation is disabled");

	    var promise = this;
	    var child = promise;
	    while (promise.isCancellable()) {
	        if (!promise._cancelBy(child)) {
	            if (child._isFollowing()) {
	                child._followee().cancel();
	            } else {
	                child._cancelBranched();
	            }
	            break;
	        }

	        var parent = promise._cancellationParent;
	        if (parent == null || !parent.isCancellable()) {
	            if (promise._isFollowing()) {
	                promise._followee().cancel();
	            } else {
	                promise._cancelBranched();
	            }
	            break;
	        } else {
	            if (promise._isFollowing()) promise._followee().cancel();
	            child = promise;
	            promise = parent;
	        }
	    }
	};

	Promise.prototype._branchHasCancelled = function() {
	    this._branchesRemainingToCancel--;
	};

	Promise.prototype._enoughBranchesHaveCancelled = function() {
	    return this._branchesRemainingToCancel === undefined ||
	           this._branchesRemainingToCancel <= 0;
	};

	Promise.prototype._cancelBy = function(canceller) {
	    if (canceller === this) {
	        this._branchesRemainingToCancel = 0;
	        this._invokeOnCancel();
	        return true;
	    } else {
	        this._branchHasCancelled();
	        if (this._enoughBranchesHaveCancelled()) {
	            this._invokeOnCancel();
	            return true;
	        }
	    }
	    return false;
	};

	Promise.prototype._cancelBranched = function() {
	    if (this._enoughBranchesHaveCancelled()) {
	        this._cancel();
	    }
	};

	Promise.prototype._cancel = function() {
	    if (!this.isCancellable()) return;

	    this._setCancelled();
	    async.invoke(this._cancelPromises, this, undefined);
	};

	Promise.prototype._cancelPromises = function() {
	    if (this._length() > 0) this._settlePromises();
	};

	Promise.prototype._unsetOnCancel = function() {
	    this._onCancelField = undefined;
	};

	Promise.prototype.isCancellable = function() {
	    return this.isPending() && !this.isCancelled();
	};

	Promise.prototype._doInvokeOnCancel = function(onCancelCallback, internalOnly) {
	    if (util.isArray(onCancelCallback)) {
	        for (var i = 0; i < onCancelCallback.length; ++i) {
	            this._doInvokeOnCancel(onCancelCallback[i], internalOnly);
	        }
	    } else if (onCancelCallback !== undefined) {
	        if (typeof onCancelCallback === "function") {
	            if (!internalOnly) {
	                var e = tryCatch(onCancelCallback).call(this._boundValue());
	                if (e === errorObj) {
	                    this._attachExtraTrace(e.e);
	                    async.throwLater(e.e);
	                }
	            }
	        } else {
	            onCancelCallback._resultCancelled(this);
	        }
	    }
	};

	Promise.prototype._invokeOnCancel = function() {
	    var onCancelCallback = this._onCancel();
	    this._unsetOnCancel();
	    async.invoke(this._doInvokeOnCancel, this, onCancelCallback);
	};

	Promise.prototype._invokeInternalOnCancel = function() {
	    if (this.isCancellable()) {
	        this._doInvokeOnCancel(this._onCancel(), true);
	        this._unsetOnCancel();
	    }
	};

	Promise.prototype._resultCancelled = function() {
	    this.cancel();
	};

	};


/***/ },
/* 109 */
/***/ function(module, exports) {

	"use strict";
	module.exports = function(Promise) {
	function returner() {
	    return this.value;
	}
	function thrower() {
	    throw this.reason;
	}

	Promise.prototype["return"] =
	Promise.prototype.thenReturn = function (value) {
	    if (value instanceof Promise) value.suppressUnhandledRejections();
	    return this._then(
	        returner, undefined, undefined, {value: value}, undefined);
	};

	Promise.prototype["throw"] =
	Promise.prototype.thenThrow = function (reason) {
	    return this._then(
	        thrower, undefined, undefined, {reason: reason}, undefined);
	};

	Promise.prototype.catchThrow = function (reason) {
	    if (arguments.length <= 1) {
	        return this._then(
	            undefined, thrower, undefined, {reason: reason}, undefined);
	    } else {
	        var _reason = arguments[1];
	        var handler = function() {throw _reason;};
	        return this.caught(reason, handler);
	    }
	};

	Promise.prototype.catchReturn = function (value) {
	    if (arguments.length <= 1) {
	        if (value instanceof Promise) value.suppressUnhandledRejections();
	        return this._then(
	            undefined, returner, undefined, {value: value}, undefined);
	    } else {
	        var _value = arguments[1];
	        if (_value instanceof Promise) _value.suppressUnhandledRejections();
	        var handler = function() {return _value;};
	        return this.caught(value, handler);
	    }
	};
	};


/***/ },
/* 110 */
/***/ function(module, exports) {

	"use strict";
	module.exports = function(Promise) {
	function PromiseInspection(promise) {
	    if (promise !== undefined) {
	        promise = promise._target();
	        this._bitField = promise._bitField;
	        this._settledValueField = promise._isFateSealed()
	            ? promise._settledValue() : undefined;
	    }
	    else {
	        this._bitField = 0;
	        this._settledValueField = undefined;
	    }
	}

	PromiseInspection.prototype._settledValue = function() {
	    return this._settledValueField;
	};

	var value = PromiseInspection.prototype.value = function () {
	    if (!this.isFulfilled()) {
	        throw new TypeError("cannot get fulfillment value of a non-fulfilled promise\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
	    }
	    return this._settledValue();
	};

	var reason = PromiseInspection.prototype.error =
	PromiseInspection.prototype.reason = function () {
	    if (!this.isRejected()) {
	        throw new TypeError("cannot get rejection reason of a non-rejected promise\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
	    }
	    return this._settledValue();
	};

	var isFulfilled = PromiseInspection.prototype.isFulfilled = function() {
	    return (this._bitField & 33554432) !== 0;
	};

	var isRejected = PromiseInspection.prototype.isRejected = function () {
	    return (this._bitField & 16777216) !== 0;
	};

	var isPending = PromiseInspection.prototype.isPending = function () {
	    return (this._bitField & 50397184) === 0;
	};

	var isResolved = PromiseInspection.prototype.isResolved = function () {
	    return (this._bitField & 50331648) !== 0;
	};

	PromiseInspection.prototype.isCancelled =
	Promise.prototype._isCancelled = function() {
	    return (this._bitField & 65536) === 65536;
	};

	Promise.prototype.isCancelled = function() {
	    return this._target()._isCancelled();
	};

	Promise.prototype.isPending = function() {
	    return isPending.call(this._target());
	};

	Promise.prototype.isRejected = function() {
	    return isRejected.call(this._target());
	};

	Promise.prototype.isFulfilled = function() {
	    return isFulfilled.call(this._target());
	};

	Promise.prototype.isResolved = function() {
	    return isResolved.call(this._target());
	};

	Promise.prototype.value = function() {
	    return value.call(this._target());
	};

	Promise.prototype.reason = function() {
	    var target = this._target();
	    target._unsetRejectionIsUnhandled();
	    return reason.call(target);
	};

	Promise.prototype._value = function() {
	    return this._settledValue();
	};

	Promise.prototype._reason = function() {
	    this._unsetRejectionIsUnhandled();
	    return this._settledValue();
	};

	Promise.PromiseInspection = PromiseInspection;
	};


/***/ },
/* 111 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	module.exports =
	function(Promise, PromiseArray, tryConvertToPromise, INTERNAL) {
	var util = __webpack_require__(93);
	var canEvaluate = util.canEvaluate;
	var tryCatch = util.tryCatch;
	var errorObj = util.errorObj;
	var reject;

	if (true) {
	if (canEvaluate) {
	    var thenCallback = function(i) {
	        return new Function("value", "holder", "                             \n\
	            'use strict';                                                    \n\
	            holder.pIndex = value;                                           \n\
	            holder.checkFulfillment(this);                                   \n\
	            ".replace(/Index/g, i));
	    };

	    var promiseSetter = function(i) {
	        return new Function("promise", "holder", "                           \n\
	            'use strict';                                                    \n\
	            holder.pIndex = promise;                                         \n\
	            ".replace(/Index/g, i));
	    };

	    var generateHolderClass = function(total) {
	        var props = new Array(total);
	        for (var i = 0; i < props.length; ++i) {
	            props[i] = "this.p" + (i+1);
	        }
	        var assignment = props.join(" = ") + " = null;";
	        var cancellationCode= "var promise;\n" + props.map(function(prop) {
	            return "                                                         \n\
	                promise = " + prop + ";                                      \n\
	                if (promise instanceof Promise) {                            \n\
	                    promise.cancel();                                        \n\
	                }                                                            \n\
	            ";
	        }).join("\n");
	        var passedArguments = props.join(", ");
	        var name = "Holder$" + total;


	        var code = "return function(tryCatch, errorObj, Promise) {           \n\
	            'use strict';                                                    \n\
	            function [TheName](fn) {                                         \n\
	                [TheProperties]                                              \n\
	                this.fn = fn;                                                \n\
	                this.now = 0;                                                \n\
	            }                                                                \n\
	            [TheName].prototype.checkFulfillment = function(promise) {       \n\
	                var now = ++this.now;                                        \n\
	                if (now === [TheTotal]) {                                    \n\
	                    promise._pushContext();                                  \n\
	                    var callback = this.fn;                                  \n\
	                    var ret = tryCatch(callback)([ThePassedArguments]);      \n\
	                    promise._popContext();                                   \n\
	                    if (ret === errorObj) {                                  \n\
	                        promise._rejectCallback(ret.e, false);               \n\
	                    } else {                                                 \n\
	                        promise._resolveCallback(ret);                       \n\
	                    }                                                        \n\
	                }                                                            \n\
	            };                                                               \n\
	                                                                             \n\
	            [TheName].prototype._resultCancelled = function() {              \n\
	                [CancellationCode]                                           \n\
	            };                                                               \n\
	                                                                             \n\
	            return [TheName];                                                \n\
	        }(tryCatch, errorObj, Promise);                                      \n\
	        ";

	        code = code.replace(/\[TheName\]/g, name)
	            .replace(/\[TheTotal\]/g, total)
	            .replace(/\[ThePassedArguments\]/g, passedArguments)
	            .replace(/\[TheProperties\]/g, assignment)
	            .replace(/\[CancellationCode\]/g, cancellationCode);

	        return new Function("tryCatch", "errorObj", "Promise", code)
	                           (tryCatch, errorObj, Promise);
	    };

	    var holderClasses = [];
	    var thenCallbacks = [];
	    var promiseSetters = [];

	    for (var i = 0; i < 8; ++i) {
	        holderClasses.push(generateHolderClass(i + 1));
	        thenCallbacks.push(thenCallback(i + 1));
	        promiseSetters.push(promiseSetter(i + 1));
	    }

	    reject = function (reason) {
	        this._reject(reason);
	    };
	}}

	Promise.join = function () {
	    var last = arguments.length - 1;
	    var fn;
	    if (last > 0 && typeof arguments[last] === "function") {
	        fn = arguments[last];
	        if (true) {
	            if (last <= 8 && canEvaluate) {
	                var ret = new Promise(INTERNAL);
	                ret._captureStackTrace();
	                var HolderClass = holderClasses[last - 1];
	                var holder = new HolderClass(fn);
	                var callbacks = thenCallbacks;

	                for (var i = 0; i < last; ++i) {
	                    var maybePromise = tryConvertToPromise(arguments[i], ret);
	                    if (maybePromise instanceof Promise) {
	                        maybePromise = maybePromise._target();
	                        var bitField = maybePromise._bitField;
	                        ;
	                        if (((bitField & 50397184) === 0)) {
	                            maybePromise._then(callbacks[i], reject,
	                                               undefined, ret, holder);
	                            promiseSetters[i](maybePromise, holder);
	                        } else if (((bitField & 33554432) !== 0)) {
	                            callbacks[i].call(ret,
	                                              maybePromise._value(), holder);
	                        } else if (((bitField & 16777216) !== 0)) {
	                            ret._reject(maybePromise._reason());
	                        } else {
	                            ret._cancel();
	                        }
	                    } else {
	                        callbacks[i].call(ret, maybePromise, holder);
	                    }
	                }
	                if (!ret._isFateSealed()) {
	                    ret._setAsyncGuaranteed();
	                    ret._setOnCancel(holder);
	                }
	                return ret;
	            }
	        }
	    }
	    var $_len = arguments.length;var args = new Array($_len); for(var $_i = 0; $_i < $_len; ++$_i) {args[$_i] = arguments[$_i];};
	    if (fn) args.pop();
	    var ret = new PromiseArray(args).promise();
	    return fn !== undefined ? ret.spread(fn) : ret;
	};

	};


/***/ },
/* 112 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	module.exports = function(Promise,
	                          PromiseArray,
	                          apiRejection,
	                          tryConvertToPromise,
	                          INTERNAL,
	                          debug) {
	var getDomain = Promise._getDomain;
	var util = __webpack_require__(93);
	var tryCatch = util.tryCatch;
	var errorObj = util.errorObj;
	var EMPTY_ARRAY = [];

	function MappingPromiseArray(promises, fn, limit, _filter) {
	    this.constructor$(promises);
	    this._promise._captureStackTrace();
	    var domain = getDomain();
	    this._callback = domain === null ? fn : domain.bind(fn);
	    this._preservedValues = _filter === INTERNAL
	        ? new Array(this.length())
	        : null;
	    this._limit = limit;
	    this._inFlight = 0;
	    this._queue = limit >= 1 ? [] : EMPTY_ARRAY;
	    this._init$(undefined, -2);
	}
	util.inherits(MappingPromiseArray, PromiseArray);

	MappingPromiseArray.prototype._init = function () {};

	MappingPromiseArray.prototype._promiseFulfilled = function (value, index) {
	    var values = this._values;
	    var length = this.length();
	    var preservedValues = this._preservedValues;
	    var limit = this._limit;

	    if (index < 0) {
	        index = (index * -1) - 1;
	        values[index] = value;
	        if (limit >= 1) {
	            this._inFlight--;
	            this._drainQueue();
	            if (this._isResolved()) return true;
	        }
	    } else {
	        if (limit >= 1 && this._inFlight >= limit) {
	            values[index] = value;
	            this._queue.push(index);
	            return false;
	        }
	        if (preservedValues !== null) preservedValues[index] = value;

	        var promise = this._promise;
	        var callback = this._callback;
	        var receiver = promise._boundValue();
	        promise._pushContext();
	        var ret = tryCatch(callback).call(receiver, value, index, length);
	        var promiseCreated = promise._popContext();
	        debug.checkForgottenReturns(
	            ret,
	            promiseCreated,
	            preservedValues !== null ? "Promise.filter" : "Promise.map",
	            promise
	        );
	        if (ret === errorObj) {
	            this._reject(ret.e);
	            return true;
	        }

	        var maybePromise = tryConvertToPromise(ret, this._promise);
	        if (maybePromise instanceof Promise) {
	            maybePromise = maybePromise._target();
	            var bitField = maybePromise._bitField;
	            ;
	            if (((bitField & 50397184) === 0)) {
	                if (limit >= 1) this._inFlight++;
	                values[index] = maybePromise;
	                maybePromise._proxy(this, (index + 1) * -1);
	                return false;
	            } else if (((bitField & 33554432) !== 0)) {
	                ret = maybePromise._value();
	            } else if (((bitField & 16777216) !== 0)) {
	                this._reject(maybePromise._reason());
	                return true;
	            } else {
	                this._cancel();
	                return true;
	            }
	        }
	        values[index] = ret;
	    }
	    var totalResolved = ++this._totalResolved;
	    if (totalResolved >= length) {
	        if (preservedValues !== null) {
	            this._filter(values, preservedValues);
	        } else {
	            this._resolve(values);
	        }
	        return true;
	    }
	    return false;
	};

	MappingPromiseArray.prototype._drainQueue = function () {
	    var queue = this._queue;
	    var limit = this._limit;
	    var values = this._values;
	    while (queue.length > 0 && this._inFlight < limit) {
	        if (this._isResolved()) return;
	        var index = queue.pop();
	        this._promiseFulfilled(values[index], index);
	    }
	};

	MappingPromiseArray.prototype._filter = function (booleans, values) {
	    var len = values.length;
	    var ret = new Array(len);
	    var j = 0;
	    for (var i = 0; i < len; ++i) {
	        if (booleans[i]) ret[j++] = values[i];
	    }
	    ret.length = j;
	    this._resolve(ret);
	};

	MappingPromiseArray.prototype.preservedValues = function () {
	    return this._preservedValues;
	};

	function map(promises, fn, options, _filter) {
	    if (typeof fn !== "function") {
	        return apiRejection("expecting a function but got " + util.classString(fn));
	    }
	    var limit = typeof options === "object" && options !== null
	        ? options.concurrency
	        : 0;
	    limit = typeof limit === "number" &&
	        isFinite(limit) && limit >= 1 ? limit : 0;
	    return new MappingPromiseArray(promises, fn, limit, _filter).promise();
	}

	Promise.prototype.map = function (fn, options) {
	    return map(this, fn, options, null);
	};

	Promise.map = function (promises, fn, options, _filter) {
	    return map(promises, fn, options, _filter);
	};


	};


/***/ },
/* 113 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	module.exports = function (Promise, apiRejection, tryConvertToPromise,
	    createContext, INTERNAL, debug) {
	    var util = __webpack_require__(93);
	    var TypeError = __webpack_require__(98).TypeError;
	    var inherits = __webpack_require__(93).inherits;
	    var errorObj = util.errorObj;
	    var tryCatch = util.tryCatch;

	    function thrower(e) {
	        setTimeout(function(){throw e;}, 0);
	    }

	    function castPreservingDisposable(thenable) {
	        var maybePromise = tryConvertToPromise(thenable);
	        if (maybePromise !== thenable &&
	            typeof thenable._isDisposable === "function" &&
	            typeof thenable._getDisposer === "function" &&
	            thenable._isDisposable()) {
	            maybePromise._setDisposable(thenable._getDisposer());
	        }
	        return maybePromise;
	    }
	    function dispose(resources, inspection) {
	        var i = 0;
	        var len = resources.length;
	        var ret = new Promise(INTERNAL);
	        function iterator() {
	            if (i >= len) return ret._fulfill();
	            var maybePromise = castPreservingDisposable(resources[i++]);
	            if (maybePromise instanceof Promise &&
	                maybePromise._isDisposable()) {
	                try {
	                    maybePromise = tryConvertToPromise(
	                        maybePromise._getDisposer().tryDispose(inspection),
	                        resources.promise);
	                } catch (e) {
	                    return thrower(e);
	                }
	                if (maybePromise instanceof Promise) {
	                    return maybePromise._then(iterator, thrower,
	                                              null, null, null);
	                }
	            }
	            iterator();
	        }
	        iterator();
	        return ret;
	    }

	    function Disposer(data, promise, context) {
	        this._data = data;
	        this._promise = promise;
	        this._context = context;
	    }

	    Disposer.prototype.data = function () {
	        return this._data;
	    };

	    Disposer.prototype.promise = function () {
	        return this._promise;
	    };

	    Disposer.prototype.resource = function () {
	        if (this.promise().isFulfilled()) {
	            return this.promise().value();
	        }
	        return null;
	    };

	    Disposer.prototype.tryDispose = function(inspection) {
	        var resource = this.resource();
	        var context = this._context;
	        if (context !== undefined) context._pushContext();
	        var ret = resource !== null
	            ? this.doDispose(resource, inspection) : null;
	        if (context !== undefined) context._popContext();
	        this._promise._unsetDisposable();
	        this._data = null;
	        return ret;
	    };

	    Disposer.isDisposer = function (d) {
	        return (d != null &&
	                typeof d.resource === "function" &&
	                typeof d.tryDispose === "function");
	    };

	    function FunctionDisposer(fn, promise, context) {
	        this.constructor$(fn, promise, context);
	    }
	    inherits(FunctionDisposer, Disposer);

	    FunctionDisposer.prototype.doDispose = function (resource, inspection) {
	        var fn = this.data();
	        return fn.call(resource, resource, inspection);
	    };

	    function maybeUnwrapDisposer(value) {
	        if (Disposer.isDisposer(value)) {
	            this.resources[this.index]._setDisposable(value);
	            return value.promise();
	        }
	        return value;
	    }

	    function ResourceList(length) {
	        this.length = length;
	        this.promise = null;
	        this[length-1] = null;
	    }

	    ResourceList.prototype._resultCancelled = function() {
	        var len = this.length;
	        for (var i = 0; i < len; ++i) {
	            var item = this[i];
	            if (item instanceof Promise) {
	                item.cancel();
	            }
	        }
	    };

	    Promise.using = function () {
	        var len = arguments.length;
	        if (len < 2) return apiRejection(
	                        "you must pass at least 2 arguments to Promise.using");
	        var fn = arguments[len - 1];
	        if (typeof fn !== "function") {
	            return apiRejection("expecting a function but got " + util.classString(fn));
	        }
	        var input;
	        var spreadArgs = true;
	        if (len === 2 && Array.isArray(arguments[0])) {
	            input = arguments[0];
	            len = input.length;
	            spreadArgs = false;
	        } else {
	            input = arguments;
	            len--;
	        }
	        var resources = new ResourceList(len);
	        for (var i = 0; i < len; ++i) {
	            var resource = input[i];
	            if (Disposer.isDisposer(resource)) {
	                var disposer = resource;
	                resource = resource.promise();
	                resource._setDisposable(disposer);
	            } else {
	                var maybePromise = tryConvertToPromise(resource);
	                if (maybePromise instanceof Promise) {
	                    resource =
	                        maybePromise._then(maybeUnwrapDisposer, null, null, {
	                            resources: resources,
	                            index: i
	                    }, undefined);
	                }
	            }
	            resources[i] = resource;
	        }

	        var reflectedResources = new Array(resources.length);
	        for (var i = 0; i < reflectedResources.length; ++i) {
	            reflectedResources[i] = Promise.resolve(resources[i]).reflect();
	        }

	        var resultPromise = Promise.all(reflectedResources)
	            .then(function(inspections) {
	                for (var i = 0; i < inspections.length; ++i) {
	                    var inspection = inspections[i];
	                    if (inspection.isRejected()) {
	                        errorObj.e = inspection.error();
	                        return errorObj;
	                    } else if (!inspection.isFulfilled()) {
	                        resultPromise.cancel();
	                        return;
	                    }
	                    inspections[i] = inspection.value();
	                }
	                promise._pushContext();

	                fn = tryCatch(fn);
	                var ret = spreadArgs
	                    ? fn.apply(undefined, inspections) : fn(inspections);
	                var promiseCreated = promise._popContext();
	                debug.checkForgottenReturns(
	                    ret, promiseCreated, "Promise.using", promise);
	                return ret;
	            });

	        var promise = resultPromise.lastly(function() {
	            var inspection = new Promise.PromiseInspection(resultPromise);
	            return dispose(resources, inspection);
	        });
	        resources.promise = promise;
	        promise._setOnCancel(resources);
	        return promise;
	    };

	    Promise.prototype._setDisposable = function (disposer) {
	        this._bitField = this._bitField | 131072;
	        this._disposer = disposer;
	    };

	    Promise.prototype._isDisposable = function () {
	        return (this._bitField & 131072) > 0;
	    };

	    Promise.prototype._getDisposer = function () {
	        return this._disposer;
	    };

	    Promise.prototype._unsetDisposable = function () {
	        this._bitField = this._bitField & (~131072);
	        this._disposer = undefined;
	    };

	    Promise.prototype.disposer = function (fn) {
	        if (typeof fn === "function") {
	            return new FunctionDisposer(fn, this, createContext());
	        }
	        throw new TypeError();
	    };

	};


/***/ },
/* 114 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	module.exports = function(Promise, INTERNAL, debug) {
	var util = __webpack_require__(93);
	var TimeoutError = Promise.TimeoutError;

	var afterTimeout = function (promise, message, parent) {
	    if (!promise.isPending()) return;
	    var err;
	    if (typeof message !== "string") {
	        if (message instanceof Error) {
	            err = message;
	        } else {
	            err = new TimeoutError("operation timed out");
	        }
	    } else {
	        err = new TimeoutError(message);
	    }
	    util.markAsOriginatingFromRejection(err);
	    promise._attachExtraTrace(err);
	    promise._reject(err);
	    if (debug.cancellation()) {
	        parent.cancel();
	    }
	};

	var afterValue = function(value) { return delay(+this).thenReturn(value); };
	var delay = Promise.delay = function (ms, value) {
	    var ret;
	    if (value !== undefined) {
	        ret = Promise.resolve(value)
	                ._then(afterValue, null, null, ms, undefined);
	    } else {
	        ret = new Promise(INTERNAL);
	        setTimeout(function() { ret._fulfill(); }, +ms);
	    }
	    ret._setAsyncGuaranteed();
	    return ret;
	};

	Promise.prototype.delay = function (ms) {
	    return delay(ms, this);
	};

	function successClear(value) {
	    var handle = this;
	    if (handle instanceof Number) handle = +handle;
	    clearTimeout(handle);
	    return value;
	}

	function failureClear(reason) {
	    var handle = this;
	    if (handle instanceof Number) handle = +handle;
	    clearTimeout(handle);
	    throw reason;
	}


	Promise.prototype.timeout = function (ms, message) {
	    ms = +ms;
	    var parent = this.then();
	    var ret = parent.then();
	    var handle = setTimeout(function timeoutTimeout() {
	        afterTimeout(ret, message, parent);
	    }, ms);
	    if (debug.cancellation()) {
	        ret._setOnCancel({
	            _resultCancelled: function() {
	                clearTimeout(handle);
	            }
	        });
	    }
	    return ret._then(successClear, failureClear, undefined, handle, undefined);
	};

	};


/***/ },
/* 115 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	module.exports = function(Promise,
	                          apiRejection,
	                          INTERNAL,
	                          tryConvertToPromise,
	                          Proxyable,
	                          debug) {
	var errors = __webpack_require__(98);
	var TypeError = errors.TypeError;
	var util = __webpack_require__(93);
	var errorObj = util.errorObj;
	var tryCatch = util.tryCatch;
	var yieldHandlers = [];

	function promiseFromYieldHandler(value, yieldHandlers, traceParent) {
	    for (var i = 0; i < yieldHandlers.length; ++i) {
	        traceParent._pushContext();
	        var result = tryCatch(yieldHandlers[i])(value);
	        traceParent._popContext();
	        if (result === errorObj) {
	            traceParent._pushContext();
	            var ret = Promise.reject(errorObj.e);
	            traceParent._popContext();
	            return ret;
	        }
	        var maybePromise = tryConvertToPromise(result, traceParent);
	        if (maybePromise instanceof Promise) return maybePromise;
	    }
	    return null;
	}

	function PromiseSpawn(generatorFunction, receiver, yieldHandler, stack) {
	    var promise = this._promise = new Promise(INTERNAL);
	    promise._captureStackTrace();
	    promise._setOnCancel(this);
	    this._stack = stack;
	    this._generatorFunction = generatorFunction;
	    this._receiver = receiver;
	    this._generator = undefined;
	    this._yieldHandlers = typeof yieldHandler === "function"
	        ? [yieldHandler].concat(yieldHandlers)
	        : yieldHandlers;
	    this._yieldedPromise = null;
	}
	util.inherits(PromiseSpawn, Proxyable);

	PromiseSpawn.prototype._isResolved = function() {
	    return this._promise === null;
	};

	PromiseSpawn.prototype._cleanup = function() {
	    this._promise = this._generator = null;
	};

	PromiseSpawn.prototype._promiseCancelled = function() {
	    if (this._isResolved()) return;
	    var implementsReturn = typeof this._generator["return"] !== "undefined";

	    var result;
	    if (!implementsReturn) {
	        var reason = new Promise.CancellationError(
	            "generator .return() sentinel");
	        Promise.coroutine.returnSentinel = reason;
	        this._promise._attachExtraTrace(reason);
	        this._promise._pushContext();
	        result = tryCatch(this._generator["throw"]).call(this._generator,
	                                                         reason);
	        this._promise._popContext();
	        if (result === errorObj && result.e === reason) {
	            result = null;
	        }
	    } else {
	        this._promise._pushContext();
	        result = tryCatch(this._generator["return"]).call(this._generator,
	                                                          undefined);
	        this._promise._popContext();
	    }
	    var promise = this._promise;
	    this._cleanup();
	    if (result === errorObj) {
	        promise._rejectCallback(result.e, false);
	    } else {
	        promise.cancel();
	    }
	};

	PromiseSpawn.prototype._promiseFulfilled = function(value) {
	    this._yieldedPromise = null;
	    this._promise._pushContext();
	    var result = tryCatch(this._generator.next).call(this._generator, value);
	    this._promise._popContext();
	    this._continue(result);
	};

	PromiseSpawn.prototype._promiseRejected = function(reason) {
	    this._yieldedPromise = null;
	    this._promise._attachExtraTrace(reason);
	    this._promise._pushContext();
	    var result = tryCatch(this._generator["throw"])
	        .call(this._generator, reason);
	    this._promise._popContext();
	    this._continue(result);
	};

	PromiseSpawn.prototype._resultCancelled = function() {
	    if (this._yieldedPromise instanceof Promise) {
	        var promise = this._yieldedPromise;
	        this._yieldedPromise = null;
	        promise.cancel();
	    }
	};

	PromiseSpawn.prototype.promise = function () {
	    return this._promise;
	};

	PromiseSpawn.prototype._run = function () {
	    this._generator = this._generatorFunction.call(this._receiver);
	    this._receiver =
	        this._generatorFunction = undefined;
	    this._promiseFulfilled(undefined);
	};

	PromiseSpawn.prototype._continue = function (result) {
	    var promise = this._promise;
	    if (result === errorObj) {
	        this._cleanup();
	        return promise._rejectCallback(result.e, false);
	    }

	    var value = result.value;
	    if (result.done === true) {
	        this._cleanup();
	        return promise._resolveCallback(value);
	    } else {
	        var maybePromise = tryConvertToPromise(value, this._promise);
	        if (!(maybePromise instanceof Promise)) {
	            maybePromise =
	                promiseFromYieldHandler(maybePromise,
	                                        this._yieldHandlers,
	                                        this._promise);
	            if (maybePromise === null) {
	                this._promiseRejected(
	                    new TypeError(
	                        "A value %s was yielded that could not be treated as a promise\u000a\u000a    See http://goo.gl/MqrFmX\u000a\u000a".replace("%s", value) +
	                        "From coroutine:\u000a" +
	                        this._stack.split("\n").slice(1, -7).join("\n")
	                    )
	                );
	                return;
	            }
	        }
	        maybePromise = maybePromise._target();
	        var bitField = maybePromise._bitField;
	        ;
	        if (((bitField & 50397184) === 0)) {
	            this._yieldedPromise = maybePromise;
	            maybePromise._proxy(this, null);
	        } else if (((bitField & 33554432) !== 0)) {
	            this._promiseFulfilled(maybePromise._value());
	        } else if (((bitField & 16777216) !== 0)) {
	            this._promiseRejected(maybePromise._reason());
	        } else {
	            this._promiseCancelled();
	        }
	    }
	};

	Promise.coroutine = function (generatorFunction, options) {
	    if (typeof generatorFunction !== "function") {
	        throw new TypeError("generatorFunction must be a function\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
	    }
	    var yieldHandler = Object(options).yieldHandler;
	    var PromiseSpawn$ = PromiseSpawn;
	    var stack = new Error().stack;
	    return function () {
	        var generator = generatorFunction.apply(this, arguments);
	        var spawn = new PromiseSpawn$(undefined, undefined, yieldHandler,
	                                      stack);
	        var ret = spawn.promise();
	        spawn._generator = generator;
	        spawn._promiseFulfilled(undefined);
	        return ret;
	    };
	};

	Promise.coroutine.addYieldHandler = function(fn) {
	    if (typeof fn !== "function") {
	        throw new TypeError("expecting a function but got " + util.classString(fn));
	    }
	    yieldHandlers.push(fn);
	};

	Promise.spawn = function (generatorFunction) {
	    debug.deprecated("Promise.spawn()", "Promise.coroutine()");
	    if (typeof generatorFunction !== "function") {
	        return apiRejection("generatorFunction must be a function\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
	    }
	    var spawn = new PromiseSpawn(generatorFunction, this);
	    var ret = spawn.promise();
	    spawn._run(Promise.spawn);
	    return ret;
	};
	};


/***/ },
/* 116 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	module.exports = function(Promise) {
	var util = __webpack_require__(93);
	var async = Promise._async;
	var tryCatch = util.tryCatch;
	var errorObj = util.errorObj;

	function spreadAdapter(val, nodeback) {
	    var promise = this;
	    if (!util.isArray(val)) return successAdapter.call(promise, val, nodeback);
	    var ret =
	        tryCatch(nodeback).apply(promise._boundValue(), [null].concat(val));
	    if (ret === errorObj) {
	        async.throwLater(ret.e);
	    }
	}

	function successAdapter(val, nodeback) {
	    var promise = this;
	    var receiver = promise._boundValue();
	    var ret = val === undefined
	        ? tryCatch(nodeback).call(receiver, null)
	        : tryCatch(nodeback).call(receiver, null, val);
	    if (ret === errorObj) {
	        async.throwLater(ret.e);
	    }
	}
	function errorAdapter(reason, nodeback) {
	    var promise = this;
	    if (!reason) {
	        var newReason = new Error(reason + "");
	        newReason.cause = reason;
	        reason = newReason;
	    }
	    var ret = tryCatch(nodeback).call(promise._boundValue(), reason);
	    if (ret === errorObj) {
	        async.throwLater(ret.e);
	    }
	}

	Promise.prototype.asCallback = Promise.prototype.nodeify = function (nodeback,
	                                                                     options) {
	    if (typeof nodeback == "function") {
	        var adapter = successAdapter;
	        if (options !== undefined && Object(options).spread) {
	            adapter = spreadAdapter;
	        }
	        this._then(
	            adapter,
	            errorAdapter,
	            undefined,
	            this,
	            nodeback
	        );
	    }
	    return this;
	};
	};


/***/ },
/* 117 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var cr = Object.create;
	if (cr) {
	    var callerCache = cr(null);
	    var getterCache = cr(null);
	    callerCache[" size"] = getterCache[" size"] = 0;
	}

	module.exports = function(Promise) {
	var util = __webpack_require__(93);
	var canEvaluate = util.canEvaluate;
	var isIdentifier = util.isIdentifier;

	var getMethodCaller;
	var getGetter;
	if (true) {
	var makeMethodCaller = function (methodName) {
	    return new Function("ensureMethod", "                                    \n\
	        return function(obj) {                                               \n\
	            'use strict'                                                     \n\
	            var len = this.length;                                           \n\
	            ensureMethod(obj, 'methodName');                                 \n\
	            switch(len) {                                                    \n\
	                case 1: return obj.methodName(this[0]);                      \n\
	                case 2: return obj.methodName(this[0], this[1]);             \n\
	                case 3: return obj.methodName(this[0], this[1], this[2]);    \n\
	                case 0: return obj.methodName();                             \n\
	                default:                                                     \n\
	                    return obj.methodName.apply(obj, this);                  \n\
	            }                                                                \n\
	        };                                                                   \n\
	        ".replace(/methodName/g, methodName))(ensureMethod);
	};

	var makeGetter = function (propertyName) {
	    return new Function("obj", "                                             \n\
	        'use strict';                                                        \n\
	        return obj.propertyName;                                             \n\
	        ".replace("propertyName", propertyName));
	};

	var getCompiled = function(name, compiler, cache) {
	    var ret = cache[name];
	    if (typeof ret !== "function") {
	        if (!isIdentifier(name)) {
	            return null;
	        }
	        ret = compiler(name);
	        cache[name] = ret;
	        cache[" size"]++;
	        if (cache[" size"] > 512) {
	            var keys = Object.keys(cache);
	            for (var i = 0; i < 256; ++i) delete cache[keys[i]];
	            cache[" size"] = keys.length - 256;
	        }
	    }
	    return ret;
	};

	getMethodCaller = function(name) {
	    return getCompiled(name, makeMethodCaller, callerCache);
	};

	getGetter = function(name) {
	    return getCompiled(name, makeGetter, getterCache);
	};
	}

	function ensureMethod(obj, methodName) {
	    var fn;
	    if (obj != null) fn = obj[methodName];
	    if (typeof fn !== "function") {
	        var message = "Object " + util.classString(obj) + " has no method '" +
	            util.toString(methodName) + "'";
	        throw new Promise.TypeError(message);
	    }
	    return fn;
	}

	function caller(obj) {
	    var methodName = this.pop();
	    var fn = ensureMethod(obj, methodName);
	    return fn.apply(obj, this);
	}
	Promise.prototype.call = function (methodName) {
	    var $_len = arguments.length;var args = new Array($_len - 1); for(var $_i = 1; $_i < $_len; ++$_i) {args[$_i - 1] = arguments[$_i];};
	    if (true) {
	        if (canEvaluate) {
	            var maybeCaller = getMethodCaller(methodName);
	            if (maybeCaller !== null) {
	                return this._then(
	                    maybeCaller, undefined, undefined, args, undefined);
	            }
	        }
	    }
	    args.push(methodName);
	    return this._then(caller, undefined, undefined, args, undefined);
	};

	function namedGetter(obj) {
	    return obj[this];
	}
	function indexedGetter(obj) {
	    var index = +this;
	    if (index < 0) index = Math.max(0, index + obj.length);
	    return obj[index];
	}
	Promise.prototype.get = function (propertyName) {
	    var isIndex = (typeof propertyName === "number");
	    var getter;
	    if (!isIndex) {
	        if (canEvaluate) {
	            var maybeGetter = getGetter(propertyName);
	            getter = maybeGetter !== null ? maybeGetter : namedGetter;
	        } else {
	            getter = namedGetter;
	        }
	    } else {
	        getter = indexedGetter;
	    }
	    return this._then(getter, undefined, undefined, propertyName, undefined);
	};
	};


/***/ },
/* 118 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	module.exports = function(
	    Promise, PromiseArray, tryConvertToPromise, apiRejection) {
	var util = __webpack_require__(93);
	var isObject = util.isObject;
	var es5 = __webpack_require__(94);
	var Es6Map;
	if (typeof Map === "function") Es6Map = Map;

	var mapToEntries = (function() {
	    var index = 0;
	    var size = 0;

	    function extractEntry(value, key) {
	        this[index] = value;
	        this[index + size] = key;
	        index++;
	    }

	    return function mapToEntries(map) {
	        size = map.size;
	        index = 0;
	        var ret = new Array(map.size * 2);
	        map.forEach(extractEntry, ret);
	        return ret;
	    };
	})();

	var entriesToMap = function(entries) {
	    var ret = new Es6Map();
	    var length = entries.length / 2 | 0;
	    for (var i = 0; i < length; ++i) {
	        var key = entries[length + i];
	        var value = entries[i];
	        ret.set(key, value);
	    }
	    return ret;
	};

	function PropertiesPromiseArray(obj) {
	    var isMap = false;
	    var entries;
	    if (Es6Map !== undefined && obj instanceof Es6Map) {
	        entries = mapToEntries(obj);
	        isMap = true;
	    } else {
	        var keys = es5.keys(obj);
	        var len = keys.length;
	        entries = new Array(len * 2);
	        for (var i = 0; i < len; ++i) {
	            var key = keys[i];
	            entries[i] = obj[key];
	            entries[i + len] = key;
	        }
	    }
	    this.constructor$(entries);
	    this._isMap = isMap;
	    this._init$(undefined, -3);
	}
	util.inherits(PropertiesPromiseArray, PromiseArray);

	PropertiesPromiseArray.prototype._init = function () {};

	PropertiesPromiseArray.prototype._promiseFulfilled = function (value, index) {
	    this._values[index] = value;
	    var totalResolved = ++this._totalResolved;
	    if (totalResolved >= this._length) {
	        var val;
	        if (this._isMap) {
	            val = entriesToMap(this._values);
	        } else {
	            val = {};
	            var keyOffset = this.length();
	            for (var i = 0, len = this.length(); i < len; ++i) {
	                val[this._values[i + keyOffset]] = this._values[i];
	            }
	        }
	        this._resolve(val);
	        return true;
	    }
	    return false;
	};

	PropertiesPromiseArray.prototype.shouldCopyValues = function () {
	    return false;
	};

	PropertiesPromiseArray.prototype.getActualLength = function (len) {
	    return len >> 1;
	};

	function props(promises) {
	    var ret;
	    var castValue = tryConvertToPromise(promises);

	    if (!isObject(castValue)) {
	        return apiRejection("cannot await properties of a non-object\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
	    } else if (castValue instanceof Promise) {
	        ret = castValue._then(
	            Promise.props, undefined, undefined, undefined, undefined);
	    } else {
	        ret = new PropertiesPromiseArray(castValue).promise();
	    }

	    if (castValue instanceof Promise) {
	        ret._propagateFrom(castValue, 2);
	    }
	    return ret;
	}

	Promise.prototype.props = function () {
	    return props(this);
	};

	Promise.props = function (promises) {
	    return props(promises);
	};
	};


/***/ },
/* 119 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	module.exports = function(
	    Promise, INTERNAL, tryConvertToPromise, apiRejection) {
	var util = __webpack_require__(93);

	var raceLater = function (promise) {
	    return promise.then(function(array) {
	        return race(array, promise);
	    });
	};

	function race(promises, parent) {
	    var maybePromise = tryConvertToPromise(promises);

	    if (maybePromise instanceof Promise) {
	        return raceLater(maybePromise);
	    } else {
	        promises = util.asArray(promises);
	        if (promises === null)
	            return apiRejection("expecting an array or an iterable object but got " + util.classString(promises));
	    }

	    var ret = new Promise(INTERNAL);
	    if (parent !== undefined) {
	        ret._propagateFrom(parent, 3);
	    }
	    var fulfill = ret._fulfill;
	    var reject = ret._reject;
	    for (var i = 0, len = promises.length; i < len; ++i) {
	        var val = promises[i];

	        if (val === undefined && !(i in promises)) {
	            continue;
	        }

	        Promise.cast(val)._then(fulfill, reject, undefined, ret, null);
	    }
	    return ret;
	}

	Promise.race = function (promises) {
	    return race(promises, undefined);
	};

	Promise.prototype.race = function () {
	    return race(this, undefined);
	};

	};


/***/ },
/* 120 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	module.exports = function(Promise,
	                          PromiseArray,
	                          apiRejection,
	                          tryConvertToPromise,
	                          INTERNAL,
	                          debug) {
	var getDomain = Promise._getDomain;
	var util = __webpack_require__(93);
	var tryCatch = util.tryCatch;

	function ReductionPromiseArray(promises, fn, initialValue, _each) {
	    this.constructor$(promises);
	    var domain = getDomain();
	    this._fn = domain === null ? fn : domain.bind(fn);
	    if (initialValue !== undefined) {
	        initialValue = Promise.resolve(initialValue);
	        initialValue._attachCancellationCallback(this);
	    }
	    this._initialValue = initialValue;
	    this._currentCancellable = null;
	    this._eachValues = _each === INTERNAL ? [] : undefined;
	    this._promise._captureStackTrace();
	    this._init$(undefined, -5);
	}
	util.inherits(ReductionPromiseArray, PromiseArray);

	ReductionPromiseArray.prototype._gotAccum = function(accum) {
	    if (this._eachValues !== undefined && accum !== INTERNAL) {
	        this._eachValues.push(accum);
	    }
	};

	ReductionPromiseArray.prototype._eachComplete = function(value) {
	    this._eachValues.push(value);
	    return this._eachValues;
	};

	ReductionPromiseArray.prototype._init = function() {};

	ReductionPromiseArray.prototype._resolveEmptyArray = function() {
	    this._resolve(this._eachValues !== undefined ? this._eachValues
	                                                 : this._initialValue);
	};

	ReductionPromiseArray.prototype.shouldCopyValues = function () {
	    return false;
	};

	ReductionPromiseArray.prototype._resolve = function(value) {
	    this._promise._resolveCallback(value);
	    this._values = null;
	};

	ReductionPromiseArray.prototype._resultCancelled = function(sender) {
	    if (sender === this._initialValue) return this._cancel();
	    if (this._isResolved()) return;
	    this._resultCancelled$();
	    if (this._currentCancellable instanceof Promise) {
	        this._currentCancellable.cancel();
	    }
	    if (this._initialValue instanceof Promise) {
	        this._initialValue.cancel();
	    }
	};

	ReductionPromiseArray.prototype._iterate = function (values) {
	    this._values = values;
	    var value;
	    var i;
	    var length = values.length;
	    if (this._initialValue !== undefined) {
	        value = this._initialValue;
	        i = 0;
	    } else {
	        value = Promise.resolve(values[0]);
	        i = 1;
	    }

	    this._currentCancellable = value;

	    if (!value.isRejected()) {
	        for (; i < length; ++i) {
	            var ctx = {
	                accum: null,
	                value: values[i],
	                index: i,
	                length: length,
	                array: this
	            };
	            value = value._then(gotAccum, undefined, undefined, ctx, undefined);
	        }
	    }

	    if (this._eachValues !== undefined) {
	        value = value
	            ._then(this._eachComplete, undefined, undefined, this, undefined);
	    }
	    value._then(completed, completed, undefined, value, this);
	};

	Promise.prototype.reduce = function (fn, initialValue) {
	    return reduce(this, fn, initialValue, null);
	};

	Promise.reduce = function (promises, fn, initialValue, _each) {
	    return reduce(promises, fn, initialValue, _each);
	};

	function completed(valueOrReason, array) {
	    if (this.isFulfilled()) {
	        array._resolve(valueOrReason);
	    } else {
	        array._reject(valueOrReason);
	    }
	}

	function reduce(promises, fn, initialValue, _each) {
	    if (typeof fn !== "function") {
	        return apiRejection("expecting a function but got " + util.classString(fn));
	    }
	    var array = new ReductionPromiseArray(promises, fn, initialValue, _each);
	    return array.promise();
	}

	function gotAccum(accum) {
	    this.accum = accum;
	    this.array._gotAccum(accum);
	    var value = tryConvertToPromise(this.value, this.array._promise);
	    if (value instanceof Promise) {
	        this.array._currentCancellable = value;
	        return value._then(gotValue, undefined, undefined, this, undefined);
	    } else {
	        return gotValue.call(this, value);
	    }
	}

	function gotValue(value) {
	    var array = this.array;
	    var promise = array._promise;
	    var fn = tryCatch(array._fn);
	    promise._pushContext();
	    var ret;
	    if (array._eachValues !== undefined) {
	        ret = fn.call(promise._boundValue(), value, this.index, this.length);
	    } else {
	        ret = fn.call(promise._boundValue(),
	                              this.accum, value, this.index, this.length);
	    }
	    if (ret instanceof Promise) {
	        array._currentCancellable = ret;
	    }
	    var promiseCreated = promise._popContext();
	    debug.checkForgottenReturns(
	        ret,
	        promiseCreated,
	        array._eachValues !== undefined ? "Promise.each" : "Promise.reduce",
	        promise
	    );
	    return ret;
	}
	};


/***/ },
/* 121 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	module.exports =
	    function(Promise, PromiseArray, debug) {
	var PromiseInspection = Promise.PromiseInspection;
	var util = __webpack_require__(93);

	function SettledPromiseArray(values) {
	    this.constructor$(values);
	}
	util.inherits(SettledPromiseArray, PromiseArray);

	SettledPromiseArray.prototype._promiseResolved = function (index, inspection) {
	    this._values[index] = inspection;
	    var totalResolved = ++this._totalResolved;
	    if (totalResolved >= this._length) {
	        this._resolve(this._values);
	        return true;
	    }
	    return false;
	};

	SettledPromiseArray.prototype._promiseFulfilled = function (value, index) {
	    var ret = new PromiseInspection();
	    ret._bitField = 33554432;
	    ret._settledValueField = value;
	    return this._promiseResolved(index, ret);
	};
	SettledPromiseArray.prototype._promiseRejected = function (reason, index) {
	    var ret = new PromiseInspection();
	    ret._bitField = 16777216;
	    ret._settledValueField = reason;
	    return this._promiseResolved(index, ret);
	};

	Promise.settle = function (promises) {
	    debug.deprecated(".settle()", ".reflect()");
	    return new SettledPromiseArray(promises).promise();
	};

	Promise.prototype.settle = function () {
	    return Promise.settle(this);
	};
	};


/***/ },
/* 122 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	module.exports =
	function(Promise, PromiseArray, apiRejection) {
	var util = __webpack_require__(93);
	var RangeError = __webpack_require__(98).RangeError;
	var AggregateError = __webpack_require__(98).AggregateError;
	var isArray = util.isArray;
	var CANCELLATION = {};


	function SomePromiseArray(values) {
	    this.constructor$(values);
	    this._howMany = 0;
	    this._unwrap = false;
	    this._initialized = false;
	}
	util.inherits(SomePromiseArray, PromiseArray);

	SomePromiseArray.prototype._init = function () {
	    if (!this._initialized) {
	        return;
	    }
	    if (this._howMany === 0) {
	        this._resolve([]);
	        return;
	    }
	    this._init$(undefined, -5);
	    var isArrayResolved = isArray(this._values);
	    if (!this._isResolved() &&
	        isArrayResolved &&
	        this._howMany > this._canPossiblyFulfill()) {
	        this._reject(this._getRangeError(this.length()));
	    }
	};

	SomePromiseArray.prototype.init = function () {
	    this._initialized = true;
	    this._init();
	};

	SomePromiseArray.prototype.setUnwrap = function () {
	    this._unwrap = true;
	};

	SomePromiseArray.prototype.howMany = function () {
	    return this._howMany;
	};

	SomePromiseArray.prototype.setHowMany = function (count) {
	    this._howMany = count;
	};

	SomePromiseArray.prototype._promiseFulfilled = function (value) {
	    this._addFulfilled(value);
	    if (this._fulfilled() === this.howMany()) {
	        this._values.length = this.howMany();
	        if (this.howMany() === 1 && this._unwrap) {
	            this._resolve(this._values[0]);
	        } else {
	            this._resolve(this._values);
	        }
	        return true;
	    }
	    return false;

	};
	SomePromiseArray.prototype._promiseRejected = function (reason) {
	    this._addRejected(reason);
	    return this._checkOutcome();
	};

	SomePromiseArray.prototype._promiseCancelled = function () {
	    if (this._values instanceof Promise || this._values == null) {
	        return this._cancel();
	    }
	    this._addRejected(CANCELLATION);
	    return this._checkOutcome();
	};

	SomePromiseArray.prototype._checkOutcome = function() {
	    if (this.howMany() > this._canPossiblyFulfill()) {
	        var e = new AggregateError();
	        for (var i = this.length(); i < this._values.length; ++i) {
	            if (this._values[i] !== CANCELLATION) {
	                e.push(this._values[i]);
	            }
	        }
	        if (e.length > 0) {
	            this._reject(e);
	        } else {
	            this._cancel();
	        }
	        return true;
	    }
	    return false;
	};

	SomePromiseArray.prototype._fulfilled = function () {
	    return this._totalResolved;
	};

	SomePromiseArray.prototype._rejected = function () {
	    return this._values.length - this.length();
	};

	SomePromiseArray.prototype._addRejected = function (reason) {
	    this._values.push(reason);
	};

	SomePromiseArray.prototype._addFulfilled = function (value) {
	    this._values[this._totalResolved++] = value;
	};

	SomePromiseArray.prototype._canPossiblyFulfill = function () {
	    return this.length() - this._rejected();
	};

	SomePromiseArray.prototype._getRangeError = function (count) {
	    var message = "Input array must contain at least " +
	            this._howMany + " items but contains only " + count + " items";
	    return new RangeError(message);
	};

	SomePromiseArray.prototype._resolveEmptyArray = function () {
	    this._reject(this._getRangeError(0));
	};

	function some(promises, howMany) {
	    if ((howMany | 0) !== howMany || howMany < 0) {
	        return apiRejection("expecting a positive integer\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
	    }
	    var ret = new SomePromiseArray(promises);
	    var promise = ret.promise();
	    ret.setHowMany(howMany);
	    ret.init();
	    return promise;
	}

	Promise.some = function (promises, howMany) {
	    return some(promises, howMany);
	};

	Promise.prototype.some = function (howMany) {
	    return some(this, howMany);
	};

	Promise._SomePromiseArray = SomePromiseArray;
	};


/***/ },
/* 123 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	module.exports = function(Promise, INTERNAL) {
	var THIS = {};
	var util = __webpack_require__(93);
	var nodebackForPromise = __webpack_require__(105);
	var withAppended = util.withAppended;
	var maybeWrapAsError = util.maybeWrapAsError;
	var canEvaluate = util.canEvaluate;
	var TypeError = __webpack_require__(98).TypeError;
	var defaultSuffix = "Async";
	var defaultPromisified = {__isPromisified__: true};
	var noCopyProps = [
	    "arity",    "length",
	    "name",
	    "arguments",
	    "caller",
	    "callee",
	    "prototype",
	    "__isPromisified__"
	];
	var noCopyPropsPattern = new RegExp("^(?:" + noCopyProps.join("|") + ")$");

	var defaultFilter = function(name) {
	    return util.isIdentifier(name) &&
	        name.charAt(0) !== "_" &&
	        name !== "constructor";
	};

	function propsFilter(key) {
	    return !noCopyPropsPattern.test(key);
	}

	function isPromisified(fn) {
	    try {
	        return fn.__isPromisified__ === true;
	    }
	    catch (e) {
	        return false;
	    }
	}

	function hasPromisified(obj, key, suffix) {
	    var val = util.getDataPropertyOrDefault(obj, key + suffix,
	                                            defaultPromisified);
	    return val ? isPromisified(val) : false;
	}
	function checkValid(ret, suffix, suffixRegexp) {
	    for (var i = 0; i < ret.length; i += 2) {
	        var key = ret[i];
	        if (suffixRegexp.test(key)) {
	            var keyWithoutAsyncSuffix = key.replace(suffixRegexp, "");
	            for (var j = 0; j < ret.length; j += 2) {
	                if (ret[j] === keyWithoutAsyncSuffix) {
	                    throw new TypeError("Cannot promisify an API that has normal methods with '%s'-suffix\u000a\u000a    See http://goo.gl/MqrFmX\u000a"
	                        .replace("%s", suffix));
	                }
	            }
	        }
	    }
	}

	function promisifiableMethods(obj, suffix, suffixRegexp, filter) {
	    var keys = util.inheritedDataKeys(obj);
	    var ret = [];
	    for (var i = 0; i < keys.length; ++i) {
	        var key = keys[i];
	        var value = obj[key];
	        var passesDefaultFilter = filter === defaultFilter
	            ? true : defaultFilter(key, value, obj);
	        if (typeof value === "function" &&
	            !isPromisified(value) &&
	            !hasPromisified(obj, key, suffix) &&
	            filter(key, value, obj, passesDefaultFilter)) {
	            ret.push(key, value);
	        }
	    }
	    checkValid(ret, suffix, suffixRegexp);
	    return ret;
	}

	var escapeIdentRegex = function(str) {
	    return str.replace(/([$])/, "\\$");
	};

	var makeNodePromisifiedEval;
	if (true) {
	var switchCaseArgumentOrder = function(likelyArgumentCount) {
	    var ret = [likelyArgumentCount];
	    var min = Math.max(0, likelyArgumentCount - 1 - 3);
	    for(var i = likelyArgumentCount - 1; i >= min; --i) {
	        ret.push(i);
	    }
	    for(var i = likelyArgumentCount + 1; i <= 3; ++i) {
	        ret.push(i);
	    }
	    return ret;
	};

	var argumentSequence = function(argumentCount) {
	    return util.filledRange(argumentCount, "_arg", "");
	};

	var parameterDeclaration = function(parameterCount) {
	    return util.filledRange(
	        Math.max(parameterCount, 3), "_arg", "");
	};

	var parameterCount = function(fn) {
	    if (typeof fn.length === "number") {
	        return Math.max(Math.min(fn.length, 1023 + 1), 0);
	    }
	    return 0;
	};

	makeNodePromisifiedEval =
	function(callback, receiver, originalName, fn, _, multiArgs) {
	    var newParameterCount = Math.max(0, parameterCount(fn) - 1);
	    var argumentOrder = switchCaseArgumentOrder(newParameterCount);
	    var shouldProxyThis = typeof callback === "string" || receiver === THIS;

	    function generateCallForArgumentCount(count) {
	        var args = argumentSequence(count).join(", ");
	        var comma = count > 0 ? ", " : "";
	        var ret;
	        if (shouldProxyThis) {
	            ret = "ret = callback.call(this, {{args}}, nodeback); break;\n";
	        } else {
	            ret = receiver === undefined
	                ? "ret = callback({{args}}, nodeback); break;\n"
	                : "ret = callback.call(receiver, {{args}}, nodeback); break;\n";
	        }
	        return ret.replace("{{args}}", args).replace(", ", comma);
	    }

	    function generateArgumentSwitchCase() {
	        var ret = "";
	        for (var i = 0; i < argumentOrder.length; ++i) {
	            ret += "case " + argumentOrder[i] +":" +
	                generateCallForArgumentCount(argumentOrder[i]);
	        }

	        ret += "                                                             \n\
	        default:                                                             \n\
	            var args = new Array(len + 1);                                   \n\
	            var i = 0;                                                       \n\
	            for (var i = 0; i < len; ++i) {                                  \n\
	               args[i] = arguments[i];                                       \n\
	            }                                                                \n\
	            args[i] = nodeback;                                              \n\
	            [CodeForCall]                                                    \n\
	            break;                                                           \n\
	        ".replace("[CodeForCall]", (shouldProxyThis
	                                ? "ret = callback.apply(this, args);\n"
	                                : "ret = callback.apply(receiver, args);\n"));
	        return ret;
	    }

	    var getFunctionCode = typeof callback === "string"
	                                ? ("this != null ? this['"+callback+"'] : fn")
	                                : "fn";
	    var body = "'use strict';                                                \n\
	        var ret = function (Parameters) {                                    \n\
	            'use strict';                                                    \n\
	            var len = arguments.length;                                      \n\
	            var promise = new Promise(INTERNAL);                             \n\
	            promise._captureStackTrace();                                    \n\
	            var nodeback = nodebackForPromise(promise, " + multiArgs + ");   \n\
	            var ret;                                                         \n\
	            var callback = tryCatch([GetFunctionCode]);                      \n\
	            switch(len) {                                                    \n\
	                [CodeForSwitchCase]                                          \n\
	            }                                                                \n\
	            if (ret === errorObj) {                                          \n\
	                promise._rejectCallback(maybeWrapAsError(ret.e), true, true);\n\
	            }                                                                \n\
	            if (!promise._isFateSealed()) promise._setAsyncGuaranteed();     \n\
	            return promise;                                                  \n\
	        };                                                                   \n\
	        notEnumerableProp(ret, '__isPromisified__', true);                   \n\
	        return ret;                                                          \n\
	    ".replace("[CodeForSwitchCase]", generateArgumentSwitchCase())
	        .replace("[GetFunctionCode]", getFunctionCode);
	    body = body.replace("Parameters", parameterDeclaration(newParameterCount));
	    return new Function("Promise",
	                        "fn",
	                        "receiver",
	                        "withAppended",
	                        "maybeWrapAsError",
	                        "nodebackForPromise",
	                        "tryCatch",
	                        "errorObj",
	                        "notEnumerableProp",
	                        "INTERNAL",
	                        body)(
	                    Promise,
	                    fn,
	                    receiver,
	                    withAppended,
	                    maybeWrapAsError,
	                    nodebackForPromise,
	                    util.tryCatch,
	                    util.errorObj,
	                    util.notEnumerableProp,
	                    INTERNAL);
	};
	}

	function makeNodePromisifiedClosure(callback, receiver, _, fn, __, multiArgs) {
	    var defaultThis = (function() {return this;})();
	    var method = callback;
	    if (typeof method === "string") {
	        callback = fn;
	    }
	    function promisified() {
	        var _receiver = receiver;
	        if (receiver === THIS) _receiver = this;
	        var promise = new Promise(INTERNAL);
	        promise._captureStackTrace();
	        var cb = typeof method === "string" && this !== defaultThis
	            ? this[method] : callback;
	        var fn = nodebackForPromise(promise, multiArgs);
	        try {
	            cb.apply(_receiver, withAppended(arguments, fn));
	        } catch(e) {
	            promise._rejectCallback(maybeWrapAsError(e), true, true);
	        }
	        if (!promise._isFateSealed()) promise._setAsyncGuaranteed();
	        return promise;
	    }
	    util.notEnumerableProp(promisified, "__isPromisified__", true);
	    return promisified;
	}

	var makeNodePromisified = canEvaluate
	    ? makeNodePromisifiedEval
	    : makeNodePromisifiedClosure;

	function promisifyAll(obj, suffix, filter, promisifier, multiArgs) {
	    var suffixRegexp = new RegExp(escapeIdentRegex(suffix) + "$");
	    var methods =
	        promisifiableMethods(obj, suffix, suffixRegexp, filter);

	    for (var i = 0, len = methods.length; i < len; i+= 2) {
	        var key = methods[i];
	        var fn = methods[i+1];
	        var promisifiedKey = key + suffix;
	        if (promisifier === makeNodePromisified) {
	            obj[promisifiedKey] =
	                makeNodePromisified(key, THIS, key, fn, suffix, multiArgs);
	        } else {
	            var promisified = promisifier(fn, function() {
	                return makeNodePromisified(key, THIS, key,
	                                           fn, suffix, multiArgs);
	            });
	            util.notEnumerableProp(promisified, "__isPromisified__", true);
	            obj[promisifiedKey] = promisified;
	        }
	    }
	    util.toFastProperties(obj);
	    return obj;
	}

	function promisify(callback, receiver, multiArgs) {
	    return makeNodePromisified(callback, receiver, undefined,
	                                callback, null, multiArgs);
	}

	Promise.promisify = function (fn, options) {
	    if (typeof fn !== "function") {
	        throw new TypeError("expecting a function but got " + util.classString(fn));
	    }
	    if (isPromisified(fn)) {
	        return fn;
	    }
	    options = Object(options);
	    var receiver = options.context === undefined ? THIS : options.context;
	    var multiArgs = !!options.multiArgs;
	    var ret = promisify(fn, receiver, multiArgs);
	    util.copyDescriptors(fn, ret, propsFilter);
	    return ret;
	};

	Promise.promisifyAll = function (target, options) {
	    if (typeof target !== "function" && typeof target !== "object") {
	        throw new TypeError("the target of promisifyAll must be an object or a function\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
	    }
	    options = Object(options);
	    var multiArgs = !!options.multiArgs;
	    var suffix = options.suffix;
	    if (typeof suffix !== "string") suffix = defaultSuffix;
	    var filter = options.filter;
	    if (typeof filter !== "function") filter = defaultFilter;
	    var promisifier = options.promisifier;
	    if (typeof promisifier !== "function") promisifier = makeNodePromisified;

	    if (!util.isIdentifier(suffix)) {
	        throw new RangeError("suffix must be a valid identifier\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
	    }

	    var keys = util.inheritedDataKeys(target);
	    for (var i = 0; i < keys.length; ++i) {
	        var value = target[keys[i]];
	        if (keys[i] !== "constructor" &&
	            util.isClass(value)) {
	            promisifyAll(value.prototype, suffix, filter, promisifier,
	                multiArgs);
	            promisifyAll(value, suffix, filter, promisifier, multiArgs);
	        }
	    }

	    return promisifyAll(target, suffix, filter, promisifier, multiArgs);
	};
	};



/***/ },
/* 124 */
/***/ function(module, exports) {

	"use strict";
	module.exports = function(Promise) {
	var SomePromiseArray = Promise._SomePromiseArray;
	function any(promises) {
	    var ret = new SomePromiseArray(promises);
	    var promise = ret.promise();
	    ret.setHowMany(1);
	    ret.setUnwrap();
	    ret.init();
	    return promise;
	}

	Promise.any = function (promises) {
	    return any(promises);
	};

	Promise.prototype.any = function () {
	    return any(this);
	};

	};


/***/ },
/* 125 */
/***/ function(module, exports) {

	"use strict";
	module.exports = function(Promise, INTERNAL) {
	var PromiseReduce = Promise.reduce;
	var PromiseAll = Promise.all;

	function promiseAllThis() {
	    return PromiseAll(this);
	}

	function PromiseMapSeries(promises, fn) {
	    return PromiseReduce(promises, fn, INTERNAL, INTERNAL);
	}

	Promise.prototype.each = function (fn) {
	    return this.mapSeries(fn)
	            ._then(promiseAllThis, undefined, undefined, this, undefined);
	};

	Promise.prototype.mapSeries = function (fn) {
	    return PromiseReduce(this, fn, INTERNAL, INTERNAL);
	};

	Promise.each = function (promises, fn) {
	    return PromiseMapSeries(promises, fn)
	            ._then(promiseAllThis, undefined, undefined, promises, undefined);
	};

	Promise.mapSeries = PromiseMapSeries;
	};


/***/ },
/* 126 */
/***/ function(module, exports) {

	"use strict";
	module.exports = function(Promise, INTERNAL) {
	var PromiseMap = Promise.map;

	Promise.prototype.filter = function (fn, options) {
	    return PromiseMap(this, fn, options, INTERNAL);
	};

	Promise.filter = function (promises, fn, options) {
	    return PromiseMap(promises, fn, options, INTERNAL);
	};
	};


/***/ },
/* 127 */
/***/ function(module, exports, __webpack_require__) {

	var protodef = __webpack_require__(128);
	var termTypes = protodef.Term.TermType;
	var datumTypes = protodef.Datum.DatumType;
	var net = __webpack_require__(72);


	function createLogger(poolMaster, silent) {
	  return function(message) {
	    if (silent !== true) {
	      console.error(message);
	    }
	    poolMaster.emit('log', message);
	  }
	}
	module.exports.createLogger = createLogger;

	function isPlainObject(obj) {
	  return Object.prototype.toString.call(obj) === '[object Object]';
	}
	module.exports.isPlainObject = isPlainObject;

	function toArray(args) {
	  return Array.prototype.slice.call(args);
	}
	module.exports.toArray = toArray;

	function hasImplicit(arg) {
	  if (Array.isArray(arg)) {
	    if (arg[0] === termTypes.IMPLICIT_VAR) return true;

	    if (Array.isArray(arg[1])) {
	      for(var i=0; i<arg[1].length; i++) {
	        if (hasImplicit(arg[1][i])) return true;
	      }
	    }
	    if (isPlainObject(arg[2])) {
	      for(var key in arg[2]) {
	        if (hasImplicit(arg[2][key])) return true;
	      }
	    }
	  }
	  else if (isPlainObject(arg)) {
	    for(var key in arg) {
	      if (hasImplicit(arg[key])) return true;
	    }
	  }
	  return false;
	}
	module.exports.hasImplicit = hasImplicit;

	function loopKeys(obj, fn) {
	  var keys = Object.keys(obj);
	  var result;
	  var keysLength = keys.length;
	  for(var i=0; i<keysLength; i++) {
	    result = fn(obj, keys[i]);
	    if (result === false) return;
	  }
	}
	module.exports.loopKeys = loopKeys;

	function convertPseudotype(obj, options) {
	  var reqlType = obj['$reql_type$'];
	  if (reqlType === 'TIME' && options['timeFormat'] !== 'raw') {
	    return new Date(obj['epoch_time'] * 1000);
	  }
	  else if (reqlType === 'GROUPED_DATA' && options['groupFormat'] !== 'raw') {
	    var result = [];
	    for (var i = 0, len = obj['data'].length, ref; i < len; i++) {
	      ref = obj.data[i];
	      result.push({
	        group: ref[0],
	        reduction: ref[1]
	      });
	    }
	    return result;
	  }
	  else if (reqlType === 'BINARY' && options['binaryFormat'] !== 'raw') {
	    return new Buffer(obj['data'], 'base64');
	  }
	  return obj;
	}
	function recursivelyConvertPseudotype(obj, options) {
	  var i, value, len, key;
	  if (Array.isArray(obj)) {
	    for (i = 0, len = obj.length; i < len; i++) {
	      value = obj[i];
	      obj[i] = recursivelyConvertPseudotype(value, options);
	    }
	  }
	  else if (obj && typeof obj === 'object') {
	    for (key in obj) {
	      value = obj[key];
	      obj[key] = recursivelyConvertPseudotype(value, options);
	    }
	    obj = convertPseudotype(obj, options);
	  }
	  return obj;
	}
	function makeAtom(response, options) {
	  options = options || {};
	  return recursivelyConvertPseudotype(response.r[0], options);
	}
	module.exports.makeAtom = makeAtom;

	function makeSequence(response, options) {
	  options = options || {};
	  return recursivelyConvertPseudotype(response.r, options);
	}

	module.exports.makeSequence = makeSequence;

	function changeProto(object, other) {
	  object.__proto__ = other.__proto__;
	}
	module.exports.changeProto = changeProto;

	// Try to extract the most global address
	// Note: Mutate the input
	function getCanonicalAddress(addresses) {
	  // We suppose that the addresses are all valid, and therefore use loose regex
	  for(var i=0; i<addresses.length; i++) {
	    var addresse = addresses[i];
	    if ((/^127(\.\d{1,3}){3}$/.test(addresse.host)) || (/0?:?0?:?0?:?0?:?0?:?0?:0?:1/.test(addresse.host))) {
	      addresse.value = 0;
	    }
	    else if ((net.isIPv6(addresse.host)) && (/^[fF]|[eE]80:.*\:.*\:/.test(addresse.host))) {
	      addresse.value = 1;
	    }
	    else if (/^169\.254\.\d{1,3}\.\d{1,3}$/.test(addresse.host)) {
	      addresse.value = 2;
	    }
	    else if (/^192\.168\.\d{1,3}\.\d{1,3}$/.test(addresse.host)) {
	      addresse.value = 3;
	    }
	    else if (/^172\.(1\d|2\d|30|31)\.\d{1,3}\.\d{1,3}$/.test(addresse.host)) {
	      addresse.value = 4;
	    }
	    else if (/^10(\.\d{1,3}){3}$/.test(addresse.host)) {
	      addresse.value = 5;
	    }
	    else if ((net.isIPv6(addresse.host)) && (/^[fF]|[cCdD].*\:.*\:/.test('addresse.host'))) {
	      addresse.value = 6;
	    }
	    else {
	      addresse.value = 7;
	    }
	  }
	  var result = addresses[0];
	  var max = addresses[0].value;
	  for(var i=0; i<addresses.length; i++) {
	    if (addresses[i].value > max) {
	      result = addresses[i];
	      max = addresses[i].value;
	    }
	  }
	  return result;
	}
	module.exports.getCanonicalAddress = getCanonicalAddress;


	module.exports.localhostAliases = {
	  'localhost': true,
	  '127.0.0.1': true,
	  '::1': true
	}

	module.exports.tryCatch = function tryCatch(toTry, handleError) {
	  try{
	  toTry()
	  }
	  catch(err) {
	  handleError(err)
	  }
	}


/***/ },
/* 128 */
/***/ function(module, exports) {

	// DO NOT EDIT
	// Autogenerated by convert_protofile

	module.exports = {
		VersionDummy: {
			Version: {
				V0_1: 1063369270,
				V0_2: 1915781601,
				V0_3: 1601562686,
				V0_4: 1074539808
			},
			
			Protocol: {
				PROTOBUF: 656407617,
				JSON: 2120839367
			}
		},
		
		Query: {
			QueryType: {
				START: 1,
				CONTINUE: 2,
				STOP: 3,
				NOREPLY_WAIT: 4,
				SERVER_INFO: 5
			},
			
			AssocPair: {}
		},
		
		Frame: {
			FrameType: {
				POS: 1,
				OPT: 2
			}
		},
		
		Backtrace: {},
		
		Response: {
			ResponseType: {
				SUCCESS_ATOM: 1,
				SUCCESS_SEQUENCE: 2,
				SUCCESS_PARTIAL: 3,
				WAIT_COMPLETE: 4,
				SERVER_INFO: 5,
				CLIENT_ERROR: 16,
				COMPILE_ERROR: 17,
				RUNTIME_ERROR: 18
			},
			
			ErrorType: {
				INTERNAL: 1000000,
				RESOURCE_LIMIT: 2000000,
				QUERY_LOGIC: 3000000,
				NON_EXISTENCE: 3100000,
				OP_FAILED: 4100000,
				OP_INDETERMINATE: 4200000,
				USER: 5000000
			},
			
			ResponseNote: {
				SEQUENCE_FEED: 1,
				ATOM_FEED: 2,
				ORDER_BY_LIMIT_FEED: 3,
				UNIONED_FEED: 4,
				INCLUDES_STATES: 5
			}
		},
		
		Datum: {
			DatumType: {
				R_NULL: 1,
				R_BOOL: 2,
				R_NUM: 3,
				R_STR: 4,
				R_ARRAY: 5,
				R_OBJECT: 6,
				R_JSON: 7
			},
			
			AssocPair: {}
		},
		
		Term: {
			TermType: {
				DATUM: 1,
				MAKE_ARRAY: 2,
				MAKE_OBJ: 3,
				VAR: 10,
				JAVASCRIPT: 11,
				UUID: 169,
				HTTP: 153,
				ERROR: 12,
				IMPLICIT_VAR: 13,
				DB: 14,
				TABLE: 15,
				GET: 16,
				GET_ALL: 78,
				EQ: 17,
				NE: 18,
				LT: 19,
				LE: 20,
				GT: 21,
				GE: 22,
				NOT: 23,
				ADD: 24,
				SUB: 25,
				MUL: 26,
				DIV: 27,
				MOD: 28,
				FLOOR: 183,
				CEIL: 184,
				ROUND: 185,
				APPEND: 29,
				PREPEND: 80,
				DIFFERENCE: 95,
				SET_INSERT: 88,
				SET_INTERSECTION: 89,
				SET_UNION: 90,
				SET_DIFFERENCE: 91,
				SLICE: 30,
				SKIP: 70,
				LIMIT: 71,
				OFFSETS_OF: 87,
				CONTAINS: 93,
				GET_FIELD: 31,
				KEYS: 94,
				VALUES: 186,
				OBJECT: 143,
				HAS_FIELDS: 32,
				WITH_FIELDS: 96,
				PLUCK: 33,
				WITHOUT: 34,
				MERGE: 35,
				BETWEEN_DEPRECATED: 36,
				BETWEEN: 182,
				REDUCE: 37,
				MAP: 38,
				FILTER: 39,
				CONCAT_MAP: 40,
				ORDER_BY: 41,
				DISTINCT: 42,
				COUNT: 43,
				IS_EMPTY: 86,
				UNION: 44,
				NTH: 45,
				BRACKET: 170,
				INNER_JOIN: 48,
				OUTER_JOIN: 49,
				EQ_JOIN: 50,
				ZIP: 72,
				RANGE: 173,
				INSERT_AT: 82,
				DELETE_AT: 83,
				CHANGE_AT: 84,
				SPLICE_AT: 85,
				COERCE_TO: 51,
				TYPE_OF: 52,
				UPDATE: 53,
				DELETE: 54,
				REPLACE: 55,
				INSERT: 56,
				DB_CREATE: 57,
				DB_DROP: 58,
				DB_LIST: 59,
				TABLE_CREATE: 60,
				TABLE_DROP: 61,
				TABLE_LIST: 62,
				CONFIG: 174,
				STATUS: 175,
				WAIT: 177,
				RECONFIGURE: 176,
				REBALANCE: 179,
				SYNC: 138,
				INDEX_CREATE: 75,
				INDEX_DROP: 76,
				INDEX_LIST: 77,
				INDEX_STATUS: 139,
				INDEX_WAIT: 140,
				INDEX_RENAME: 156,
				FUNCALL: 64,
				BRANCH: 65,
				OR: 66,
				AND: 67,
				FOR_EACH: 68,
				FUNC: 69,
				ASC: 73,
				DESC: 74,
				INFO: 79,
				MATCH: 97,
				UPCASE: 141,
				DOWNCASE: 142,
				SAMPLE: 81,
				DEFAULT: 92,
				JSON: 98,
				TO_JSON_STRING: 172,
				ISO8601: 99,
				TO_ISO8601: 100,
				EPOCH_TIME: 101,
				TO_EPOCH_TIME: 102,
				NOW: 103,
				IN_TIMEZONE: 104,
				DURING: 105,
				DATE: 106,
				TIME_OF_DAY: 126,
				TIMEZONE: 127,
				YEAR: 128,
				MONTH: 129,
				DAY: 130,
				DAY_OF_WEEK: 131,
				DAY_OF_YEAR: 132,
				HOURS: 133,
				MINUTES: 134,
				SECONDS: 135,
				TIME: 136,
				MONDAY: 107,
				TUESDAY: 108,
				WEDNESDAY: 109,
				THURSDAY: 110,
				FRIDAY: 111,
				SATURDAY: 112,
				SUNDAY: 113,
				JANUARY: 114,
				FEBRUARY: 115,
				MARCH: 116,
				APRIL: 117,
				MAY: 118,
				JUNE: 119,
				JULY: 120,
				AUGUST: 121,
				SEPTEMBER: 122,
				OCTOBER: 123,
				NOVEMBER: 124,
				DECEMBER: 125,
				LITERAL: 137,
				GROUP: 144,
				SUM: 145,
				AVG: 146,
				MIN: 147,
				MAX: 148,
				SPLIT: 149,
				UNGROUP: 150,
				RANDOM: 151,
				CHANGES: 152,
				ARGS: 154,
				BINARY: 155,
				GEOJSON: 157,
				TO_GEOJSON: 158,
				POINT: 159,
				LINE: 160,
				POLYGON: 161,
				DISTANCE: 162,
				INTERSECTS: 163,
				INCLUDES: 164,
				CIRCLE: 165,
				GET_INTERSECTING: 166,
				FILL: 167,
				GET_NEAREST: 168,
				POLYGON_SUB: 171,
				MINVAL: 180,
				MAXVAL: 181
			},
			
			AssocPair: {}
		}
	}


/***/ },
/* 129 */
/***/ function(module, exports, __webpack_require__) {

	var net = __webpack_require__(72);
	var tls = __webpack_require__(130);
	var Promise = __webpack_require__(91);
	var events = __webpack_require__(79);
	var util = __webpack_require__(9);

	var helper = __webpack_require__(127);
	var Err = __webpack_require__(131);
	var Cursor = __webpack_require__(132);
	var ReadableStream = __webpack_require__(133);
	var Metadata = __webpack_require__(134);

	var protodef = __webpack_require__(128);
	var responseTypes = protodef.Response.ResponseType;

	function Connection(r, options, resolve, reject) {
	  var self = this;
	  this.r = r;

	  // Set default options - We have to save them in case the user tries to reconnect
	  if (!helper.isPlainObject(options)) options = {};
	  this.host = options.host || r._host;
	  this.port = options.port || r._port;
	  this.authKey = options.authKey || r._authKey;
	  this.timeoutConnect = options.timeout || r._timeoutConnect; // period in *seconds* for the connection to be opened

	  if (options.db) this.db = options.db; // Pass to each query

	  this.token = 1;
	  this.buffer = new Buffer(0);

	  this.metadata = {}

	  this.open = false; // true only if the user can write on the socket
	  this.timeout = null;

	  if (options.connection) {
	    this.connection = options.connection;
	  }
	  else {
	    var family = 'IPv4';
	    if (net.isIPv6(self.host)) {
	      family = 'IPv6';
	    }

	    var connectionArgs = {
	      host: self.host,
	      port: self.port,
	      family: family
	    }

	    var tlsOptions = options.ssl || false;
	    if (tlsOptions === false) {
	      self.connection = net.connect(connectionArgs);
	    } else {
	      if (helper.isPlainObject(tlsOptions)) {
	        // Copy the TLS options in connectionArgs
	        helper.loopKeys(tlsOptions, function(tlsOptions, key) {
	          connectionArgs[key] = tlsOptions[key];
	        });
	      }
	      self.connection = tls.connect(connectionArgs);
	    }
	  }

	  self.connection.setKeepAlive(true);

	  self.timeoutOpen = setTimeout(function() {
	    self.connection.end(); // Send a FIN packet
	    reject(new Err.ReqlDriverError('Failed to connect to '+self.host+':'+self.port+' in less than '+self.timeoutConnect+'s').setOperational());
	  }, self.timeoutConnect*1000);

	  self.connection.on('end', function(error) {
	    // We emit end or close just once
	    self.connection.removeAllListeners();
	    self.open = false;
	    self.emit('end');
	    // We got a FIN packet, so we'll just flush
	    self._flush();
	  });
	  self.connection.on('close', function(error) {
	    // We emit end or close just once
	    clearTimeout(self.timeoutOpen)
	    self.connection.removeAllListeners();
	    self.open = false;
	    self.emit('closed');
	    // The connection is fully closed, flush (in case 'end' was not triggered)
	    self._flush();
	  });
	  self.connection.setNoDelay();
	  self.connection.once('error', function(error) {
	    reject(new Err.ReqlDriverError('Failed to connect to '+self.host+':'+self.port+'\nFull error:\n'+JSON.stringify(error)).setOperational());
	  });
	  self.connection.on('connect', function() {
	    self.connection.removeAllListeners('error');
	    self.connection.on('error', function(error) {
	      self.emit('error', error);
	    });

	    var initBuffer = new Buffer(4)
	    initBuffer.writeUInt32LE(protodef.VersionDummy.Version.V0_4, 0)

	    var authBuffer = new Buffer(self.authKey, 'ascii')
	    var lengthBuffer = new Buffer(4);
	    lengthBuffer.writeUInt32LE(authBuffer.length, 0)

	    var protocolBuffer = new Buffer(4)
	    protocolBuffer.writeUInt32LE(protodef.VersionDummy.Protocol.JSON, 0)
	    helper.tryCatch(function() {
	      self.connection.write(Buffer.concat([initBuffer, lengthBuffer, authBuffer, protocolBuffer]));
	    }, function(err) {
	      // The TCP connection is open, but the ReQL connection wasn't established.
	      // We can just abort the whole thing
	      self.open = false;
	      reject(new Err.ReqlDriverError('Failed to perform handshake with '+self.host+':'+self.port));
	    });
	  });
	  self.connection.once('end', function() {
	    self.open = false;
	  });

	  self.connection.on('data', function(buffer) {
	    self.buffer = Buffer.concat([self.buffer, buffer]);

	    if (self.open == false) {
	      for(var i=0; i<self.buffer.length; i++) {
	        if (buffer[i] === 0) {
	          clearTimeout(self.timeoutOpen)
	          var connectionStatus = buffer.slice(0, i).toString();
	          if (connectionStatus === 'SUCCESS') {
	            self.open = true;
	            resolve(self);
	          }
	          else {
	            reject(new Err.ReqlDriverError('Server dropped connection with message: \''+connectionStatus+'\''));
	          }
	          self.buffer = buffer.slice(i+1);
	          break;
	        }
	      }
	      self.connection.removeAllListeners('error');
	      self.connection.on('error', function(e) {
	        self.open = false;
	      });
	    }
	    else {
	      while(self.buffer.length >= 12) {
	        var token = self.buffer.readUInt32LE(0) + 0x100000000 * self.buffer.readUInt32LE(4);
	        var responseLength = self.buffer.readUInt32LE(8);

	        if (self.buffer.length < 12+responseLength) break;

	        var responseBuffer = self.buffer.slice(12, 12+responseLength);
	        var response = JSON.parse(responseBuffer);

	        self._processResponse(response, token);

	        self.buffer = self.buffer.slice(12+responseLength);
	      }
	    }
	  });

	  self.connection.on('timeout', function(buffer) {
	    self.connection.open = false;
	    self.emit('timeout');
	  })
	  self.connection.toJSON = function() { // We want people to be able to jsonify a cursor
	    return '"A socket object cannot be converted to JSON due to circular references."'
	  }
	}

	util.inherits(Connection, events.EventEmitter);

	Connection.prototype._processResponse = function(response, token) {
	  //console.log('Connection.prototype._processResponse: '+token);
	  //console.log(JSON.stringify(response, null, 2));
	  var self = this;

	  var type = response.t;
	  var result;
	  var cursor;
	  var stream;
	  var currentResolve, currentReject;
	  var datum;
	  var options;

	  if (type === responseTypes.COMPILE_ERROR) {
	    self.emit('release');
	    if (typeof self.metadata[token].reject === 'function') {
	      self.metadata[token].reject(new Err.ReqlCompileError(helper.makeAtom(response), self.metadata[token].query, response));
	    }

	    delete self.metadata[token]
	  }
	  else if (type === responseTypes.CLIENT_ERROR) {
	    self.emit('release');

	    if (typeof self.metadata[token].reject === 'function') {
	      currentResolve = self.metadata[token].resolve;
	      currentReject = self.metadata[token].reject;
	      self.metadata[token].removeCallbacks();
	      currentReject(new Err.ReqlClientError(helper.makeAtom(response), self.metadata[token].query, response));
	      if (typeof self.metadata[token].endReject !== 'function') {
	        // No pending STOP query, we can delete
	        delete self.metadata[token]
	      }
	    }
	    else if (typeof self.metadata[token].endResolve === 'function') {
	      currentResolve = self.metadata[token].endResolve;
	      currentReject = self.metadata[token].endReject;
	      self.metadata[token].removeEndCallbacks();
	      currentReject(new Err.ReqlClientError(helper.makeAtom(response), self.metadata[token].query, response));
	      delete self.metadata[token]
	    }
	    else if (token === -1) { // This should not happen now since 1.13 took the token out of the query
	      var error = new Err.ReqlClientError(helper.makeAtom(response)+'\nClosing all outstanding queries...');
	      self.emit('error', error);
	      // We don't want a function to yield forever, so we just reject everything
	      helper.loopKeys(self.rejectMap, function(rejectMap, key) {
	        rejectMap[key](error);
	      });
	      self.close();
	      delete self.metadata[token]
	    }
	  }
	  else if (type === responseTypes.RUNTIME_ERROR) {
	    self.emit('release');
	    if (typeof self.metadata[token].reject === 'function') {
	    }

	    if (typeof self.metadata[token].reject === 'function') {
	      currentResolve = self.metadata[token].resolve;
	      currentReject = self.metadata[token].reject;
	      self.metadata[token].removeCallbacks();
	      var error = new Err.ReqlRuntimeError(helper.makeAtom(response), self.metadata[token].query, response);
	      error.setName(response.e);
	      currentReject(error);
	      if (typeof self.metadata[token].endReject !== 'function') {
	        // No pending STOP query, we can delete
	        delete self.metadata[token]
	      }
	    }
	    else if (typeof self.metadata[token].endResolve === 'function') {
	      currentResolve = self.metadata[token].endResolve;
	      currentReject = self.metadata[token].endReject;
	      self.metadata[token].removeEndCallbacks();
	      currentReject(new Err.ReqlRuntimeError(helper.makeAtom(response), self.metadata[token].query, response));
	      delete self.metadata[token]
	    }
	  }
	  else if (type === responseTypes.SUCCESS_ATOM) {
	    self.emit('release');
	    // self.metadata[token].resolve is always a function
	    datum = helper.makeAtom(response, self.metadata[token].options);

	    if ((Array.isArray(datum)) &&
	        ((self.metadata[token].options.cursor === true) || ((self.metadata[token].options.cursor === undefined) && (self.r._options.cursor === true)))) {
	      cursor = new Cursor(self, token, self.metadata[token].options, 'cursor');
	      if (self.metadata[token].options.profile === true) {
	        self.metadata[token].resolve({
	          profile: response.p,
	          result: cursor
	        });
	      }
	      else {
	        self.metadata[token].resolve(cursor);
	      }

	      cursor._push({done: true, response: { r: datum }});
	    }
	    else if ((Array.isArray(datum)) &&
	        ((self.metadata[token].options.stream === true || self.r._options.stream === true))) {
	      cursor = new Cursor(self, token, self.metadata[token].options, 'cursor');
	      stream = new ReadableStream({}, cursor);
	      if (self.metadata[token].options.profile === true) {
	        self.metadata[token].resolve({
	          profile: response.p,
	          result: stream 
	        });
	      }
	      else {
	        self.metadata[token].resolve(stream);
	      }

	      cursor._push({done: true, response: { r: datum }});

	    }
	    else {
	      if (self.metadata[token].options.profile === true) {
	        result = {
	          profile: response.p,
	          result: cursor || datum
	        }
	      }
	      else {
	        result = datum;
	      }
	      self.metadata[token].resolve(result);
	    }

	    delete self.metadata[token];
	  }
	  else if (type === responseTypes.SUCCESS_PARTIAL) {
	    // We save the current resolve function because we are going to call cursor._fetch before resuming the user's yield
	    var done = false;
	    if (typeof self.metadata[token].resolve !== 'function') {
	      // According to issues/190, we can get a SUCESS_COMPLETE followed by a
	      // SUCCESS_PARTIAL when closing an feed. So resolve/reject will be undefined
	      // in this case.
	      currentResolve = self.metadata[token].endResolve;
	      currentReject = self.metadata[token].endReject;
	      if (typeof currentResolve === 'function') {
	        done = true;
	      }
	    }
	    else {
	      currentResolve = self.metadata[token].resolve;
	      currentReject = self.metadata[token].reject;
	    }

	    // We need to delete before calling cursor._push
	    self.metadata[token].removeCallbacks();

	    if (!self.metadata[token].cursor) { //No cursor, let's create one
	      self.metadata[token].cursor = true;

	      var typeResult = 'Cursor';
	      var includesStates = false;;
	      if (Array.isArray(response.n)) {
	        for(var i=0; i<response.n.length; i++) {
	          if (response.n[i] === protodef.Response.ResponseNote.SEQUENCE_FEED) {
	            typeResult = 'Feed';
	          }
	          else if (response.n[i] === protodef.Response.ResponseNote.ATOM_FEED) {
	            typeResult = 'AtomFeed';
	          }
	          else if (response.n[i] === protodef.Response.ResponseNote.ORDER_BY_LIMIT_FEED) {
	            typeResult = 'OrderByLimitFeed';
	          }
	          else if (response.n[i] === protodef.Response.ResponseNote.UNIONED_FEED) {
	            typeResult = 'UnionedFeed';
	          }
	          else if (response.n[i] === protodef.Response.ResponseNote.INCLUDES_STATES) {
	            includesStates = true;
	          }
	          else {
	            currentReject(new Err.ReqlDriverError('Unknown ResponseNote '+response.n[i]+', the driver is probably out of date.'));
	            return;
	          }
	        }
	      }
	      cursor = new Cursor(self, token, self.metadata[token].options, typeResult);
	      if (includesStates === true) {
	        cursor.setIncludesStates();
	      }
	      if ((self.metadata[token].options.cursor === true) || ((self.metadata[token].options.cursor === undefined) && (self.r._options.cursor === true))) {
	        // Return a cursor
	        if (self.metadata[token].options.profile === true) {
	          currentResolve({
	            profile: response.p,
	            result: cursor
	          });
	        }
	        else {
	          currentResolve(cursor);
	        }
	      }
	      else if ((self.metadata[token].options.stream === true || self.r._options.stream === true)) {
	        stream = new ReadableStream({}, cursor);
	        if (self.metadata[token].options.profile === true) {
	          currentResolve({
	            profile: response.p,
	            result: stream 
	          });
	        }
	        else {
	          currentResolve(stream);
	        }
	      }
	      else if (typeResult !== 'Cursor') {
	        // Return a feed
	        if (self.metadata[token].options.profile === true) {
	          currentResolve({
	            profile: response.p,
	            result: cursor
	          });
	        }
	        else {
	          currentResolve(cursor);
	        }
	      }
	      else {
	        // When we get SUCCESS_SEQUENCE, we will delete self.metadata[token].options
	        // So we keep a reference of it here
	        options = self.metadata[token].options;

	        // Fetch everything and return an array
	        cursor.toArray().then(function(result) {
	          if (options.profile === true) {
	            currentResolve({
	              profile: response.p,
	              result: result
	            });
	          }
	          else {
	            currentResolve(result);
	          }
	        }).error(currentReject)
	      }
	      cursor._push({done: false, response: response});
	    }
	    else { // That was a continue query
	      currentResolve({done: done, response: response});
	    }
	  }
	  else if (type === responseTypes.SUCCESS_SEQUENCE) {
	    self.emit('release');

	    if (typeof self.metadata[token].resolve === 'function') {
	      currentResolve = self.metadata[token].resolve;
	      currentReject = self.metadata[token].reject;
	      self.metadata[token].removeCallbacks();
	    }
	    else if (typeof self.metadata[token].endResolve === 'function') {
	      currentResolve = self.metadata[token].endResolve;
	      currentReject = self.metadata[token].endReject;
	      self.metadata[token].removeEndCallbacks();
	    }

	    if (!self.metadata[token].cursor) { // No cursor, let's create one
	      cursor = new Cursor(self, token, self.metadata[token].options, 'Cursor');

	      if ((self.metadata[token].options.cursor === true) || ((self.metadata[token].options.cursor === undefined) && (self.r._options.cursor === true))) {
	        if (self.metadata[token].options.profile === true) {
	          currentResolve({
	            profile: response.p,
	            result: cursor
	          });
	        }
	        else {
	          currentResolve(cursor);
	        }

	        // We need to keep the options in the else statement, so we clean it inside the if/else blocks
	        if (typeof self.metadata[token].endResolve !== 'function') {
	          delete self.metadata[token];
	        }
	      }
	      else if ((self.metadata[token].options.stream === true || self.r._options.stream === true)) {
	        stream = new ReadableStream({}, cursor);
	        if (self.metadata[token].options.profile === true) {
	          currentResolve({
	            profile: response.p,
	            result: stream
	          });
	        }
	        else {
	          currentResolve(stream);
	        }

	        // We need to keep the options in the else statement,
	        // so we clean it inside the if/else blocks (the one looking 
	        // if a cursor was already created)
	        if (typeof self.metadata[token].endResolve !== 'function') {
	          // We do not want to delete the metadata if there is an END query waiting
	          delete self.metadata[token];
	        }

	      }
	      else {
	        cursor.toArray().then(function(result) {
	          if (self.metadata[token].options.profile === true) {
	            currentResolve({
	              profile: response.p,
	              result: result
	            });
	          }
	          else {
	            currentResolve(result);
	          }
	          if (typeof self.metadata[token].endResolve !== 'function') {
	            delete self.metadata[token];
	          }

	        }).error(currentReject)
	      }
	      done = true;
	      cursor._push({done: true, response: response});
	    }
	    else { // That was a continue query
	      // If there is a pending STOP query we do not want to close the cursor yet
	      done = true;
	      if (typeof self.metadata[token].endResolve === 'function') {
	        done = false;
	      }
	      currentResolve({done: done, response: response});
	    }
	  }
	  else if (type === responseTypes.WAIT_COMPLETE) {
	    self.emit('release');
	    self.metadata[token].resolve();

	    delete self.metadata[token];
	  }
	  else if (type === responseTypes.SERVER_INFO) {
	    self.emit('release');
	    datum = helper.makeAtom(response, self.metadata[token].options);
	    self.metadata[token].resolve(datum);
	    delete self.metadata[token];
	  }
	}

	Connection.prototype.reconnect = function(options, callback) {
	  var self = this;

	  if (typeof options === 'function') {
	    callback = options;
	    options = {};
	  }

	  if (!helper.isPlainObject(options)) options = {};

	  if (options.noreplyWait === true) {
	    var p = new Promise(function(resolve, reject) {
	      self.close(options).then(function() {
	        self.r.connect({
	          host: self.host,
	          port: self.port,
	          authKey: self.authKey,
	          db: self.db
	        }).then(function(c) {
	          resolve(c);
	        }).error(function(e) {
	          reject(e);
	        });
	      }).error(function(e) {
	        reject(e)
	      })
	    }).nodeify(callback);
	  }
	  else {
	    return self.r.connect({
	      host: self.host,
	      port: self.port,
	      authKey: self.authKey,
	      db: self.db
	    }, callback);
	  }

	  return p;
	}

	Connection.prototype._send = function(query, token, resolve, reject, originalQuery, options, end) {
	  //console.log('Connection.prototype._send: '+token);
	  //console.log(JSON.stringify(query, null, 2));

	  var self = this;
	  if (self.open === false) {
	    var err = new Err.ReqlDriverError('The connection was closed by the other party');
	    err.setOperational();
	    reject(err);
	    return;
	  }

	  var queryStr = JSON.stringify(query);
	  var querySize = Buffer.byteLength(queryStr);

	  var buffer = new Buffer(8+4+querySize);
	  buffer.writeUInt32LE(token & 0xFFFFFFFF, 0)
	  buffer.writeUInt32LE(Math.floor(token / 0xFFFFFFFF), 4)

	  buffer.writeUInt32LE(querySize, 8);

	  buffer.write(queryStr, 12);

	  // noreply instead of noReply because the otpions are translated for the server
	  if ((!helper.isPlainObject(options)) || (options.noreply != true)) {
	    if (!self.metadata[token]) {
	      self.metadata[token] = new Metadata(resolve, reject, originalQuery, options);
	    }
	    else if (end === true) {
	      self.metadata[token].setEnd(resolve, reject);
	    }
	    else {
	      self.metadata[token].setCallbacks(resolve, reject);
	    }
	  }
	  else {
	    if (typeof resolve === 'function') resolve();
	    this.emit('release');
	  }

	  // This will emit an error if the connection is closed
	  helper.tryCatch(function() {
	    self.connection.write(buffer);
	  }, function(err) {
	    self.metadata[token].reject(err);
	    delete self.metadata[token]
	  });

	};

	Connection.prototype._continue = function(token, resolve, reject) {
	  var query = [protodef.Query.QueryType.CONTINUE];
	  this._send(query, token, resolve, reject);
	}
	Connection.prototype._end = function(token, resolve, reject) {
	  var query = [protodef.Query.QueryType.STOP];
	  this._send(query, token, resolve, reject, undefined, undefined, true);
	}


	Connection.prototype.use = function(db) {
	  if (typeof db !== 'string') throw new Err.ReqlDriverError('First argument of `use` must be a string')
	  this.db = db;
	}

	Connection.prototype.server = function(callback) {
	  var self = this;
	  return new Promise(function(resolve, reject) {
	    var query = [protodef.Query.QueryType.SERVER_INFO];
	    self._send(query, self._getToken(), resolve, reject, undefined, undefined, true);
	  }).nodeify(callback);
	}

	// Return the next token and update it.
	Connection.prototype._getToken = function() {
	  return this.token++;
	}

	Connection.prototype.close = function(options, callback) {
	  if (typeof options === 'function') {
	    callback = options;
	    options = {};
	  }
	  var self = this;

	  var p = new Promise(function(resolve, reject) {
	    if (!helper.isPlainObject(options)) options = {};
	    if (options.noreplyWait === true) {
	      self.noreplyWait().then(function(r) {
	        self.open = false;
	        self.connection.end()
	        resolve(r);
	      }).error(function(e) {
	        reject(e)
	      });
	    }
	    else{
	      self.open = false;
	      self.connection.end();
	      resolve();
	    }
	  }).nodeify(callback);
	  return p;
	};


	Connection.prototype.noReplyWait = function() {
	  throw new Err.ReqlDriverError('Did you mean to use `noreplyWait` instead of `noReplyWait`?')
	}
	Connection.prototype.noreplyWait = function(callback) {
	  var self = this;
	  var token = self._getToken();

	  var p = new Promise(function(resolve, reject) {
	    var query = [protodef.Query.QueryType.NOREPLY_WAIT];

	    self._send(query, token, resolve, reject);
	  }).nodeify(callback);
	  return p;
	}
	Connection.prototype._isConnection = function() {
	  return true;
	}
	Connection.prototype._isOpen = function() {
	  return this.open;
	}

	Connection.prototype._flush = function() {
	  helper.loopKeys(this.metadata, function(metadata, key) {
	    if (typeof metadata[key].reject === 'function') {
	      metadata[key].reject(new Err.ReqlServerError(
	            'The connection was closed before the query could be completed.',
	            metadata[key].query));
	    }
	    if (typeof metadata[key].endReject === 'function') {
	      metadata[key].endReject(new Err.ReqlServerError(
	            'The connection was closed before the query could be completed.',
	            metadata[key].query));
	    }
	  });
	  this.metadata = {};
	}

	module.exports = Connection


/***/ },
/* 130 */
/***/ function(module, exports) {

	module.exports = require("tls");

/***/ },
/* 131 */
/***/ function(module, exports, __webpack_require__) {

	var helper = __webpack_require__(127);
	var INDENT = 4;
	var LIMIT = 80;
	var IS_OPERATIONAL = 'isOperational';

	var protodef = __webpack_require__(128);
	var responseTypes = protodef.Response.ResponseType;
	var protoErrorType = protodef.Response.ErrorType;
	var termTypes = protodef.Term.TermType;
	var datumTypes = protodef.Datum.DatumType;
	var frameTypes = protodef.Frame.FrameType;


	function ReqlDriverError(message, query, secondMessage) {
	  Error.captureStackTrace(this, ReqlDriverError);
	  this.message = message;
	  if ((Array.isArray(query) && (query.length > 0)) || (!Array.isArray(query) && query != null)) {
	    if ((this.message.length > 0) && (this.message[this.message.length-1] === '.')) {
	      this.message = this.message.slice(0, this.message.length-1);
	    }

	    this.message += ' after:\n';

	    var backtrace = generateBacktrace(query, 0, null, [], {indent: 0, extra: 0});

	    this.message += backtrace.str;
	  }
	  else {
	    if (this.message[this.message.length-1] !== '?') this.message += '.';
	  }
	  if (secondMessage) this.message += '\n'+secondMessage;
	};
	ReqlDriverError.prototype = new Error();
	ReqlDriverError.prototype.name = 'ReqlDriverError';
	ReqlDriverError.prototype.setOperational = function() {
	  this[IS_OPERATIONAL] = true;
	  return this;
	};

	module.exports.ReqlDriverError = ReqlDriverError;


	function ReqlServerError(message, query) {
	  Error.captureStackTrace(this, ReqlServerError);
	  this.message = message;

	  if ((Array.isArray(query) && (query.length > 0)) || (!Array.isArray(query) && query != null)) {
	    if ((this.message.length > 0) && (this.message[this.message.length-1] === '.')) {
	      this.message = this.message.slice(0, this.message.length-1);
	    }

	    this.message += ' for:\n';

	    var backtrace = generateBacktrace(query, 0, null, [], {indent: 0, extra: 0});

	    this.message += backtrace.str;
	  }
	  else {
	    if (this.message[this.message.length-1] !== '?') this.message += '.';
	  }
	};
	ReqlServerError.prototype = new Error();
	ReqlServerError.prototype.name = 'ReqlServerError';
	ReqlServerError.prototype[IS_OPERATIONAL] = true;

	module.exports.ReqlServerError = ReqlServerError;


	function ReqlRuntimeError(message, query, frames) {
	  Error.captureStackTrace(this, ReqlRuntimeError);
	  this.message = message;

	  if ((query != null) && (frames)) {
	    if ((this.message.length > 0) && (this.message[this.message.length-1] === '.')) {
	      this.message = this.message.slice(0, this.message.length-1);
	    }
	    this.message += ' in:\n';

	    frames = frames.b;
	    if (frames) this.frames = frames.slice(0);
	    //this.frames = JSON.stringify(frames, null, 2);

	    var backtrace = generateBacktrace(query, 0, null, frames, {indent: 0, extra: 0});

	    var queryLines = backtrace.str.split('\n');
	    var carrotLines = backtrace.car.split('\n');

	    for(var i=0; i<queryLines.length; i++) {
	      this.message += queryLines[i]+'\n';
	      if (carrotLines[i].match(/\^/)) {
	        var pos = queryLines[i].match(/[^\s]/);
	        if ((pos) && (pos.index)) {
	          this.message += space(pos.index)+carrotLines[i].slice(pos.index)+'\n';
	        }
	        else {
	          this.message += carrotLines[i]+'\n';
	        }
	      }
	    }
	  }
	  //this.query = JSON.stringify(query, null, 2);
	};
	ReqlRuntimeError.prototype = new Error();
	ReqlRuntimeError.prototype.name = 'ReqlRuntimeError';
	ReqlRuntimeError.prototype.setName = function(type) {
	  switch(type) {
	    case protoErrorType.INTERNAL:
	      this.name = 'ReqlInternalError';
	      break;
	    case protoErrorType.RESOURCE_LIMIT:
	      this.name = 'ReqlResourceError';
	      break;
	    case protoErrorType.QUERY_LOGIC:
	      this.name = 'ReqlLogicError';
	      break;
	    case protoErrorType.OP_FAILED:
	      this.name = 'ReqlOpFailedError';
	      break;
	    case protoErrorType.OP_INDETERMINATE:
	      this.name = 'ReqlOpIndeterminateError';
	      break;
	    case protoErrorType.USER:
	      this.name = 'ReqlUserError';
	      break;
	    //default: // Do nothing
	  }
	}
	ReqlRuntimeError.prototype[IS_OPERATIONAL] = true;

	module.exports.ReqlRuntimeError = ReqlRuntimeError;


	function ReqlCompileError(message, query, frames) {
	  Error.captureStackTrace(this, ReqlCompileError);
	  this.message = message;

	  if ((query != null) && (frames)) {
	    if ((this.message.length > 0) && (this.message[this.message.length-1] === '.')) {
	      this.message = this.message.slice(0, this.message.length-1);
	    }

	    this.message += ' in:\n';

	    frames = frames.b;
	    if (frames) this.frames = frames.slice(0);
	    //this.frames = JSON.stringify(frames, null, 2);

	    var backtrace = generateBacktrace(query, 0, null, frames, {indent: 0, extra: 0});

	    var queryLines = backtrace.str.split('\n');
	    var carrotLines = backtrace.car.split('\n');

	    for(var i=0; i<queryLines.length; i++) {
	      this.message += queryLines[i]+'\n';
	      if (carrotLines[i].match(/\^/)) {
	        var pos = queryLines[i].match(/[^\s]/);
	        if ((pos) && (pos.index)) {
	          this.message += space(pos.index)+carrotLines[i].slice(pos.index)+'\n';
	        }
	        else {
	          this.message += carrotLines[i]+'\n';
	        }
	      }
	    }
	  }
	};
	ReqlCompileError.prototype = new Error();
	ReqlCompileError.prototype.name = 'ReqlCompileError';
	ReqlCompileError.prototype[IS_OPERATIONAL] = true;

	module.exports.ReqlCompileError = ReqlCompileError;


	function ReqlClientError(message) {
	  Error.captureStackTrace(this, ReqlClientError);
	  this.message = message;
	};
	ReqlClientError.prototype = new Error();
	ReqlClientError.prototype.name = 'ReqlClientError';
	ReqlClientError.prototype[IS_OPERATIONAL] = true;

	module.exports.ReqlClientError = ReqlClientError;



	var _constants = {
	  MONDAY: true,
	  TUESDAY: true,
	  WEDNESDAY: true,
	  THURSDAY: true,
	  FRIDAY: true,
	  SATURDAY: true,
	  SUNDAY: true,
	  JANUARY: true,
	  FEBRUARY: true,
	  MARCH: true,
	  APRIL: true,
	  MAY: true,
	  JUNE: true,
	  JULY: true,
	  AUGUST: true,
	  SEPTEMBER: true,
	  OCTOBER: true,
	  NOVEMBER: true,
	  DECEMBER: true,
	  MINVAL: true,
	  MAXVAL: true,
	}
	var constants = {};
	for(var key in _constants) {
	  constants[termTypes[key]] = true;
	}


	var _nonPrefix = {
	  DB: true,
	  DB_CREATE: true,
	  DB_LIST: true,
	  DB_DROP: true,
	  JS: true,
	  NOW: true,
	  TIME: true,
	  EPOCH_TIME: true,
	  ISO8601: true,
	  BRANCH: true,
	  JAVASCRIPT: true,
	  ERROR: true,
	  MAKE_ARRAY: true,
	  JSON: true,
	  ARGS: true,
	  HTTP: true,
	  RANDOM: true,
	  BINARY: true,
	  OBJECT: true,
	  CIRCLE: true,
	  GEOJSON: true,
	  POINT: true,
	  LINE: true,
	  POLYGON: true,
	  UUID: true,
	  DESC: true,
	  ASC: true,
	  RANGE: true,
	  LITERAL: 'true'
	}
	var nonPrefix = {};
	for(var key in _nonPrefix) {
	  nonPrefix[termTypes[key]] = true;
	}
	// Constants are also in nonPrefix
	for(var key in _constants) {
	  nonPrefix[termTypes[key]] = true;
	}


	var _typeToString = {
	  DB: 'db',
	  DB_CREATE: 'dbCreate',
	  DB_LIST: 'dbList',
	  DB_DROP: 'dbDrop',
	  TABLE_CREATE: 'tableCreate',
	  TABLE_LIST: 'tableList',
	  TABLE_DROP: 'tableDrop',
	  TABLE: 'table',
	  INDEX_CREATE: 'indexCreate',
	  INDEX_DROP: 'indexDrop',
	  INDEX_LIST: 'indexList',
	  INDEX_WAIT: 'indexWait',
	  INDEX_STATUS: 'indexStatus',
	  INSERT: 'insert',
	  UPDATE: 'update',
	  REPLACE: 'replace',
	  DELETE: 'delete',
	  SYNC: 'sync',
	  GET: 'get',
	  GET_ALL: 'getAll',
	  BETWEEN: 'between',
	  FILTER: 'filter',
	  INNER_JOIN: 'innerJoin',
	  OUTER_JOIN: 'outerJoin',
	  EQ_JOIN: 'eqJoin',
	  ZIP: 'zip',
	  MAP: 'map',
	  WITH_FIELDS: 'withFields',
	  CONCAT_MAP: 'concatMap',
	  ORDER_BY: 'orderBy',
	  DESC: 'desc',
	  ASC: 'asc',
	  SKIP: 'skip',
	  LIMIT: 'limit',
	  SLICE: 'slice',
	  NTH: 'nth',
	  OFFSETS_OF: 'offsetsOf',
	  IS_EMPTY: 'isEmpty',
	  UNION: 'union',
	  SAMPLE: 'sample',
	  REDUCE: 'reduce',
	  COUNT: 'count',
	  SUM: 'sum',
	  AVG: 'avg',
	  MIN: 'min',
	  MAX: 'max',
	  OBJECT: 'object',
	  DISTINCT: 'distinct',
	  GROUP: 'group',
	  UNGROUP: 'ungroup',
	  CONTAINS: 'contains',
	  IMPLICIT_VAR: 'row',
	  PLUCK: 'pluck',
	  WITHOUT: 'without',
	  MERGE: 'merge',
	  APPEND: 'append',
	  PREPEND: 'prepend',
	  DIFFERENCE: 'difference',
	  SET_INSERT: 'setInsert',
	  SET_UNION: 'setUnion',
	  SET_INTERSECTION: 'setIntersection',
	  SET_DIFFERENCE: 'setDifference',
	  HAS_FIELDS: 'hasFields',
	  INSERT_AT: 'insertAt',
	  SPLICE_AT: 'spliceAt',
	  DELETE_AT: 'deleteAt',
	  CHANGE_AT: 'changeAt',
	  KEYS: 'keys',
	  VALUES: 'values',
	  MATCH: 'match',
	  UPCASE: 'upcase',
	  DOWNCASE: 'downcase',
	  ADD: 'add',
	  SUB: 'sub',
	  MUL: 'mul',
	  DIV: 'div',
	  MOD: 'mod',
	  AND: 'and',
	  OR: 'or',
	  EQ: 'eq',
	  NE: 'ne',
	  GT: 'gt',
	  GE: 'ge',
	  LT: 'lt',
	  LE: 'le',
	  NOT: 'not',
	  FLOOR: 'floor',
	  CEIL: 'ceil',
	  ROUND: 'round',
	  NOW: 'now',
	  TIME: 'time',
	  EPOCH_TIME: 'epochTime',
	  ISO8601: 'ISO8601',
	  IN_TIMEZONE: 'inTimezone',
	  TIMEZONE: 'timezone',
	  DURING: 'during',
	  DATE: 'date',
	  TIME_OF_DAY: 'timeOfDay',
	  YEAR: 'year',
	  MONTH: 'month',
	  DAY: 'day',
	  DAY_OF_WEEK: 'dayOfWeek',
	  DAY_OF_YEAR: 'dayOfYear',
	  HOURS: 'hours',
	  MINUTES: 'minutes',
	  SECONDS: 'seconds',
	  TO_ISO8601: 'toISO8601',
	  TO_EPOCH_TIME: 'toEpochTime',
	  FUNCALL: 'do',
	  BRANCH: 'branch',
	  FOR_EACH: 'forEach',
	  ERROR: 'error',
	  DEFAULT: 'default',
	  JAVASCRIPT: 'js',
	  COERCE_TO: 'coerceTo',
	  TYPE_OF: 'typeOf',
	  INFO: 'info',
	  JSON: 'json',
	  ARGS: 'args',
	  HTTP: 'http',
	  RANDOM: 'random',
	  CHANGES: 'changes',
	  BINARY: 'binary',
	  INDEX_RENAME: 'indexRename',
	  CIRCLE: 'circle',
	  DISTANCE: 'distance',
	  FILL: 'fill',
	  GEOJSON: 'geojson',
	  TO_GEOJSON: 'toGeojson',
	  GET_INTERSECTING: 'getIntersecting',
	  GET_NEAREST: 'getNearest',
	  INCLUDES: 'includes',
	  INTERSECTS: 'intersects',
	  LINE: 'line',
	  POINT: 'point',
	  POLYGON: 'polygon',
	  POLYGON_SUB: 'polygonSub',
	  UUID: 'uuid',
	  RANGE: 'range',
	  TO_JSON_STRING: 'toJSON',
	  CONFIG: 'config',
	  STATUS: 'status',
	  WAIT: 'wait',
	  RECONFIGURE: 'reconfigure',
	  REBALANCE: 'rebalance',
	  SPLIT: 'split',
	  LITERAL: 'literal',
	  MONDAY: 'monday',
	  TUESDAY: 'tuesday',
	  WEDNESDAY: 'wednesday',
	  THURSDAY: 'thursday',
	  FRIDAY: 'friday',
	  SATURDAY: 'saturday',
	  SUNDAY: 'sunday',
	  JANUARY: 'january',
	  FEBRUARY: 'february',
	  MARCH: 'march',
	  APRIL: 'april',
	  MAY: 'may',
	  JUNE: 'june',
	  JULY: 'july',
	  AUGUST: 'august',
	  SEPTEMBER: 'september',
	  OCTOBER: 'october',
	  NOVEMBER: 'november',
	  DECEMBER: 'december' ,
	  MINVAL: 'minval',
	  MAXVAL: 'maxval',
	}
	var typeToString = {};
	for(var key in _typeToString) {
	  typeToString[termTypes[key]] = _typeToString[key];
	}

	var _noPrefixOptargs = {
	  ISO8601: true,
	}
	var noPrefixOptargs = {};
	for(var key in _noPrefixOptargs) {
	  noPrefixOptargs[termTypes[key]] = true;
	}

	var _specialType = {
	  DATUM: function(term, index, father, frames, options, optarg) {
	    optarg = optarg || false;

	    var underline = Array.isArray(frames) && (frames.length === 0);
	    var currentFrame, backtrace;
	    if (Array.isArray(frames)) currentFrame = frames.shift();

	    var result = {
	      str: '',
	      car: ''
	    }

	    if ((helper.isPlainObject(term)) && (term.$reql_type$ === 'BINARY')) {
	      carify(result, 'r.binary(<Buffer>)', underline);
	      return result;
	    }

	    if ((index === 0) && ((father == null) || (!nonPrefix[father[0]]))) carify(result, 'r.expr(', underline)

	    if (typeof term === 'string' ) {
	      carify(result, '"'+term+'"', underline);
	    }
	    else if (helper.isPlainObject(term)) {
	      var totalKeys = Object.keys(term).length;
	      if (totalKeys === 0) {
	        carify(result, '{}', underline);
	      }
	      else {
	        carify(result, '{\n', underline);
	        var countKeys = 0;
	        var extraToRemove = options.extra;
	        options.indent += INDENT+options.extra;
	        options.extra = 0;
	        for(var key in term) {
	          countKeys++;
	          //if (!((father) && (Array.isArray(father[2])) && (Object.keys(father[2]).length > 0))) options.extra = 0;

	          if (optarg) {
	            carify(result, space(options.indent)+camelCase(key)+': ', underline);
	          }
	          else {
	            carify(result, space(options.indent)+key+': ', underline);
	          }
	          if ((currentFrame != null) && (currentFrame === key)) {
	            backtrace = generateBacktrace(term[key], i, term, frames, options);
	          }
	          else {
	            backtrace = generateBacktrace(term[key], i, term, null, options);
	          }
	          result.str += backtrace.str;
	          result.car += backtrace.car;
	          
	          if (countKeys !== totalKeys) { 
	            carify(result, ',\n', underline);
	          }

	        }
	        options.indent -= INDENT+extraToRemove;
	        carify(result, '\n'+space(options.indent+extraToRemove)+'}', underline);
	      }
	    }
	    else if (Array.isArray(term)) {
	      carify(result, '[', underline);
	      for(var i=0; i<term.length; i++) {
	        if ((currentFrame != null) && (currentFrame === i)) {
	          backtrace = generateBacktrace(term[i], i, term, frames, options);
	        }
	        else {
	          backtrace = generateBacktrace(term[i], i, term, null, options);
	        }
	        result.str += backtrace.str;
	        result.car += backtrace.car;
	      }
	      carify(result, ']', underline);
	    }
	    else {
	      carify(result, ''+term, underline);
	    }

	    if ((index === 0) && ((father == null) || (!nonPrefix[father[0]]))) carify(result, ')', underline);

	    if (underline) result.car = result.str.replace(/./g, '^');

	    return result;
	  },
	  TABLE: function(term, index, father, frames, options) {
	    var result = {
	      str: '',
	      car: ''
	    }
	    var backtrace, underline, currentFrame;


	    if ((term.length === 1) || (term[1].length === 0) || (term[1][0][0] !== termTypes.DB)) {
	      var underline = Array.isArray(frames) && (frames.length === 0);
	      if (Array.isArray(frames)) currentFrame = frames.shift();

	      carify(result, 'r.'+typeToString[term[0]]+'(', underline);
	      if (Array.isArray(term[1])) {
	        for(var i=0; i<term[1].length; i++) {
	          if (i !==0) result.str += ', ';


	          if ((currentFrame != null) && (currentFrame === 1)) {
	            // +1 for index because it's like if there was a r.db(...) before .table(...)
	            backtrace = generateBacktrace(term[1][i], i+1, term, frames, options)
	          }
	          else {
	            backtrace = generateBacktrace(term[1][i], i+1, term, null, options)
	          }
	          result.str += backtrace.str;
	          result.car += backtrace.car
	        }
	      }

	      backtrace = makeOptargs(term, i, term, frames, options, currentFrame)
	      result.str += backtrace.str;
	      result.car += backtrace.car;

	      carify(result, ')', underline);

	      if (underline) result.car = result.str.replace(/./g, '^');
	    }
	    else {
	      backtrace = generateNormalBacktrace(term, index, father, frames, options);
	      result.str = backtrace.str;
	      result.car = backtrace.car;
	    }

	    return result;
	  },
	  GET_FIELD: function(term, index, father, frames, options) {
	    var result = {
	      str: '',
	      car: ''
	    }
	    var backtrace, underline, currentFrame;

	    var underline = Array.isArray(frames) && (frames.length === 0);
	    if (Array.isArray(frames)) currentFrame = frames.shift();

	    if ((currentFrame != null) && (currentFrame === 0)) {
	      backtrace = generateBacktrace(term[1][0], 0, term, frames, options)
	    }
	    else {
	      backtrace = generateBacktrace(term[1][0], 0, term, null, options)
	    }
	    result.str = backtrace.str;
	    result.car = backtrace.car;

	    carify(result, '(', underline);

	    if ((currentFrame != null) && (currentFrame === 1)) {
	      backtrace = generateBacktrace(term[1][1], 1, term, frames, options)
	    }
	    else {
	      backtrace = generateBacktrace(term[1][1], 1, term, null, options)
	    }
	    result.str += backtrace.str;
	    result.car += backtrace.car;

	    carify(result, ')', underline);

	    if (underline) result.car = result.str.replace(/./g, '^');

	    return result;
	  },
	  MAKE_ARRAY: function(term, index, father, frames, options) {
	    var result = {
	      str: '',
	      car: ''
	    };
	    var backtrace, underline, currentFrame;

	    var underline = Array.isArray(frames) && (frames.length === 0);
	    if (Array.isArray(frames)) currentFrame = frames.shift();

	    if ((index === 0) && ((father == null) || (!nonPrefix[father[0]]))) carify(result, 'r.expr(', underline)

	    if (!((options) && (options.noBracket))) {
	      carify(result, '[', underline);
	    }
	    for(var i=0; i<term[1].length; i++) {
	      if (i !== 0) {
	        carify(result, ', ', underline);
	      }

	      if ((currentFrame != null) && (currentFrame  === i)) {
	        backtrace = generateBacktrace(term[1][i], i, term, frames, options);
	      }
	      else {
	        backtrace = generateBacktrace(term[1][i], i, term, null, options);
	      }
	      result.str += backtrace.str;
	      result.car += backtrace.car;

	    }

	    if (!((options) && (options.noBracket))) {
	      carify(result, ']', underline);
	    }

	    if ((index === 0) && ((father == null) || (!nonPrefix[father[0]]))) {
	      carify(result, ')', underline);
	    }

	    if (underline) result.car = result.str.replace(/./g, '^');

	    return result;
	  },
	  FUNC: function(term, index, father, frames, options) {
	    var result = {
	      str: '',
	      car: ''
	    };
	    var backtrace, underline, currentFrame;

	    var underline = Array.isArray(frames) && (frames.length === 0);
	    if (Array.isArray(frames)) currentFrame = frames.shift();

	    if ((term[1][0][1].length === 1) && (helper.hasImplicit(term[1][1]))) {
	      if ((currentFrame != null) && (currentFrame === 1)) {
	        backtrace = generateBacktrace(term[1][1], 1, term, frames, options);
	      }
	      else {
	        backtrace = generateBacktrace(term[1][1], 1, term, null, options);
	      }
	      result.str = backtrace.str;
	      result.car = backtrace.car;
	    }
	    else {
	      carify(result, 'function(', underline);

	      for(var i=0; i<term[1][0][1].length; i++) {
	        if (i !== 0) {
	          carify(result, ', ', underline);
	        }
	        carify(result, 'var_'+term[1][0][1][i], underline);
	      }

	      options.indent += INDENT+options.extra;
	      var extraToRemove = options.extra;
	      options.extra = 0;
	      //if (!((Array.isArray(term[2])) && (term[2].length > 0))) options.extra = 0;

	      carify(result, ') {\n'+space(options.indent)+'return ', underline);

	      if ((currentFrame != null) && (currentFrame === 1)) {
	        backtrace = generateBacktrace(term[1][1], 1, term, frames, options);
	      }
	      else {
	        backtrace = generateBacktrace(term[1][1], 1, term, null, options);
	      }

	      result.str += backtrace.str;
	      result.car += backtrace.car;

	      options.indent -= INDENT+extraToRemove;
	      options.extra = extraToRemove;

	      carify(result, '\n'+space(options.indent+extraToRemove)+'}', underline);

	    }

	    if (underline) result.car = result.str.replace(/./g, '^');

	    return result;
	  },
	  VAR: function(term, index, father, frames, options) {
	    var result = {
	      str: '',
	      car: ''
	    }
	    var backtrace, underline, currentFrame;

	    var underline = Array.isArray(frames) && (frames.length === 0);
	    if (Array.isArray(frames)) currentFrame = frames.shift();

	    carify(result, 'var_'+term[1][0], underline);

	    if (underline) result.car = result.str.replace(/./g, '^');
	    return result;
	  },
	  FUNCALL: function(term, index, father, frames, options) {
	    // The syntax is args[1].do(args[0])
	    var result = {
	      str: '',
	      car: ''
	    };
	    var backtrace, underline, currentFrame;

	    var underline = Array.isArray(frames) && (frames.length === 0);
	    if (Array.isArray(frames)) currentFrame = frames.shift();

	    if (term[1].length === 2) {
	      if ((currentFrame != null) && (currentFrame === 1)) {
	        backtrace = generateBacktrace(term[1][1], 0, term, frames, options);
	      }
	      else {
	        backtrace = generateBacktrace(term[1][1], 0, term, null, options);
	      }
	      result.str = backtrace.str;
	      result.car = backtrace.car;

	      carify(result, '.do(', underline);
	    }
	    else {
	      carify(result, 'r.do(', underline);

	      for(var i=1; i<term[1].length; i++) {
	        if ((currentFrame != null) && (currentFrame === i)) {
	          backtrace = generateBacktrace(term[1][i], i, term, frames, options);
	        }
	        else {
	          backtrace = generateBacktrace(term[1][i], i, term, null, options);
	        }
	        result.str += backtrace.str;
	        result.car += backtrace.car;

	        if (i !== term[1].length) {
	          carify(result, ', ' , underline);
	        }
	      }
	    }

	    if ((currentFrame != null) && (currentFrame === 0)) {
	      backtrace = generateBacktrace(term[1][0], 0, term, frames, options);
	    }
	    else {
	      backtrace = generateBacktrace(term[1][0], 0, term, null, options);
	    }
	    result.str += backtrace.str;
	    result.car += backtrace.car;

	    carify(result, ')', underline);

	    if (underline) result.car = result.str.replace(/./g, '^');

	    return result;
	  },
	  IMPLICIT_VAR: function(term, index, father, frames, options) {
	    var result = {
	      str: '',
	      car: ''
	    }
	    var backtrace, underline, currentFrame;

	    var underline = Array.isArray(frames) && (frames.length === 0);
	    if (Array.isArray(frames)) currentFrame = frames.shift();

	    carify(result, 'r.row', underline);

	    if (underline) result.car = result.str.replace(/./g, '^');
	    return result;
	  },
	  WAIT: function(term, index, father, frames, options) {
	    var result = {
	      str: '',
	      car: ''
	    }
	    var backtrace, underline, currentFrame;

	    if (term.length === 1 || term[1].length === 0) {
	      backtrace = generateWithoutPrefixBacktrace(term, index, father, frames, options);
	      result.str = backtrace.str;
	      result.car = backtrace.car;
	    }
	    else {
	      backtrace = generateNormalBacktrace(term, index, father, frames, options);
	      result.str = backtrace.str;
	      result.car = backtrace.car;
	    }
	    return result;
	  },
	  MAP: function(term, index, father, frames, options) {
	    var result = {
	      str: '',
	      car: ''
	    }
	    var backtrace, underline, currentFrame;

	    if (term.length > 1 && term[1].length > 2) {
	      backtrace = generateWithoutPrefixBacktrace(term, index, father, frames, options);
	      result.str = backtrace.str;
	      result.car = backtrace.car;
	    }
	    else {
	      backtrace = generateNormalBacktrace(term, index, father, frames, options);
	      result.str = backtrace.str;
	      result.car = backtrace.car;
	    }
	    return result;
	  },
	}
	_specialType.TABLE_CREATE = _specialType.TABLE;
	_specialType.TABLE_DROP = _specialType.TABLE;
	_specialType.TABLE_LIST = _specialType.TABLE;
	_specialType.RECONFIGURE = _specialType.WAIT;
	_specialType.REBALANCE = _specialType.WAIT;
	_specialType.BRACKET = _specialType.GET_FIELD;

	var specialType = {};
	for(var key in _specialType) {
	  specialType[termTypes[key]] = _specialType[key];
	}


	function space(n) {
	  return new Array(n+1).join(' ');
	}
	function carify(result, str, underline) {
	  if (underline === true) {
	    result.str += str;
	    result.car += str.replace(/[^\n]/g, '^');
	  }
	  else {
	    result.str += str;
	    result.car += str.replace(/[^\n]/g, ' ');
	  }
	}
	function makeOptargs(term, index, father, frames, options, currentFrame) {
	  var result = {
	    str: '',
	    car: ''
	  }
	  var backtrace, currentFrame, underline;

	  if (helper.isPlainObject(term[2])) {
	    //if ((currentFrame != null) && (frames != null)) frames.unshift(currentFrame);

	    //underline = Array.isArray(frames) && (frames.length === 0);
	    var underline = false;
	    //if (Array.isArray(frames)) currentFrame = frames.shift();

	    // This works before there is no prefix term than can be called with no normal argument but with an optarg
	    if (Array.isArray(term[1]) && (term[1].length > 1)) {
	      carify(result, ', ' , underline);
	    }
	    else if (Array.isArray(term[1]) && (term[1].length > 0) && (noPrefixOptargs[term[0]])) {
	      carify(result, ', ' , underline);
	    }

	    backtrace = specialType[termTypes.DATUM](term[2], index, term[2], frames, options, true);

	    result.str += backtrace.str;
	    result.car += backtrace.car;

	    if (underline) result.car = result.str.replace(/./g, '^');
	  }

	  return result;
	}
	function generateNormalBacktrace(term, index, father, frames, options) {
	  var result = {
	    str: '',
	    car: ''
	  }
	  var backtrace, currentFrame, underline;

	  //if (term[1]) {
	    var underline = Array.isArray(frames) && (frames.length === 0);
	    if (Array.isArray(frames)) currentFrame = frames.shift();

	    if ((currentFrame != null) && (currentFrame === 0)) {
	      backtrace = generateBacktrace(term[1][0], 0, term, frames, options);
	    }
	    else {
	      backtrace = generateBacktrace(term[1][0], 0, term, null, options);
	    }
	    result.str = backtrace.str;
	    result.car = backtrace.car;

	    var lines = backtrace.str.split('\n');
	    var line = lines[lines.length-1];
	    var pos = line.match(/[^\s]/);
	    pos = (pos) ? pos.index : 0;

	    if (line.length-pos > LIMIT) {
	      if (options.extra === 0) options.extra += INDENT;
	      carify(result, '\n'+space(options.indent+options.extra) , underline);
	    }

	    carify(result, '.'+typeToString[term[0]]+'(' , underline);
	    options.indent += options.extra;
	    var extraToRemove = options.extra;
	    options.extra = 0;

	    for(var i=1; i<term[1].length; i++) {
	      if (i !== 1) {
	        carify(result, ', ' , underline);
	      }
	      if ((currentFrame != null) && (currentFrame === i)) {
	        backtrace = generateBacktrace(term[1][i], i, term, frames, options);
	      }
	      else {
	        backtrace = generateBacktrace(term[1][i], i, term, null, options);
	      }
	      result.str += backtrace.str;
	      result.car += backtrace.car;
	    }

	    backtrace = makeOptargs(term, i, term, frames, options, currentFrame)
	    result.str += backtrace.str;
	    result.car += backtrace.car;

	    options.indent -= extraToRemove;
	    options.extra = extraToRemove;

	    carify(result, ')' , underline);

	    if (underline) result.car = result.str.replace(/./g, '^');
	  /*
	  }
	  else {
	    throw new Error('The driver should never enter this condition. Please report the query to the developers -- End 1 --\n'+JSON.stringify(term, null, 2))
	  }
	  */


	  return result;
	}

	function generateWithoutPrefixBacktrace(term, index, father, frames, options) {
	  var result = {
	    str: '',
	    car: ''
	  }

	  var backtrace, currentFrame, underline;

	  var underline = Array.isArray(frames) && (frames.length === 0);
	  if (Array.isArray(frames)) currentFrame = frames.shift();

	  if (constants[term[0]]) {
	    carify(result, 'r.'+typeToString[term[0]], underline); 
	    return result;
	  }

	  carify(result, 'r.'+typeToString[term[0]]+'(', underline); 

	  if (Array.isArray(term[1])) {
	    for(var i=0; i<term[1].length; i++) {
	      if (i !== 0) carify(result, ', ', underline)

	      if ((currentFrame != null) && (currentFrame === i)) {
	        backtrace = generateBacktrace(term[1][i], i, term, frames, options)
	      }
	      else {
	        backtrace = generateBacktrace(term[1][i], i, term, null, options)
	      }
	      result.str += backtrace.str;
	      result.car += backtrace.car;
	    }
	  }

	  backtrace = makeOptargs(term, i, term, frames, options, currentFrame)
	  result.str += backtrace.str;
	  result.car += backtrace.car;

	  carify(result, ')', underline);

	  if (underline) result.car = result.str.replace(/./g, '^');

	  return result;
	}

	function generateBacktrace(term, index, father, frames, options) {
	  var result = {
	    str: '',
	    car: ''
	  }
	  var backtrace, currentFrame, underline;

	  // frames = null -> do not underline
	  // frames = [] -> underline

	  if (Array.isArray(term)) {
	    if (term.length === 0) {
	      var underline = Array.isArray(frames) && (frames.length === 0);
	      carify(result, 'undefined', underline);
	    }
	    else if (specialType[term[0]]) {
	      backtrace = specialType[term[0]](term, index, father, frames, options);
	      result.str = backtrace.str;
	      result.car = backtrace.car;
	    }
	    else if (nonPrefix[term[0]]) {
	      backtrace = generateWithoutPrefixBacktrace(term, index, father, frames, options);
	      result.str = backtrace.str;
	      result.car = backtrace.car;
	    }
	    else { // normal type -- this.<method>( this.args... )
	      backtrace = generateNormalBacktrace(term, index, father, frames, options);
	      result.str = backtrace.str;
	      result.car = backtrace.car;
	    }
	  }
	  else if (term !== undefined) {
	    backtrace = specialType[termTypes.DATUM](term, index, father, frames, options);

	    result.str = backtrace.str;
	    result.car = backtrace.car;
	  }
	  else {
	    //throw new Error('The driver should never enter this condition. Please report the query to the developers -- End 2')
	  }
	  return result;
	}

	function camelCase(str) {
	  return str.replace(/_(.)/g, function (m, char) { return char.toUpperCase() });
	}
	module.exports.generateBacktrace = generateBacktrace;

	module.exports.setOperational = function(error) {
	  error[IS_OPERATIONAL] = true;
	  return error;
	};



/***/ },
/* 132 */
/***/ function(module, exports, __webpack_require__) {

	var Promise = __webpack_require__(91);
	var Err = __webpack_require__(131);
	var helper = __webpack_require__(127);
	var EventEmitter = __webpack_require__(79).EventEmitter;

	function Cursor(connection, token, options, type) {
	  this.connection = connection;
	  this.token = token;

	  this._index = 0; // Position in this._data[0]
	  this._data = []; // Array of non empty arrays
	  this._fetching = false; // Are we fetching data
	  this._canFetch = true; // Can we fetch more data?
	  this._pendingPromises = []; // Pending promises' resolve/reject
	  this.options = options || {};
	  this._closed = false;
	  this._type = type;
	  this._setIncludesStates = false;
	  if ((type === 'feed') || (type === 'atomFeed')) {
	    this.toArray = function() {
	      throw new Error('The `toArray` method is not available on feeds.')
	    }
	  }
	  this.each = this._each;
	  this.eachAsync = this._eachAsync;
	  this.next = this._next;
	  this._emittedEnd = false;
	}

	Cursor.prototype.toString = function() {
	  return '[object '+this._type+']';
	}
	Cursor.prototype.setIncludesStates = function() {
	  this._setIncludesStates = true;
	}
	Cursor.prototype.includesStates = function() {
	  return this._setIncludesStates;
	}
	Cursor.prototype.getType = function() {
	  return this._type;
	}

	Cursor.prototype.toJSON = function() {
	  if (this._type === 'Cursor') {
	    throw new Err.ReqlDriverError('You cannot serialize a Cursor to JSON. Retrieve data from the cursor with `toArray` or `next`');
	  }
	  else {
	    throw new Err.ReqlDriverError('You cannot serialize a '+this._type+' to JSON. Retrieve data from the cursor with `each` or `next`');
	  }
	}

	Cursor.prototype._next = function(callback) {
	  var self = this;
	  return new Promise(function(resolve, reject) {
	    if (self._closed === true) {
	      reject(new Err.ReqlDriverError('You cannot call `next` on a closed '+this._type))
	    }
	    else if ((self._data.length === 0) && (self._canFetch === false)) {
	      reject(new Err.ReqlDriverError('No more rows in the '+self._type.toLowerCase()).setOperational())
	    }
	    else {
	      if ((self._data.length > 0) && (self._data[0].length > self._index)) {
	        var result = self._data[0][self._index++];
	        if (result instanceof Error) {
	          reject(result);
	        }
	        else {
	          resolve(result);

	          // This could be possible if we get back batch with just one document?
	          if (self._data[0].length === self._index) {
	            self._index = 0;
	            self._data.shift();
	            if ((self._data.length === 1)
	              && (self._canFetch === true)
	              && (self._closed === false)
	              && (self._fetching === false)) {
	                self._fetch();
	            }
	          }
	        }
	      }
	      else {
	        self._pendingPromises.push({resolve: resolve, reject: reject});
	      }
	    }
	  }).nodeify(callback);
	}
	Cursor.prototype.hasNext = function() {
	  throw new Error('The `hasNext` command has been removed in 1.13, please use `next`.')
	}
	Cursor.prototype.toArray = function(callback) {
	  var self = this;
	  var p = new Promise(function(resolve, reject) {
	    var result = [];
	    var i =0;
	    self._each(function(err, data) {
	      if (err) {
	        reject(err);
	      }
	      else {
	        result.push(data);
	      }
	    }, function() {
	      resolve(result);
	    });
	  }).nodeify(callback);
	  return p;
	}

	Cursor.prototype._fetch = function() {
	  var self = this;
	  this._fetching = true;

	  var p = new Promise(function(resolve, reject) {
	    self.connection._continue(self.token, resolve, reject);
	  }).then(function(response) {
	    self._push(response);
	    return null;
	  }).error(function(error) {
	    self._fetching = false;
	    self._canFetch = false;
	    self._pushError(error);
	  })
	}

	Cursor.prototype._push = function(data) {
	  var couldfetch = this._canFetch;
	  if (data.done) this._done();
	  var response = data.response;
	  this._fetching = false;
	  // If the cursor was closed, we ignore all following response
	  if ((response.r.length > 0) && (couldfetch === true)) {
	    this._data.push(helper.makeSequence(response, this.options));
	  }
	  // this._fetching = false
	  if ((this._closed === false) && (this._canFetch) && (this._data.length <= 1)) this._fetch();
	  this._flush();
	}
	// Try to solve as many pending promises as possible
	Cursor.prototype._flush = function() {
	  while ((this._pendingPromises.length > 0) && ((this._data.length > 0) || ((this._fetching === false) && (this._canFetch === false)))) {
	    var fullfiller = this._pendingPromises.shift(); 
	    var resolve = fullfiller.resolve;
	    var reject = fullfiller.reject;

	    if (this._data.length > 0) {
	      var result = this._data[0][this._index++];
	      if (result instanceof Error) {
	        reject(result);
	      }
	      else {
	        resolve(result);
	      }

	      if (this._data[0].length === this._index) {
	        this._index = 0;
	        this._data.shift();
	        if ((this._data.length <= 1)
	          && (this._canFetch === true)
	          && (this._closed === false)
	          && (this._fetching === false)) {
	            this._fetch();
	        }
	      }
	    }
	    else {
	      reject(new Err.ReqlDriverError('No more rows in the '+this._type.toLowerCase()).setOperational())
	    }
	  }
	}
	Cursor.prototype._pushError = function(error) {
	  this._data.push([error]);
	  this._flush();
	}

	Cursor.prototype._done = function() {
	  this._canFetch = false;
	  if (this._eventEmitter) {
	    this._eventEmitter.emit('end');
	  }
	}

	Cursor.prototype._set = function(ar) {
	  this._fetching = false;
	  this._canFetch = false;
	  if (ar.length > 0) {
	    this._data.push(ar);
	  }
	  this._flush();
	}

	Cursor.prototype.close = function(callback) {
	  var self = this;

	  self._closed = true;

	  var p = new Promise(function(resolve, reject) {
	    if ((self._canFetch === false) && (self._fetching === false)) {
	      resolve()
	    }
	    else { // since v0_4 (RethinkDB 2.0) we can (must) force a STOP request even if a CONTINUE query is pending
	      var endCallback = function() {
	        if (self._eventEmitter && (self._emittedEnd === false)) {
	          self._emittedEnd = true;
	          self._eventEmitter.emit('end');
	        }
	        resolve();
	      }
	      self.connection._end(self.token, endCallback, reject);
	    }
	  }).nodeify(callback);
	  return p;
	}
	Cursor.prototype._each = function(callback, onFinish) {
	  if (this._closed === true) {
	    return callback(new Err.ReqlDriverError('You cannot retrieve data from a cursor that is closed').setOperational());
	  }
	  var self = this;

	  var reject = function(err) {
	    if (err.message === 'No more rows in the '+self._type.toLowerCase()+'.') {
	      if (typeof onFinish === 'function') {
	        onFinish();
	      }
	    }
	    else {
	      callback(err);
	    }
	    return null;
	  }
	  var resolve = function(data) {
	    var keepGoing = callback(null, data);
	    if (keepGoing === false) {
	      if (typeof onFinish === 'function') {
	        onFinish();
	      }
	    }
	    else {
	      if (self._closed === false) {
	        self._next().then(resolve).error(function(error) {
	          if ((error.message !== 'You cannot retrieve data from a cursor that is closed.') &&
	              (error.message.match(/You cannot call `next` on a closed/) === null)) {
	            reject(error);
	          }
	        });
	      }
	    }
	    return null;
	  }

	  self._next().then(resolve).error(function(error) {
	    // We can silence error when the cursor is closed as this 
	    if ((error.message !== 'You cannot retrieve data from a cursor that is closed.') &&
	        (error.message.match(/You cannot call `next` on a closed/) === null)) {
	      reject(error);
	    }
	  });
	  return null;
	}
	Cursor.prototype._eachAsync = function(callback, onFinish) {
	  if (this._closed === true) {
	    throw new Err.ReqlDriverError('You cannot retrieve data from a cursor that is closed').setOperational();
	  }
	  var self = this;

	  var reject = function(err) {
	    if (err.message === 'No more rows in the '+self._type.toLowerCase()+'.') {
	      if (typeof onFinish === 'function') {
	        onFinish();
	      }
	    }
	    else {
	      throw Err.setOperational(err);
	    }
	  }
	  var resolve = function(data) {
	    return callback(data).then(function() {
	      if (self._closed === false) {
	        return self._next().then(resolve).error(function(error) {
	          if ((error.message !== 'You cannot retrieve data from a cursor that is closed.') &&
	              (error.message.match(/You cannot call `next` on a closed/) === null)) {
	            reject(error);
	          }
	        });
	      }
	      return null;
	    });
	  }

	  return self._next().then(resolve).error(function(error) {
	    // We can silence error when the cursor is closed as this 
	    if ((error.message !== 'You cannot retrieve data from a cursor that is closed.') &&
	        (error.message.match(/You cannot call `next` on a closed/) === null)) {
	      reject(error);
	    }
	  });
	}

	Cursor.prototype._makeEmitter = function() {
	  this.next = function() {
	    throw new Err.ReqlDriverError('You cannot call `next` once you have bound listeners on the '+this._type)
	  }
	  this.each = function() {
	    throw new Err.ReqlDriverError('You cannot call `each` once you have bound listeners on the '+this._type)
	  }
	  this.eachAsync = function() {
	    throw new Err.ReqlDriverError('You cannot call `eachAsync` once you have bound listeners on the '+this._type)
	  }
	  this.toArray = function() {
	    throw new Err.ReqlDriverError('You cannot call `toArray` once you have bound listeners on the '+this._type)
	  }
	  this._eventEmitter = new EventEmitter();
	}
	Cursor.prototype._eachCb = function(err, data) {
	  // We should silent things if the cursor/feed is closed
	  if (this._closed === false) {
	    if (err) {
	      this._eventEmitter.emit('error', err);
	    }
	    else {
	      this._eventEmitter.emit('data', data);
	    }
	  }
	}

	var methods = [
	  'addListener',
	  'on',
	  'once',
	  'removeListener',
	  'removeAllListeners',
	  'setMaxListeners',
	  'listeners',
	  'emit'
	];

	for(var i=0; i<methods.length; i++) {
	  (function(n) {
	    var method = methods[n];
	    Cursor.prototype[method] = function() {
	      var self = this;
	      if (self._eventEmitter == null) {
	        self._makeEmitter();
	        setImmediate(function() {
	          self._each(self._eachCb.bind(self), function() {
	            if (self._emittedEnd === false) {
	              self._emittedEnd = true;
	              self._eventEmitter.emit('end');
	            }
	          });
	        });
	      }
	      var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	      self._eventEmitter[method].apply(self._eventEmitter, _args);
	    };
	  })(i);
	}

	module.exports = Cursor;


/***/ },
/* 133 */
/***/ function(module, exports, __webpack_require__) {

	var Readable = __webpack_require__(52).Readable;
	var Cursor = __webpack_require__(132);
	var util = __webpack_require__(9);

	// Experimental, but should work fine.
	function ReadableStream(options, cursor) {
	  if (cursor) this._cursor = cursor;
	  this._pending = 0; // How many time we called _read while no cursor was available
	  this._index = 0;
	  this._maxRecursion = 1000; // Hardcoded
	  this._highWaterMark = options.highWaterMark;
	  this._closed = false;

	  Readable.call(this, {
	    objectMode: true,
	    highWaterMark: this._highWaterMark
	  });
	};
	util.inherits(ReadableStream, Readable);


	ReadableStream.prototype._setCursor = function(cursor) {
	  if (cursor instanceof Cursor === false) {
	    this.emit('error', new Error('Cannot create a stream on a single value.'));
	    return this;
	  }
	  this._cursor = cursor;
	  this._fetchAndDecrement();
	}
	ReadableStream.prototype._read = function(size) {
	  this._count++;
	  if (this._cursor === undefined) {
	    this._pending++;
	    return;
	  }

	  this._recursion = 0;
	  this._fetch();
	}

	//TODO: Refactor with _fetch?
	ReadableStream.prototype._fetchAndDecrement = function() {
	  var self = this;
	  self._pending--;
	  if (self._pending < 0 || self._closed === true) {
	    return;
	  }

	  if (self._cursor._closed === true) {
	    self.push(null);
	  }
	  else {
	    self._cursor._next().then(function(data) {
	      // Silently drop null values for now
	      if (data === null) {
	        if (self._recursion++ === self._maxRecursion) {
	          //Avoid maximum call stack errors
	          process.nextTick(function() {
	            self._fetchAndDecrement();
	          });
	        }
	        else {
	          self._fetchAndDecrement();
	        }
	      }
	      else {
	        if (self.push(data) !== false) {
	          if (self._recursion++ === self._maxRecursion) {
	            process.nextTick(function() {
	              self._fetchAndDecrement();
	            });
	          }
	          else {
	            self._fetchAndDecrement();
	          }
	        }
	      }
	    }).error(function(error) {
	      if (error.message.match(/No more rows in the/)) {
	        self.push(null);
	      }
	      else if (error.message === 'You cannot retrieve data from a cursor that is closed.') {
	        // if the user call `close`, the cursor may reject pending requests. We just
	        // ignore them here.
	      }
	      else {
	        self.emit('error', error);
	      }
	    });
	  }
	}

	ReadableStream.prototype._fetch = function() {
	  var self = this;
	  if (self._closed === true) {
	    return;
	  }
	  if (self._cursor._closed === true) {
	    self.push(null);
	  }
	  else {
	    self._cursor._next().then(function(data) {
	      if (self._closed === true) {
	        return;
	      }
	      // Silently drop null values for now
	      if (data === null) {
	        if (self._recursion++ === self._maxRecursion) {
	          process.nextTick(function() {
	            self._fetch();
	          });
	        }
	        else {
	          self._fetch();
	        }
	      }
	      else {
	        if (self.push(data) !== false) {
	          if (self._recursion++ === self._maxRecursion) {
	            process.nextTick(function() {
	              self._fetch();
	            });
	          }
	          else {
	            self._fetch();
	          }
	        }
	      }
	    }).error(function(error) {
	      if (error.message.match(/No more rows in the/)) {
	        self.push(null);
	      }
	      else if (error.message === 'You cannot retrieve data from a cursor that is closed.') {
	        // if the user call `close`, the cursor may reject pending requests. We just
	        // ignore them here.
	      }
	      else {
	        self.emit('error', error);
	      }
	    });
	  }
	}


	ReadableStream.prototype.close = function() {
	  this._closed = true;
	  this.push(null);
	  return this._cursor.close();
	}

	module.exports = ReadableStream;


/***/ },
/* 134 */
/***/ function(module, exports) {

	// Metadata we keep per query
	function Metadata(resolve, reject, query, options) {
	  this.resolve = resolve;
	  this.reject = reject;
	  this.query = query; // The query in case we have to build a backtrace
	  this.options = options;
	  this.cursor = false;
	}

	Metadata.prototype.setCursor = function() {
	  this.cursor = true;
	}

	Metadata.prototype.setEnd = function(resolve, reject) {
	  this.endResolve = resolve;
	  this.endReject = reject;
	}

	Metadata.prototype.setCallbacks = function(resolve, reject) {
	  this.resolve = resolve;
	  this.reject = reject;
	}
	Metadata.prototype.removeCallbacks = function() {
	  this.resolve = null;
	  this.reject = null;
	}
	Metadata.prototype.removeEndCallbacks = function() {
	  this.endResolve = null;
	  this.endReject = null;
	}

	module.exports = Metadata;


/***/ },
/* 135 */
/***/ function(module, exports, __webpack_require__) {

	var Promise = __webpack_require__(91);
	var protodef = __webpack_require__(128);
	var termTypes = protodef.Term.TermType;

	var Error = __webpack_require__(131);
	var helper = __webpack_require__(127);
	var ReadableStream = __webpack_require__(133);
	var WritableStream = __webpack_require__(136);
	var TransformStream = __webpack_require__(137);

	function Term(r, value, error) {
	  var self = this;
	  var term = function(field) {
	    if (Term.prototype._fastArity(arguments.length, 1) === false) {
	      var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	      Term.prototype._arity(_args, 1, '(...)', self);
	    }
	    return term.bracket(field);
	  }
	  helper.changeProto(term, self);

	  if (value === undefined) {
	    term._query = [];
	  }
	  else {
	    term._query = value;
	  }
	  term._r = r; // Keep a reference to r for global settings

	  if (error !== undefined) {
	    term._error = error;
	    term._frames = [];
	  }

	  return term;
	}

	// run([connection][, options][, callback])
	Term.prototype.run = function(connection, options, callback) {
	  var self = this;

	  if (self._error != null) {
	    var error = new Error.ReqlRuntimeError(self._error, self._query, {b: self._frames});
	    return Promise.reject(error);
	  }

	  if (helper.isPlainObject(connection) && (typeof connection._isConnection === 'function') && (connection._isConnection() === true)) {
	    if (typeof options === 'function') {
	      callback = options;
	      options = {};
	    }
	    else {
	      if (!helper.isPlainObject(options)) options = {};
	    }

	    if (connection._isOpen() !== true) {
	      return new Promise(function(resolve, reject) {
	        reject(new Error.ReqlDriverError('`run` was called with a closed connection', self._query).setOperational());
	      });
	    }
	    var p = new Promise(function(resolve, reject) {
	      var token = connection._getToken();

	      var query = [protodef.Query.QueryType.START];
	      query.push(self._query);

	      var _options = {};
	      var sendOptions = false;
	      if (connection.db != null) {
	        sendOptions = true;
	        _options.db = self._r.db(connection.db)._query;
	      }

	      if (self._r.arrayLimit != null) {
	        sendOptions = true;
	        _options[self._translateArgs['arrayLimit']] = self._r.arrayLimit;
	      };


	      var keepGoing = true; // we need it just to avoir calling resolve/reject multiple times
	      helper.loopKeys(options, function(options, key) {
	        if (keepGoing === true) {
	          if ((key === 'readMode') || (key === 'durability') || (key === 'db') ||
	            (key === 'noreply') || (key === 'arrayLimit') || (key === 'profile') ||
	            (key === 'minBatchRows') || (key === 'maxBatchRows') || (key === 'maxBatchBytes') ||
	            (key === 'maxBatchSeconds') || (key === 'firstBatchScaledownFactor')) {

	            sendOptions = true;
	            if (key === 'db') {
	              _options[key] = self._r.db(options[key])._query;
	            }
	            else if (self._translateArgs.hasOwnProperty(key)) {
	              _options[self._translateArgs[key]] = new Term(self._r).expr(options[key])._query;
	            }
	            else {
	              _options[key] = new Term(self._r).expr(options[key])._query;
	            }
	          }
	          else if ((key !== 'timeFormat') && (key !== 'groupFormat') &&
	              (key !== 'binaryFormat') && (key !== 'cursor') &&
	              (key !== 'readable') && (key !== 'writable') &&
	              (key !== 'transform') && (key !== 'stream') &&
	              (key !== 'highWaterMark')) {
	            reject(new Error.ReqlDriverError('Unrecognized option `'+key+'` in `run`. Available options are readMode <string>, durability <string>, noreply <bool>, timeFormat <string>, groupFormat: <string>, profile <bool>, binaryFormat <bool>, cursor <bool>, stream <bool>'));
	            keepGoing = false;
	          }
	        }
	      });

	      if (keepGoing === false) {
	        connection.emit('release');
	        return // The promise was rejected in the loopKeys
	      }

	      if (sendOptions === true) {
	        query.push(_options);
	      }
	      connection._send(query, token, resolve, reject, self._query, options);
	    }).nodeify(callback);
	  }
	  else {
	    var poolMaster = self._r.getPoolMaster(); // if self._r is defined, so is self._r.getPool()
	    if (!poolMaster) {
	      throw new Error.ReqlDriverError('`run` was called without a connection and no pool has been created', self._query);
	    }
	    else {
	      if (typeof connection === 'function') {
	        // run(callback);
	        callback = connection;
	        options = {};
	      }
	      else if (helper.isPlainObject(connection)) {
	        // run(options[, callback])
	        callback = options;
	        options = connection;
	      }
	      else {
	        options = {};
	      }


	      var p = new Promise(function(resolve, reject) {
	        poolMaster.getConnection().then(function(connection) {
	          var token = connection._getToken();
	          var query = [protodef.Query.QueryType.START];
	          query.push(self._query);

	          var _options = {};
	          var sendOptions = false;
	          if (connection.db != null) {
	            sendOptions = true;
	            _options.db = self._r.db(connection.db)._query;
	          }
	          if (self._r.arrayLimit != null) {
	            sendOptions = true;
	            _options[self._translateArgs['arrayLimit']] = self._r.arrayLimit;
	          };

	          var keepGoing = true;
	          helper.loopKeys(options, function(options, key) {
	            if (keepGoing === true) {
	              if ((key === 'readMode') || (key === 'durability') || (key === 'db') ||
	                  (key === 'noreply') || (key === 'arrayLimit') || (key === 'profile') ||
	                  (key === 'minBatchRows') || (key === 'maxBatchRows') || (key === 'maxBatchBytes') ||
	                  (key === 'maxBatchSeconds') || (key === 'firstBatchScaledownFactor')) {


	                sendOptions = true;
	                if (key === 'db') {
	                  _options[key] = self._r.db(options[key])._query;
	                }
	                else if (self._translateArgs.hasOwnProperty(key)) {
	                  _options[self._translateArgs[key]] = new Term(self._r).expr(options[key])._query
	                }
	                else {
	                  _options[key] = new Term(self._r).expr(options[key])._query
	                }
	              }
	              else if ((key !== 'timeFormat') && (key !== 'groupFormat') &&
	                  (key !== 'binaryFormat') && (key !== 'cursor') &&
	                  (key !== 'readable') && (key !== 'writable') &&
	                  (key !== 'transform') && (key !== 'stream') &&
	                  (key !== 'highWaterMark')) {

	                setTimeout( function() {
	                  reject(new Error.ReqlDriverError('Unrecognized option `'+key+'` in `run`. Available options are readMode <string>, durability <string>, noreply <bool>, timeFormat <string>, groupFormat: <string>, profile <bool>, binaryFormat <string>, cursor <bool>, stream <bool>'));
	                }, 0);
	                keepGoing = false;
	                return false;
	              }
	            }
	          });

	          if (keepGoing === false) {
	            connection.emit('release');
	            return // The promise was rejected in the loopKeys
	          }

	          if (sendOptions === true) {
	            query.push(_options);
	          }
	          connection._send(query, token, resolve, reject, self._query, options);
	        }).error(function(error) {
	          reject(error);
	        });
	      }).nodeify(callback);
	    }
	  }

	  //if (options.noreply) return self; // Do not return a promise if the user ask for no reply.

	  return p;
	}

	Term.prototype.toStream = function(connection, options) {
	  if (helper.isPlainObject(connection) && (typeof connection._isConnection === 'function') && (connection._isConnection() === true)) {
	    if (helper.isPlainObject(options) === false) {
	      options = {};
	    }
	    if (options.readable === true) {
	      return this._toReadableStream(connection, options);
	    }
	    else if (options.writable === true) {
	      return this._toWritableStream(connection, options);
	    }
	    else if (options.transform === true) {
	      return this._toTransformStream(connection, options);
	    }
	    else {
	      return this._toReadableStream(connection, options);
	    }
	  }
	  else {
	    options = connection;
	    if (helper.isPlainObject(options) === false) {
	      options = {};
	    }
	    if (options.readable === true) {
	      return this._toReadableStream(options);
	    }
	    else if (options.writable === true) {
	      return this._toWritableStream(options);
	    }
	    else if (options.transform === true) {
	      return this._toTransformStream(options);
	    }
	    else {
	      return this._toReadableStream(options);
	    }
	  }
	}

	Term.prototype._toReadableStream = function(connection, options) {
	  var stream;

	  var _options = {};
	  if (helper.isPlainObject(connection) && (typeof connection._isConnection === 'function') && (connection._isConnection() === true)) {
	    //toStream make sure that options is an object
	    helper.loopKeys(options, function(obj, key) {
	      _options[key] = obj[key];
	    });
	    _options.cursor = true;
	    stream = new ReadableStream(_options);
	    this.run(connection, _options).then(function(cursor) {
	      stream._setCursor(cursor);
	    }).error(function(error) {
	      stream.emit('error', error);
	    });
	  }
	  else {
	    helper.loopKeys(connection, function(obj, key) {
	      _options[key] = obj[key];
	    });
	    _options.cursor = true;
	    stream = new ReadableStream(_options);
	    this.run(_options).then(function(cursor) {
	      stream._setCursor(cursor);
	    }).error(function(error) {
	      stream.emit('error', error);
	    });
	  }
	  return stream;
	}

	Term.prototype._toWritableStream = function(connection, options) {
	  if (this._query[0] !== termTypes.TABLE) {
	    throw new Error.ReqlDriverError('Cannot create a writable stream on something else than a table.');
	  }

	  if (helper.isPlainObject(connection) && (typeof connection._isConnection === 'function') && (connection._isConnection() === true)) {
	    return new WritableStream(this, options, connection);
	  }
	  else {
	    return new WritableStream(this, connection);
	  }
	}
	Term.prototype._toTransformStream = function(connection, options) {
	  if (this._query[0] !== termTypes.TABLE) {
	    throw new Error.ReqlDriverError('Cannot create a writable stream on something else than a table.');
	  }

	  if (helper.isPlainObject(connection) && (typeof connection._isConnection === 'function') && (connection._isConnection() === true)) {
	    return new TransformStream(this, options, connection);
	  }
	  else {
	    return new TransformStream(this, connection);
	  }
	}


	// Manipulating databases
	Term.prototype.dbCreate = function(db) {
	  // Check for arity is done in r.prototype.dbCreate
	  this._noPrefix(this, 'dbCreate');

	  var term = new Term(this._r);
	  term._query.push(termTypes.DB_CREATE);
	  var args = [new Term(this._r).expr(db)._query]
	  term._fillArgs(args);
	  return term;
	}
	Term.prototype.dbDrop = function(db) {
	  this._noPrefix(this, 'dbDrop');

	  var term = new Term(this._r);
	  term._query.push(termTypes.DB_DROP);
	  var args = [new Term(this._r).expr(db)._query]
	  term._fillArgs(args);
	  return term;
	}
	Term.prototype.dbList = function() {
	  this._noPrefix(this, 'dbList');

	  var term = new Term(this._r);
	  term._query.push(termTypes.DB_LIST)
	  return term;
	}

	// Manipulating Tables
	Term.prototype.tableCreate = function(table, options) {
	  var self = this;
	  if (self._fastArityRange(arguments.length, 1, 2) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    self._arityRange(_args, 1, 2, 'tableCreate', self);
	  }


	  var term = new Term(self._r);
	  term._query.push(termTypes.TABLE_CREATE)

	  var args = [];
	  if (Array.isArray(self._query) && (self._query.length > 0)) {
	    args.push(self); // Push db
	  }
	  args.push(new Term(self._r).expr(table))
	  term._fillArgs(args);

	  if (helper.isPlainObject(options)) {
	    // Check for non valid key
	    helper.loopKeys(options, function(obj, key) {
	      if ((key !== 'primaryKey')
	          && (key !== 'durability')
	          && (key !== 'shards')
	          && (key !== 'replicas')
	          && (key !== 'primaryReplicaTag')) {
	        throw new Error.ReqlDriverError('Unrecognized option `'+key+'` in `tableCreate`', self._query, 'Available options are primaryKey <string>, durability <string>, shards <number>, replicas <number/object>, primaryReplicaTag <object>');
	      }
	    });
	    term._query.push(new Term(self._r).expr(translateOptions(options))._query);
	  }
	  return term;
	}

	Term.prototype.tableDrop = function(table) {
	  if (this._fastArity(arguments.length, 1) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    this._arity(_args, 1, 'tableDrop', this);
	  }

	  var term = new Term(this._r);
	  term._query.push(termTypes.TABLE_DROP)

	  var args = [];
	  if (Array.isArray(this._query) && (this._query.length > 0)) {
	    args.push(this); // push db
	  }
	  args.push(new Term(this._r).expr(table))
	  term._fillArgs(args);
	  return term;
	}
	Term.prototype.tableList = function() {
	  if (this._fastArity(arguments.length, 0) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    this._arity(_args, 0, 'tableList', this);
	  }

	  var term = new Term(this._r);
	  term._query.push(termTypes.TABLE_LIST);

	  var args = [];
	  if (Array.isArray(this._query) && (this._query.length > 0)) {
	    args.push(this);
	  }
	  term._fillArgs(args);
	  return term;
	}
	Term.prototype.indexList = function() {
	  if (this._fastArity(arguments.length, 0) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    this._arity(_args, 0, 'indexList', this);
	  }

	  var term = new Term(this._r);
	  term._query.push(termTypes.INDEX_LIST);
	  var args = [this];
	  term._fillArgs(args);
	  return term;
	}
	Term.prototype.indexCreate = function(name, fn, options) {
	  if (this._fastArityRange(arguments.length, 1, 3) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    this._arityRange(_args, 1, 3, 'indexCreate', this);
	  }

	  if ((options == null) && (helper.isPlainObject(fn))) {
	    options = fn;
	    fn = undefined;
	  }

	  var term = new Term(this._r);
	  term._query.push(termTypes.INDEX_CREATE);
	  var args = [this];
	  args.push(new Term(this._r).expr(name));
	  if (typeof fn !== 'undefined') args.push(new Term(this._r).expr(fn)._wrap());
	  term._fillArgs(args);

	  if (helper.isPlainObject(options)) {
	    // There is no need to translate here
	    helper.loopKeys(options, function(obj, key) {
	      if ((key !== 'multi') && (key !== 'geo')) {
	        throw new Error.ReqlDriverError('Unrecognized option `'+key+'` in `indexCreate`', self._query, 'Available option is multi <bool> and geo <bool>');
	      }
	    });
	    term._query.push(new Term(this._r).expr(options)._query);
	  }
	  return term;
	}
	Term.prototype.indexDrop = function(name) {
	  if (this._fastArity(arguments.length, 1) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    this._arity(_args, 1, 'indexDrop', this);
	  }

	  var term = new Term(this._r);
	  term._query.push(termTypes.INDEX_DROP);
	  var args = [this, new Term(this._r).expr(name)];
	  term._fillArgs(args);
	  return term;
	}

	Term.prototype.indexStatus = function() {
	  var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	  var term = new Term(this._r);
	  term._query.push(termTypes.INDEX_STATUS);
	  var args = [this];
	  for(var i=0; i<_args.length; i++) {
	    args.push(new Term(this._r).expr(_args[i]))
	  }
	  term._fillArgs(args);
	  return term;
	}
	Term.prototype.indexWait = function() {
	  var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	  var term = new Term(this._r);
	  term._query.push(termTypes.INDEX_WAIT);
	  var args = [this];
	  for(var i=0; i<_args.length; i++) {
	    args.push(new Term(this._r).expr(_args[i]))
	  }
	  term._fillArgs(args);
	  return term;
	}
	Term.prototype.indexRename = function(oldName, newName, options) {
	  var self = this;
	  if (self._fastArityRange(arguments.length, 2, 3) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    self._arityRange(_args, 2, 3, 'indexRename', self);
	  }

	  var term = new Term(this._r);
	  term._query.push(termTypes.INDEX_RENAME);
	  var args = [this, new Term(this._r).expr(oldName), new Term(this._r).expr(newName)];
	  term._fillArgs(args);

	  if (helper.isPlainObject(options)) {
	    helper.loopKeys(options, function(obj, key) {
	      if (key !== 'overwrite') {
	        throw new Error.ReqlDriverError('Unrecognized option `'+key+'` in `indexRename`', self._query, 'Available options are overwrite <bool>');
	      }
	    });
	    term._query.push(new Term(self._r).expr(translateOptions(options))._query);
	  }


	  return term;
	}
	Term.prototype.changes = function(options) {
	  var self = this;
	  if (self._fastArityRange(arguments.length, 0, 1) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    self._arityRange(_args, 0, 1, 'changes', self);
	  }

	  var term = new Term(self._r);
	  term._query.push(termTypes.CHANGES);
	  var args = [self];
	  term._fillArgs(args);
	  if (helper.isPlainObject(options)) {
	    helper.loopKeys(options, function(obj, key) {
	      if ((key !== 'squash') && (key !== 'includeStates')
	         && (key !== 'includeInitial')) {
	        throw new Error.ReqlDriverError('Unrecognized option `'+key+'` in `changes`', self._query, 'Available options are squash <bool>');
	      }
	    });
	    term._query.push(new Term(self._r).expr(translateOptions(options))._query);
	  }
	  return term;
	}

	// Writing data
	Term.prototype.insert = function(documents, options) {
	  var self = this;
	  if (self._fastArityRange(arguments.length, 1, 2) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    self._arityRange(_args, 1, 2, 'insert', self);
	  }

	  var term = new Term(self._r);
	  term._query.push(termTypes.INSERT);
	  var args = [self, new Term(self._r).expr(documents)];
	  term._fillArgs(args);

	  if (helper.isPlainObject(options)) {
	    helper.loopKeys(options, function(obj, key) {
	      if ((key !== 'returnChanges') && (key !== 'durability') && (key !== 'conflict')) {
	        throw new Error.ReqlDriverError('Unrecognized option `'+key+'` in `insert`', self._query, 'Available options are returnChanges <bool>, durability <string>, conflict <string>');
	      }
	    });
	    term._query.push(new Term(self._r).expr(translateOptions(options))._query);
	  }
	  return term;
	}
	Term.prototype.update = function(newValue, options) {
	  var self = this;
	  if (self._fastArityRange(arguments.length, 1, 2) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    self._arityRange(_args, 1, 2, 'update', self);
	  }

	  var term = new Term(self._r);
	  term._query.push(termTypes.UPDATE);
	  var args = [self, new Term(self._r).expr(newValue)._wrap()];
	  term._fillArgs(args);

	  if (helper.isPlainObject(options)) {
	    helper.loopKeys(options, function(obj, key) {
	      if ((key !== 'returnChanges') && (key !== 'durability') && (key !== 'nonAtomic')) {
	        throw new Error.ReqlDriverError('Unrecognized option `'+key+'` in `update`', self._query, 'Available options are returnChanges <bool>, durability <string>, nonAtomic <bool>');
	      }
	    });
	    term._query.push(new Term(self._r).expr(translateOptions(options))._query);
	  }
	  return term;
	}
	Term.prototype.replace = function(newValue, options) {
	  var self = this;
	  if (self._fastArityRange(arguments.length, 1, 2) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    self._arityRange(_args, 1, 2, 'replace', self);
	  }

	  var term = new Term(self._r);
	  term._query.push(termTypes.REPLACE);
	  var args = [self, new Term(self._r).expr(newValue)._wrap()];
	  term._fillArgs(args);

	  if (helper.isPlainObject(options)) {
	    helper.loopKeys(options, function(obj, key) {
	      if ((key !== 'returnChanges') && (key !== 'durability') && (key !== 'nonAtomic')) {
	        throw new Error.ReqlDriverError('Unrecognized option `'+key+'` in `replace`', self._query, 'Available options are returnChanges <bool>, durability <string>, nonAtomic <bool>');
	      }
	    });
	    term._query.push(new Term(self._r).expr(translateOptions(options))._query);
	  }
	  return term;
	}
	Term.prototype.delete = function(options) {
	  var self = this;
	  if (self._fastArityRange(arguments.length, 1, 2) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    self._arityRange(_args, 0, 1, 'delete', self);
	  }

	  var term = new Term(self._r);
	  term._query.push(termTypes.DELETE);
	  var args = [self];
	  term._fillArgs(args);

	  if (helper.isPlainObject(options)) {
	    helper.loopKeys(options, function(obj, key) {
	      if ((key !== 'returnChanges') && (key !== 'durability')) {
	        throw new Error.ReqlDriverError('Unrecognized option `'+key+'` in `delete`', self._query, 'Available options are returnChanges <bool>, durability <string>');
	      }
	    });
	    term._query.push(new Term(self._r).expr(translateOptions(options))._query);
	  }
	  return term;
	}
	Term.prototype.sync = function() {
	  if (this._fastArity(arguments.length, 0) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    this._arity(_args, 0, 'sync', this);
	  }

	  var term = new Term(this._r);
	  term._query.push(termTypes.SYNC)
	  var args = [this._query];
	  term._fillArgs(args);
	  return term;
	}

	// Selecting data
	Term.prototype.db = function(db) {
	  this._noPrefix(this, 'db');
	  if (this._fastArity(arguments.length, 1) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    this._arity(_args, 1, 'db', this);
	  }

	  var term = new Term(this._r);
	  term._query.push(termTypes.DB)
	  var args = [new Term(this._r).expr(db)];
	  term._fillArgs(args);
	  return term;
	}
	Term.prototype.table = function(table, options) {
	  var self = this;
	  if (self._fastArityRange(arguments.length, 1, 2) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    self._arityRange(_args, 1, 2, 'table', self);
	  }

	  var term = new Term(self._r);
	  term._query.push(termTypes.TABLE)

	  var args = [];
	  if (Array.isArray(self._query) && (self._query.length > 0)) {
	    args.push(self);
	  }
	  args.push(new Term(self._r).expr(table))
	  term._fillArgs(args);

	  if (helper.isPlainObject(options)) {
	    helper.loopKeys(options, function(obj, key) {
	      if (key !== 'readMode') {
	        throw new Error.ReqlDriverError('Unrecognized option `'+key+'` in `table`', self._query, 'Available option is readMode <string>');
	      }
	    });
	    term._query.push(new Term(self._r).expr(translateOptions(options))._query);
	  }
	  return term;
	}
	Term.prototype.get = function(primaryKey) {
	  if (this._fastArity(arguments.length, 1) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    this._arity(_args, 1, 'get', this);
	  }

	  var term = new Term(this._r);
	  term._query.push(termTypes.GET);
	  var args = [this, new Term(this._r).expr(primaryKey)]
	  term._fillArgs(args);
	  return term;
	}
	Term.prototype.getAll = function() {
	  // We explicitly _args here, so fastArityRange is not useful
	  var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	  this._arityRange(_args, 1, Infinity, 'getAll', this);

	  var term = new Term(this._r);
	  term._query.push(termTypes.GET_ALL);

	  var args = [];
	  args.push(this);
	  for(var i=0; i<_args.length-1; i++) {
	    args.push(new Term(this._r).expr(_args[i]))
	  }
	  if ((_args.length > 1) && (helper.isPlainObject(_args[_args.length-1])) && (_args[_args.length-1].index !== undefined)) {
	    term._fillArgs(args);
	    term._query.push(new Term(this._r).expr(translateOptions(_args[_args.length-1]))._query);
	  }
	  else {
	    args.push(new Term(this._r).expr(_args[_args.length-1]))
	    term._fillArgs(args);
	  }
	  return term;
	}
	Term.prototype.between = function(start, end, options) {
	  var self = this;
	  if (self._fastArityRange(arguments.length, 2, 3) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    self._arityRange(_args, 2, 3, 'between', self);
	  }

	  var term = new Term(self._r);
	  term._query.push(termTypes.BETWEEN);
	  var args = [self, new Term(self._r).expr(start), new Term(self._r).expr(end)]
	  term._fillArgs(args);

	  if (helper.isPlainObject(options)) {
	    helper.loopKeys(options, function(obj, key) {
	      if ((key !== 'index') && (key !== 'leftBound') && (key !== 'rightBound')){
	        throw new Error.ReqlDriverError('Unrecognized option `'+key+'` in `between`', self._query, 'Available options are index <string>, leftBound <string>, rightBound <string>');
	      }
	    });
	    term._query.push(new Term(self._r).expr(translateOptions(options))._query);
	  }
	  return term;
	}
	Term.prototype.minval = function() {
	  var term = new Term(this._r);
	  term._query.push(termTypes.MINVAL);
	  return term;
	}
	Term.prototype.maxval = function() {
	  var term = new Term(this._r);
	  term._query.push(termTypes.MAXVAL);
	  return term;
	}

	Term.prototype.filter = function(filter, options) {
	  var self = this;
	  if (self._fastArityRange(arguments.length, 1, 2) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    self._arityRange(_args, 1, 2, 'filter', self);
	  }

	  var term = new Term(self._r);
	  term._query.push(termTypes.FILTER);
	  var args = [self, new Term(self._r).expr(filter)._wrap()]
	  term._fillArgs(args);

	  if (helper.isPlainObject(options)) {
	    helper.loopKeys(options, function(obj, key) {
	      if (key !== 'default') {
	        throw new Error.ReqlDriverError('Unrecognized option `'+key+'` in `filter`', self._query, 'Available option is filter');
	      }
	    })
	    term._query.push(new Term(self._r).expr(translateOptions(options))._query);
	  }
	  return term;
	}

	// Joins
	Term.prototype.innerJoin = function(sequence, predicate) {
	  if (this._fastArity(arguments.length, 2) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    this._arity(_args, 2, 'innerJoin', this);
	  }

	  var term = new Term(this._r);
	  term._query.push(termTypes.INNER_JOIN);
	  var args = [this._query];
	  args.push(new Term(this._r).expr(sequence)._query);
	  args.push(new Term(this._r).expr(predicate)._wrap()._query);
	  term._fillArgs(args);

	  return term;
	}
	Term.prototype.outerJoin = function(sequence, predicate) {
	  if (this._fastArity(arguments.length, 2) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    this._arity(_args, 2, 'outerJoin', this);
	  }

	  var term = new Term(this._r);
	  term._query.push(termTypes.OUTER_JOIN);
	  var args = [this];
	  args.push(new Term(this._r).expr(sequence));
	  args.push(new Term(this._r).expr(predicate)._wrap());
	  term._fillArgs(args);

	  return term;
	}
	Term.prototype.eqJoin = function(rightKey, sequence, options) {
	  var self = this;
	  if (self._fastArityRange(arguments.length, 2, 3) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    self._arityRange(_args, 2, 3, 'eqJoin', self);
	  }

	  var term = new Term(self._r);
	  term._query.push(termTypes.EQ_JOIN);
	  var args = [self];
	  args.push(new Term(self._r).expr(rightKey)._wrap());
	  args.push(new Term(self._r).expr(sequence));
	  term._fillArgs(args);

	  if (helper.isPlainObject(options)) {
	    helper.loopKeys(options, function(obj, key) {
	      if (key !== 'index') {
	        throw new Error.ReqlDriverError('Unrecognized option `'+key+'` in `eqJoin`', self._query, 'Available option is index <string>');
	      }
	    })
	    term._query.push(new Term(self._r).expr(translateOptions(options))._query);
	  }
	  return term;
	}
	Term.prototype.zip = function() {
	  if (this._fastArity(arguments.length, 0) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    this._arity(_args, 0, 'zip', this);
	  }

	  var term = new Term(this._r);
	  term._query.push(termTypes.ZIP);
	  var args = [this];
	  term._fillArgs(args);
	  return term;
	}



	// Transformation
	Term.prototype.map = function() {
	  var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	  this._arityRange(_args, 1, Infinity, 'map', this);

	  var term = new Term(this._r);
	  term._query.push(termTypes.MAP);
	  var args = [];
	  if (Array.isArray(this._query) && (this._query.length > 0)) {
	    args.push(this);
	  }
	  for(var i=0; i<_args.length-1; i++) {
	    args.push(new Term(this._r).expr(_args[i]))
	  }
	  // Make sure that we don't push undefined if no argument is passed to map,
	  // in which case the server will handle the case and return an error.
	  if (_args.length> 0) {
	    args.push(new Term(this._r).expr(_args[_args.length-1])._wrap())
	  }
	  term._fillArgs(args);

	  return term;
	}
	Term.prototype.withFields = function() {
	  var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	  this._arityRange(_args, 1, Infinity, 'withFields', this);

	  var term = new Term(this._r);
	  term._query.push(termTypes.WITH_FIELDS);
	  var args = [this];
	  for(var i=0; i<_args.length; i++) {
	    args.push(new Term(this._r).expr(_args[i]))
	  }
	  term._fillArgs(args);

	  return term;
	}
	Term.prototype.concatMap = function(transformation) {
	  if (this._fastArity(arguments.length, 1) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    this._arity(_args, 1, 'concatMap', this);
	  }

	  var term = new Term(this._r);
	  term._query.push(termTypes.CONCAT_MAP);
	  var args = [this];
	  args.push(new Term(this._r).expr(transformation)._wrap())
	  term._fillArgs(args);

	  return term;
	}
	Term.prototype.orderBy = function() {
	  var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	  this._arityRange(_args, 1, Infinity, 'orderBy', this);

	  var term = new Term(this._r);
	  term._query.push(termTypes.ORDER_BY);

	  var args = [this];
	  for(var i=0; i<_args.length-1; i++) {
	    if ((_args[i] instanceof Term) &&
	        ((_args[i]._query[0] === termTypes.DESC) || (_args[i]._query[0] === termTypes.ASC))) {
	      args.push(new Term(this._r).expr(_args[i]))
	    }
	    else {
	      args.push(new Term(this._r).expr(_args[i])._wrap())
	    }
	  }
	  // We actually don't need to make the difference here, but...
	  if ((_args.length > 0) && (helper.isPlainObject(_args[_args.length-1])) && (_args[_args.length-1].index !== undefined)) {
	    term._fillArgs(args);
	    term._query.push(new Term(this._r).expr(translateOptions(_args[_args.length-1]))._query);
	  }
	  else {
	    if ((_args[_args.length-1] instanceof Term) &&
	      ((_args[_args.length-1]._query[0] === termTypes.DESC) || (_args[_args.length-1]._query[0] === termTypes.ASC))) {
	      args.push(new Term(this._r).expr(_args[_args.length-1]))
	    }
	    else {
	      args.push(new Term(this._r).expr(_args[_args.length-1])._wrap())
	    }
	    term._fillArgs(args);
	  }
	  return term;

	}
	Term.prototype.desc = function(field) {
	  this._noPrefix(this, 'desc');
	  if (this._fastArity(arguments.length, 1) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    this._arity(_args, 1, 'desc', this);
	  }

	  var term = new Term(this._r);
	  term._query.push(termTypes.DESC)
	  var args = [new Term(this._r).expr(field)._wrap()];
	  term._fillArgs(args);
	  return term;
	}
	Term.prototype.asc = function(field) {
	  this._noPrefix(this, 'asc');
	  if (this._fastArity(arguments.length, 1) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    this._arity(_args, 1, 'asc', this);
	  }

	  var term = new Term(this._r);
	  term._query.push(termTypes.ASC)
	  var args = [new Term(this._r).expr(field)._wrap()];
	  term._fillArgs(args);
	  return term;
	}
	Term.prototype.skip = function(value) {
	  if (this._fastArity(arguments.length, 1) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    this._arity(_args, 1, 'skip', this);
	  }

	  var term = new Term(this._r);
	  term._query.push(termTypes.SKIP)
	  var args = [this, new Term(this._r).expr(value)]
	  term._fillArgs(args);
	  return term;
	}
	Term.prototype.limit = function(value) {
	  if (this._fastArity(arguments.length, 1) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    this._arity(_args, 1, 'limit', this);
	  }

	  var term = new Term(this._r);
	  term._query.push(termTypes.LIMIT)
	  var args = [this, new Term(this._r).expr(value)]
	  term._fillArgs(args);
	  return term;
	}
	Term.prototype.slice = function(start, end, options) {
	  if (this._fastArityRange(arguments.length, 1, 2) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    this._arityRange(_args, 1, 3, 'slice', this);
	  }

	  var term = new Term(this._r);
	  term._query.push(termTypes.SLICE);

	  var args = [];
	  args.push(this);
	  args.push(new Term(this._r).expr(start));

	  if ((end !== undefined) && (options !== undefined)) {
	    args.push(new Term(this._r).expr(end));
	    term._fillArgs(args);
	    term._query.push(new Term(this._r).expr(translateOptions(options))._query);
	  }
	  else if ((end !== undefined) && (options === undefined)) {
	    if (helper.isPlainObject(end) === false) {
	      args.push(new Term(this._r).expr(end));
	      term._fillArgs(args);
	    }
	    else {
	      term._fillArgs(args);
	      term._query.push(new Term(this._r).expr(translateOptions(end))._query);
	    }
	  }
	  else { // end and options are both undefined
	    term._fillArgs(args);
	  }
	  return term;
	}
	Term.prototype.nth = function(value) {
	  if (this._fastArity(arguments.length, 1) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    this._arity(_args, 1, 'nth', this);
	  }

	  var term = new Term(this._r);
	  term._query.push(termTypes.NTH)
	  var args = [this._query, new Term(this._r).expr(value)]
	  term._fillArgs(args);
	  return term;
	}
	Term.prototype.offsetsOf = function(predicate) {
	  if (this._fastArity(arguments.length, 1) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    this._arity(_args, 1, 'indexesOf', this);
	  }

	  var term = new Term(this._r);
	  term._query.push(termTypes.OFFSETS_OF)
	  var args = [this, new Term(this._r).expr(predicate)._wrap()];
	  term._fillArgs(args);
	  return term;
	}
	Term.prototype.indexesOf = Term.prototype.offsetsOf;

	Term.prototype.isEmpty = function() {
	  if (this._fastArity(arguments.length, 0) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    this._arity(_args, 0, 'isEmpty', this);
	  }

	  var term = new Term(this._r);
	  term._query.push(termTypes.IS_EMPTY)
	  var args = [this];
	  term._fillArgs(args);
	  return term;
	}
	Term.prototype.union = function() {
	  var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}

	  var term = new Term(this._r);
	  term._query.push(termTypes.UNION)
	  var args = [];
	  if (Array.isArray(this._query) && (this._query.length > 0)) {
	    args.push(this);
	  }

	  for(var i=0; i<_args.length; i++) {
	    args.push(new Term(this._r).expr(_args[i]))
	  }
	  term._fillArgs(args);
	  return term;
	}
	Term.prototype.sample = function(size) {
	  if (this._fastArity(arguments.length, 1) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    this._arity(_args, 1, 'sample', this);
	  }

	  var term = new Term(this._r);
	  term._query.push(termTypes.SAMPLE)
	  var args = [this, new Term(this._r).expr(size)];
	  term._fillArgs(args);
	  return term;
	}

	// Aggregations
	Term.prototype.reduce = function(func) {
	  if (this._fastArity(arguments.length, 1) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    this._arity(_args, 1, 'reduce', this);
	  }

	  var term = new Term(this._r);
	  term._query.push(termTypes.REDUCE)
	  var args = [this, new Term(this._r).expr(func)._wrap()];
	  term._fillArgs(args);
	  return term;
	}
	Term.prototype.count = function(filter) {
	  if (this._fastArityRange(arguments.length, 0, 1) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    this._arityRange(_args, 0, 1, 'count', this);
	  }

	  var term = new Term(this._r);
	  term._query.push(termTypes.COUNT);
	  var args = [];
	  args.push(this);
	  if (filter !== undefined) {
	    args.push(new Term(this._r).expr(filter)._wrap())
	  }
	  term._fillArgs(args);
	  return term;
	}
	Term.prototype.distinct = function(options) {
	  var self= this;
	  if (self._fastArityRange(arguments.length, 0, 1) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    self._arityRange(_args, 0, 1, 'distinct', self);
	  }

	  var term = new Term(self._r);
	  term._query.push(termTypes.DISTINCT)
	  var args = [self];
	  term._fillArgs(args);

	  if (helper.isPlainObject(options)) {
	    var keepGoing = true;
	    helper.loopKeys(options, function(obj, key) {
	      if ((keepGoing === true) && (key !== 'index')) {
	        throw new Error.ReqlDriverError('Unrecognized option `'+key+'` in `distinct`', self._query, 'Available option is index: <string>');
	        keepGoing = false;
	      }
	    });
	    if (keepGoing === true) {
	      term._query.push(new Term(self._r).expr(translateOptions(options))._query);
	    }
	  }

	  return term;
	}
	Term.prototype.group = function() {
	  var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	  var self = this;
	  self._arityRange(_args, 1, Infinity, 'group', self);

	  var term = new Term(self._r);
	  term._query.push(termTypes.GROUP);
	  var args = [self];
	  for(var i=0; i<_args.length-1; i++) {
	    args.push(new Term(self._r).expr(_args[i])._wrap())
	  }
	  if (_args.length > 0) {
	    if (helper.isPlainObject(_args[_args.length-1])) {
	      helper.loopKeys(_args[_args.length-1], function(obj, key) {
	         if ((key !== 'index')
	        && (key !==  'multi')) {
	          throw new Error.ReqlDriverError('Unrecognized option `'+key+'` in `group`', self._query, 'Available options are index: <string>, multi <boolean>');
	        }
	      });
	      term._fillArgs(args);
	      term._query.push(new Term(self._r).expr(translateOptions(_args[_args.length-1]))._query);
	    }
	    else {
	      args.push(new Term(self._r).expr(_args[_args.length-1])._wrap())
	      term._fillArgs(args);
	    }
	  }
	  else {
	    term._fillArgs(args);
	  }

	  return term;
	}
	Term.prototype.split = function(separator, max) {
	  if (this._fastArityRange(arguments.length, 0, 2) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    this._arityRange(_args, 0, 2, 'split', this);
	  }

	  var term = new Term(this._r);
	  term._query.push(termTypes.SPLIT)
	  var args = [this];
	  if (separator !== undefined) {
	    args.push(new Term(this._r).expr(separator))
	    if (max !== undefined) {
	      args.push(new Term(this._r).expr(max))
	    }
	  }
	  term._fillArgs(args);

	  return term;
	}

	Term.prototype.ungroup = function() {
	  if (this._fastArity(arguments.length, 0) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    this._arity(_args, 0, 'ungroup', this);
	  }

	  var term = new Term(this._r);
	  term._query.push(termTypes.UNGROUP)
	  var args = [this._query];
	  term._fillArgs(args);
	  return term;
	}
	Term.prototype.contains = function() {
	  var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	  this._arityRange(_args, 1, Infinity, 'contains', this);

	  var term = new Term(this._r);
	  term._query.push(termTypes.CONTAINS)
	  var args = [this._query];
	  for(var i=0; i<_args.length; i++) {
	    args.push(new Term(this._r).expr(_args[i])._wrap())
	  }
	  term._fillArgs(args);
	  return term;
	}
	Term.prototype.sum = function(field) {
	  if (this._fastArityRange(arguments.length, 0, 1) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    this._arityRange(_args, 0, 1, 'sum', this);
	  }

	  var term = new Term(this._r);
	  term._query.push(termTypes.SUM);
	  var args = [this];
	  if (field !== undefined) {
	    args.push(new Term(this._r).expr(field)._wrap())
	  }
	  term._fillArgs(args);
	  return term;
	}
	Term.prototype.avg = function(field) {
	  if (this._fastArityRange(arguments.length, 0, 1) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    this._arityRange(_args, 0, 1, 'avg', this);
	  }

	  var term = new Term(this._r);
	  term._query.push(termTypes.AVG)
	  var args = [this];
	  if (field !== undefined) {
	    args.push(new Term(this._r).expr(field)._wrap())
	  }
	  term._fillArgs(args);
	  return term;
	}
	Term.prototype.min = function(field) {
	  if (this._fastArityRange(arguments.length, 0, 1) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    this._arityRange(_args, 0, 1, 'min', this);
	  }

	  var term = new Term(this._r);
	  term._query.push(termTypes.MIN)
	  var args = [this];
	  if (field !== undefined) {
	    if (helper.isPlainObject(field)) {
	      term._fillArgs(args);
	      term._query.push(new Term(this._r).expr(translateOptions(field))._query);
	    }
	    else {
	      args.push(new Term(this._r).expr(field)._wrap());
	      term._fillArgs(args);
	    }
	  }
	  else {
	    term._fillArgs(args);
	  }
	  return term;
	}
	Term.prototype.max = function(field) {
	  if (this._fastArityRange(arguments.length, 0, 1) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    this._arityRange(_args, 0, 1, 'max', this);
	  }

	  var term = new Term(this._r);
	  term._query.push(termTypes.MAX)
	  var args = [this];
	  if (field !== undefined) {
	    if (helper.isPlainObject(field)) {
	      term._fillArgs(args);
	      term._query.push(new Term(this._r).expr(translateOptions(field))._query);
	    }
	    else {
	      args.push(new Term(this._r).expr(field)._wrap())
	      term._fillArgs(args);
	    }
	  }
	  else {
	    term._fillArgs(args);
	  }
	  return term;
	}



	// Document manipulation
	Term.prototype.row = function() {
	  this._noPrefix(this, 'row');
	  if (this._fastArity(arguments.length, 0) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    this._arity(_args, 0, 'r.row', this);
	  }

	  var term = new Term(this._r);
	  term._query.push(termTypes.IMPLICIT_VAR)
	  return term;
	}
	Term.prototype.pluck = function() {
	  var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	  this._arityRange(_args, 1, Infinity, 'pluck', this);

	  var term = new Term(this._r);
	  term._query.push(termTypes.PLUCK)
	  var args = [this];
	  for(var i=0; i<_args.length; i++) {
	    args.push(new Term(this._r).expr(_args[i]))
	  }
	  term._fillArgs(args);
	  return term;
	}
	Term.prototype.without = function() {
	  var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	  this._arityRange(_args, 1, Infinity, 'without', this);

	  var term = new Term(this._r);
	  term._query.push(termTypes.WITHOUT)
	  var args = [this];
	  for(var i=0; i<_args.length; i++) {
	    args.push(new Term(this._r).expr(_args[i]))
	  }
	  term._fillArgs(args);
	  return term;
	}
	Term.prototype.merge = function(arg) {
	  var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	  this._arityRange(_args, 1, Infinity, 'merge', this);

	  var term = new Term(this._r);
	  term._query.push(termTypes.MERGE)
	  var args = [this];
	  for(var i=0; i<_args.length; i++) {
	    args.push(new Term(this._r).expr(_args[i])._wrap())
	  }
	  term._fillArgs(args);
	  return term;
	}
	Term.prototype.literal = function(obj) {
	  this._noPrefix(this, 'literal');
	  // The test for arity is performed in r.literal

	  var term = new Term(this._r);
	  term._query.push(termTypes.LITERAL);
	  if (arguments.length > 0) {
	    var args = [new Term(this._r).expr(obj)];
	    term._fillArgs(args);
	  }
	  return term;
	}
	Term.prototype.append = function(value) {
	  if (this._fastArity(arguments.length, 1) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    this._arity(_args, 1, 'append', this);
	  }

	  var term = new Term(this._r);
	  term._query.push(termTypes.APPEND)
	  var args = [this, new Term(this._r).expr(value)];
	  term._fillArgs(args);
	  return term;
	}
	Term.prototype.prepend = function(value) {
	  if (this._fastArity(arguments.length, 1) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    this._arity(_args, 1, 'prepend', this);
	  }

	  var term = new Term(this._r);
	  term._query.push(termTypes.PREPEND)
	  var args = [this, new Term(this._r).expr(value)];
	  term._fillArgs(args);
	  return term;
	}
	Term.prototype.difference = function(other) {
	  if (this._fastArity(arguments.length, 1) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    this._arity(_args, 1, 'difference', this);
	  }

	  var term = new Term(this._r);
	  term._query.push(termTypes.DIFFERENCE)
	  var args = [this, new Term(this._r).expr(other)];
	  term._fillArgs(args);
	  return term;
	}
	Term.prototype.setInsert = function(other) {
	  if (this._fastArity(arguments.length, 1) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    this._arity(_args, 1, 'setInsert', this);
	  }

	  var term = new Term(this._r);
	  term._query.push(termTypes.SET_INSERT)
	  var args = [this, new Term(this._r).expr(other)];
	  term._fillArgs(args);
	  return term;
	}
	Term.prototype.setUnion = function(other) {
	  if (this._fastArity(arguments.length, 1) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    this._arity(_args, 1, 'setUnion', this);
	  }

	  var term = new Term(this._r);
	  term._query.push(termTypes.SET_UNION)
	  var args = [this, new Term(this._r).expr(other)];
	  term._fillArgs(args);
	  return term;
	}
	Term.prototype.setIntersection = function(other) {
	  if (this._fastArity(arguments.length, 1) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    this._arity(_args, 1, 'setIntersection', this);
	  }

	  var term = new Term(this._r);
	  term._query.push(termTypes.SET_INTERSECTION)
	  var args = [this, new Term(this._r).expr(other)];
	  term._fillArgs(args);
	  return term;
	}
	Term.prototype.setDifference = function(other) {
	  if (this._fastArity(arguments.length, 1) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    this._arity(_args, 1, 'setDifference', this);
	  }

	  var term = new Term(this._r);
	  term._query.push(termTypes.SET_DIFFERENCE)
	  var args = [this, new Term(this._r).expr(other)];
	  term._fillArgs(args);
	  return term;
	}
	Term.prototype.getField = function(field) {
	  if (this._fastArity(arguments.length, 1) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    this._arity(_args, 1, '(...)', this);
	  }

	  var term = new Term(this._r);
	  term._query.push(termTypes.GET_FIELD)
	  var args = [this, new Term(this._r).expr(field)];
	  term._fillArgs(args);
	  return term;
	}
	Term.prototype.bracket = function(field) {
	  if (this._fastArity(arguments.length, 1) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    this._arity(_args, 1, '(...)', this);
	  }

	  var term = new Term(this._r);
	  term._query.push(termTypes.BRACKET)
	  var args = [this, new Term(this._r).expr(field)];
	  term._fillArgs(args);
	  return term;
	}

	Term.prototype.hasFields = function() {
	  var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	  this._arityRange(_args, 1, Infinity, 'hasFields', this);

	  var term = new Term(this._r);
	  term._query.push(termTypes.HAS_FIELDS)
	  var args = [this];
	  for(var i=0; i<_args.length; i++) {
	    args.push(new Term(this._r).expr(_args[i]))
	  }
	  term._fillArgs(args);
	  return term;

	}
	Term.prototype.insertAt = function(index, value) {
	  if (this._fastArity(arguments.length, 2) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    this._arity(_args, 2, 'insertAt', this);
	  }

	  var term = new Term(this._r);
	  term._query.push(termTypes.INSERT_AT)
	  var args = [this, new Term(this._r).expr(index), new Term(this._r).expr(value)];
	  term._fillArgs(args);
	  return term;
	}
	Term.prototype.spliceAt = function(index, array) {
	  if (this._fastArityRange(arguments.length, 1, 2) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    this._arityRange(_args, 1, 2, 'spliceAt', this);
	  }

	  var term = new Term(this._r);
	  term._query.push(termTypes.SPLICE_AT)
	  var args = [this, new Term(this._r).expr(index), new Term(this._r).expr(array)];
	  term._fillArgs(args);
	  return term;
	}
	Term.prototype.deleteAt = function(start, end) {
	  if (this._fastArityRange(arguments.length, 1, 2) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    this._arityRange(_args, 1, 2, 'deleteAt', this);
	  }

	  var term = new Term(this._r);
	  term._query.push(termTypes.DELETE_AT);
	  var args = [this, new Term(this._r).expr(start)];
	  if (end !== undefined) {
	    args.push(new Term(this._r).expr(end))
	  }
	  term._fillArgs(args);
	  return term;
	}
	Term.prototype.changeAt = function(index, value) {
	  if (this._fastArityRange(arguments.length, 1, 2) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    this._arityRange(_args, 1, 2, 'changeAt', this);
	  }

	  var term = new Term(this._r);
	  term._query.push(termTypes.CHANGE_AT);
	  var args = [this];
	  args.push(new Term(this._r).expr(index))
	  args.push(new Term(this._r).expr(value))
	  term._fillArgs(args);
	  return term;
	}
	Term.prototype.keys = function() {
	  if (this._fastArity(arguments.length, 0) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    this._arity(_args, 0, 'keys', this);
	  }

	  var term = new Term(this._r);
	  term._query.push(termTypes.KEYS)
	  var args = [this];
	  term._fillArgs(args);
	  return term;
	}

	Term.prototype.values = function() {
	  if (this._fastArity(arguments.length, 0) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    this._arity(_args, 0, 'keys', this);
	  }

	  var term = new Term(this._r);
	  term._query.push(termTypes.VALUES)
	  var args = [this];
	  term._fillArgs(args);
	  return term;
	}

	Term.prototype.object = function() {
	  var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	  this._noPrefix(this, 'object');
	  this._arityRange(_args, 0, Infinity, 'object', this);

	  var term = new Term(this._r);
	  term._query.push(termTypes.OBJECT)
	  var args = [];
	  for(var i=0; i<_args.length; i++) {
	    args.push(new Term(this._r).expr(_args[i]))
	  }
	  term._fillArgs(args);
	  return term;
	}



	// String
	Term.prototype.match = function(regex) {
	  if (this._fastArity(arguments.length, 1) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    this._arity(_args, 1, 'match', this);
	  }

	  var term = new Term(this._r);
	  term._query.push(termTypes.MATCH)
	  var args = [this, new Term(this._r).expr(regex)];
	  term._fillArgs(args);
	  return term;
	}
	Term.prototype.upcase = function(regex) {
	  if (this._fastArity(arguments.length, 0) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    this._arity(_args, 0, 'upcase', this);
	  }

	  var term = new Term(this._r);
	  term._query.push(termTypes.UPCASE)
	  var args = [this];
	  term._fillArgs(args);
	  return term;
	}
	Term.prototype.downcase = function(regex) {
	  if (this._fastArity(arguments.length, 0) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    this._arity(_args, 0, 'upcase', this);
	  }

	  var term = new Term(this._r);
	  term._query.push(termTypes.DOWNCASE)
	  var args = [this];
	  term._fillArgs(args);
	  return term;
	}




	// Math and Logic
	Term.prototype.add = function() {
	  var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	  this._arityRange(_args, 1, Infinity, 'add', this);

	  var term = new Term(this._r);
	  term._query.push(termTypes.ADD)
	  var args = [this];
	  for(var i=0; i<_args.length; i++) {
	    args.push(new Term(this._r).expr(_args[i]))
	  }
	  term._fillArgs(args);
	  return term;
	}
	Term.prototype.sub = function() {
	  var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	  this._arityRange(_args, 1, Infinity, 'sub', this);

	  var term = new Term(this._r);
	  term._query.push(termTypes.SUB)
	  var args = [this];
	  for(var i=0; i<_args.length; i++) {
	    args.push(new Term(this._r).expr(_args[i]))
	  }
	  term._fillArgs(args);
	  return term;
	}
	Term.prototype.mul = function() {
	  var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	  this._arityRange(_args, 1, Infinity, 'mul', this);

	  var term = new Term(this._r);
	  term._query.push(termTypes.MUL)
	  var args = [this];
	  for(var i=0; i<_args.length; i++) {
	    args.push(new Term(this._r).expr(_args[i]))
	  }
	  term._fillArgs(args);
	  return term;
	}
	Term.prototype.div = function() {
	  var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	  this._arityRange(_args, 1, Infinity, 'div', this);

	  var term = new Term(this._r);
	  term._query.push(termTypes.DIV)
	  var args = [this];
	  for(var i=0; i<_args.length; i++) {
	    args.push(new Term(this._r).expr(_args[i]))
	  }
	  term._fillArgs(args);
	  return term;
	}
	Term.prototype.mod = function(b) {
	  if (this._fastArity(arguments.length, 1) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    this._arity(_args, 1, 'mod', this);
	  }

	  var term = new Term(this._r);
	  term._query.push(termTypes.MOD)
	  var args = [this, new Term(this._r).expr(b)];
	  term._fillArgs(args);
	  return term;
	}
	Term.prototype.and = function() {
	  var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}

	  var term = new Term(this._r);
	  term._query.push(termTypes.AND)
	  var args = [this];
	  for(var i=0; i<_args.length; i++) {
	    args.push(new Term(this._r).expr(_args[i]))
	  }
	  term._fillArgs(args);
	  return term;
	}
	Term.prototype.or = function() {
	  var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}

	  var term = new Term(this._r);
	  term._query.push(termTypes.OR)
	  var args = [this];
	  for(var i=0; i<_args.length; i++) {
	    args.push(new Term(this._r).expr(_args[i]))
	  }
	  term._fillArgs(args);
	  return term;
	}
	Term.prototype.eq = function() {
	  var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	  this._arityRange(_args, 1, Infinity, 'eq', this);

	  var term = new Term(this._r);
	  term._query.push(termTypes.EQ)
	  var args = [this];
	  for(var i=0; i<_args.length; i++) {
	    args.push(new Term(this._r).expr(_args[i]))
	  }
	  term._fillArgs(args);
	  return term;
	}
	Term.prototype.ne = function() {
	  var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	  this._arityRange(_args, 1, Infinity, 'ne', this);

	  var term = new Term(this._r);
	  term._query.push(termTypes.NE)
	  var args = [this];
	  for(var i=0; i<_args.length; i++) {
	    args.push(new Term(this._r).expr(_args[i]))
	  }
	  term._fillArgs(args);
	  return term;
	}
	Term.prototype.gt = function(other) {
	  var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	  this._arityRange(_args, 1, Infinity, 'gt', this);

	  var term = new Term(this._r);
	  term._query.push(termTypes.GT)
	  var args = [this];
	  for(var i=0; i<_args.length; i++) {
	    args.push(new Term(this._r).expr(_args[i]))
	  }
	  term._fillArgs(args);
	  return term;
	}
	Term.prototype.ge = function(other) {
	  var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	  this._arityRange(_args, 1, Infinity, 'ge', this);

	  var term = new Term(this._r);
	  term._query.push(termTypes.GE)
	  var args = [this];
	  for(var i=0; i<_args.length; i++) {
	    args.push(new Term(this._r).expr(_args[i]))
	  }
	  term._fillArgs(args);
	  return term;
	}
	Term.prototype.lt = function(other) {
	  var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	  this._arityRange(_args, 1, Infinity, 'lt', this);

	  var term = new Term(this._r);
	  term._query.push(termTypes.LT)
	  var args = [this];
	  for(var i=0; i<_args.length; i++) {
	    args.push(new Term(this._r).expr(_args[i]))
	  }
	  term._fillArgs(args);
	  return term;
	}
	Term.prototype.le = function(other) {
	  var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	  this._arityRange(_args, 1, Infinity, 'le', this);

	  var term = new Term(this._r);
	  term._query.push(termTypes.LE)
	  var args = [this];
	  for(var i=0; i<_args.length; i++) {
	    args.push(new Term(this._r).expr(_args[i]))
	  }
	  term._fillArgs(args);
	  return term;
	}
	Term.prototype.not = function() {
	  if (this._fastArity(arguments.length, 0) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    this._arity(_args, 0, 'not', this);
	  }

	  var term = new Term(this._r);
	  term._query.push(termTypes.NOT)
	  var args = [this];
	  term._fillArgs(args);
	  return term;
	}
	Term.prototype.random = function() {
	  var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	  var self = this;
	  self._noPrefix(this, 'random');
	  self._arityRange(_args, 0, 3, 'random', self);

	  var term = new Term(self._r);
	  term._query.push(termTypes.RANDOM);

	  var args = [];
	  for(var i=0; i<_args.length-1; i++) {
	    args.push(new Term(self._r).expr(_args[i]))
	  }
	  if (_args.length > 0) {
	    if (helper.isPlainObject(_args[_args.length-1])) {
	      helper.loopKeys(_args[_args.length-1], function(obj, key) {
	        if (key !== 'float') {
	          throw new Error.ReqlDriverError('Unrecognized option `'+key+'` in `random`', self._query, 'Available option is float: <boolean>');
	        }
	      });
	      term._fillArgs(args);
	      term._query.push(new Term(self._r).expr(translateOptions(_args[_args.length-1]))._query);
	    }
	    else {
	      args.push(new Term(self._r).expr(_args[_args.length-1]))
	      term._fillArgs(args);
	    }
	  }
	  else {
	    term._fillArgs(args);
	  }
	  return term;
	}
	Term.prototype.floor = function() {
	  if (this._fastArityRange(arguments.length, 0, 1) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    this._arityRange(_args, 0, 1, 'floor', this);
	  }

	  var term = new Term(this._r);
	  term._query.push(termTypes.FLOOR)
	  var args = [this];
	  term._fillArgs(args);
	  return term;
	}
	Term.prototype.ceil = function() {
	  if (this._fastArityRange(arguments.length, 0, 1) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    this._arityRange(_args, 0, 1, 'ceil', this);
	  }

	  var term = new Term(this._r);
	  term._query.push(termTypes.CEIL)
	  var args = [this];
	  term._fillArgs(args);
	  return term;
	}
	Term.prototype.round = function() {
	  if (this._fastArityRange(arguments.length, 0, 1) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    this._arityRange(_args, 0, 1, 'round', this);
	  }

	  var term = new Term(this._r);
	  term._query.push(termTypes.ROUND)
	  var args = [this];
	  term._fillArgs(args);
	  return term;
	}

	// Dates and times
	Term.prototype.now = function() {
	  this._noPrefix(this, 'now');

	  var term = new Term(this._r);
	  term._query.push(termTypes.NOW)
	  return term;
	}
	Term.prototype.time = function() {
	  var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	  this._noPrefix(this, 'time');
	  // Special check for arity
	  var foundArgs = false;
	  for(var i=0; i<_args.length; i++) {
	    if ((_args[i] instanceof Term) && (_args[i]._query[0] === termTypes.ARGS)) {
	      foundArgs = true;
	      break;
	    }
	  }
	  if (foundArgs === false) {
	    if ((_args.length !== 4) && (_args.length !== 7)) {
	      throw new Error.ReqlDriverError('`r.time` called with '+_args.length+' argument'+((_args.length>1)?'s':''), null, '`r.time` takes 4 or 7 arguments');
	    }
	  }

	  var term = new Term(this._r);
	  term._query.push(termTypes.TIME)
	  var args = [];
	  for(var i=0; i<_args.length; i++) {
	    args.push(new Term(this._r).expr(_args[i]))
	  }
	  term._fillArgs(args);
	  return term;
	}
	Term.prototype.epochTime = function(epochTime) {
	  this._noPrefix(this, 'epochTime');

	  var term = new Term(this._r);
	  term._query.push(termTypes.EPOCH_TIME)
	  var args = [new Term(this._r).expr(epochTime)];
	  term._fillArgs(args);
	  return term;
	}
	Term.prototype.ISO8601 = function(isoTime, options) {
	  this._noPrefix(this, 'ISO8601');
	  if (this._fastArityRange(arguments.length, 1, 2) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    this._arityRange(_args, 1, 2, 'ISO8601', this);
	  }

	  var term = new Term(this._r);
	  term._query.push(termTypes.ISO8601)
	  var args = [new Term(this._r).expr(isoTime)._query];
	  term._fillArgs(args);
	  if (helper.isPlainObject(options)) {
	    helper.loopKeys(options, function(obj, key) {
	      if (key !== 'defaultTimezone') {
	        throw new Error.ReqlDriverError('Unrecognized option `'+key+'` in `ISO8601`. Available options are primaryKey <string>, durability <string>, datancenter <string>');
	      }
	    });
	    term._query.push(new Term(this._r).expr(translateOptions(options))._query);
	  }

	  return term;

	  return new ISO8601(this._r, isoTime, options);
	}
	Term.prototype.inTimezone = function(timezone) {
	  if (this._fastArity(arguments.length, 1) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    this._arity(_args, 1, 'inTimezone', this);
	  }

	  var term = new Term(this._r);
	  term._query.push(termTypes.IN_TIMEZONE)
	  var args = [this, new Term(this._r).expr(timezone)];
	  term._fillArgs(args);
	  return term;
	}
	Term.prototype.timezone = function() {
	  if (this._fastArity(arguments.length, 0) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    this._arity(_args, 0, 'timezone', this);
	  }

	  var term = new Term(this._r);
	  term._query.push(termTypes.TIMEZONE)
	  var args = [this];
	  term._fillArgs(args);
	  return term;
	}
	Term.prototype.during = function(left, right, options) {
	  if (this._fastArityRange(arguments.length, 2, 3) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    this._arityRange(_args, 2, 3, 'during', this);
	  }

	  var term = new Term(this._r);
	  term._query.push(termTypes.DURING);
	  var args = [];
	  args.push(this);
	  args.push(new Term(this._r).expr(left));
	  args.push(new Term(this._r).expr(right));

	  term._fillArgs(args);
	  if (helper.isPlainObject(options)) {
	    term._query.push(new Term(this._r).expr(translateOptions(options))._query);
	  }
	  return term;
	}
	Term.prototype.date = function() {
	  if (this._fastArity(arguments.length, 0) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    this._arity(_args, 0, 'date', this);
	  }

	  var term = new Term(this._r);
	  term._query.push(termTypes.DATE)
	  var args = [this];
	  term._fillArgs(args);
	  return term;
	}
	Term.prototype.timeOfDay = function() {
	  if (this._fastArity(arguments.length, 0) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    this._arity(_args, 0, 'timeOfDay', this);
	  }

	  var term = new Term(this._r);
	  term._query.push(termTypes.TIME_OF_DAY)
	  var args = [this];
	  term._fillArgs(args);
	  return term;
	}
	Term.prototype.year = function() {
	  if (this._fastArity(arguments.length, 0) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    this._arity(_args, 0, 'year', this);
	  }

	  var term = new Term(this._r);
	  term._query.push(termTypes.YEAR)
	  var args = [this];
	  term._fillArgs(args);
	  return term;
	}
	Term.prototype.month = function() {
	  if (this._fastArity(arguments.length, 0) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    this._arity(_args, 0, 'month', this);
	  }

	  var term = new Term(this._r);
	  term._query.push(termTypes.MONTH)
	  var args = [this];
	  term._fillArgs(args);
	  return term;
	}
	Term.prototype.day = function() {
	  if (this._fastArity(arguments.length, 0) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    this._arity(_args, 0, 'day', this);
	  }

	  var term = new Term(this._r);
	  term._query.push(termTypes.DAY)
	  var args = [this];
	  term._fillArgs(args);
	  return term;
	}
	Term.prototype.dayOfYear = function() {
	  if (this._fastArity(arguments.length, 0) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    this._arity(_args, 0, 'dayOfYear', this);
	  }

	  var term = new Term(this._r);
	  term._query.push(termTypes.DAY_OF_YEAR)
	  var args = [this];
	  term._fillArgs(args);
	  return term;
	}
	Term.prototype.dayOfWeek = function() {
	  if (this._fastArity(arguments.length, 0) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    this._arity(_args, 0, 'dayOfWeek', this);
	  }

	  var term = new Term(this._r);
	  term._query.push(termTypes.DAY_OF_WEEK)
	  var args = [this];
	  term._fillArgs(args);
	  return term;
	}
	Term.prototype.hours = function() {
	  if (this._fastArity(arguments.length, 0) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    this._arity(_args, 0, 'hours', this);
	  }

	  var term = new Term(this._r);
	  term._query.push(termTypes.HOURS)
	  var args = [this];
	  term._fillArgs(args);
	  return term;
	}
	Term.prototype.minutes = function() {
	  if (this._fastArity(arguments.length, 0) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    this._arity(_args, 0, 'minutes', this);
	  }

	  var term = new Term(this._r);
	  term._query.push(termTypes.MINUTES)
	  var args = [this];
	  term._fillArgs(args);
	  return term;
	}
	Term.prototype.seconds = function() {
	  if (this._fastArity(arguments.length, 0) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    this._arity(_args, 0, 'seconds', this);
	  }

	  var term = new Term(this._r);
	  term._query.push(termTypes.SECONDS)
	  var args = [this];
	  term._fillArgs(args);
	  return term;
	}
	Term.prototype.toISO8601 = function() {
	  if (this._fastArity(arguments.length, 0) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    this._arity(_args, 0, 'toISO8601', this);
	  }

	  var term = new Term(this._r);
	  term._query.push(termTypes.TO_ISO8601)
	  var args = [this];
	  term._fillArgs(args);
	  return term;
	}
	Term.prototype.toEpochTime = function() {
	  if (this._fastArity(arguments.length, 0) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    this._arity(_args, 0, 'toEpochTime', this);
	  }

	  var term = new Term(this._r);
	  term._query.push(termTypes.TO_EPOCH_TIME)
	  var args = [this];
	  term._fillArgs(args);
	  return term;
	}
	Term.prototype.monday = function() {
	  var term = new Term(this._r);
	  term._query.push(termTypes.MONDAY);
	  return term;
	}
	Term.prototype.tuesday = function() {
	  var term = new Term(this._r);
	  term._query.push(termTypes.TUESDAY);
	  return term;
	}
	Term.prototype.wednesday = function() {
	  var term = new Term(this._r);
	  term._query.push(termTypes.WEDNESDAY);
	  return term;
	}
	Term.prototype.thursday = function() {
	  var term = new Term(this._r);
	  term._query.push(termTypes.THURSDAY);
	  return term;
	}
	Term.prototype.friday = function() {
	  var term = new Term(this._r);
	  term._query.push(termTypes.FRIDAY);
	  return term;
	}
	Term.prototype.saturday = function() {
	  var term = new Term(this._r);
	  term._query.push(termTypes.SATURDAY);
	  return term;
	}
	Term.prototype.sunday = function() {
	  var term = new Term(this._r);
	  term._query.push(termTypes.SUNDAY);
	  return term;
	}

	Term.prototype.january = function() {
	  var term = new Term(this._r);
	  term._query.push(termTypes.JANUARY);
	  return term;
	}
	Term.prototype.february = function() {
	  var term = new Term(this._r);
	  term._query.push(termTypes.FEBRUARY);
	  return term;
	}
	Term.prototype.march = function() {
	  var term = new Term(this._r);
	  term._query.push(termTypes.MARCH);
	  return term;
	}
	Term.prototype.april = function() {
	  var term = new Term(this._r);
	  term._query.push(termTypes.APRIL);
	  return term;
	}
	Term.prototype.may = function() {
	  var term = new Term(this._r);
	  term._query.push(termTypes.MAY);
	  return term;
	}
	Term.prototype.june = function() {
	  var term = new Term(this._r);
	  term._query.push(termTypes.JUNE);
	  return term;
	}
	Term.prototype.july = function() {
	  var term = new Term(this._r);
	  term._query.push(termTypes.JULY);
	  return term;
	}
	Term.prototype.august = function() {
	  var term = new Term(this._r);
	  term._query.push(termTypes.AUGUST);
	  return term;
	}
	Term.prototype.september = function() {
	  var term = new Term(this._r);
	  term._query.push(termTypes.SEPTEMBER);
	  return term;
	}
	Term.prototype.october = function() {
	  var term = new Term(this._r);
	  term._query.push(termTypes.OCTOBER);
	  return term;
	}
	Term.prototype.november = function() {
	  var term = new Term(this._r);
	  term._query.push(termTypes.NOVEMBER);
	  return term;
	}
	Term.prototype.december = function() {
	  var term = new Term(this._r);
	  term._query.push(termTypes.DECEMBER);
	  return term;
	}


	Term.prototype.args = function() {
	  var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	  this._noPrefix(this, 'args');

	  var term = new Term(this._r);
	  term._query.push(termTypes.ARGS);
	  var args = [];
	  for(var i=0; i<_args.length; i++) {
	    args.push(new Term(this._r).expr(_args[i]))
	  }
	  term._fillArgs(args);
	  return term;
	}
	Term.prototype.do = function() {
	  var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	  this._arityRange(_args, 1, Infinity, 'do', this);

	  var term = new Term(this._r);
	  term._query.push(termTypes.FUNCALL);
	  var args = [new Term(this._r).expr(_args[_args.length-1])._wrap()._query];
	  args.push(this);
	  for(var i=0; i<_args.length-1; i++) {
	    args.push(new Term(this._r).expr(_args[i]))
	  }
	  term._fillArgs(args);
	  return term;
	}


	Term.prototype.branch = function() {
	  var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	  this._arityRange(_args, 2, Infinity, '', this);

	  var term = new Term(this._r);
	  term._query.push(termTypes.BRANCH)
	  var args = [];
	  args.push(this);
	  for(var i=0; i<_len; i++) {
	    args.push(new Term(this._r).expr(_args[i]))
	  }
	  term._fillArgs(args);
	  return term;
	}
	Term.prototype.forEach = function(func) {
	  if (this._fastArity(arguments.length, 1) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    this._arity(_args, 1, 'forEach', this);
	  }

	  var term = new Term(this._r);
	  term._query.push(termTypes.FOR_EACH);
	  var args = [this, new Term(this._r).expr(func)._wrap()];
	  term._fillArgs(args);
	  return term;
	}
	Term.prototype.default = function(expression) {
	  if (this._fastArity(arguments.length, 1) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    this._arity(_args, 1, 'default', this);
	  }

	  var term = new Term(this._r);
	  term._query.push(termTypes.DEFAULT);
	  var args = [this, new Term(this._r).expr(expression)];
	  term._fillArgs(args);
	  return term;
	}
	Term.prototype.expr = function(expression, nestingLevel) {
	  var self = this;
	  self._noPrefix(self, 'expr');
	  if (self._fastArityRange(arguments.length, 1, 2) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    self._arityRange(_args, 1, 2, 'expr', self);
	  }

	  // undefined will be caught in the last else
	  var ar, obj;

	  if (expression === undefined) {
	    var error = 'Cannot convert `undefined` with r.expr()';
	    return new Term(self._r, expression, error);
	  }

	  var _nestingLevel = nestingLevel;
	  if (_nestingLevel == null) {
	    _nestingLevel = self._r.nestingLevel;
	  }
	  //if (nestingLevel == null) nestingLevel = self._r.nestingLevel;
	  if (_nestingLevel < 0) throw new Error.ReqlDriverError('Nesting depth limit exceeded.\nYou probably have a circular reference somewhere')

	  if (expression instanceof Term) {
	    return expression;
	  }
	  else if (expression instanceof Function) {
	    return new Func(self._r, expression);
	  }
	  else if (expression instanceof Date) {
	    return new Term(self._r).ISO8601(expression.toISOString())
	  }
	  else if (Array.isArray(expression)) {
	    var term = new Term(self._r);
	    term._query.push(termTypes.MAKE_ARRAY);

	    var args = [];
	    for(var i=0; i<expression.length; i++) {
	      args.push(new Term(self._r).expr(expression[i], _nestingLevel-1))
	    }
	    term._fillArgs(args);
	    return term;
	  }
	  else if (expression instanceof Buffer) {
	    return self._r.binary(expression);
	  }
	  else if (helper.isPlainObject(expression)) {
	    var term = new Term(self._r);
	    var optArgs = {};
	    var foundError = false;
	    helper.loopKeys(expression, function(expression, key) {
	      if (expression[key] !== undefined) {
	        var optArg = new Term(self._r).expr(expression[key], _nestingLevel-1);
	        if (optArg instanceof Term && !foundError && optArg._error != null) {
	          foundError = true;
	          term._error = optArg._error;
	          term._frames = [key].concat(optArg._frames);
	        }
	        optArgs[key] = optArg._query;
	      }
	    });
	    term._query = optArgs;
	    return term;
	  }
	  else { // Primitive
	    if (expression === null) {
	      return new Term(self._r, null, expression);
	    }
	    else if (typeof expression === 'string') {
	      return new Term(self._r, expression);
	    }
	    else if (typeof expression === 'number') {
	      if (expression !== expression) {
	        var error = 'Cannot convert `NaN` to JSON';
	        return new Term(self._r, expression, error);
	      }
	      else if (!isFinite(expression)) {
	        var error = 'Cannot convert `Infinity` to JSON';
	        return new Term(self._r, expression, error);
	      }
	      return new Term(self._r, expression);
	    }
	    else if (typeof expression === 'boolean') {
	      return new Term(self._r, expression);
	    }
	    else {
	      //TODO
	      self._error = new Error.ReqlDriverError('Cannot convert `'+expression+'` to datum.')
	    }
	  }
	  return self;
	}

	Term.prototype.binary = function(bin) {
	  this._noPrefix(this, 'binary');
	  if (this._fastArity(arguments.length, 1) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    this._arity(_args, 1, 'binary', this);
	  }

	  var term;
	  if (bin instanceof Buffer) {
	    // We could use BINARY, and coerce `bin` to an ASCII string, but that
	    // will break if there is a null char
	    term = new Term(this._r, {
	      $reql_type$: 'BINARY',
	      data: bin.toString('base64')
	    });
	  }
	  else {
	    term = new Term(this._r);
	    term._query.push(termTypes.BINARY)
	    var args = [new Term(this._r).expr(bin)];
	    term._fillArgs(args);
	  }
	  return term;
	}

	Term.prototype.js = function(arg, options) {
	  this._noPrefix(this, 'js');
	  if (this._fastArityRange(arguments.length, 1, 2) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    this._arityRange(_args, 1, 2, 'js', this);
	  }

	  var term = new Term(this._r);
	  term._query.push(termTypes.JAVASCRIPT)
	  var args = [new Term(this._r).expr(arg)];
	  term._fillArgs(args);

	  if (helper.isPlainObject(options)) {
	    term._query.push(new Term(this._r).expr(translateOptions(options))._query);
	  }
	  return term;
	}
	Term.prototype.coerceTo = function(type) {
	  if (this._fastArity(arguments.length, 1) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    this._arity(_args, 1, 'coerceTo', this);
	  }

	  var term = new Term(this._r);
	  term._query.push(termTypes.COERCE_TO)
	  var args = [this, new Term(this._r).expr(type)];
	  term._fillArgs(args);
	  return term;
	}
	Term.prototype.typeOf = function() {
	  if (this._fastArity(arguments.length, 0) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    this._arity(_args, 0, 'typeOf', this);
	  }

	  var term = new Term(this._r);
	  term._query.push(termTypes.TYPE_OF);
	  var args = [this];
	  term._fillArgs(args);
	  return term;
	}
	Term.prototype.info = function() {
	  if (this._fastArity(arguments.length, 0) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    this._arity(_args, 0, 'info', this);
	  }

	  var term = new Term(this._r);
	  term._query.push(termTypes.INFO);
	  var args = [this];
	  term._fillArgs(args);
	  return term;
	}
	Term.prototype.json = function(json) {
	  this._noPrefix(this, 'json');
	  if (this._fastArity(arguments.length, 1) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    this._arity(_args, 1, 'info', this);
	  }
	  /*
	  if ((/\\u0000/.test(json)) || (/\0/.test(json))) {
	    this._error = new Error.ReqlDriverError('The null character is currently not supported by RethinkDB');
	  }
	  */
	  var term = new Term(this._r);
	  term._query.push(termTypes.JSON);

	  var args = [new Term(this._r).expr(json)];
	  term._fillArgs(args);
	  return term;
	}
	Term.prototype.http = function(url, options) {
	  this._noPrefix(this, 'http');
	  if (this._fastArityRange(arguments.length, 1, 2) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    this._arityRange(_args, 1, 2, 'http', this);
	  }

	  var term = new Term(this._r);
	  term._query.push(termTypes.HTTP);
	  var args = [new Term(this._r).expr(url)];
	  term._fillArgs(args);
	  if (helper.isPlainObject(options)) {
	    helper.loopKeys(options, function(obj, key) {
	      if ((key !== 'timeout')
	        && (key !==  'attempts')
	        && (key !==  'redirects')
	        && (key !==  'verify')
	        && (key !==  'resultFormat')
	        && (key !==  'method')
	        && (key !==  'auth')
	        && (key !==  'params')
	        && (key !==  'header')
	        && (key !==  'data')
	        && (key !==  'page')
	        && (key !==  'pageLimit')
	        && (key !==  '')) {
	        throw new Error.ReqlDriverError('Unrecognized option `'+key+'` in `http`. Available options are attempts <number>, redirects <number>, verify <boolean>, resultFormat: <string>, method: <string>, auth: <object>, params: <object>, header: <string>, data: <string>, page: <string/function>, pageLimit: <number>');
	      }
	    });

	    term._query.push(new Term(this._r).expr(translateOptions(options))._query);
	  }
	  return term;
	}
	Term.prototype.uuid = function(str) {
	  this._noPrefix(this, 'uuid');

	  var term = new Term(this._r);
	  term._query.push(termTypes.UUID)

	  if (str !== undefined) {
	    var args = [new Term(this._r).expr(str)];
	    term._fillArgs(args);
	  }
	  return term;
	}


	Term.prototype.circle = function(center, radius, options) {
	  var self = this;

	  // Arity check is done by r.circle
	  self._noPrefix(self, 'circle');
	  var term = new Term(self._r);
	  term._query.push(termTypes.CIRCLE);
	  var args = [new Term(self._r).expr(center), new Term(self._r).expr(radius)];
	  term._fillArgs(args);

	  if (helper.isPlainObject(options)) {
	    // There is no need to translate here
	    helper.loopKeys(options, function(obj, key) {
	      if ((key !== 'numVertices') && (key !== 'geoSystem') && (key !== 'unit') && (key !== 'fill')) {
	        throw new Error.ReqlDriverError('Unrecognized option `'+key+'` in `circle`', self._query, 'Available options are numVertices <number>, geoSsystem <string>, unit <string> and fill <bool>');
	      }
	    });
	    term._query.push(new Term(self._r).expr(translateOptions(options))._query);
	  }

	  return term;
	}
	Term.prototype.distance = function(geometry, options) {
	  var self = this;
	  if (self._fastArityRange(arguments.length, 1, 2) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    self._arityRange(_args, 1, 2, 'distance', self);
	  }
	  var term = new Term(self._r);
	  term._query.push(termTypes.DISTANCE);
	  var args = [self, new Term(self._r).expr(geometry)];
	  term._fillArgs(args);
	  if (helper.isPlainObject(options)) {
	    helper.loopKeys(options, function(obj, key) {
	      if ((key !== 'geoSystem') && (key !== 'unit')) {
	        throw new Error.ReqlDriverError('Unrecognized option `'+key+'` in `distance`', self._query, 'Available options are geoSystem <string>, unit <string>');
	      }
	    });
	    term._query.push(new Term(self._r).expr(translateOptions(options))._query);
	  }
	  return term;
	}
	Term.prototype.fill = function() {
	  if (this._fastArity(arguments.length, 0) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    this._arity(_args, 0, 'fill', this);
	  }
	  var term = new Term(this._r);
	  term._query.push(termTypes.FILL);
	  var args = [this];
	  term._fillArgs(args);
	  return term;
	}

	Term.prototype.geojson = function(geometry) {
	  if (this._fastArity(arguments.length, 1) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    this._arity(_args, 1, 'geojson', this);
	  }
	  this._noPrefix(this, 'geojson');
	  var term = new Term(this._r);
	  term._query.push(termTypes.GEOJSON);
	  var args = [new Term(this._r).expr(geometry)];
	  term._fillArgs(args);
	  return term;
	}

	Term.prototype.toGeojson = function() {
	  if (this._fastArity(arguments.length, 0) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    this._arity(_args, 0, 'toGeojson', this);
	  }
	  var term = new Term(this._r);
	  term._query.push(termTypes.TO_GEOJSON);
	  var args = [this];
	  term._fillArgs(args);
	  return term;
	}

	Term.prototype.getIntersecting = function(geometry, options) {
	  if (this._fastArity(arguments.length, 2) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    this._arity(_args, 2, 'getIntersecting', this);
	  }
	  var term = new Term(this._r);
	  term._query.push(termTypes.GET_INTERSECTING);
	  var args = [this, new Term(this._r).expr(geometry)];
	  term._fillArgs(args);
	  if (helper.isPlainObject(options)) {
	    helper.loopKeys(options, function(obj, key) {
	      if (key !== 'index') {
	        throw new Error.ReqlDriverError('Unrecognized option `'+key+'` in `distance`', self._query, 'Available options are index <string>');
	      }
	    });
	    term._query.push(new Term(this._r).expr(translateOptions(options))._query);
	  }
	  return term;
	}

	Term.prototype.getNearest = function(geometry, options) {
	  var self = this;
	  if (self._fastArity(arguments.length, 2) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    self._arity(_args, 2, 'getNearest', self);
	  }
	  var term = new Term(self._r);
	  term._query.push(termTypes.GET_NEAREST);
	  var args = [self, new Term(self._r).expr(geometry)];
	  term._fillArgs(args);
	  if (helper.isPlainObject(options)) {
	    helper.loopKeys(options, function(obj, key) {
	      if ((key !== 'index') && (key !== 'maxResults') && (key !== 'maxDist') && (key !== 'unit') && (key !== 'geoSystem')) {
	        throw new Error.ReqlDriverError('Unrecognized option `'+key+'` in `getNearest`', self._query, 'Available options are index <string>, maxResults <number>, maxDist <number>, unit <string>, geoSystem <string>');
	      }
	    });
	    term._query.push(new Term(self._r).expr(translateOptions(options))._query);
	  }
	  return term;

	}

	Term.prototype.includes = function(geometry) {
	  if (this._fastArity(arguments.length, 1) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    this._arity(_args, 1, 'includes', this);
	  }
	  var term = new Term(this._r);
	  term._query.push(termTypes.INCLUDES);
	  var args = [this, new Term(this._r).expr(geometry)];
	  term._fillArgs(args);
	  return term;
	}

	Term.prototype.intersects = function(geometry) {
	  if (this._fastArity(arguments.length, 1) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    this._arity(_args, 1, 'intersects', this);
	  }
	  var term = new Term(this._r);
	  term._query.push(termTypes.INTERSECTS);
	  var args = [this, new Term(this._r).expr(geometry)];
	  term._fillArgs(args);
	  return term;
	}

	Term.prototype.line = function() {
	  var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	  // Arity check is done by r.line
	  this._noPrefix(this, 'line');

	  var term = new Term(this._r);
	  term._query.push(termTypes.LINE);

	  var args = [];
	  for(var i=0; i<_args.length; i++) {
	    args.push(new Term(this._r).expr(_args[i]))
	  }
	  term._fillArgs(args);
	  return term;
	}

	Term.prototype.point = function(longitude, latitude) {
	  // Arity check is done by r.point
	  this._noPrefix(this, 'point');

	  var term = new Term(this._r);
	  term._query.push(termTypes.POINT);
	  var args = [new Term(this._r).expr(longitude), new Term(this._r).expr(latitude)];
	  term._fillArgs(args);
	  return term;
	}

	Term.prototype.polygon = function() {
	  var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	  // Arity check is done by r.polygon
	  this._noPrefix(this, 'polygon');

	  var term = new Term(this._r);
	  term._query.push(termTypes.POLYGON);

	  var args = [];
	  for(var i=0; i<_args.length; i++) {
	    args.push(new Term(this._r).expr(_args[i]))
	  }
	  term._fillArgs(args);

	  return term;
	}

	Term.prototype.polygonSub = function(geometry) {
	  if (this._fastArity(arguments.length, 1) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    this._arity(_args, 1, 'polygonSub', this);
	  }
	  var term = new Term(this._r);
	  term._query.push(termTypes.POLYGON_SUB);
	  var args = [this, new Term(this._r).expr(geometry)];
	  term._fillArgs(args);
	  return term;
	}

	Term.prototype.range = function(start, end) {
	  this._noPrefix(this, 'range');
	  if (this._fastArityRange(arguments.length, 1, 2) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    this._arityRange(_args, 1, 2, 'r.range', this);
	  }
	  var term = new Term(this._r);
	  term._query.push(termTypes.RANGE);
	  var args = [];
	  args.push(new Term(this._r).expr(start));
	  if (end !== undefined) {
	    args.push(new Term(this._r).expr(end));
	  }
	  term._fillArgs(args);
	  return term;
	}
	Term.prototype.toJsonString = function() {
	  if (this._fastArity(arguments.length, 0) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    this._arity(_args, 0, 'toJSON', this);
	  }
	  var term = new Term(this._r);
	  term._query.push(termTypes.TO_JSON_STRING);
	  var args = [this];
	  term._fillArgs(args);
	  return term;
	}
	Term.prototype.toJSON = Term.prototype.toJsonString;

	Term.prototype.config = function() {
	  if (this._fastArity(arguments.length, 0) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    this._arity(_args, 0, 'config', this);
	  }
	  var term = new Term(this._r);
	  term._query.push(termTypes.CONFIG);
	  var args = [this];
	  term._fillArgs(args);
	  return term;
	}

	Term.prototype.status = function() {
	  if (this._fastArity(arguments.length, 0) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    this._arity(_args, 0, 'status', this);
	  }
	  var term = new Term(this._r);
	  term._query.push(termTypes.STATUS);
	  var args = [this];
	  term._fillArgs(args);
	  return term;
	}

	Term.prototype.wait = function(options) {
	  var self = this;
	  if (self._fastArityRange(arguments.length, 0, 1) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    self._arityRange(_args, 0, 1, 'wait', self);
	  }
	  var term = new Term(self._r);
	  term._query.push(termTypes.WAIT);
	  if (Array.isArray(self._query) && (self._query.length > 0)) {
	    var args = [self];
	    term._fillArgs(args);
	  }
	  if (helper.isPlainObject(options)) {
	    helper.loopKeys(options, function(obj, key) {
	      if ((key !== 'waitFor') && (key !== 'timeout')) {
	        throw new Error.ReqlDriverError('Unrecognized option `'+key+'` in `wait`', self._query, 'Available options are waitFor: <string>, timeout: <number>');
	      }
	    });
	    term._query.push(new Term(self._r).expr(translateOptions(options))._query);
	  }

	  return term;
	}

	Term.prototype.reconfigure = function(config) {
	  var self = this;
	  if (self._fastArity(arguments.length, 1) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    self._arity(_args, 1, 'reconfigure', self);
	  }
	  var term = new Term(self._r);
	  term._query.push(termTypes.RECONFIGURE);

	  if (Array.isArray(this._query) && (this._query.length > 0)) {
	    var args = [this];
	    term._fillArgs(args);
	  }
	  else{
	    term._query.push([]);
	  }
	  if (helper.isPlainObject(config)) {
	    helper.loopKeys(config, function(obj, key) {
	      if ((key !== 'shards') && (key !== 'replicas') &&
	        (key !== 'dryRun') && (key !== 'primaryReplicaTag') &&
	        (key !== 'nonvotingReplicaTags') && (key !== 'emergencyRepair')) {
	        throw new Error.ReqlDriverError('Unrecognized option `'+key+'` in `reconfigure`', self._query, 'Available options are shards: <number>, replicas: <number>, primaryReplicaTag: <object>, dryRun <boolean>, emergencyRepair: <string>, nonvotingReplicaTags: <array<string>>');
	      }
	    });
	    term._query.push(new Term(self._r).expr(translateOptions(config))._query);
	  }
	  else {
	    throw new Error.ReqlDriverError('First argument of `reconfigure` must be an object');
	  }
	  return term;
	}

	Term.prototype.rebalance = function() {
	  if (this._fastArity(arguments.length, 0) === false) {
	    var _len = arguments.length;var _args = new Array(_len); for(var _i = 0; _i < _len; _i++) {_args[_i] = arguments[_i];}
	    this._arity(_args, 0, 'rebalance', this);
	  }
	  var term = new Term(this._r);
	  term._query.push(termTypes.REBALANCE);
	  if (Array.isArray(this._query) && (this._query.length > 0)) {
	    var args = [this];
	    term._fillArgs(args);
	  }
	  return term;
	}


	Term.prototype.then = function(resolve, reject) {
	  return this.run().then(resolve, reject);
	}
	Term.prototype.error = function(reject) {
	  return this.run().error(reject);
	}
	Term.prototype.catch = function(reject) {
	  return this.run().catch(reject);
	}
	Term.prototype.finally = function(handler) {
	  return this.run().finally(handler);
	}


	Term.prototype.toString = function() {
	  return Error.generateBacktrace(this._query, 0, null, [], {indent: 0, extra: 0}).str;
	}

	Term.prototype._wrap = function() {
	  var self = this;
	  if (helper.hasImplicit(this._query)) {
	    if (this._query[0] === termTypes.ARGS) {
	      throw new Error.ReqlDriverError('Implicit variable `r.row` cannot be used inside `r.args`')
	    }
	    //Must pass at least one variable to the function or it won't accept r.row
	    return new Term(this._r).expr(function(doc) { return self; })
	  }
	  else {
	    return self;
	  }
	}

	Term.prototype._fillArgs = function(args) {
	  var foundError = false;
	  var internalArgs = [];
	  for(var i=0; i<args.length; i++) {
	  if (args[i] instanceof Term) {
	    internalArgs.push(args[i]._query);
	    if (!foundError && (args[i]._error != null)) {
	    this._error = args[i]._error;
	    this._frames = args[i]._frames;
	    this._frames.unshift(i);
	    foundError = true;
	    }
	  }
	  else {
	    internalArgs.push(args[i]);
	  }
	  }
	  this._query.push(internalArgs);
	  return this;
	}

	Term.prototype._translateArgs = {
	  returnChanges: 'return_changes',
	  includeInitial: 'include_initial',
	  primaryKey: 'primary_key',
	  readMode: 'read_mode',
	  nonAtomic: 'non_atomic',
	  leftBound: 'left_bound',
	  rightBound: 'right_bound',
	  defaultTimezone: 'default_timezone',
	  noReply: 'noreply',
	  resultFormat: 'result_format',
	  pageLimit: 'page_limit',
	  arrayLimit: 'array_limit',
	  numVertices: 'num_vertices',
	  geoSystem: 'geo_system',
	  maxResults: 'max_results',
	  maxDist: 'max_dist',
	  dryRun: 'dry_run',
	  waitFor: 'wait_for',
	  includeStates: 'include_states',
	  primaryReplicaTag: 'primary_replica_tag',
	  emergencyRepair: 'emergency_repair',
	  minBatchRows: 'min_batch_rows',
	  maxBatchRows: 'max_batch_rows',
	  maxBatchBytes: 'max_batch_bytes',
	  maxBatchSeconds: 'max_batch_seconds',
	  firstBatchScaledownFactor: 'first_batch_scaledown_factor'
	}
	function translateOptions(options) {
	  var translatedOpt = {};
	  helper.loopKeys(options, function(options, key) {
	    var keyServer = Term.prototype._translateArgs[key] || key;
	    translatedOpt[keyServer] = options[key];
	  });
	  return translatedOpt;
	}
	Term.prototype._setNestingLevel = function(nestingLevel) {
	  Term.prototype._nestingLevel = nestingLevel;
	}
	Term.prototype._setArrayLimit = function(arrayLimit) {
	  Term.prototype._arrayLimit = arrayLimit;
	}


	Term.prototype._noPrefix = function(term, method) {
	  if ((!Array.isArray(term._query)) || (term._query.length > 0)) {
	    throw new Error.ReqlDriverError('`'+method+'` is not defined', term._query);
	  }
	}
	Term.prototype._arityRange = function(args, min, max, method, term) {
	  var foundArgs = false;
	  if (args.length < min) {
	    for(var i=0; i<args.length; i++) {
	      if ((args[i] instanceof Term) && (args[i]._query[0] === termTypes.ARGS)) {
	        foundArgs = true;
	        break;
	      }
	    }
	    if (foundArgs === false) {
	      throw new Error.ReqlDriverError('`'+method+'` takes at least '+min+' argument'+((min>1)?'s':'')+', '+args.length+' provided', term._query);
	    }
	  }
	  else if (args.length > max) {
	    for(var i=0; i<args.length; i++) {
	      if ((args[i] instanceof Term) && (args[i]._query[0] === termTypes.ARGS)) {
	        foundArgs = true;
	        break;
	      }
	    }
	    if (foundArgs === false) {
	      throw new Error.ReqlDriverError('`'+method+'` takes at most '+max+' argument'+((max>1)?'s':'')+', '+args.length+' provided', term._query);
	    }
	  }
	}
	Term.prototype._arity = function(args, num, method, term) {
	  var foundArgs = false;
	  for(var i=0; i<args.length; i++) {
	    if ((args[i] instanceof Term) && (args[i]._query[0] === termTypes.ARGS)) {
	      foundArgs = true;
	      break;
	    }
	  }
	  if (foundArgs === false) {
	    throw new Error.ReqlDriverError('`'+method+'` takes '+num+' argument'+((num>1)?'s':'')+', '+args.length+' provided', term._query);
	  }
	}
	// Cheap arity check. If it fails, return false, and then we are expected to call _arity/_arityRange
	Term.prototype._fastArity = function(len, num) {
	  return (len === num);
	}
	Term.prototype._fastArityRange = function(len, min, max) {
	  return ((len >= min) && (len <= max));
	}


	// Datums
	function Func(r, func) {
	  // We can retrieve the names of the arguments with
	  // func.toString().match(/\(([^\)]*)\)/)[1].split(/\s*,\s*/)

	  var term = new Term(r);
	  term._query.push(termTypes.FUNC);
	  var args = [];
	  var argVars = [];
	  var argNums = [];

	  for(var i=0; i<func.length; i++) {
	    argVars.push(new Var(r, r.nextVarId));
	    argNums.push(r.nextVarId);

	    if (r.nextVarId === 9007199254740992) { // That seems like overdoing it... but well maybe...
	      r.nextVarId = 0;
	    }
	    else {
	      r.nextVarId++;
	    }
	  }

	  var body = func.apply(func, argVars)
	  if (body === undefined) throw new Error.ReqlDriverError('Annonymous function returned `undefined`. Did you forget a `return`? In:\n'+func.toString(), this._query);
	  body = new Term(r).expr(body);
	  args.push(new Term(r).expr(argNums));
	  args.push(body);

	  term._fillArgs(args);

	  return term;
	}
	Func.prototype.nextVarId = 1;

	function Var(r, id) {
	  var term = new Term(r);
	  term._query.push(termTypes.VAR)
	  term._query.push([new Term(r).expr(id)._query])
	  return term;
	}

	module.exports = Term;


/***/ },
/* 136 */
/***/ function(module, exports, __webpack_require__) {

	var Writable = __webpack_require__(52).Writable;
	var Cursor = __webpack_require__(132);
	var util = __webpack_require__(9);

	// Experimental, but should work fine.
	function WritableStream(table, options, connection) {
	  this._table = table;
	  this._options = options;
	  this._cache = [];
	  this._pendingCallback = null;
	  this._inserting = false;
	  this._delayed = false;
	  this._connection = connection;
	  this._highWaterMark = options.highWaterMark || 100;

	  this._insertOptions = {};
	  this._insertOptions.durability = options.durability || 'hard';
	  this._insertOptions.conflict = options.conflict || 'error';

	  // Internal option to run some tests
	  if (options.debug === true) {
	    this._sequence = [];
	  }

	  Writable.call(this, {
	    objectMode: true,
	    highWaterMark: this._highWaterMark
	  });
	  this._i = 0;
	};
	util.inherits(WritableStream, Writable);

	WritableStream.prototype._write = function(value, encoding, done) {
	  this._i++;
	  this._cache.push(value);
	  this._next(value, encoding, done);
	}

	// Everytime we want to insert but do not have a full buffer,
	// we recurse with setImmediate to give a chance to the input
	// stream to push a few more elements
	WritableStream.prototype._next = function(value, encoding, done) {
	  if ((this._writableState.lastBufferedRequest != null) && (this._writableState.lastBufferedRequest.chunk !== value)) {
	    // There's more data to buffer
	    if (this._cache.length < this._highWaterMark) {
	      this._delayed = false;
	      // Call done now, and more data will be put in the cache
	      done();
	    }
	    else {
	      if (this._inserting === false) {
	        if (this._delayed === true) {
	          this._delayed = false;
	          // We have to flush
	          this._insert();
	          // Fill the buffer while we are inserting data
	          done();
	        }
	        else {
	          var self = this;
	          this._delayed = true;
	          setImmediate(function() {
	            self._next(value, encoding, done);
	          })
	        }

	      }
	      else {
	        this._delayed = false;
	        // to call when we are dong inserting to keep buffering
	        this._pendingCallback = done;
	      }
	    }
	  }
	  else { // We just pushed the last element in the internal buffer
	    if (this._inserting === false) {
	      if (this._delayed === true) {
	        this._delayed = false;
	        // to call when we are dong inserting to maybe flag the end
	        // We cannot call done here as we may be inserting the last batch
	        this._pendingCallback = done;
	        this._insert();
	      }
	      else {
	        var self = this;
	        this._delayed = true;
	        setImmediate(function() {
	          self._next(value, encoding, done);
	        })
	      }
	    }
	    else {
	      this._delayed = false;
	      // We cannot call done here as we may be inserting the last batch
	      this._pendingCallback = done;
	    }
	  }
	}

	WritableStream.prototype._insert = function() {
	  var self = this;
	  self._inserting = true;

	  var cache = self._cache;
	  self._cache = [];

	  if (Array.isArray(self._sequence)) {
	    self._sequence.push(cache.length);
	  }

	  self._table.insert(cache, self._insertOptions).run(self._connection).then(function(result) {
	    self._inserting = false;
	    if (result.errors > 0) {
	      self._inserting = false;
	      self.emit('error', new Error('Failed to insert some documents:'+JSON.stringify(result, null, 2)));
	    }
	    if (typeof self._pendingCallback === 'function') {
	      var pendingCallback = self._pendingCallback;
	      self._pendingCallback = null;
	      pendingCallback();
	    }

	  }).error(function(error) {
	    self._inserting = false;
	    self.emit('error', error);
	  });
	}


	module.exports = WritableStream;


/***/ },
/* 137 */
/***/ function(module, exports, __webpack_require__) {

	var Transform = __webpack_require__(52).Transform;
	var Cursor = __webpack_require__(132);
	var util = __webpack_require__(9);

	// Experimental, but should work fine.
	function TransformStream(table, options, connection) {
	  this._table = table;
	  this._r = table._r;
	  this._options = options;
	  this._cache = [];
	  this._pendingCallback = null;
	  this._ended = false;
	  this._inserting = false;
	  this._delayed = false;
	  this._connection = connection;
	  this._highWaterMark = options.highWaterMark || 100;
	  this._insertOptions = {};
	  this._insertOptions.durability = options.durability || 'hard';
	  this._insertOptions.conflict = options.conflict || 'error';
	  this._insertOptions.returnChanges = options.returnChanges || true;

	  // Internal option to run some tests
	  if (options.debug === true) {
	    this._sequence = [];
	  }

	  Transform.call(this, {
	    objectMode: true,
	    highWaterMark: this._highWaterMark
	  });
	};
	util.inherits(TransformStream, Transform);

	TransformStream.prototype._transform = function(value, encoding, done) {
	  this._cache.push(value);
	  this._next(value, encoding, done);
	}

	// Everytime we want to insert but do not have a full buffer,
	// we recurse with setImmediate to give a chance to the input
	// stream to push a few more elements
	TransformStream.prototype._next = function(value, encoding, done) {
	  if ((this._writableState.lastBufferedRequest != null) && (this._writableState.lastBufferedRequest.chunk !== value)) {
	    // There's more data to buffer
	    if (this._cache.length < this._highWaterMark) {
	      this._delayed = false;
	      // Call done now, and more data will be put in the cache
	      done();
	    }
	    else {
	      if (this._inserting === false) {
	        if (this._delayed === true) {
	          // We have to flush
	          this._delayed = false;
	          this._insert();
	          // Fill the buffer while we are inserting data
	          done();
	        }
	        else {
	          var self = this;
	          this._delayed = true;
	          setImmediate(function() {
	            self._next(value, encoding, done);
	          })
	        }

	      }
	      else {
	        // to call when we are dong inserting to keep buffering
	        this._pendingCallback = done;
	      }
	    }
	  }
	  else { // We just pushed the last element in the internal buffer
	    if (this._inserting === false) {
	      if (this._delayed === true) {
	        this._delayed = false;
	        // to call when we are dong inserting to maybe flag the end
	        this._insert();
	        // We can call done now, because we have _flush to close the stream
	        done();
	      }
	      else {
	        var self = this;
	        this._delayed = true;
	        setImmediate(function() {
	          self._next(value, encoding, done);
	        })
	      }
	    }
	    else {
	      this._delayed = false;
	      // There is nothing left in the internal buffer
	      // But something is already inserting stuff.
	      if (this._cache.length < this._highWaterMark-1) {
	        // Call done, to attempt to buffer more
	        // This may trigger _flush
	        //this._pendingCallback = done;
	        done();
	      }
	      else {
	        this._pendingCallback = done;
	      }
	    }
	  }
	}

	TransformStream.prototype._insert = function() {
	  var self = this;
	  self._inserting = true;

	  var cache = self._cache;
	  self._cache = [];

	  if (Array.isArray(self._sequence)) {
	    self._sequence.push(cache.length);
	  }

	  var pendingCallback = self._pendingCallback;
	  self._pendingCallback = null;
	  if (typeof pendingCallback === 'function') {
	    pendingCallback();
	  }

	  var query = self._table.insert(cache, self._insertOptions);
	  if (self._options.format === 'primaryKey') {
	    query = query.do(function(result) {
	      return self._r.branch(
	        result('errors').eq(0),
	        self._table.config()('primary_key').do(function(primaryKey) {
	          return result('changes')('new_val')(primaryKey)
	        }),
	        result(self._r.error(result('errors').coerceTo('STRING').add(' errors returned. First error:\n').add(result('first_error'))))
	      )
	    })
	  }

	  query.run(self._connection).then(function(result) {
	    self._inserting = false;
	    if (self._options.format === 'primaryKey') {
	      for(var i=0; i<result.length; i++) {
	        self.push(result[i]);
	      }
	    }
	    else {
	      if (result.errors > 0) {
	        self._inserting = false;
	        self.emit('error', new Error('Failed to insert some documents:'+JSON.stringify(result, null, 2)));
	      }
	      else {
	        if (self._insertOptions.returnChanges === true) {
	          for(var i=0; i<result.changes.length; i++) {
	            self.push(result.changes[i].new_val);
	          }
	        }
	      }
	    }

	    pendingCallback = self._pendingCallback
	    self._pendingCallback = null;
	    if (typeof pendingCallback === 'function') {
	      // Mean that we can buffer more
	      pendingCallback();
	    }
	    else if (self._ended !== true) {
	      if (((((self._writableState.lastBufferedRequest === null) ||
	          self._writableState.lastBufferedRequest.chunk === self._cache[self._cache.length-1])))
	        && (self._cache.length > 0)) {
	          self._insert();
	      }
	    }
	    else if (self._ended === true) {
	      if (self._cache.length > 0) {
	        self._insert();
	      }
	      else {
	        if (typeof self._flushCallback === 'function') {
	          self._flushCallback();
	        }
	        self.push(null);
	      }
	    }
	  }).error(function(error) {
	    self._inserting = false;
	    self.emit('error', error);
	  });
	}

	TransformStream.prototype._flush = function(done) {
	  this._ended = true;
	  if ((this._cache.length === 0) && (this._inserting === false)) {
	    done();
	  }
	  else { // this._inserting === true
	    if (this._inserting === false) {
	      this._flushCallback = done;
	      this._insert();
	    }
	    else {
	      this._flushCallback = done;
	    }
	  }
	}


	module.exports = TransformStream;


/***/ },
/* 138 */
/***/ function(module, exports, __webpack_require__) {

	var util = __webpack_require__(9);
	var events = __webpack_require__(79);
	var Promise = __webpack_require__(91);
	var Dequeue = __webpack_require__(139);
	var Pool = __webpack_require__(140);
	var helper = __webpack_require__(127);
	var Err = __webpack_require__(131);
	var UNKNOWN_POOLS = 'unknownPools';
	var SEPARATOR = 'feedSeparator';
	function PoolMaster(r, options) {
	  var self = this;
	  var options = options || {};
	  var lineLength = options.buffer || 50;

	  self._r = r;
	  self._line = new Dequeue(lineLength);
	  self._pools = {};
	  self._pools[UNKNOWN_POOLS] = []; // pools for which we do not know the server'id
	  self._healthyPools = [];
	  self._healthy = false;
	  self._init = false;
	  self._index = 0; // next pool to used
	  self._indexUnknown =  0 // next unknown pool to used
	  self._discovery = (typeof options.discovery === 'boolean') ? options.discovery: false; // Whether the pool master is in discovery mode or not
	  //self._refresh = (typeof options.refresh === 'number') ? options.refresh: 1000*60*60; // Refresh rate for the list of servers
	  self._options = options;
	  self._options.buffer = options.buffer || 50;
	  self._options.max = options.max || 1000;
	  self._log = helper.createLogger(self, options.silent || false);
	  self._draining = false;
	  self._numConnections = 0;
	  self._numAvailableConnections = 0;
	  self._hasPrintWarningLocalhost = false;
	  self._feed = null;
	  self._consecutiveFails = -1;
	  self._timeoutError = options.timeoutError || 1000; // How long should we wait before recreating a connection that failed?
	  self._maxExponent = options.maxExponent || 6; // Maximum timeout is 2^maxExponent*timeoutError

	  //TODO
	  //self._usingPool = true; // If we have used the pool
	  self._seed = 0;

	  var pool;
	  if (Array.isArray(options.servers) && options.servers.length > 0) {
	    self._servers = options.servers;
	    for(var i=0; i<options.servers.length; i++) {
	      var settings = self.createPoolSettings(options, options.servers[i], self._log);
	      pool = new Pool(self._r, settings);
	      self._pools[UNKNOWN_POOLS].push(pool);
	      // A pool is considered healthy by default such that people can do
	      // var = require(...)(); query.run();
	      self._healthyPools.push(pool);
	      self.emitStatus()
	    }
	  }
	  else {
	    self._servers = [{
	      host: options.host || 'localhost',
	      port: options.port || 28015
	    }]
	    var settings = self.createPoolSettings(options, {}, self._log);
	    pool = new Pool(self._r, settings);
	    self._pools[UNKNOWN_POOLS].push(pool);
	    self._healthyPools.push(pool);
	    self.emitStatus()
	  }

	  // Initialize all the pools - bind listeners
	  for(var i=0; i<self._pools[UNKNOWN_POOLS].length; i++) {
	    self.initPool(self._pools[UNKNOWN_POOLS][i]);
	  }
	  if ((self._discovery === true)) {
	    self._timeout = setTimeout(function() { self.fetchServers() }, 0);
	  }
	}
	util.inherits(PoolMaster, events.EventEmitter);

	PoolMaster.prototype.getPools = function() {
	  var result = [];
	  helper.loopKeys(this._pools, function(pools, key) {
	    if (key === UNKNOWN_POOLS) {
	      for(var i=0;i<pools[key].length; i++) {
	        result.push(pools[key][i]);
	      }
	    }
	    else {
	      result.push(pools[key]);
	    }
	  });
	  return result;
	}

	// Reject all promises in this._line
	PoolMaster.prototype._flushErrors = function() {
	  while(this._line.getLength() > 0) {
	    this._line.shift().reject(new Err.ReqlDriverError('None of the pools have an opened connection and failed to open a new one').setOperational());
	    this.emit('queueing', this._line.getLength())
	  }
	}

	PoolMaster.prototype.getConnection = function() {
	  var self = this;
	  // Find a pool with available connections
	  var result;
	  for(var i=0; i<self._healthyPools.length; i++) {
	    if (self._index >= self._healthyPools.length) {
	      self._index = 0;
	    }
	    if (self._healthyPools[self._index].getAvailableLength() > 0) {
	      result = self._healthyPools[self._index].getConnection();
	    }
	    self._index++;
	    if (self._index === self._healthyPools.length) {
	      self._index = 0;
	    }
	    if (result) {
	      return result;
	    }
	  }
	  if (self._healthyPools.length === 0) {
	    return new Promise(function(resolve, reject) {
	      reject(new Err.ReqlDriverError('None of the pools have an opened connection and failed to open a new one').setOperational());
	    });
	  }
	  else {
	    // All pool are busy, buffer the request
	    return new Promise(function(resolve, reject) {
	      self._line.push({
	        resolve: resolve,
	        reject: reject
	      });

	      self.emit('queueing', self._line.getLength())
	      // We could add a condition to be less greedy (for early start)
	      self._expandAll();
	    });

	  }
	}
	PoolMaster.prototype._expandAll = function() {
	  for(var i=0; i<this._healthyPools.length; i++) {
	    this._healthyPools[i]._expandBuffer();
	  }
	}

	// Fetch all the servers once
	PoolMaster.prototype.handleAllServersResponse = function(servers) {
	  var self = this;
	  if (self._draining === true) {
	    return;
	  }
	  // Fill all the known server from RethinkDB
	  var knownServer = {};
	  for(var i=0; i<servers.length; i++) {
	    var server = servers[i];
	    knownServer[server.id] = {count: 0, server: server};
	    if (self._pools[server.id] === undefined) {
	      // We potentially have a new server in the cluster, or we already have a pool for this server
	      // in one of the UNKNOWN_POOLS
	      var found = false;
	      for(var j=0; j<self._pools[UNKNOWN_POOLS].length; j++) {
	        if (found) break;
	        var pool = self._pools[UNKNOWN_POOLS][j]; 
	        // If a pool is created with localhost, it will probably match the first server even though it may not the the one
	        // So it gets an id
	        for(var k=0; k<server.network.canonical_addresses.length; k++) {
	          // Check for the same host (or if they are both localhost) and port
	          if (((server.network.canonical_addresses[k].host === pool.options.connection.host) ||
	               (server.network.hostname === pool.options.connection.host) ||
	            (helper.localhostAliases.hasOwnProperty(server.network.canonical_addresses[k].host) &&
	            helper.localhostAliases.hasOwnProperty(pool.options.connection.host))) &&
	            (server.network.reql_port === pool.options.connection.port)) {

	            self._pools[server.id] = self._pools[UNKNOWN_POOLS].splice(j, 1)[0];
	            // We may assign the wrong pool to this server if it's maching on localhost
	            if (helper.localhostAliases.hasOwnProperty(server.network.canonical_addresses[k].host)) {
	              self._pools[server.id].options.connection.host = helper.getCanonicalAddress(server.network.canonical_addresses).host;
	              if (!helper.getCanonicalAddress(self._pools[server.id].options.connection.host)) {
	                self._pools[server.id].drainLocalhost();
	              }
	            }
	            found = true;
	            break;
	          }
	        }
	      }
	      if (found === false) {
	        // We just found a new server, let's extract the canonical address and connect to it
	        self.createPool(server);
	      }
	    }
	  } // Each server know has a pool

	  // Check if we need to remove pools
	  helper.loopKeys(self._pools, function(pools, key) { // among the pools with a server id
	    if (key !== UNKNOWN_POOLS) {
	      if (knownServer.hasOwnProperty(key) === false) {
	        self.deletePool(key); // We just found a pool that doesn't map to any known RethinkDB server
	      }
	      else {
	        knownServer[key].count++;
	      }
	    }
	  });
	  for(var i=0;i<self._pools[UNKNOWN_POOLS].length; i++) {
	    // These pools does not match any server returned by RethinkDB.
	    var pool = self._pools[UNKNOWN_POOLS].splice(i, 1)[0];
	    self._log('Removing pool connected to: '+pool.getAddress())
	    pool.drain().then(function() {
	      pool.removeAllListeners();
	    }).error(function(error) {
	      self._log('Pool connected to: '+self._pools[UNKNOWN_POOLS][i].getAddress()+' could not be properly drained.')
	      self._log(error.message);
	      self._log(error.stack);
	    });
	  }
	}

	// Create the settings for a given pool. Merge the global options + the servers's one.
	PoolMaster.prototype.createPoolSettings = function(globalOptions, serverOptions, log) {
	  var settings = {};
	  var numServers = Array.isArray(globalOptions.servers) ? globalOptions.servers.length: 1;
	  helper.loopKeys(globalOptions, function(options, key) {
	    if ((key === 'buffer') || (key === 'max')) {
	      settings[key] = Math.ceil(options[key]/numServers);
	      settings[key] = Math.ceil(options[key]/numServers);
	    }
	    else if (key !== 'servers') {
	      settings[key] = options[key];
	    }
	  });
	  if (serverOptions) {
	    helper.loopKeys(serverOptions, function(options, key) {
	      settings[key] = options[key];
	    });
	  }
	  settings._log = log;
	  return settings;
	}

	// Create a new pool
	PoolMaster.prototype.createPool = function(server) {
	  var self = this;
	  var address = helper.getCanonicalAddress(server.network.canonical_addresses);
	  var settings = self.createPoolSettings(self._options, {
	    port: server.network.reql_port,
	    host: address.host
	  }, self._log);
	  var pool = new Pool(self._r, settings);
	  self._pools[server.id] = pool
	  self.initPool(pool);
	  self._healthyPools.push(pool);
	  self.emitStatus()
	  self.resetBufferParameters();
	}

	// Delete a known pool
	PoolMaster.prototype.deletePool = function(key) {
	  var self = this;
	  var pool = self._pools[key];
	  self._log('Removing pool connected to: '+pool.getAddress())
	  pool.drain().then(function() {
	    pool.removeAllListeners();
	  }).error(function(error) {
	    self._log('Pool connected to: '+self._pools[key].getAddress()+' could not be properly drained.')
	    self._log(error.message);
	    self._log(error.stack);
	  });
	  delete self._pools[key];
	  self.resetBufferParameters();
	}

	//  Create the feed on server_status and bind the listener to the feed
	PoolMaster.prototype.fetchServers = function(useSeeds) {
	  var self = this;
	  var query = self._r.db('rethinkdb').table('server_status')
	      .union([SEPARATOR])
	      .union(self._r.db('rethinkdb').table('server_status').changes())
	  // In case useSeeds is true, we rotate through all the seeds + the pool master
	  if (!useSeeds || self._seed === self._servers.length) {
	    if (useSeeds && self._seed === self._servers.length) {
	      // We increase the back off only when we went through all the seeds
	      self._consecutiveFails++;
	    }

	    self._seed = 0;
	    var promise = query.run({cursor: true})
	  }
	  else {
	    var settings = self._servers[self._seed];
	    self._seed++;
	    var promise = self._r.connect(settings).then(function(connection) {
	      return query.run(connection, {cursor: true})
	    });
	  }
	  promise.then(function(feed) {
	    if (self._draining === true) {
	      // There is no need to close the feed here as we'll close the connections
	      return feed.close();
	    }
	    self._feed = feed;
	    var initializing = true;
	    var servers = [];
	    feed.each(function(err, change) {
	      if (err) {
	        self._log('The changefeed on server_status returned an error: '+err.toString());
	        // We have to refetch everything as the server that was serving the feed may
	        // have died.
	        if (!self._draining) {
	          setTimeout(function() {
	            self.fetchServers();
	          }, 0); // Give a timeout to let the driver clean the pools
	        }
	        return;
	      }
	      if (initializing === true) {
	        if (change === SEPARATOR) {
	          initializing = false;
	          self.handleAllServersResponse(servers);
	          // Rerun the whole query after to make sure that a change did not skip/sneak between the union. As long
	          // as RethinkDB does not provide initial results
	          setTimeout(function() {
	            self._r.db('rethinkdb').table('server_status').run({cursor: false}).then(function(servers) {
	              self.handleAllServersResponse(servers);
	            }).error(function(error) {
	              self._log('Fail to retrieve a second copy of server_status');
	              //TODO Retry
	            });
	          }, 1000);
	        }
	        else {
	          servers.push(change);
	        }
	        return;
	      }

	      if (change.new_val !== null && change.old_val === null) {
	        // New server
	        self.createPool(change.new_val);
	      }
	      else if (change.new_val === null && change.old_val !== null) {
	        // A server was removed
	        var server = change.old_val;
	        if (self._pools[server.id] != null) {
	          self.deletePool(server.id);
	        }
	        else {
	          var found = false;
	          for(var i=0; i<self._pools[UNKNOWN_POOLS].length; i++) {
	            if (((server.network.canonical_addresses[k].host === self._pools[UNKNOWN_POOLS][i].options.connection.host) ||
	              (helper.localhostAliases.hasOwnProperty(server.network.canonical_addresses[k].host) && (helper.localhostAliases.hasOwnProperty(self._pools[UNKNOWN_POOLS][i].options.connection.host)))) &&
	              (server.network.reql_port === self._pools[UNKNOWN_POOLS][i].options.connection.port)) {
	              found = true;

	              (function (pool) {
	                self._log('Removing pool connected to: '+pool.getAddress())
	                var pool = self._pools[UNKNOWN_POOLS].splice(i, 1)[0];
	                pool.drain().then(function() {
	                  pool.removeAllListeners();
	                }).error(function(error) {
	                  if (self._options.silent !== true) {
	                    self._log('Pool connected to: '+pool.getAddress()+' could not be properly drained.')
	                    self._log(error.message);
	                    self._log(error.stack);
	                  }
	                });
	              })(self._pools[UNKNOWN_POOLS][i]);
	              break;
	            }
	          }
	        }
	        if (found === false) {
	          self._log('A server was removed but no pool for this server exists...')
	        }
	      }
	      // We ignore this change since this it doesn't affect whether the server
	      // is available or not.
	      // else if (change.new_val !== null && change.old_val !== null) {}
	    });
	    return null;
	  }).error(function(error) {
	    self._log('Could not retrieve the data from server_status: '+JSON.stringify(error));
	    
	    var timeout;
	    if (self._consecutiveFails === -1) {
	      timeout = 0;
	    }
	    else {
	      timeout = (1<<Math.min(self._maxExponent, self._consecutiveFails))*self._timeoutError;
	    }
	    setTimeout(function() {
	      self.fetchServers(true);
	    }, timeout);
	  });
	}

	// Bind listeners on the pools
	PoolMaster.prototype.initPool = function(pool) {
	  var self = this;

	  pool.on('size-diff', function(diff) {
	    self._numConnections += diff;
	    self.emit('size', self._numConnections)
	  });
	  pool.on('available-size-diff', function(diff) {
	    self._numAvailableConnections += diff;
	    self.emit('available-size', self._numAvailableConnections)
	  });

	  pool.on('new-connection', function() {
	    if (self._line.getLength() > 0) {
	      var p = self._line.shift();
	      this.getConnection().then(p.resolve).error(p.reject);
	      self.emit('queueing', self._line.getLength())
	    }
	  });
	  pool.on('not-empty', function() {
	    if (self._draining === false) {
	      var found = false;
	      for(var i=0; i<self._healthyPools.length; i++) {
	        if (self._healthyPools[i] === this) {
	          self._healthyPools.length;
	          found = true;
	          break;
	        }
	      }
	      if (found === false) {
	        self._healthyPools.push(this);
	        self.emitStatus()
	        self.resetBufferParameters();
	      }
	    }
	  });
	  pool.on('empty', function() {
	    // A pool that become empty is considered unhealthy
	    for(var i=0; i<self._healthyPools.length; i++) {
	      if (self._healthyPools[i] === this) {
	        self._healthyPools.splice(i, 1);
	        self.emitStatus()
	        break;
	      }
	    }
	    if (self._healthyPools.length === 0) {
	      self._flushErrors();
	    }

	    self.resetBufferParameters();
	  });
	  pool.on('draining', function() {
	    for(var i=0; i<self._healthyPools.length; i++) {
	      if (self._healthyPools[i] === this) {
	        self._healthyPools.splice(i, 1);
	        self.emitStatus()
	        break;
	      }
	    }

	    if (self._healthyPools === 0) {
	      self._flushErrors();
	    }
	  });
	}

	PoolMaster.prototype.getNumConnections = function() {
	  var sum = 0;
	  for(var i=0; i<this._healthyPools.length; i++) {
	    sum += this._healthyPools[i].getLength();
	  }
	  return sum;
	}
	PoolMaster.prototype.getNumAvailableConnections = function() {
	  var sum = 0;
	  for(var i=0; i<this._healthyPools.length; i++) {
	    sum += this._healthyPools[i].getAvailableLength();
	  }
	  return sum;
	}

	// Reset buffer and max for each pool
	PoolMaster.prototype.resetBufferParameters = function() {
	  var max = Math.floor(this._options.max/this._healthyPools.length)
	  var buffer = Math.floor(this._options.buffer/this._healthyPools.length)
	  for(var i=0; i<this._healthyPools.length; i++) {
	    if (this._healthyPools[i].getLength() > max) {
	      this._healthyPools[i]._extraConnections = this._healthyPools[i].getLength()-max;
	    }
	    else {
	      this._healthyPools[i]._extraConnections = 0;
	    }
	    this._healthyPools[i].options.max = max
	    this._healthyPools[i].options.buffer = buffer;
	  }
	}

	PoolMaster.prototype.getLength = function() {
	  return this._numConnections;
	}
	PoolMaster.prototype.getAvailableLength = function() {
	  return this._numAvailableConnections;
	}

	PoolMaster.prototype.drain = function() {
	  this.emit('draining');
	  if (this._discovery === true) {
	    this._discovery = false;
	    if (this._feed != null) {
	      this._feed.close();
	    }
	  }
	  this._draining = true;
	  var promises = [];
	  var pools = this.getPools();
	  for(var i=0; i<pools.length; i++) {
	    promises.push(pools[i].drain());
	  }
	  this._healthyPools = [];
	  var self = this;
	  return Promise.all(promises).then(function() {
	    for(var i=0; i<pools.length; i++) {
	      pools[i].removeAllListeners();
	    }
	  }).error(function(error) {
	    if (self._options.silent !== true) {
	      self._log('Failed to drain all the pools:');
	      self._log(error.message);
	      self._log(error.stack);
	    }
	  });
	}

	// Emit the healthy event with a boolean indicating whether the pool master
	// is healthy or not
	PoolMaster.prototype.emitStatus = function() {
	  var healthy = this._healthyPools.length !== 0;
	  if (this._healthy !== healthy) {
	    this._healthy = healthy;
	    this.emit('healthy', healthy)
	  }
	}

	module.exports = PoolMaster;


/***/ },
/* 139 */
/***/ function(module, exports) {

	// Implement a dequeue with a circular buffer
	// The buffer can expand but currently doesn't automatically shrink
	// as it is not a desired behavior. We may want to explicitly resize it though.
	function Dequeue(size) {
	  this.start = 0;
	  this.end = 0;

	  size = size || 50;
	  this.buffer = new Array(size);
	}
	Dequeue.prototype.get = function(index) {
	  if (this.start+index > this.buffer.length) {
	    return this.buffer[this.start+index-this.buffer.length]
	  }
	  else {
	    return this.buffer[this.start+index]
	  }
	}

	Dequeue.prototype.toArray = function(index) {
	  var result = [];
	  for(var i=0; i<this.getLength(); i++) {
	    result.push(this.get(i));
	  }
	  return result;
	}

	Dequeue.prototype.delete = function(index) {
	  var current, next;
	  if (this.start+index >= this.buffer.length) {
	    current = this.start+index-this.buffer.length;
	    next = this.start+index-this.buffer.length+1;
	  }
	  else {
	    current = this.start+index;
	    next = this.start+index+1;
	  }

	  for(var i=index; i<(this.buffer.length-index); i++) {
	    if (next === this.buffer.length) next = 0;
	    if (current === this.buffer.length) current = 0;

	    this.buffer[current] = this.buffer[next];
	    current++;
	    next++;
	  }

	  this.end--;
	  if (this.end < 0) this.end = this.buffer.length-1
	}

	Dequeue.prototype.push = function(element) {
	  // push on this.end and then increase this.end
	  // this.end should NEVER be equal to this.buffer.length
	  this.buffer[this.end] = element;
	  this.end++;
	  if (this.end === this.buffer.length) this.end = 0;

	  if (this.start === this.end) {
	    // Resize
	    var previousBuffer = this.buffer;

	    this.buffer = new Array(previousBuffer.length*2);

	    var i, k = 0;
	    for(i=this.start; i<previousBuffer.length; i++) {
	      this.buffer[k++] = previousBuffer[i];
	    }
	    for(i=0; i<this.start; i++) {
	      this.buffer[k++] = previousBuffer[i];
	    }
	    this.start = 0;
	    this.end = previousBuffer.length;
	  }
	}

	Dequeue.prototype.pop = function(element) {
	  //TODO: Decrease size when possible/needed? This may not be
	  //something we really need/want
	  // Return the element in this.end-1
	  if (this.getLength() > 0) {
	    var pos = this.end-1;
	    if (pos < 0) pos = this.buffer.length-1;
	    this.end = pos;
	    return this.buffer[pos];
	  }
	  else {
	    return undefined
	  }
	  var pos = this.end-1;
	  if (pos < 0) pos = this.buffer.length-1;

	  if (this.end !== this.start) {
	    this.end = pos;
	    return this.buffer[pos];
	  }
	  else {
	    return undefined
	  }
	}

	Dequeue.prototype.unshift = function(element) {
	  // push on this.start-1 and then decrease this.start.
	  // this.end should NEVER be equal to this.buffer.length

	  var pos = this.start-1;
	  if (pos < 0) pos = this.buffer.length-1;

	  this.buffer[pos] = element;
	  this.start = pos;

	  if (this.start === this.end) {
	    //Resize
	    var previousBuffer = this.buffer;

	    this.buffer = new Array(previousBuffer.length*2);

	    var i, k = 0;
	    for(i=this.start; i<previousBuffer.length; i++) {
	      this.buffer[k++] = previousBuffer[i];
	    }
	    for(i=0; i<this.start; i++) {
	      this.buffer[k++] = previousBuffer[i];
	    }
	    this.start = 0;
	    this.end = previousBuffer.length;
	  }
	}

	Dequeue.prototype.shift = function() {
	  // Return the element in this.start

	  if (this.getLength() > 0) {
	    var result = this.buffer[this.start];
	    this.start++;
	    if (this.start === this.buffer.length) this.start = 0;
	    return result;
	  }
	}

	Dequeue.prototype.getLength = function() {
	  if (this.start <= this.end) {
	    return this.end-this.start;
	  }
	  else {
	    return this.buffer.length-(this.start-this.end);
	  }
	}

	module.exports = Dequeue;


/***/ },
/* 140 */
/***/ function(module, exports, __webpack_require__) {

	var Promise = __webpack_require__(91);
	var Dequeue = __webpack_require__(139);
	var helper = __webpack_require__(127);
	var Err = __webpack_require__(131);
	var events = __webpack_require__(79);
	var util = __webpack_require__(9);

	function Pool(r, options) {
	  this._r = r;

	  if (!helper.isPlainObject(options)) options = {};
	  this.options = {};
	  this.options.max = options.max || 1000; // 4000 is about the maximum the kernel can take
	  var buffer = (typeof options.buffer === 'number') ? options.buffer : 50;
	  this.options.buffer = (buffer < this.options.max) ? buffer : this.options.max;
	  this.options.timeoutError = options.timeoutError || 1000; // How long should we wait before recreating a connection that failed?
	  this.options.timeoutGb = options.timeoutGb || 60*60*1000; // Default timeout for TCP connection is 2 hours on Linux, we time out after one hour.
	  this.options.maxExponent = options.maxExponent || 6; // Maximum timeout is 2^maxExponent*timeoutError

	  this.options.silent = options.silent || false;

	  this.options.connection = {
	    host: options.host || this._r._host,
	    port: options.port || this._r._port,
	    db: options.db || this._r._db,
	    timeout: options.timeout || this._r._timeoutConnect,
	    authKey: options.authKey || this._r._authKey,
	    cursor: options.cursor || false,
	    stream: options.stream || false,
	    ssl: options.ssl || false
	  }
	  this._log = options._log;

	  this._pool = new Dequeue(this.options.buffer+1);
	  this._draining = false;
	  this._drainingHandlers = null; // Store the resolve/reject methods once draining is called
	  this._localhostToDrain = 0; // number of connections to "localhost" to remove
	  this._connectionToReplace = 0; // number of connections to "localhost" to remove

	  this._numConnections = 0;
	  this._openingConnections = 0; // Number of connections being opened
	  this._consecutiveFails = 0;   // In slow growth, the number of consecutive failures to open a connection
	  this._slowGrowth = false;     // Opening one connection at a time
	  this._slowlyGrowing = false;  // The next connection to be returned is one opened in slowGrowth mode
	  this._extraConnections = 0; // Number of extra connections being opened that we should eventually close

	  this._empty = true;

	  var self = this;
	  // So we can let the pool master bind listeners
	  setTimeout(function() {
	    if (self._draining === false) {
	      for(var i=0; i<self.options.buffer; i++) {
	        if (self.getLength() < self.options.max) {
	          self.createConnection();
	        }
	      }
	    }
	  }, 0);
	  this.id = Math.floor(Math.random()*100000);
	  this._log('Creating a pool connected to '+this.getAddress());
	}

	util.inherits(Pool, events.EventEmitter);
	/*
	 * Events:
	 *  - draining // when `drain` is called
	 *  - queueing(size of the queue) // the number of queries being beffered changed
	 *  - size(number of connections) // the size of the pool changed
	 *  - available-size(available size) // the number of AVAILABLE conncetions of the pool changed
	 */

	Pool.prototype.getConnection = function() {
	  var self = this;
	  var p = new Promise(function(resolve, reject) {
	    if (self._draining === true) {
	      return reject(new Err.ReqlDriverError('The pool is being drained').setOperational());
	    }

	    var connection = self._pool.pop();
	    self.emit('available-size', self._pool.getLength());
	    self.emit('available-size-diff', -1);

	    if (connection) {
	      clearTimeout(connection.timeout);
	      resolve(connection);
	    }
	    else {
	      if ((self._numConnections === 0) && (self._slowGrowth === true)) {
	        // If the server is down we do not want to buffer the queries
	        return reject(new Err.ReqlDriverError('The pool does not have any opened connections and failed to open a new one').setOperational());
	      }
	    }

	    if (self._slowGrowth === false) {
	      self._expandBuffer();
	    }

	  });
	  return p;
	};

	Pool.prototype._decreaseNumConnections = function() {
	  this._numConnections--;
	  this.emit('size', this._numConnections)
	  this.emit('size-diff', -1)
	  if ((this._drainingHandlers !== null) && (this._numConnections === 0)) {
	    this._drainingHandlers.resolve();
	  }
	  // We do not check for this._empty === false because we want to emit empty if the pool
	  // tries to connect to an unavailable server (such that the master can remove it from the
	  // healthy pool
	  if (this._numConnections === 0) {
	    this._empty = true;
	    this.emit('empty');
	  }
	}
	Pool.prototype._increaseNumConnections = function() {
	  this._numConnections++;
	  this.emit('size', this._numConnections)
	  this.emit('size-diff', 1)
	}


	Pool.prototype.putConnection = function(connection) {
	  var self = this;
	  if (connection.end === false) {
	    // Temporary attempt to fix #192 - this should not happen.
	    return;
	  }
	  if (self._empty === true) {
	    self._empty = false;
	    // We emit not-empty only we have at least one opened connection
	    self.emit('not-empty');
	  }
	  if ((self._localhostToDrain > 0) && (helper.localhostAliases.hasOwnProperty(connection.host))) {
	    self._localhostToDrain--;
	    connection.close();
	    clearTimeout(connection.timeout);
	    self.createConnection();
	  }
	  else if (self._drainingHandlers !== null) {
	    connection.close();
	    clearTimeout(connection.timeout);
	    if (self.getLength() === 0) {
	      self._drainingHandlers.resolve();
	    }
	  }
	  else if (self._extraConnections > 0) {
	    self._extraConnections--;
	    connection.close().error(function(error) {
	      self._log('Fail to properly close a connection. Error:'+JSON.stringify(error));
	    });
	    clearTimeout(connection.timeout);
	  }
	  /*
	  // We let the pool garbage collect these connections
	  else if (self.getAvailableLength()+1 > self.options.buffer) { // +1 for the connection we may put back
	    // Note that because we have available connections here, the pool master has no pending
	    // queries.
	    connection.close().error(function(error) {
	      self._log('Fail to properly close a connection. Error:'+JSON.stringify(error));
	    });
	    clearTimeout(connection.timeout);
	  }
	  */
	  else {
	    self._pool.push(connection);
	    self.emit('available-size', self._pool.getLength());
	    self.emit('available-size-diff', 1);
	    self.emit('new-connection', connection);

	    clearTimeout(connection.timeout);
	    var timeoutCb = function() {
	      if (self._pool.get(0) === connection) {
	        if (self._pool.getLength() > self.options.buffer) {
	          self._pool.shift().close();
	          self.emit('available-size', self._pool.getLength());
	          self.emit('available-size-diff', -1);
	        }
	        else {
	          connection.timeout = setTimeout(timeoutCb, self.options.timeoutGb);
	        }
	      }
	      else {
	        // This should technically never happens
	        connection.timeout = setTimeout(timeoutCb, self.options.timeoutGb);
	      }
	    }
	    connection.timeout = setTimeout(timeoutCb, self.options.timeoutGb);
	  }
	};

	Pool.prototype.createConnection = function() {
	  var self = this;
	  self._increaseNumConnections();
	  self._openingConnections++;

	  self.emit('creating-connection', self);
	  if (self._draining === true) {
	    return; // Do not create a new connection if we are draining the pool.
	  }

	  return self._r.connect(self.options.connection).then(function(connection) {
	    self.emit('created-connection', self);

	    self._openingConnections--;

	    if ((self._slowlyGrowing === false) && (self._slowGrowth === true) && (self._openingConnections === 0)) {
	      self._consecutiveFails++;
	      self._slowlyGrowing = true;
	      self.timeoutReconnect = setTimeout(function() {
	        self.createConnection();
	        //self._expandBuffer();
	      }, (1<<Math.min(self.options.maxExponent, self._consecutiveFails))*self.options.timeoutError);
	    }
	    // Need another flag
	    else if ((self._slowlyGrowing === true) && (self._slowGrowth === true) && (self._consecutiveFails > 0)) {
	      self._log('Exiting slow growth mode');
	      self._consecutiveFails = 0;
	      self._slowGrowth = false;
	      self._slowlyGrowing = false;
	      self._aggressivelyExpandBuffer();
	    }



	    connection.on('error', function(e) {
	      // We are going to close connection, but we don't want another process to use it before
	      // So we remove it from the pool now (if it's inside)
	      self._log('Error emitted by a connection: '+JSON.stringify(error));
	      for(var i=0; i<self.getAvailableLength(); i++) {
	        if (self._pool.get(i) === this) {
	          self._pool.delete(i);
	          self.emit('available-size', self._pool.getLength());
	          self.emit('available-size-diff', -1);
	          break;
	        }
	      }
	      // We want to make sure that it's not going to try to reconnect
	      clearTimeout(connection.timeout);

	      // Not sure what happened here, so let's be safe and close this connection.
	      connection.close().then(function() {
	        self._expandBuffer();
	      }).error(function(e) {
	        // We failed to close this connection, but we removed it from the pool... so err, let's just ignore that.
	        self._expandBuffer();
	      });
	      clearTimeout(connection.timeout);
	    });
	    connection.on('end', function(e) {
	      // The connection was closed by the server, let's clean...
	      for(var i=0; i<self.getAvailableLength(); i++) {
	        if (self._pool.get(i) === this) {
	          self._pool.delete(i);
	          self.emit('available-size', self._pool.getLength());
	          self.emit('available-size-diff', -1);
	          break;
	        }
	      }

	      clearTimeout(connection.timeout);
	      self._decreaseNumConnections();
	      self._expandBuffer();
	    });
	    connection.on('timeout', function() {
	      for(var i=0; i<self.getAvailableLength(); i++) {
	        if (self._pool.get(i) === this) {
	          self._pool.delete(i);
	          self.emit('available-size', self._pool.getLength());
	          self.emit('available-size-diff', -1);
	          break;
	        }
	      }

	      clearTimeout(connection.timeout);
	      self._decreaseNumConnections();
	      self._expandBuffer();
	    });
	    connection.on('release', function() {
	      if (this._isOpen()) self.putConnection(this);
	    });
	    self.putConnection(connection);
	    return null;
	  }).error(function(error) {
	    // We failed to create a connection, we are now going to create connections one by one
	    self._openingConnections--;
	    self._decreaseNumConnections();

	    self._slowGrowth = true;
	    if (self._slowlyGrowing === false) {
	      self._log('Entering slow growth mode');
	    }
	    self._slowlyGrowing = true;

	    // Log an error
	    self._log('Fail to create a new connection for the connection pool. Error:'+JSON.stringify(error));

	    if (self._openingConnections === 0) {
	      self._consecutiveFails++;
	      self.timeoutReconnect = setTimeout(function() {
	        //self._expandBuffer();
	        self.createConnection();
	      }, (1<<Math.min(self.options.maxExponent, self._consecutiveFails))*self.options.timeoutError);
	    }
	  })
	};

	Pool.prototype._aggressivelyExpandBuffer = function() {
	  for(var i=0; i<this.options.buffer; i++) {
	    this._expandBuffer();
	  }
	}
	Pool.prototype._expandBuffer = function() {
	  if ((this._draining === false) &&
	      (this._pool.getLength() < this.options.buffer+this._localhostToDrain) &&
	      (this._numConnections < this.options.max+this._localhostToDrain)) {
	    this.createConnection();
	  }
	}

	Pool.prototype.getLength = function() {
	  return this._numConnections;
	}
	Pool.prototype.getAvailableLength = function() {
	  return this._pool.getLength();
	}

	Pool.prototype.setOptions = function(options) {
	  if (helper.isPlainObject(options)) {
	    for(var key in options) {
	      this.options[key] = options[key];
	    }
	  }
	  return this.options;
	}
	Pool.prototype.drainLocalhost = function() {
	  var self = this;
	  // All the connections are to localhost, let's create new ones (not to localhost)
	  self._connectionToReplace = self._numConnections;
	  ;
	  for(var i=0, numConnections=self._numConnections; i<numConnections; i++) {
	    self.createConnection().finally(function() {
	      self._localhostToDrain++;
	      self._connectionToReplace--;
	      if ((self._connectionToReplace === 0) && (self._localhostToDrain > 0)) {
	        var len = self._pool.getLength();
	        for(var j=0; j<len; j++) {
	          if (self._localhostToDrain === 0) {
	            break;
	          }
	          var _connection = self._pool.shift();
	          if (helper.localhostAliases.hasOwnProperty(_connection.host)) {
	            self._localhostToDrain--;
	            _connection.close();
	            clearTimeout(_connection.timeout);
	          }
	          else {
	            self._pool.push(_connection);
	          }
	        }
	      }

	    });
	  }
	}

	Pool.prototype.drain = function() {
	  var self = this;
	  self._draining = true;
	  self._log('Draining the pool connected to '+this.getAddress());
	  self.emit('draining');
	  var p = new Promise(function(resolve, reject) {
	    var connection = self._pool.pop();
	    self.emit('available-size', self._pool.getLength());
	    self.emit('available-size-diff', -1);
	    while(connection) {
	      connection.close();
	      clearTimeout(connection.timeout);
	      connection = self._pool.pop();
	    }
	    if (self.timeoutReconnect !== undefined) {
	      clearTimeout(self.timeoutReconnect);
	      self.timeoutReconnect = null;
	    }
	    if (self.getLength() === 0) {
	      resolve();
	    }
	    else {
	      self._drainingHandlers = {
	        resolve: resolve,
	        reject: reject
	      }
	    }
	  });
	  return p;
	}


	Pool.prototype.getAddress = function() {
	  return this.options.connection.host+':'+this.options.connection.port;
	}
	module.exports = Pool;


/***/ },
/* 141 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.default = jsonOrHtml;

	var _httpAccept = __webpack_require__(142);

	var _httpAccept2 = _interopRequireDefault(_httpAccept);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function jsonOrHtml(mwJson, mwHtml) {
	    return function (req, res, next) {
	        (0, _httpAccept2.default)(req, res, function () {
	            var type = req.accept.types.getBestMatch(['text/html', 'application/json']);
	            if (type === 'text/html') {
	                mwHtml(req, res, next);
	            } else {
	                mwJson(req, res, next);
	            }
	        });
	    };
	}

/***/ },
/* 142 */
/***/ function(module, exports) {

	// Generated by CoffeeScript 1.6.2
	/*
	Copyright (c) 2012 Niclas Hoyer, Fiona Schmidtke, Ben Blank
	Copyright (c) 2014 Niclas Hoyer, Pavel Strashkin

	Permission is hereby granted, free of charge, to any person
	obtaining a copy of this software and associated documentation
	files (the "Software"), to deal in the Software without
	restriction, including without limitation the rights to use,
	copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the
	Software is furnished to do so, subject to the following
	conditions:

	The above copyright notice and this permission notice shall be
	included in all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
	EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
	OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
	NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
	HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
	WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
	FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
	OTHER DEALINGS IN THE SOFTWARE.
	*/

	var getBestLanguageMatch, getBestMatch, getBestMediaMatch, middleware, parseAccept, parseHeaderField, parseMediaType, parseParams, parseStandard, sortMediaType, sortQuality, trimsplit,
	  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

	trimsplit = function(str, delimiter) {
	  var strs, _i, _len, _results;

	  strs = str.split(delimiter);
	  _results = [];
	  for (_i = 0, _len = strs.length; _i < _len; _i++) {
	    str = strs[_i];
	    _results.push(str.trim());
	  }
	  return _results;
	};

	parseParams = function(str) {
	  var param, paramToObj, params, paramstrs, q, strs, _i, _len;

	  paramToObj = function(str, obj) {
	    var param;

	    param = trimsplit(str, '=');
	    return obj[param[0]] = param[1];
	  };
	  strs = trimsplit(str, ';');
	  paramstrs = strs.slice(1);
	  params = {};
	  for (_i = 0, _len = paramstrs.length; _i < _len; _i++) {
	    param = paramstrs[_i];
	    paramToObj(param, params);
	  }
	  if (params.q != null) {
	    q = Number(params.q);
	  } else {
	    q = 1;
	  }
	  return {
	    value: strs[0],
	    params: params,
	    quality: q
	  };
	};

	parseMediaType = function(obj) {
	  var mediarange;

	  mediarange = trimsplit(obj.value, '/');
	  return {
	    type: mediarange[0],
	    subtype: mediarange[1],
	    params: obj.params,
	    mediarange: obj.value,
	    quality: obj.quality
	  };
	};

	parseStandard = function(obj) {
	  return obj.value;
	};

	parseHeaderField = function(str, map, sort, match) {
	  var obj, objects, strs;

	  if (str == null) {
	    return;
	  }
	  strs = trimsplit(str, ',');
	  objects = (function() {
	    var _i, _len, _results;

	    _results = [];
	    for (_i = 0, _len = strs.length; _i < _len; _i++) {
	      str = strs[_i];
	      _results.push(parseParams(str));
	    }
	    return _results;
	  })();
	  map = map != null ? map : parseStandard;
	  sort = sort != null ? sort : sortQuality;
	  objects = (function() {
	    var _i, _len, _results;

	    _results = [];
	    for (_i = 0, _len = objects.length; _i < _len; _i++) {
	      obj = objects[_i];
	      _results.push(map(obj));
	    }
	    return _results;
	  })();
	  objects.sort(sort);
	  return Object.defineProperty(objects, 'getBestMatch', {
	    value: match != null ? match : getBestMatch
	  });
	};

	parseAccept = function(str) {
	  str = str != null ? str : '*/*';
	  return parseHeaderField(str, parseMediaType, sortMediaType, getBestMediaMatch);
	};

	sortQuality = function(a, b) {
	  if (a.quality < b.quality) {
	    return 1;
	  }
	  if (a.quality > b.quality) {
	    return -1;
	  }
	};

	sortMediaType = function(a, b) {
	  if (a.quality < b.quality) {
	    return 1;
	  }
	  if (a.quality > b.quality) {
	    return -1;
	  }
	  if (a.type === '*' && b.type !== '*') {
	    return 1;
	  }
	  if (a.type !== '*' && b.type === '*') {
	    return -1;
	  }
	  if (a.subtype === '*' && b.subtype !== '*') {
	    return 1;
	  }
	  if (a.subtype !== '*' && b.subtype === '*') {
	    return -1;
	  }
	  if (Object.keys(a.params).length < Object.keys(b.params).length) {
	    return 1;
	  }
	  if (Object.keys(a.params).length > Object.keys(b.params).length) {
	    return -1;
	  }
	  return 0;
	};

	getBestMatch = function(candidates) {
	  var acceptable, accepted, _ref;

	  acceptable = (function() {
	    var _i, _len, _results;

	    _results = [];
	    for (_i = 0, _len = this.length; _i < _len; _i++) {
	      accepted = this[_i];
	      if (__indexOf.call(candidates, accepted) >= 0) {
	        _results.push(accepted);
	      }
	    }
	    return _results;
	  }).call(this);
	  return (_ref = acceptable[0]) != null ? _ref : (__indexOf.call(this, "*") >= 0 ? candidates[0] : void 0);
	};

	getBestLanguageMatch = function(candidates) {
	  var acceptable, accepted, candidate, i, length, value, _i, _j, _len, _len1;

	  acceptable = (function() {
	    var _i, _len, _results;

	    _results = [];
	    for (_i = 0, _len = candidates.length; _i < _len; _i++) {
	      candidate = candidates[_i];
	      _results.push({
	        value: candidate,
	        q: -1,
	        length: 0
	      });
	    }
	    return _results;
	  })();
	  for (_i = 0, _len = acceptable.length; _i < _len; _i++) {
	    candidate = acceptable[_i];
	    value = candidate.value + "-";
	    for (i = _j = 0, _len1 = this.length; _j < _len1; i = ++_j) {
	      accepted = this[i];
	      if ((value.indexOf(accepted + "-")) === 0) {
	        length = (accepted.split("-")).length;
	        if (length > candidate.length) {
	          candidate.q = i;
	          candidate.length = length;
	        }
	      }
	    }
	  }
	  acceptable.sort(function(a, b) {
	    if (a.q === -1 && b.q !== -1) {
	      return 1;
	    }
	    if (a.q !== -1 && b.q === -1) {
	      return -1;
	    }
	    if (a.q > b.q) {
	      return 1;
	    }
	    if (a.q < b.q) {
	      return -1;
	    }
	    if (a.length < b.length) {
	      return 1;
	    }
	    if (a.length > b.length) {
	      return -1;
	    }
	    return 0;
	  });
	  if (acceptable[0].q !== -1) {
	    return acceptable[0].value;
	  } else {
	    if (__indexOf.call(this, "*") >= 0) {
	      return candidates[0];
	    }
	  }
	};

	getBestMediaMatch = function(candidates) {
	  var acceptable, accepted, candidate, i, param, prec, value, _i, _j, _len, _len1, _ref;

	  acceptable = (function() {
	    var _i, _len, _results;

	    _results = [];
	    for (_i = 0, _len = candidates.length; _i < _len; _i++) {
	      candidate = candidates[_i];
	      _results.push(parseMediaType(parseParams(candidate)));
	    }
	    return _results;
	  })();
	  for (i = _i = 0, _len = acceptable.length; _i < _len; i = ++_i) {
	    candidate = acceptable[i];
	    candidate.index = i;
	    candidate.quality = 0;
	    candidate.prec = -1;
	    for (_j = 0, _len1 = this.length; _j < _len1; _j++) {
	      accepted = this[_j];
	      prec = -1;
	      if (accepted.type === candidate.type) {
	        if (accepted.subtype === candidate.subtype) {
	          prec = 2;
	          _ref = accepted.params;
	          for (param in _ref) {
	            value = _ref[param];
	            if (param !== "q") {
	              if (candidate.params[param] === value) {
	                prec++;
	              }
	            }
	          }
	        } else if (accepted.subtype === "*") {
	          prec = 1;
	        }
	      } else if (accepted.type === "*" && accepted.subtype === "*") {
	        prec = 0;
	      }
	      if (prec > candidate.prec) {
	        candidate.prec = prec;
	        candidate.quality = accepted.quality;
	      }
	    }
	  }
	  acceptable.sort(function(a, b) {
	    if (a.quality < b.quality) {
	      return 1;
	    }
	    if (a.quality > b.quality) {
	      return -1;
	    }
	    if (a.prec < b.prec) {
	      return 1;
	    }
	    if (a.prec > b.prec) {
	      return 1;
	    }
	    if (a.index < b.index) {
	      return -1;
	    }
	    if (a.index > b.index) {
	      return 1;
	    }
	  });
	  if (acceptable[0].quality) {
	    return candidates[acceptable[0].index];
	  }
	};

	middleware = function(req, res, next) {
	  req.accept = {
	    types: parseAccept(req.headers.accept),
	    charsets: parseHeaderField(req.headers['accept-charset']),
	    encodings: parseHeaderField(req.headers['accept-encoding']),
	    languages: parseHeaderField(req.headers['accept-language'], null, null, getBestLanguageMatch),
	    ranges: parseHeaderField(req.headers['accept-ranges'])
	  };
	  return next();
	};

	module.exports = middleware;

	module.exports.parser = parseHeaderField;


/***/ },
/* 143 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.default = serveApp;
	function serveApp(req, res) {
	    res.sendFile('index.html', { root: 'public' });
	}

/***/ },
/* 144 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _bodyParser = __webpack_require__(145);

	var _bodyParser2 = _interopRequireDefault(_bodyParser);

	var _item = __webpack_require__(86);

	var _middleware = __webpack_require__(4);

	var _jsonorhtml = __webpack_require__(141);

	var _jsonorhtml2 = _interopRequireDefault(_jsonorhtml);

	var _serveapp = __webpack_require__(143);

	var _serveapp2 = _interopRequireDefault(_serveapp);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	exports.default = function (router) {
	    // Get all items for that belong to the user
	    router.get('/user/items', _middleware.authedOnlyMw, function (req, res) {
	        (0, _item.getUserItems)(req.user.id).then(function (items) {
	            return res.json(items);
	        }, function (err) {
	            return res.status(500).send(err);
	        });
	    });

	    router.get('/item/:id', (0, _jsonorhtml2.default)(function (req, res) {
	        (0, _item.getItem)(req.params.id).then(function (item) {
	            return res.json(item);
	        }, function (err) {
	            return res.status(500).send('Database error');
	        });
	    }, _serveapp2.default));

	    router.put('/item/:id', _middleware.authedOnlyMw, _bodyParser2.default.json(), function (req, res) {
	        (0, _item.putItem)(req.user.id, req.params.id, req.body).then(function (item) {
	            return res.json(item);
	        }, function (err) {
	            res.status(500).send('Database error');console.log(err);
	        });
	    });

	    router.get('/item/:id/edit', _serveapp2.default);
	};

/***/ },
/* 145 */
/***/ function(module, exports) {

	module.exports = body-parser;

/***/ },
/* 146 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _sharp = __webpack_require__(147);

	var _sharp2 = _interopRequireDefault(_sharp);

	var _fs = __webpack_require__(44);

	var _fs2 = _interopRequireDefault(_fs);

	var _multiparty = __webpack_require__(148);

	var _image = __webpack_require__(153);

	var _middleware = __webpack_require__(4);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	exports.default = function (router) {
	    router.get('/item-images/:id/small', function (req, res) {
	        (0, _image.getImageSmall)(req.params.id).then(function (_ref) {
	            var type = _ref.type;
	            var image = _ref.image;

	            res.set('Content-Type', type);
	            res.send(image);
	        }, function (err) {
	            return res.status(500).send(err);
	        });
	    });

	    router.get('/item-images/:id', function (req, res) {
	        (0, _image.getImageOriginal)(req.params.id).then(function (_ref2) {
	            var type = _ref2.type;
	            var image = _ref2.image;

	            res.set('Content-Type', type);
	            res.send(image);
	        }, function (err) {
	            return res.status(500).send(err);
	        });
	    });

	    router.put('/item-images/:id', _middleware.authedOnlyMw, uploadedFiles, function (req, res) {
	        var id = req.params.id;

	        var originalType = undefined;
	        var img = req.files.originalImage;
	        if (img && img[0]) {
	            img = img[0];
	            createSmallImage(img.path).then(function (_ref3) {
	                var small = _ref3.small;
	                var formatFrom = _ref3.formatFrom;

	                _fs2.default.readFile(img.path, function (err, original) {
	                    if (err) {
	                        return console.warn('Unable to read file ' + img.path + '. ' + err);
	                    }

	                    (0, _image.putImage)(req.user.id, id, 'image/jpeg', small, originalType, original).then(function (out) {
	                        return res.send(out);
	                    }, function (err) {
	                        return res.status(500).send(err);
	                    }).then(function () {
	                        return req.files.cleanup();
	                    });
	                });
	            });
	        }
	    });
	};

	function uploadedFiles(req, res, next) {
	    var form = new _multiparty.Form({
	        maxFilesSize: 10 * 1024 * 1024
	    });

	    form.parse(req, function (err, fields, files) {
	        if (err) {
	            return next(err);
	        }

	        req.files = _extends({}, files, {
	            cleanup: function cleanup() {
	                var fileList = Object.keys(files).reduce(function (list, name) {
	                    return list.concat(files[name]);
	                }, []);

	                fileList.forEach(function (file) {
	                    _fs2.default.unlink(file.path, function (err) {
	                        if (err) {
	                            console.warn('Uploaded file may not have been cleaned up. ' + err + ' occurred while removing ' + file.path);
	                        }
	                    });
	                });
	            }
	        });

	        next();
	    });
	}

	function createSmallImage(path) {
	    var fromFormat = undefined;
	    var image = (0, _sharp2.default)(path).metadata(function (err, metadata) {
	        if (err) return Promise.reject(err);
	        fromFormat = 'image/' + metadata.format;
	        return image;
	    }).resize(300, 300).max().jpeg().toBuffer().then(function (small) {
	        return { small: small, fromFormat: fromFormat };
	    });

	    return image;
	}

/***/ },
/* 147 */
/***/ function(module, exports) {

	module.exports = sharp;

/***/ },
/* 148 */
/***/ function(module, exports, __webpack_require__) {

	var stream = __webpack_require__(52);
	var util = __webpack_require__(9);
	var fs = __webpack_require__(44);
	var crypto = __webpack_require__(28);
	var path = __webpack_require__(45);
	var os = __webpack_require__(149);
	var StringDecoder = __webpack_require__(150).StringDecoder;
	var fdSlicer = __webpack_require__(151);

	var START = 0;
	var START_BOUNDARY = 1;
	var HEADER_FIELD_START = 2;
	var HEADER_FIELD = 3;
	var HEADER_VALUE_START = 4;
	var HEADER_VALUE = 5;
	var HEADER_VALUE_ALMOST_DONE = 6;
	var HEADERS_ALMOST_DONE = 7;
	var PART_DATA_START = 8;
	var PART_DATA = 9;
	var PART_END = 10;
	var CLOSE_BOUNDARY = 11;
	var END = 12;

	var LF = 10;
	var CR = 13;
	var SPACE = 32;
	var HYPHEN = 45;
	var COLON = 58;
	var A = 97;
	var Z = 122;

	var CONTENT_TYPE_RE = /^multipart\/(?:form-data|related)(?:;|$)/i;
	var CONTENT_TYPE_PARAM_RE = /;\s*([^=]+)=(?:"([^"]+)"|([^;]+))/gi;
	var FILE_EXT_RE = /(\.[_\-a-zA-Z0-9]{0,16}).*/;
	var LAST_BOUNDARY_SUFFIX_LEN = 4; // --\r\n

	// replace base64 characters with safe-for-filename characters
	var b64Safe = {'/': '_', '+': '-'};

	exports.Form = Form;

	util.inherits(Form, stream.Writable);
	function Form(options) {
	  var self = this;
	  stream.Writable.call(self);

	  options = options || {};

	  self.error = null;

	  self.autoFields = !!options.autoFields;
	  self.autoFiles = !!options.autoFiles;

	  self.maxFields = options.maxFields || 1000;
	  self.maxFieldsSize = options.maxFieldsSize || 2 * 1024 * 1024;
	  self.maxFilesSize = options.maxFilesSize || Infinity;
	  self.uploadDir = options.uploadDir || os.tmpDir();
	  self.encoding = options.encoding || 'utf8';

	  self.bytesReceived = 0;
	  self.bytesExpected = null;

	  self.openedFiles = [];
	  self.totalFieldSize = 0;
	  self.totalFieldCount = 0;
	  self.totalFileSize = 0;
	  self.flushing = 0;

	  self.backpressure = false;
	  self.writeCbs = [];

	  self.emitQueue = [];

	  self.on('newListener', function(eventName) {
	    if (eventName === 'file') {
	      self.autoFiles = true;
	    } else if (eventName === 'field') {
	      self.autoFields = true;
	    }
	  });
	}

	Form.prototype.parse = function(req, cb) {
	  var called = false;
	  var self = this;
	  var waitend = true;

	  if (cb) {
	    // if the user supplies a callback, this implies autoFields and autoFiles
	    self.autoFields = true;
	    self.autoFiles = true;

	    // wait for request to end before calling cb
	    var end = function (done) {
	      if (called) return;

	      called = true;

	      // wait for req events to fire
	      process.nextTick(function() {
	        if (waitend && req.readable) {
	          // dump rest of request
	          req.resume();
	          req.once('end', done);
	          return;
	        }

	        done();
	      });
	    };

	    var fields = {};
	    var files = {};
	    self.on('error', function(err) {
	      end(function() {
	        cb(err);
	      });
	    });
	    self.on('field', function(name, value) {
	      var fieldsArray = fields[name] || (fields[name] = []);
	      fieldsArray.push(value);
	    });
	    self.on('file', function(name, file) {
	      var filesArray = files[name] || (files[name] = []);
	      filesArray.push(file);
	    });
	    self.on('close', function() {
	      end(function() {
	        cb(null, fields, files);
	      });
	    });
	  }

	  self.handleError = handleError;
	  self.bytesExpected = getBytesExpected(req.headers);

	  req.on('end', onReqEnd);
	  req.on('error', function(err) {
	    waitend = false;
	    handleError(err);
	  });
	  req.on('aborted', onReqAborted);

	  var state = req._readableState;
	  if (req._decoder || (state && (state.encoding || state.decoder))) {
	    // this is a binary protocol
	    // if an encoding is set, input is likely corrupted
	    validationError(new Error('request encoding must not be set'));
	    return;
	  }

	  var contentType = req.headers['content-type'];
	  if (!contentType) {
	    validationError(createError(415, 'missing content-type header'));
	    return;
	  }

	  var m = CONTENT_TYPE_RE.exec(contentType);
	  if (!m) {
	    validationError(createError(415, 'unsupported content-type'));
	    return;
	  }

	  var boundary;
	  CONTENT_TYPE_PARAM_RE.lastIndex = m.index + m[0].length - 1;
	  while ((m = CONTENT_TYPE_PARAM_RE.exec(contentType))) {
	    if (m[1].toLowerCase() !== 'boundary') continue;
	    boundary = m[2] || m[3];
	    break;
	  }

	  if (!boundary) {
	    validationError(createError(400, 'content-type missing boundary'));
	    return;
	  }

	  setUpParser(self, boundary);
	  req.pipe(self);

	  function onReqAborted() {
	    waitend = false;
	    self.emit('aborted');
	    handleError(new Error("Request aborted"));
	  }

	  function onReqEnd() {
	    waitend = false;
	  }

	  function handleError(err) {
	    var first = !self.error;
	    if (first) {
	      self.error = err;
	      req.removeListener('aborted', onReqAborted);
	      req.removeListener('end', onReqEnd);
	      if (self.destStream) {
	        errorEventQueue(self, self.destStream, err);
	      }
	    }

	    cleanupOpenFiles(self);

	    if (first) {
	      self.emit('error', err);
	    }
	  }

	  function validationError(err) {
	    // handle error on next tick for event listeners to attach
	    process.nextTick(handleError.bind(null, err))
	  }
	};

	Form.prototype._write = function(buffer, encoding, cb) {
	  if (this.error) return;

	  var self = this;
	  var i = 0;
	  var len = buffer.length;
	  var prevIndex = self.index;
	  var index = self.index;
	  var state = self.state;
	  var lookbehind = self.lookbehind;
	  var boundary = self.boundary;
	  var boundaryChars = self.boundaryChars;
	  var boundaryLength = self.boundary.length;
	  var boundaryEnd = boundaryLength - 1;
	  var bufferLength = buffer.length;
	  var c;
	  var cl;

	  for (i = 0; i < len; i++) {
	    c = buffer[i];
	    switch (state) {
	      case START:
	        index = 0;
	        state = START_BOUNDARY;
	        /* falls through */
	      case START_BOUNDARY:
	        if (index === boundaryLength - 2 && c === HYPHEN) {
	          index = 1;
	          state = CLOSE_BOUNDARY;
	          break;
	        } else if (index === boundaryLength - 2) {
	          if (c !== CR) return self.handleError(createError(400, 'Expected CR Received ' + c));
	          index++;
	          break;
	        } else if (index === boundaryLength - 1) {
	          if (c !== LF) return self.handleError(createError(400, 'Expected LF Received ' + c));
	          index = 0;
	          self.onParsePartBegin();
	          state = HEADER_FIELD_START;
	          break;
	        }

	        if (c !== boundary[index+2]) index = -2;
	        if (c === boundary[index+2]) index++;
	        break;
	      case HEADER_FIELD_START:
	        state = HEADER_FIELD;
	        self.headerFieldMark = i;
	        index = 0;
	        /* falls through */
	      case HEADER_FIELD:
	        if (c === CR) {
	          self.headerFieldMark = null;
	          state = HEADERS_ALMOST_DONE;
	          break;
	        }

	        index++;
	        if (c === HYPHEN) break;

	        if (c === COLON) {
	          if (index === 1) {
	            // empty header field
	            self.handleError(createError(400, 'Empty header field'));
	            return;
	          }
	          self.onParseHeaderField(buffer.slice(self.headerFieldMark, i));
	          self.headerFieldMark = null;
	          state = HEADER_VALUE_START;
	          break;
	        }

	        cl = lower(c);
	        if (cl < A || cl > Z) {
	          self.handleError(createError(400, 'Expected alphabetic character, received ' + c));
	          return;
	        }
	        break;
	      case HEADER_VALUE_START:
	        if (c === SPACE) break;

	        self.headerValueMark = i;
	        state = HEADER_VALUE;
	        /* falls through */
	      case HEADER_VALUE:
	        if (c === CR) {
	          self.onParseHeaderValue(buffer.slice(self.headerValueMark, i));
	          self.headerValueMark = null;
	          self.onParseHeaderEnd();
	          state = HEADER_VALUE_ALMOST_DONE;
	        }
	        break;
	      case HEADER_VALUE_ALMOST_DONE:
	        if (c !== LF) return self.handleError(createError(400, 'Expected LF Received ' + c));
	        state = HEADER_FIELD_START;
	        break;
	      case HEADERS_ALMOST_DONE:
	        if (c !== LF) return self.handleError(createError(400, 'Expected LF Received ' + c));
	        var err = self.onParseHeadersEnd(i + 1);
	        if (err) return self.handleError(err);
	        state = PART_DATA_START;
	        break;
	      case PART_DATA_START:
	        state = PART_DATA;
	        self.partDataMark = i;
	        /* falls through */
	      case PART_DATA:
	        prevIndex = index;

	        if (index === 0) {
	          // boyer-moore derrived algorithm to safely skip non-boundary data
	          i += boundaryEnd;
	          while (i < bufferLength && !(buffer[i] in boundaryChars)) {
	            i += boundaryLength;
	          }
	          i -= boundaryEnd;
	          c = buffer[i];
	        }

	        if (index < boundaryLength) {
	          if (boundary[index] === c) {
	            if (index === 0) {
	              self.onParsePartData(buffer.slice(self.partDataMark, i));
	              self.partDataMark = null;
	            }
	            index++;
	          } else {
	            index = 0;
	          }
	        } else if (index === boundaryLength) {
	          index++;
	          if (c === CR) {
	            // CR = part boundary
	            self.partBoundaryFlag = true;
	          } else if (c === HYPHEN) {
	            index = 1;
	            state = CLOSE_BOUNDARY;
	            break;
	          } else {
	            index = 0;
	          }
	        } else if (index - 1 === boundaryLength)  {
	          if (self.partBoundaryFlag) {
	            index = 0;
	            if (c === LF) {
	              self.partBoundaryFlag = false;
	              self.onParsePartEnd();
	              self.onParsePartBegin();
	              state = HEADER_FIELD_START;
	              break;
	            }
	          } else {
	            index = 0;
	          }
	        }

	        if (index > 0) {
	          // when matching a possible boundary, keep a lookbehind reference
	          // in case it turns out to be a false lead
	          lookbehind[index-1] = c;
	        } else if (prevIndex > 0) {
	          // if our boundary turned out to be rubbish, the captured lookbehind
	          // belongs to partData
	          self.onParsePartData(lookbehind.slice(0, prevIndex));
	          prevIndex = 0;
	          self.partDataMark = i;

	          // reconsider the current character even so it interrupted the sequence
	          // it could be the beginning of a new sequence
	          i--;
	        }

	        break;
	      case CLOSE_BOUNDARY:
	        if (c !== HYPHEN) return self.handleError(createError(400, 'Expected HYPHEN Received ' + c));
	        if (index === 1) {
	          self.onParsePartEnd();
	          state = END;
	        } else if (index > 1) {
	          return self.handleError(new Error("Parser has invalid state."));
	        }
	        index++;
	        break;
	      case END:
	        break;
	      default:
	        self.handleError(new Error("Parser has invalid state."));
	        return;
	    }
	  }

	  if (self.headerFieldMark != null) {
	    self.onParseHeaderField(buffer.slice(self.headerFieldMark));
	    self.headerFieldMark = 0;
	  }
	  if (self.headerValueMark != null) {
	    self.onParseHeaderValue(buffer.slice(self.headerValueMark));
	    self.headerValueMark = 0;
	  }
	  if (self.partDataMark != null) {
	    self.onParsePartData(buffer.slice(self.partDataMark));
	    self.partDataMark = 0;
	  }

	  self.index = index;
	  self.state = state;

	  self.bytesReceived += buffer.length;
	  self.emit('progress', self.bytesReceived, self.bytesExpected);

	  if (self.backpressure) {
	    self.writeCbs.push(cb);
	  } else {
	    cb();
	  }
	};

	Form.prototype.onParsePartBegin = function() {
	  clearPartVars(this);
	}

	Form.prototype.onParseHeaderField = function(b) {
	  this.headerField += this.headerFieldDecoder.write(b);
	}

	Form.prototype.onParseHeaderValue = function(b) {
	  this.headerValue += this.headerValueDecoder.write(b);
	}

	Form.prototype.onParseHeaderEnd = function() {
	  this.headerField = this.headerField.toLowerCase();
	  this.partHeaders[this.headerField] = this.headerValue;

	  var m;
	  if (this.headerField === 'content-disposition') {
	    if (m = this.headerValue.match(/\bname="([^"]+)"/i)) {
	      this.partName = m[1];
	    }
	    this.partFilename = parseFilename(this.headerValue);
	  } else if (this.headerField === 'content-transfer-encoding') {
	    this.partTransferEncoding = this.headerValue.toLowerCase();
	  }

	  this.headerFieldDecoder = new StringDecoder(this.encoding);
	  this.headerField = '';
	  this.headerValueDecoder = new StringDecoder(this.encoding);
	  this.headerValue = '';
	}

	Form.prototype.onParsePartData = function(b) {
	  if (this.partTransferEncoding === 'base64') {
	    this.backpressure = ! this.destStream.write(b.toString('ascii'), 'base64');
	  } else {
	    this.backpressure = ! this.destStream.write(b);
	  }
	}

	Form.prototype.onParsePartEnd = function() {
	  if (this.destStream) {
	    flushWriteCbs(this);
	    var s = this.destStream;
	    process.nextTick(function() {
	      s.end();
	    });
	  }
	  clearPartVars(this);
	}

	Form.prototype.onParseHeadersEnd = function(offset) {
	  var self = this;
	  switch(self.partTransferEncoding){
	    case 'binary':
	    case '7bit':
	    case '8bit':
	    self.partTransferEncoding = 'binary';
	    break;

	    case 'base64': break;
	    default:
	    return createError(400, 'unknown transfer-encoding: ' + self.partTransferEncoding);
	  }

	  self.totalFieldCount += 1;
	  if (self.totalFieldCount > self.maxFields) {
	    return createError(413, 'maxFields ' + self.maxFields + ' exceeded.');
	  }

	  self.destStream = new stream.PassThrough();
	  self.destStream.on('drain', function() {
	    flushWriteCbs(self);
	  });
	  self.destStream.headers = self.partHeaders;
	  self.destStream.name = self.partName;
	  self.destStream.filename = self.partFilename;
	  self.destStream.byteOffset = self.bytesReceived + offset;
	  var partContentLength = self.destStream.headers['content-length'];
	  self.destStream.byteCount = partContentLength ? parseInt(partContentLength, 10) :
	    self.bytesExpected ? (self.bytesExpected - self.destStream.byteOffset -
	      self.boundary.length - LAST_BOUNDARY_SUFFIX_LEN) :
	    undefined;

	  if (self.destStream.filename == null && self.autoFields) {
	    handleField(self, self.destStream);
	  } else if (self.destStream.filename != null && self.autoFiles) {
	    handleFile(self, self.destStream);
	  } else {
	    handlePart(self, self.destStream);
	  }
	}

	function flushWriteCbs(self) {
	  self.writeCbs.forEach(function(cb) {
	    process.nextTick(cb);
	  });
	  self.writeCbs = [];
	  self.backpressure = false;
	}

	function getBytesExpected(headers) {
	  var contentLength = headers['content-length'];
	  if (contentLength) {
	    return parseInt(contentLength, 10);
	  } else if (headers['transfer-encoding'] == null) {
	    return 0;
	  } else {
	    return null;
	  }
	}

	function beginFlush(self) {
	  self.flushing += 1;
	}

	function endFlush(self) {
	  self.flushing -= 1;

	  if (self.flushing < 0) {
	    // if this happens this is a critical bug in multiparty and this stack trace
	    // will help us figure it out.
	    self.handleError(new Error("unexpected endFlush"));
	    return;
	  }

	  maybeClose(self);
	}

	function maybeClose(self) {
	  if (self.flushing > 0 || self.error) return;

	  // go through the emit queue in case any field, file, or part events are
	  // waiting to be emitted
	  holdEmitQueue(self)(function() {
	    // nextTick because the user is listening to part 'end' events and we are
	    // using part 'end' events to decide when to emit 'close'. we add our 'end'
	    // handler before the user gets a chance to add theirs. So we make sure
	    // their 'end' event fires before we emit the 'close' event.
	    // this is covered by test/standalone/test-issue-36
	    process.nextTick(function() {
	      self.emit('close');
	    });
	  });
	}

	function cleanupOpenFiles(self) {
	  self.openedFiles.forEach(function(internalFile) {
	    // since fd slicer autoClose is true, destroying the only write stream
	    // is guaranteed by the API to close the fd
	    internalFile.ws.destroy();

	    fs.unlink(internalFile.publicFile.path, function(err) {
	      if (err) self.handleError(err);
	    });
	  });
	  self.openedFiles = [];
	}

	function holdEmitQueue(self, eventEmitter) {
	  var item = {cb: null, ee: eventEmitter, err: null};
	  self.emitQueue.push(item);
	  return function(cb) {
	    item.cb = cb;
	    flushEmitQueue(self);
	  };
	}

	function errorEventQueue(self, eventEmitter, err) {
	  var items = self.emitQueue.filter(function (item) {
	    return item.ee === eventEmitter;
	  });

	  if (items.length === 0) {
	    eventEmitter.emit('error', err);
	    return;
	  }

	  items.forEach(function (item) {
	    item.err = err;
	  });
	}

	function flushEmitQueue(self) {
	  while (self.emitQueue.length > 0 && self.emitQueue[0].cb) {
	    var item = self.emitQueue.shift();

	    // invoke the callback
	    item.cb();

	    if (item.err) {
	      // emit the delayed error
	      item.ee.emit('error', item.err);
	    }
	  }
	}

	function handlePart(self, partStream) {
	  beginFlush(self);
	  var emitAndReleaseHold = holdEmitQueue(self, partStream);
	  partStream.on('end', function() {
	    endFlush(self);
	  });
	  emitAndReleaseHold(function() {
	    self.emit('part', partStream);
	  });
	}

	function handleFile(self, fileStream) {
	  if (self.error) return;
	  var publicFile = {
	    fieldName: fileStream.name,
	    originalFilename: fileStream.filename,
	    path: uploadPath(self.uploadDir, fileStream.filename),
	    headers: fileStream.headers,
	    size: 0,
	  };
	  var internalFile = {
	    publicFile: publicFile,
	    ws: null,
	  };
	  beginFlush(self); // flush to write stream
	  var emitAndReleaseHold = holdEmitQueue(self, fileStream);
	  fileStream.on('error', function(err) {
	    self.handleError(err);
	  });
	  fs.open(publicFile.path, 'wx', function(err, fd) {
	    if (err) return self.handleError(err);
	    var slicer = fdSlicer.createFromFd(fd, {autoClose: true});

	    // end option here guarantees that no more than that amount will be written
	    // or else an error will be emitted
	    internalFile.ws = slicer.createWriteStream({end: self.maxFilesSize - self.totalFileSize});

	    // if an error ocurred while we were waiting for fs.open we handle that
	    // cleanup now
	    self.openedFiles.push(internalFile);
	    if (self.error) return cleanupOpenFiles(self);

	    var prevByteCount = 0;
	    internalFile.ws.on('error', function(err) {
	      if (err.code === 'ETOOBIG') {
	        err = createError(413, err.message);
	        err.code = 'ETOOBIG';
	      }
	      self.handleError(err);
	    });
	    internalFile.ws.on('progress', function() {
	      publicFile.size = internalFile.ws.bytesWritten;
	      var delta = publicFile.size - prevByteCount;
	      self.totalFileSize += delta;
	      prevByteCount = publicFile.size;
	    });
	    slicer.on('close', function() {
	      if (self.error) return;
	      emitAndReleaseHold(function() {
	        self.emit('file', fileStream.name, publicFile);
	      });
	      endFlush(self);
	    });
	    fileStream.pipe(internalFile.ws);
	  });
	}

	function handleField(self, fieldStream) {
	  var value = '';
	  var decoder = new StringDecoder(self.encoding);

	  beginFlush(self);
	  var emitAndReleaseHold = holdEmitQueue(self, fieldStream);
	  fieldStream.on('error', function(err) {
	    self.handleError(err);
	  });
	  fieldStream.on('readable', function() {
	    var buffer = fieldStream.read();
	    if (!buffer) return;

	    self.totalFieldSize += buffer.length;
	    if (self.totalFieldSize > self.maxFieldsSize) {
	      self.handleError(createError(413, 'maxFieldsSize ' + self.maxFieldsSize + ' exceeded'));
	      return;
	    }
	    value += decoder.write(buffer);
	  });

	  fieldStream.on('end', function() {
	    emitAndReleaseHold(function() {
	      self.emit('field', fieldStream.name, value);
	    });
	    endFlush(self);
	  });
	}

	function clearPartVars(self) {
	  self.partHeaders = {};
	  self.partName = null;
	  self.partFilename = null;
	  self.partTransferEncoding = 'binary';
	  self.destStream = null;

	  self.headerFieldDecoder = new StringDecoder(self.encoding);
	  self.headerField = "";
	  self.headerValueDecoder = new StringDecoder(self.encoding);
	  self.headerValue = "";
	}

	function setUpParser(self, boundary) {
	  self.boundary = new Buffer(boundary.length + 4);
	  self.boundary.write('\r\n--', 0, boundary.length + 4, 'ascii');
	  self.boundary.write(boundary, 4, boundary.length, 'ascii');
	  self.lookbehind = new Buffer(self.boundary.length + 8);
	  self.state = START;
	  self.boundaryChars = {};
	  for (var i = 0; i < self.boundary.length; i++) {
	    self.boundaryChars[self.boundary[i]] = true;
	  }

	  self.index = null;
	  self.partBoundaryFlag = false;

	  beginFlush(self);
	  self.on('finish', function() {
	    if (self.state !== END) {
	      self.handleError(createError(400, 'stream ended unexpectedly'));
	    }
	    endFlush(self);
	  });
	}

	function uploadPath(baseDir, filename) {
	  var ext = path.extname(filename).replace(FILE_EXT_RE, '$1');
	  var name = randoString(18) + ext;
	  return path.join(baseDir, name);
	}

	function randoString(size) {
	  return rando(size).toString('base64').replace(/[\/\+]/g, function(x) {
	    return b64Safe[x];
	  });
	}

	function rando(size) {
	  try {
	    return crypto.randomBytes(size);
	  } catch (err) {
	    return crypto.pseudoRandomBytes(size);
	  }
	}

	function parseFilename(headerValue) {
	  var m = headerValue.match(/\bfilename="(.*?)"($|; )/i);
	  if (!m) {
	    m = headerValue.match(/\bfilename\*=utf-8\'\'(.*?)($|; )/i);
	    if (m) {
	      m[1] = decodeURI(m[1]);
	    }
	    else {
	      return;
	    }
	  }

	  var filename = m[1];
	  filename = filename.replace(/%22|\\"/g, '"');
	  filename = filename.replace(/&#([\d]{4});/g, function(m, code) {
	    return String.fromCharCode(code);
	  });
	  return filename.substr(filename.lastIndexOf('\\') + 1);
	}

	function lower(c) {
	  return c | 0x20;
	}

	function createError(status, message) {
	  var error = new Error(message);
	  Error.captureStackTrace(error, createError);
	  error.status = status;
	  error.statusCode = status;
	  return error;
	}


/***/ },
/* 149 */
/***/ function(module, exports) {

	module.exports = require("os");

/***/ },
/* 150 */
/***/ function(module, exports) {

	module.exports = require("string_decoder");

/***/ },
/* 151 */
/***/ function(module, exports, __webpack_require__) {

	var fs = __webpack_require__(44);
	var util = __webpack_require__(9);
	var stream = __webpack_require__(52);
	var Readable = stream.Readable;
	var Writable = stream.Writable;
	var PassThrough = stream.PassThrough;
	var Pend = __webpack_require__(152);
	var EventEmitter = __webpack_require__(79).EventEmitter;

	exports.createFromBuffer = createFromBuffer;
	exports.createFromFd = createFromFd;
	exports.BufferSlicer = BufferSlicer;
	exports.FdSlicer = FdSlicer;

	util.inherits(FdSlicer, EventEmitter);
	function FdSlicer(fd, options) {
	  options = options || {};
	  EventEmitter.call(this);

	  this.fd = fd;
	  this.pend = new Pend();
	  this.pend.max = 1;
	  this.refCount = 0;
	  this.autoClose = !!options.autoClose;
	}

	FdSlicer.prototype.read = function(buffer, offset, length, position, callback) {
	  var self = this;
	  self.pend.go(function(cb) {
	    fs.read(self.fd, buffer, offset, length, position, function(err, bytesRead, buffer) {
	      cb();
	      callback(err, bytesRead, buffer);
	    });
	  });
	};

	FdSlicer.prototype.write = function(buffer, offset, length, position, callback) {
	  var self = this;
	  self.pend.go(function(cb) {
	    fs.write(self.fd, buffer, offset, length, position, function(err, written, buffer) {
	      cb();
	      callback(err, written, buffer);
	    });
	  });
	};

	FdSlicer.prototype.createReadStream = function(options) {
	  return new ReadStream(this, options);
	};

	FdSlicer.prototype.createWriteStream = function(options) {
	  return new WriteStream(this, options);
	};

	FdSlicer.prototype.ref = function() {
	  this.refCount += 1;
	};

	FdSlicer.prototype.unref = function() {
	  var self = this;
	  self.refCount -= 1;

	  if (self.refCount > 0) return;
	  if (self.refCount < 0) throw new Error("invalid unref");

	  if (self.autoClose) {
	    fs.close(self.fd, onCloseDone);
	  }

	  function onCloseDone(err) {
	    if (err) {
	      self.emit('error', err);
	    } else {
	      self.emit('close');
	    }
	  }
	};

	util.inherits(ReadStream, Readable);
	function ReadStream(context, options) {
	  options = options || {};
	  Readable.call(this, options);

	  this.context = context;
	  this.context.ref();

	  this.start = options.start || 0;
	  this.endOffset = options.end;
	  this.pos = this.start;
	  this.destroyed = false;
	}

	ReadStream.prototype._read = function(n) {
	  var self = this;
	  if (self.destroyed) return;

	  var toRead = Math.min(self._readableState.highWaterMark, n);
	  if (self.endOffset != null) {
	    toRead = Math.min(toRead, self.endOffset - self.pos);
	  }
	  if (toRead <= 0) {
	    self.destroyed = true;
	    self.push(null);
	    self.context.unref();
	    return;
	  }
	  self.context.pend.go(function(cb) {
	    if (self.destroyed) return cb();
	    var buffer = new Buffer(toRead);
	    fs.read(self.context.fd, buffer, 0, toRead, self.pos, function(err, bytesRead) {
	      if (err) {
	        self.destroy(err);
	      } else if (bytesRead === 0) {
	        self.destroyed = true;
	        self.push(null);
	        self.context.unref();
	      } else {
	        self.pos += bytesRead;
	        self.push(buffer.slice(0, bytesRead));
	      }
	      cb();
	    });
	  });
	};

	ReadStream.prototype.destroy = function(err) {
	  if (this.destroyed) return;
	  err = err || new Error("stream destroyed");
	  this.destroyed = true;
	  this.emit('error', err);
	  this.context.unref();
	};

	util.inherits(WriteStream, Writable);
	function WriteStream(context, options) {
	  options = options || {};
	  Writable.call(this, options);

	  this.context = context;
	  this.context.ref();

	  this.start = options.start || 0;
	  this.endOffset = (options.end == null) ? Infinity : +options.end;
	  this.bytesWritten = 0;
	  this.pos = this.start;
	  this.destroyed = false;

	  this.on('finish', this.destroy.bind(this));
	}

	WriteStream.prototype._write = function(buffer, encoding, callback) {
	  var self = this;
	  if (self.destroyed) return;

	  if (self.pos + buffer.length > self.endOffset) {
	    var err = new Error("maximum file length exceeded");
	    err.code = 'ETOOBIG';
	    self.destroy();
	    callback(err);
	    return;
	  }
	  self.context.pend.go(function(cb) {
	    if (self.destroyed) return cb();
	    fs.write(self.context.fd, buffer, 0, buffer.length, self.pos, function(err, bytes) {
	      if (err) {
	        self.destroy();
	        cb();
	        callback(err);
	      } else {
	        self.bytesWritten += bytes;
	        self.pos += bytes;
	        self.emit('progress');
	        cb();
	        callback();
	      }
	    });
	  });
	};

	WriteStream.prototype.destroy = function() {
	  if (this.destroyed) return;
	  this.destroyed = true;
	  this.context.unref();
	};

	util.inherits(BufferSlicer, EventEmitter);
	function BufferSlicer(buffer) {
	  EventEmitter.call(this);

	  this.refCount = 0;
	  this.buffer = buffer;
	}

	BufferSlicer.prototype.read = function(buffer, offset, length, position, callback) {
	  var end = position + length;
	  var delta = end - this.buffer.length;
	  var written = (delta > 0) ? delta : length;
	  this.buffer.copy(buffer, offset, position, end);
	  setImmediate(function() {
	    callback(null, written);
	  });
	};

	BufferSlicer.prototype.write = function(buffer, offset, length, position, callback) {
	  buffer.copy(this.buffer, position, offset, offset + length);
	  setImmediate(function() {
	    callback(null, length, buffer);
	  });
	};

	BufferSlicer.prototype.createReadStream = function(options) {
	  options = options || {};
	  var readStream = new PassThrough(options);
	  readStream.start = options.start || 0;
	  readStream.endOffset = options.end;
	  readStream.pos = readStream.endOffset || this.buffer.length; // yep, we're already done
	  readStream.destroyed = false;
	  readStream.write(this.buffer.slice(readStream.start, readStream.pos));
	  readStream.end();
	  readStream.destroy = function() {
	    readStream.destroyed = true;
	  };
	  return readStream;
	};

	BufferSlicer.prototype.createWriteStream = function(options) {
	  var bufferSlicer = this;
	  options = options || {};
	  var writeStream = new Writable(options);
	  writeStream.start = options.start || 0;
	  writeStream.endOffset = (options.end == null) ? this.buffer.length : +options.end;
	  writeStream.bytesWritten = 0;
	  writeStream.pos = writeStream.start;
	  writeStream.destroyed = false;
	  writeStream._write = function(buffer, encoding, callback) {
	    if (writeStream.destroyed) return;

	    var end = writeStream.pos + buffer.length;
	    if (end > writeStream.endOffset) {
	      var err = new Error("maximum file length exceeded");
	      err.code = 'ETOOBIG';
	      writeStream.destroyed = true;
	      callback(err);
	      return;
	    }
	    buffer.copy(bufferSlicer.buffer, writeStream.pos, 0, buffer.length);

	    writeStream.bytesWritten += buffer.length;
	    writeStream.pos = end;
	    writeStream.emit('progress');
	    callback();
	  };
	  writeStream.destroy = function() {
	    writeStream.destroyed = true;
	  };
	  return writeStream;
	};

	BufferSlicer.prototype.ref = function() {
	  this.refCount += 1;
	};

	BufferSlicer.prototype.unref = function() {
	  this.refCount -= 1;

	  if (this.refCount < 0) {
	    throw new Error("invalid unref");
	  }
	};

	function createFromBuffer(buffer) {
	  return new BufferSlicer(buffer);
	}

	function createFromFd(fd, options) {
	  return new FdSlicer(fd, options);
	}


/***/ },
/* 152 */
/***/ function(module, exports) {

	module.exports = Pend;

	function Pend() {
	  this.pending = 0;
	  this.max = Infinity;
	  this.listeners = [];
	  this.waiting = [];
	  this.error = null;
	}

	Pend.prototype.go = function(fn) {
	  if (this.pending < this.max) {
	    pendGo(this, fn);
	  } else {
	    this.waiting.push(fn);
	  }
	};

	Pend.prototype.wait = function(cb) {
	  if (this.pending === 0) {
	    cb(this.error);
	  } else {
	    this.listeners.push(cb);
	  }
	};

	Pend.prototype.hold = function() {
	  return pendHold(this);
	};

	function pendHold(self) {
	  self.pending += 1;
	  var called = false;
	  return onCb;
	  function onCb(err) {
	    if (called) throw new Error("callback called twice");
	    called = true;
	    self.error = self.error || err;
	    self.pending -= 1;
	    if (self.waiting.length > 0 && self.pending < self.max) {
	      pendGo(self, self.waiting.shift());
	    } else if (self.pending === 0) {
	      var listeners = self.listeners;
	      self.listeners = [];
	      listeners.forEach(cbListener);
	    }
	  }
	  function cbListener(listener) {
	    listener(self.error);
	  }
	}

	function pendGo(self, fn) {
	  fn(pendHold(self));
	}


/***/ },
/* 153 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.putImage = putImage;
	exports.getImageOriginal = getImageOriginal;
	exports.getImageSmall = getImageSmall;

	var _revalidator = __webpack_require__(87);

	var _validator = __webpack_require__(88);

	var _validator2 = _interopRequireDefault(_validator);

	var _rethinkdb = __webpack_require__(89);

	var _rethinkdb2 = _interopRequireDefault(_rethinkdb);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var r = (0, _rethinkdb2.default)();

	function putImage(userId, id, smallType, small, originalType, original) {
	    var record = {
	        id: id,
	        smallType: smallType,
	        small: small,
	        originalType: originalType,
	        original: original,
	        timestamp: Date.now()
	    };

	    var imageValid = (0, _revalidator.validate)(record, {
	        id: {
	            type: 'string',
	            conform: _validator2.default.isUUID
	        },
	        smallType: { type: 'string' },
	        small: {
	            type: 'object',
	            conform: isBuffer
	        },
	        originalType: { type: 'string' },
	        original: {
	            type: 'object',
	            conform: isBuffer
	        }
	    });

	    if (!imageValid.valid) {
	        console.log(imageValid.errors);
	        return Promise.reject('Invalid image');
	    }

	    // TODO: Allow original uploader to replace the image
	    return r.table('item_images').insert(record).run().then(function () {
	        return 'Image saved';
	    }, function (err) {
	        console.log('putImage', err);
	        // TODO: on insert error, send back id taken
	        throw 'Database error';
	    });
	}

	function getImageOriginal(id) {
	    return r.table('item_images').get(id).pluck('originalType', 'original').run().then(function (record) {
	        return {
	            type: record.originalType,
	            image: record.original
	        };
	    }, function (err) {
	        console.warn('getImageOriginal', id, err);
	        throw 'Database error';
	    });
	}

	function getImageSmall(id) {
	    return r.table('item_images').get(id).pluck('smallType', 'small').run().then(function (record) {
	        return {
	            type: record.smallType,
	            image: record.small
	        };
	    }, function (err) {
	        console.warn('getImageSmall', id, err);
	        throw 'Database error';
	    });
	}

	function isBuffer(obj) {
	    return Buffer.isBuffer(obj);
	}

/***/ },
/* 154 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _bodyParser = __webpack_require__(145);

	var _bodyParser2 = _interopRequireDefault(_bodyParser);

	var _middleware = __webpack_require__(4);

	var _request = __webpack_require__(155);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	exports.default = function (router) {
	    // Show all the requests made on an item (id)
	    router.get('/request/item/:id', _middleware.authedOnlyMw, function (req, res) {
	        var itemId = req.params.id;

	        (0, _request.getItemRequests)(itemId, req.user.id).then(function (requests) {
	            return res.json(requests);
	        }, function (err) {
	            return res.status(500).send(err);
	        });
	    });

	    // Create a request for the item (id)
	    router.put('/request/item/:id', _middleware.authedOnlyMw, function (req, res) {
	        var itemId = req.params.id;

	        (0, _request.createItemRequest)(req.user.id, itemId).then(function (requests) {
	            return res.json(requests);
	        }, function (err) {
	            return res.status(500).send(err);
	        });
	    });

	    // Remove a requests for the item (id)
	    router.delete('/request/item/:id', _middleware.authedOnlyMw, function (req, res) {
	        var itemId = req.params.id;

	        (0, _request.removeItemRequest)(req.user.id, itemId).then(function (requests) {
	            return res.json(requests);
	        }, function (err) {
	            return res.status(500).send(err);
	        });
	    });

	    // Accept an item request
	    router.post('/request/:id/accept', _middleware.authedOnlyMw, function (req, res) {
	        var requestId = req.params.id;

	        (0, _request.acceptRequest)(req.user.id, requestId).then(function (requests) {
	            return res.json(requests);
	        }, function (err) {
	            return res.status(500).send(err);
	        });
	    });

	    // Un-accept an item request
	    router.post('/request/:id/unaccept', _middleware.authedOnlyMw, function (req, res) {
	        var requestId = req.params.id;

	        (0, _request.unacceptRequest)(req.user.id, requestId).then(function (requests) {
	            return res.json(requests);
	        }, function (err) {
	            return res.status(500).send(err);
	        });
	    });
	};

/***/ },
/* 155 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.getItemRequestsFromUser = getItemRequestsFromUser;
	exports.getItemRequests = getItemRequests;
	exports.getRequestsMadeToUser = getRequestsMadeToUser;
	exports.createItemRequest = createItemRequest;
	exports.removeItemRequest = removeItemRequest;
	exports.acceptRequest = acceptRequest;
	exports.unacceptRequest = unacceptRequest;

	var _rethinkdb = __webpack_require__(89);

	var _rethinkdb2 = _interopRequireDefault(_rethinkdb);

	var _item = __webpack_require__(86);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var r = (0, _rethinkdb2.default)();

	function getItemRequestsFromUser(userId) {
	    return r.table('requests').getAll(userId, { index: 'requester' }).run().then(function (cursor) {
	        return cursor.toArray();
	    }).then(null, function (err) {
	        console.log('getItemRequestsFromUser err', err);throw 'Database error';
	    });
	}

	// Get the requests for an item if it is owned by userId
	function getItemRequests(itemId, userId) {
	    return r.table('items').get(itemId).run().then(function (item) {
	        if (item.owner === userId) {
	            return r.table('requests').getAll(itemId, { index: 'item' }).eqJoin('requester', r.table('users'), { index: 'id' }).pluck({ left: ['id', 'timeAdded', 'accepted'], right: 'displayName' }).zip().run().then(function (cursor) {
	                return cursor.toArray();
	            }).then(null, function (err) {
	                console.log('showItemRequests err', err);throw 'Database error';
	            });
	        } else {
	            throw 'This is not your item';
	        }
	    });
	}

	function getRequestsMadeToUser(userId) {
	    return r.table('requests').getAll(userId, { index: 'itemOwner' }).run().then(function (cursor) {
	        return cursor.toArray();
	    }) // TODO: Cleanup results
	    .then(null, function (err) {
	        throw 'Database error';
	    });
	}

	function createItemRequest(userId, itemId) {
	    return (0, _item.getItem)(itemId).then(function (item) {
	        return r.table('requests').insert({
	            id: userId + '_' + itemId, // Use as primary key, a user should only request an item once
	            requester: userId,
	            item: itemId,
	            itemOwner: item.owner,
	            timeAdded: Date.now()
	        });
	    }).then(function () {
	        return getItemRequestsFromUser(userId);
	    }, function (err) {
	        console.log('createItemRequest err', err, Object.keys(err));
	        // TODO: If error is duplicate id, return false
	        throw 'Database error';
	    });
	}

	function removeItemRequest(userId, itemId) {
	    return r.table('requests').get(userId + '_' + itemId).delete().run().then(function () {
	        return getItemRequestsFromUser(userId);
	    }, function (err) {
	        console.log('removeItemRequest err', err, Object.keys(err));
	        throw 'Database error';
	    });
	}

	function acceptRequest(userId, requestId) {
	    return r.table('requests').get(requestId).run().then(function (request) {
	        if (request.itemOwner !== userId) {
	            throw 'You do not own the item concerned';
	        }

	        return r.table('requests').getAll(request.item, { index: 'item' }).filter(r.row('id').ne(requestId)).update({ accepted: false }).run().then(function () {
	            return r.table('requests').get(requestId).update({ accepted: true }).run().then(function () {
	                return getItemRequests(request.item, userId);
	            });
	        });
	    }).then(null, function (err) {
	        console.log('acceptRequest error', err);
	        throw 'Database error';
	    });
	}

	function unacceptRequest(userId, requestId) {
	    return r.table('requests').get(requestId).run().then(function (request) {
	        return r.table('requests').getAll(request.item, { index: 'item' }).replace(r.row.without('accepted')).run().then(function () {
	            return getItemRequests(request.item, userId);
	        });
	    }).then(null, function (err) {
	        console.log('unacceptRequest error', err);
	        throw 'Database error';
	    });
	}

/***/ },
/* 156 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _middleware = __webpack_require__(4);

	var _request = __webpack_require__(155);

	exports.default = function (router) {
	    // Show all the requests made by the user
	    router.get('/user/sent_requests', _middleware.authedOnlyMw, function (req, res) {
	        (0, _request.getItemRequestsFromUser)(req.user.id).then(function (requests) {
	            return res.json(requests);
	        }, function (err) {
	            return res.status(500).send(err);
	        });
	    });

	    router.get('/user/incoming_requests', _middleware.authedOnlyMw, function (req, res) {
	        (0, _request.getRequestsMadeToUser)(req.user.id).then(function (results) {
	            return res.json(results);
	        }, function (err) {
	            return res.status(500).send(err);
	        });
	    });
	};

/***/ },
/* 157 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.getOrCreateUser = getOrCreateUser;

	var _revalidator = __webpack_require__(87);

	var _validator = __webpack_require__(88);

	var _validator2 = _interopRequireDefault(_validator);

	var _uuidv = __webpack_require__(158);

	var _uuidv2 = _interopRequireDefault(_uuidv);

	var _rethinkdb = __webpack_require__(89);

	var _rethinkdb2 = _interopRequireDefault(_rethinkdb);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var r = (0, _rethinkdb2.default)();

	function getOrCreateUser(email, displayName) {
	    return r.table('users').insert({
	        email: email,
	        id: (0, _uuidv2.default)(),
	        displayName: displayName
	    }, { conflict: 'error' }).run().then(function () {
	        return getUser(email);
	    }, function (err) {
	        console.log('getOrCreateUser', err);
	        // TODO: If insert conflict, say user already exists, else return error
	    });
	}

	function getUser(email) {
	    return r.table('users').get(email).run().then(null, function (err) {
	        throw 'Database error';
	    });
	}

/***/ },
/* 158 */
/***/ function(module, exports) {

	'use strict';

	// See http://stackoverflow.com/a/2117523/1333873 for details.
	var uuidv4 = function () {
	  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (character) {
	    var randomNumber = Math.random() * 16 | 0,
	        result =
	          character === 'x' ?
	            randomNumber :
	            randomNumber & 0x3 | 0x8;

	    return result.toString(16);
	  });
	};

	uuidv4.empty = function () {
	  return '00000000-0000-0000-0000-000000000000';
	};

	module.exports = uuidv4;


/***/ }
/******/ ]);