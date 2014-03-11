
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var fs = require('fs');

var app = express();

//var
var header;
var menu;
var footer;

// all environments
app.set('port', process.env.PORT || 3000);
// app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'jade');
// app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// app.get('/', routes.index);
// app.get('/users', user.list);

app.get('/', function(request, response, next) {
	fs.readFile('views/mainBody.html', function(error, data) {
		response.send(header + menu + data.toString() + footer);
	});
});

app.get('/viewContents', function(request, response, next) {
	fs.readFile('views/singlePage.html', function(error, data) {
		response.send(header + menu + data.toString() + footer);
	});
})

http.createServer(app).listen(app.get('port'), function(){

	fs.readFile('views/header.html', function(error, data) {
		header = data.toString();
	});
	fs.readFile('views/menu.html', function(error, data) {
		menu = data.toString();
	});
	fs.readFile('views/footer.html', function(error, data) {
		footer = data.toString();
	});

  console.log('Express server listening on port ' + app.get('port'));
});
