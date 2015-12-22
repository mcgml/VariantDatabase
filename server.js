'use strict';

// set up ========================
var express  = require('express');
var app = express(); // create our app w/ express
var request = require('request');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var morgan = require('morgan'); // log requests to the console (express4)
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser'); // pull information from HTML POST (express4)
var session  = require('express-session');
var methodOverride = require('method-override'); // simulate DELETE and PUT (express4)
var favicon = require('serve-favicon');
var path = require('path');
var bcrypt = require('bcrypt-nodejs');

//==================================================================
// Define the strategy to be used by PassportJS
passport.use(new LocalStrategy(function(username, password, done) {
    getUserInformation({ username: username }, function(err, user) {
        if (err) return done(err);
        if (!user) return done(null, false, { message: 'Incorrect username.' });
        comparePassword(password, user, function(err, isMatch) {
            if (isMatch) {
                return done(null, user);
            } else {
                return done(null, false, { message: 'Incorrect password.' });
            }
        });
    });
}));

// Serialized and deserialized methods when got from session
passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});

// Define a middleware function to be used for every secured routes
var auth = function(req, res, next){
    if (!req.isAuthenticated())
        res.sendStatus(401);
    else
        next();
};

var comparePassword = function(candidatePassword, user, cb) {
    bcrypt.compare(candidatePassword, user.Password, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
    return cb;
};

var hashPassword = function(password, cb) {
    bcrypt.hash(password, null, null, function(err, hash) {
        if (err) return cb(err);
        cb(null, hash);
    });
    return cb;
};

var getUserInformation = function(username, cb){
    request.post(
        {
            uri:"http://127.0.0.1:7474/awmgs/plugins/variantdatabase/getuserinformation",
            json: { UserId : username.username }
        },
        function(error, result)
        {
            if (error) return cb(error);
            cb(null, result.body);
        }
    );
};

//==================================================================

// configuration ================
app.use(express.static(path.join(__dirname, 'app'))); // set the static files location /app
app.use('/node_modules',  express.static(path.join(__dirname, 'node_modules'))); //redirect requests to node_modules folder
app.use('/vendor',  express.static(path.join(__dirname, 'vendor'))); //redirect requests to vendor folder
app.use('/images',  express.static(path.join(__dirname, 'app', 'images'))); //redirect requests to images folder
app.use('/fonts',  express.static(path.join(__dirname, 'app', 'fonts'))); //redirect requests to fonts folder
app.use(favicon(path.join(__dirname,'app','images', 'favicon-stethoscope.ico'))); //provide favicon path
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.urlencoded({'extended':'true'})); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(methodOverride());
app.use(session({ secret: 'secret', cookie: { maxAge: 60000 }, resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions

// routes ======================================================================
// api ---------------------------------------------------------------------
app.get('/api/variantdatabase/workflows', auth, function(req, res) {
    request.get (
        {
            uri:"http://127.0.0.1:7474/awmgs/plugins/variantdatabase/workflows",
            json: req.body
        },
        function(error, result)
        {
            if (error) throw err;
            res.send(result.body);
        }
    )
});
app.get('/api/variantdatabase/analyses', auth, function(req, res) {
    request.get (
        {
            uri:"http://127.0.0.1:7474/awmgs/plugins/variantdatabase/analyses",
            json: req.body
        },
        function(error, result)
        {
            if (error) throw err;
            res.send(result.body);
        }
    )
});
app.get('/api/variantdatabase/panels', auth, function(req, res) {
    request.get (
        {
            uri:"http://127.0.0.1:7474/awmgs/plugins/variantdatabase/panels",
            json: req.body
        },
        function(error, result)
        {
            if (error) throw err;
            res.send(result.body);
        }
    )
});
app.get('/api/variantdatabase/getnewpathogenicitiesforauthorisation', auth, function(req, res) {
    request.get (
        {
            uri:"http://127.0.0.1:7474/awmgs/plugins/variantdatabase/getnewpathogenicitiesforauthorisation",
            json: req.body
        },
        function(error, result)
        {
            if (error) throw err;
            res.send(result.body);
        }
    )
});
app.post('/api/variantdatabase/autosomaldominantworkflowv1', auth, function(req, res) {
    request.post(
        {
            uri:"http://127.0.0.1:7474/awmgs/plugins/variantdatabase/autosomaldominantworkflowv1",
            json: req.body
        },
        function(error, result)
        {
            if (error) throw err;
            res.send(result.body);
        }
    )
});
app.post('/api/variantdatabase/variantinformation', auth, function(req, res) {
    request.post(
        {
            uri:"http://127.0.0.1:7474/awmgs/plugins/variantdatabase/variantinformation",
            json: req.body
        },
        function(error, result)
        {
            if (error) throw err;
            res.send(result.body);
        }
    )
});
app.post('/api/variantdatabase/featureinformation', auth, function(req, res) {
    request.post(
        {
            uri:"http://127.0.0.1:7474/awmgs/plugins/variantdatabase/featureinformation",
            json: req.body
        },
        function(error, result)
        {
            if (error) throw err;
            res.send(result.body);
        }
    )
});
app.post('/api/variantdatabase/functionalannotation', auth, function(req, res) {
    request.post(
        {
            uri:"http://127.0.0.1:7474/awmgs/plugins/variantdatabase/functionalannotation",
            json: req.body
        },
        function(error, result)
        {
            if (error) throw err;
            res.send(result.body);
        }
    )
});
app.post('/api/variantdatabase/variantobservations', auth, function(req, res) {
    request.post(
        {
            uri:"http://127.0.0.1:7474/awmgs/plugins/variantdatabase/variantobservations",
            json: req.body
        },
        function(error, result)
        {
            if (error) throw err;
            res.send(result.body);
        }
    )
});
app.post('/api/variantdatabase/authorisevariantpathogenicity', auth, function(req, res) {
    request.post(
        {
            uri:"http://127.0.0.1:7474/awmgs/plugins/variantdatabase/authorisevariantpathogenicity",
            json: req.body
        },
        function(error, result)
        {
            if (error) throw err;
            res.send(result.body);
        }
    )
});
app.post('/api/variantdatabase/addvariantpathogenicity', auth, function(req, res) {
    request.post(
        {
            uri:"http://127.0.0.1:7474/awmgs/plugins/variantdatabase/addvariantpathogenicity",
            json: req.body
        },
        function(error, result)
        {
            if (error) throw err;
            res.send(result.body);
        }
    )
});
app.post('/api/variantdatabase/removevariantpathogenicity', auth, function(req, res) {
    request.post(
        {
            uri:"http://127.0.0.1:7474/awmgs/plugins/variantdatabase/removevariantpathogenicity",
            json: req.body
        },
        function(error, result)
        {
            if (error) throw err;
            res.send(result.body);
        }
    )
});
app.post('/api/variantdatabase/addvirtualpanel', auth, function(req, res) {
    request.post(
        {
            uri:"http://127.0.0.1:7474/awmgs/plugins/variantdatabase/addvirtualpanel",
            json: req.body
        },
        function(error, result)
        {
            if (error) throw err;
            res.send(result.body);
        }
    )
});
app.post('/api/variantdatabase/getvirtualpanelgenes', auth, function(req, res) {
    request.post(
        {
            uri:"http://127.0.0.1:7474/awmgs/plugins/variantdatabase/getvirtualpanelgenes",
            json: req.body
        },
        function(error, result)
        {
            if (error) throw err;
            res.send(result.body);
        }
    )
});
app.post('/api/variantdatabase/updateuserpassword', auth, function(req, res) {
    bcrypt.hash(req.body.Password, null, null, function(error, hash) {
        if (error) throw err;

        request.post(
            {
                uri:"http://127.0.0.1:7474/awmgs/plugins/variantdatabase/updateuserpassword",
                json: { UserNodeId : req.body.UserNodeId, Password : hash }
            },
            function(error, result)
            {
                if (error) throw err;
                res.send(result.body);
            }
        );

    });
});
app.post('/api/variantdatabase/returninputjson', function(req, res) {
    request.post(
        {
            uri:"http://127.0.0.1:7474/awmgs/plugins/variantdatabase/returninputjson",
            json: req.body
        },
        function(error, result)
        {
            if (error) throw err;
            res.send(result.body);
        }
    )
});

//==================================================================
// route to test if the user is logged in or not
app.get('/loggedin', function(req, res) {
    res.send(req.isAuthenticated() ? req.user : '0');
});

// route to log in
app.post('/login', passport.authenticate('local'), function(req, res) {
    res.send(req.user);
});

// route to log out
app.post('/logout', function(req, res){
    req.logOut();
    res.sendStatus(200);
});
//==================================================================

// application -------------------------------------------------------------
app.get('*', function(req, res) {
    res.sendfile('./app/index.html'); // load the single view file (angular will handle the page changes on the front-end)
});

// listen (start app with node server.js) ======================================
app.set('port', process.env.PORT || 3000);
app.listen(app.get('port'));
console.log("App listening on port " + app.get('port'));