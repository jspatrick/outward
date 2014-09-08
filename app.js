'use strict';
var connectHello,
	http   = require( 'http' ),
	express = require('express'),
	app = express(),
	server = http.createServer(app),
	port = process.env.port || 3000;

app.configure( function() {
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(express.static(__dirname + '/build'));
	app.use(app.router);
});

app.configure('development', function () {
	app.use(express.logger());
	app.use(express.errorHandler({
		dumpExceptions: true,
		showStack: true
	}) );
});

app.configure('production', function(){
	app.use(express.errorHandler());
});

app.get('/', function(request, response) {
	response.redirect('/index.html');
});

server.listen(port);
console.log(
	'Express server listening on port %d in %s mode',
	server.address().port, app.settings.env);

	
