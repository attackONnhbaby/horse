
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
app.use(express.bodyParser());
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
	fs.readFile('views/header.html', function(error, data) {
		header = data.toString();
	});
	fs.readFile('views/menu.html', function(error, data) {
		menu = data.toString();
	});
	fs.readFile('views/footer.html', function(error, data) {
		footer = data.toString();
	});
	
	fs.readFile('views/mainBody.html', function(error, data) {
		response.send(header + menu + data.toString() + footer);
	});
});

app.get('/viewContents', function(request, response, next) {
	fs.readFile('views/singlePage.html', function(error, data) {
		response.send(header + menu + data.toString() + footer);
	});
})

//글쓰기
app.get('/write', function(request, response, next) {
	fs.readFile('views/write.html', function(error, data) {
		response.send(data.toString());
	});
});

//이미지 업로드
app.post('/upload', function(request, response, next) {
	fs.readFile(request.files.file.path, function(error, data) {
		var filePath = __dirname + '\\public\\upload\\' + request.files.file.name;
		fs.writeFile(filePath, data, function(error) {
			if(error) {
				throw error;
			} else {
				var a = {link: '/upload/' + request.files.file.name};
				response.send(JSON.stringify(a));
			}
		});
	});
});

http.createServer(app).listen(app.get('port'), function(){



  console.log('Express server listening on port ' + app.get('port'));
});
