'use strict';

var express = require('express'),
	http   = require( 'http' ),
    app = express(),
    server = http.createServer(app),
    port = process.env.PORT || 3000;    

app.configure(function(){
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(express.static(__dirname + '/views'));
	app.use(express.static(__dirname + '/public'));
	app.use(app.router);
});

app.configure('development', function(){
	app.use(express.logger());
	app.use(express.errorHandler({
		dumpExceptions: true,
		showStack: true
	}) );
});

app.configure('production', function() {
	app.use(express.errorHandler());
});



app.get('/', function(req, res, next) {
    res.render('index.html');
});


app.listen(port);
console.log('App running on port', port);
