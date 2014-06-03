var express = require('express');
var http = require('http');
var path = require('path');
var app = express();
var page = require('./routes/socket');

app.configure(function() {
	app.set('port', process.env.PORT || 3000);
	app.engine('.html', require('ejs').__express);
	app.set('views', path.join(__dirname, 'views'));
	app.set('view engine', 'html');
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(app.router);
	app.use(express.static(__dirname + '/public'));
});

app.configure('development', function() {
	app.use(express.errorHandler({
		dumpExceptions: true,
		showStack: true
	}));
});

app.configure('production', function() {
	app.use(express.errorHandler());
});

app.get('/', page.index);

var server = http.createServer(app).listen(app.get('port'), function() {
	console.log('express server listening in port ' + app.get('port'));
});
var io = require('socket.io').listen(server);

// process.nextTick(function() {
// 	console.log( new Date().getTime() );
// });

io.sockets.on('connect', function(socket) {
	console.log('socket connect : ' + socket.id);
	socket.on('selectBox', function(param) {
		console.log(param);
		//socket.broadcast.emit('boxStateChange', param);
		socket.emit('boxStateChange', param);
		socket.broadcast.emit('boxStateChange', param);
	});

	socket.on('phptest', function() {
		console.log('phptest run');
	});
});

require('net').createServer(function(socket) {
	console.log('net socket');

	socket.on('data', function(data) {
		console.log('socket on data : ' + data);
	});
}).listen(3001);