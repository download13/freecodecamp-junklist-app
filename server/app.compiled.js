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

	var _routes = __webpack_require__(10);

	var _routes2 = _interopRequireDefault(_routes);

	var _user = __webpack_require__(29);

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

	module.exports = require("express");

/***/ },
/* 3 */
/***/ function(module, exports) {

	module.exports = require("socket.io");

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

	var _passportGoogleOauth = __webpack_require__(6);

	var _jsonwebtoken = __webpack_require__(7);

	var _jsonwebtoken2 = _interopRequireDefault(_jsonwebtoken);

	var _router = __webpack_require__(8);

	var _router2 = _interopRequireDefault(_router);

	var _constants = __webpack_require__(9);

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
/***/ function(module, exports) {

	module.exports = require("passport");

/***/ },
/* 6 */
/***/ function(module, exports) {

	module.exports = require("passport-google-oauth");

/***/ },
/* 7 */
/***/ function(module, exports) {

	module.exports = require("jsonwebtoken");

/***/ },
/* 8 */
/***/ function(module, exports) {

	module.exports = require("express/lib/router");

/***/ },
/* 9 */
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
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _express = __webpack_require__(2);

	var _express2 = _interopRequireDefault(_express);

	var _item = __webpack_require__(11);

	var _jsonorhtml = __webpack_require__(16);

	var _jsonorhtml2 = _interopRequireDefault(_jsonorhtml);

	var _serveapp = __webpack_require__(18);

	var _serveapp2 = _interopRequireDefault(_serveapp);

	var _item2 = __webpack_require__(19);

	var _item3 = _interopRequireDefault(_item2);

	var _itemImages = __webpack_require__(21);

	var _itemImages2 = _interopRequireDefault(_itemImages);

	var _request = __webpack_require__(26);

	var _request2 = _interopRequireDefault(_request);

	var _user = __webpack_require__(28);

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
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.getFrontPageItems = getFrontPageItems;
	exports.getUserItems = getUserItems;
	exports.getItem = getItem;
	exports.putItem = putItem;

	var _revalidator = __webpack_require__(12);

	var _validator = __webpack_require__(13);

	var _validator2 = _interopRequireDefault(_validator);

	var _rethinkdb = __webpack_require__(14);

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
/* 12 */
/***/ function(module, exports) {

	module.exports = require("revalidator");

/***/ },
/* 13 */
/***/ function(module, exports) {

	module.exports = require("validator");

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _rethinkdbdash = __webpack_require__(15);

	var _rethinkdbdash2 = _interopRequireDefault(_rethinkdbdash);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var r = (0, _rethinkdbdash2.default)({ cursor: true, db: 'junk' });

	exports.default = function () {
	  return r;
	};

/***/ },
/* 15 */
/***/ function(module, exports) {

	module.exports = require("rethinkdbdash");

/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.default = jsonOrHtml;

	var _httpAccept = __webpack_require__(17);

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
/* 17 */
/***/ function(module, exports) {

	module.exports = require("http-accept");

/***/ },
/* 18 */
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
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _bodyParser = __webpack_require__(20);

	var _bodyParser2 = _interopRequireDefault(_bodyParser);

	var _item = __webpack_require__(11);

	var _middleware = __webpack_require__(4);

	var _jsonorhtml = __webpack_require__(16);

	var _jsonorhtml2 = _interopRequireDefault(_jsonorhtml);

	var _serveapp = __webpack_require__(18);

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
/* 20 */
/***/ function(module, exports) {

	module.exports = require("body-parser");

/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _sharp = __webpack_require__(22);

	var _sharp2 = _interopRequireDefault(_sharp);

	var _fs = __webpack_require__(23);

	var _fs2 = _interopRequireDefault(_fs);

	var _multiparty = __webpack_require__(24);

	var _image = __webpack_require__(25);

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
/* 22 */
/***/ function(module, exports) {

	module.exports = require("sharp");

/***/ },
/* 23 */
/***/ function(module, exports) {

	module.exports = require("fs");

/***/ },
/* 24 */
/***/ function(module, exports) {

	module.exports = require("multiparty");

/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.putImage = putImage;
	exports.getImageOriginal = getImageOriginal;
	exports.getImageSmall = getImageSmall;

	var _revalidator = __webpack_require__(12);

	var _validator = __webpack_require__(13);

	var _validator2 = _interopRequireDefault(_validator);

	var _rethinkdb = __webpack_require__(14);

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
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _bodyParser = __webpack_require__(20);

	var _bodyParser2 = _interopRequireDefault(_bodyParser);

	var _middleware = __webpack_require__(4);

	var _request = __webpack_require__(27);

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
/* 27 */
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

	var _rethinkdb = __webpack_require__(14);

	var _rethinkdb2 = _interopRequireDefault(_rethinkdb);

	var _item = __webpack_require__(11);

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
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _middleware = __webpack_require__(4);

	var _request = __webpack_require__(27);

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
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.getOrCreateUser = getOrCreateUser;

	var _revalidator = __webpack_require__(12);

	var _validator = __webpack_require__(13);

	var _validator2 = _interopRequireDefault(_validator);

	var _uuidv = __webpack_require__(30);

	var _uuidv2 = _interopRequireDefault(_uuidv);

	var _rethinkdb = __webpack_require__(14);

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
/* 30 */
/***/ function(module, exports) {

	module.exports = require("uuidv4");

/***/ }
/******/ ]);