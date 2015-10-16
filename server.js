// server.js

// set up ========================
var express  = require('express');
var app      = express();                               // create our app w/ express
var request = require('request');
var db = require("seraph")("http://localhost:7474");
var morgan = require('morgan');             // log requests to the console (express4)
var bodyParser = require('body-parser');    // pull information from HTML POST (express4)
var methodOverride = require('method-override'); // simulate DELETE and PUT (express4)
var favicon = require('serve-favicon');
var path = require('path');

// configuration ================
app.use(express.static(path.join(__dirname, 'app')));                 // set the static files location /public/img will be /img for users
app.use('/fonts',  express.static(path.join(__dirname, 'node_modules', 'bootstrap', 'dist', 'fonts'))); //redirect requests to fonts folder
app.use('/node_modules',  express.static(path.join(__dirname, 'node_modules'))); //redirect requests to node_modules folder
app.use('/bower_components',  express.static(path.join(__dirname, 'bower_components'))); //redirect requests to bower_components folder
app.use('/images',  express.static(path.join(__dirname, 'app', 'images'))); //redirect requests to images folder
app.use(favicon(path.join(__dirname,'app','images', 'app.ico')));
app.use(morgan('dev'));                                         // log every request to the console
app.use(bodyParser.urlencoded({'extended':'true'}));            // parse application/x-www-form-urlencoded
app.use(bodyParser.json());                                     // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(methodOverride());

// routes ======================================================================

// api ---------------------------------------------------------------------
app.post('/api/cypher', function(req, res) {
    request.post(
        {
            uri:"http://localhost:7474/db/data/transaction/commit",
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

app.post('/api/variantfilter', function(req, res) {
    request.post(
        {
            uri:"http://localhost:7474/awmgs/plugins/variantfilter" + req.body.WorkflowPath,
            json: req.body
        },
        function(error, result)
        {
            if (error) throw err;
            res.send(result.body);
        }
    )
});

app.post('/api/variantfilter/populationfrequency', function(req, res) {
    request.post(
        {
            uri:"http://localhost:7474/awmgs/plugins/variantfilter/populationfrequency",
            json: req.body
        },
        function(error, result)
        {
            if (error) throw err;
            res.send(result.body);
        }
    )
});

app.get('/api/workflows', function(req, res) {
    request.get (
        {
            uri:"http://localhost:7474/awmgs/plugins/variantfilter/workflows",
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

// application -------------------------------------------------------------
app.get('*', function(req, res) {
    res.sendfile('./app/index.html'); // load the single view file (angular will handle the page changes on the front-end)
});

// listen (start app with node server.js) ======================================
app.set('port', process.env.PORT || 3000);
app.listen(app.get('port'));
console.log("App listening on port " + app.get('port'));