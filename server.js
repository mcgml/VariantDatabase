// server.js

// set up ========================
var express  = require('express');
var app      = express(); // create our app w/ express
var request = require('request');
var db = require("seraph")("http://127.0.0.1:7474");
var morgan = require('morgan'); // log requests to the console (express4)
var bodyParser = require('body-parser'); // pull information from HTML POST (express4)
var methodOverride = require('method-override'); // simulate DELETE and PUT (express4)
var passport = require('passport'), LocalStrategy = require('passport-local').Strategy;
var flash    = require('connect-flash');
var cookieParser = require('cookie-parser');
var session      = require('express-session');
var favicon = require('serve-favicon');
var path = require('path');

// configuration ================
app.use(express.static(path.join(__dirname, 'app'))); // set the static files location /app
app.use('/node_modules',  express.static(path.join(__dirname, 'node_modules'))); //redirect requests to node_modules folder
app.use('/bower_components',  express.static(path.join(__dirname, 'bower_components'))); //redirect requests to bower_components folder
app.use('/fonts',  express.static(path.join(__dirname, 'node_modules', 'bootstrap', 'dist', 'fonts'))); //redirect requests to fonts folder
app.use('/images',  express.static(path.join(__dirname, 'app', 'images'))); //redirect requests to images folder
app.use(favicon(path.join(__dirname,'app','images', 'app.ico'))); //provide favicon path
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.urlencoded({'extended':'true'})); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(methodOverride());

// auth ========================================================================

// routes ======================================================================
// api ---------------------------------------------------------------------
app.get('/api/variantdatabase/workflows', function(req, res) {
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
app.get('/api/variantdatabase/analyses', function(req, res) {
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
app.get('/api/variantdatabase/panels', function(req, res) {
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
app.post('/api/variantdatabase/autosomaldominantworkflow', function(req, res) {
    request.post(
        {
            uri:"http://127.0.0.1:7474/awmgs/plugins/variantdatabase/autosomaldominantworkflow",
            json: req.body
        },
        function(error, result)
        {
            if (error) throw err;
            res.send(result.body);
        }
    )
});
app.post('/api/variantdatabase/variantinformation', function(req, res) {
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
app.post('/api/variantdatabase/populationfrequency', function(req, res) {
    request.post(
        {
            uri:"http://127.0.0.1:7474/awmgs/plugins/variantdatabase/populationfrequency",
            json: req.body
        },
        function(error, result)
        {
            if (error) throw err;
            res.send(result.body);
        }
    )
});
app.post('/api/variantdatabase/functionalannotation', function(req, res) {
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
app.post('/api/seraph', function(req, res) {
    db.query(req.body.query, req.body.params, function(err, result) {
        if (err) throw err;
        res.send(result);
    });
});
app.post('/api/cypher', function(req, res) {
    request.post(
        {
            uri:"http://127.0.0.1:7474/db/data/transaction/commit",
            json:
            {
                statements:
                    [
                        {
                            statement:req.body.query,parameters:req.body.params
                        }
                    ]
            }
        },
        function(error, result)
        {
            if (error) throw err;
            res.send(result.body);
        }
    )
});

// application -------------------------------------------------------------
app.get('*', function(req, res) {
    res.sendfile('./app/index.html'); // load the single view file (angular will handle the page changes on the front-end)
});

// listen (start app with node server.js) ======================================
app.set('port', process.env.PORT || 3000);
app.listen(app.get('port'));
console.log("App listening on port " + app.get('port'));