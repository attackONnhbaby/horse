
/**
 * Module dependencies.111333!!!!!
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var fs = require('fs');
var mysql = require('mysql');
//var ejs = require('ejs');

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

app.engine('.html', require('ejs').__express);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');

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

//상세보기
app.get('/viewContents', function(request, response, next) {
    fs.readFile('views/singlePage.html', function(error, data) {
        response.send(header + menu + data.toString() + footer);
    });
});

//리스트뷰
app.get('/list', function(request, response) {
    var dat = {'state':0, 'msg': ''};
    var client = conn();
    client.query('select * from horse_bbs'
    , []
    , function(error, results, fields) {
        if(error) {
            dat['state'] = -1;
            dat['msg'] = 'query filed...';
            console.log(dat['msg']);
        } else {
            dat['state'] = 1;
            dat['data'] = results;
//                        console.log(results);
//                        console.log(fields);
            client.end();
        }

//    fs.readFile('views/header.html', function(error, data) {
//        header = data.toString();
//    });
//    fs.readFile('views/menu.html', function(error, data) {
//        menu = data.toString();
//    });
//    fs.readFile('views/footer.html', function(error, data) {
//        footer = data.toString();
//    });
//console.log(results);
//for(var i in results) {
//    console.log(results[i].body);
//}

var a = JSON.stringify(results);
//console.log(a);
//console.log(typeof a);
//console.log('################################');
//var b = JSON.parse(a);
//console.log(typeof b);
//console.log(b);
//console.log(typeof results);
//return;
//results = JSON.parse(results);

//        fs.readFile('views/list.ejs', 'utf8', function(error, data) {
//            response.writeHead(200, {'Content-Type' : 'text/html'});
//            response.end(ejs.render(header + menu + data + footer, {
//            response.end(ejs.render(data, {
//                'data': a
//            }));

var users = [
  { name: 'tobi', email: 'tobi@learnboost.com' },
  { name: 'loki', email: 'loki@learnboost.com' },
  { name: 'jane', email: 'jane@learnboost.com' }
];

                response.render('list', {
                    aa: a,
                    datas: results,
                    users: users
                });
            
//        });

//        console.log('****************************************');
//        for(var i in results) {
//            console.log(results[i]);
//            response.write(results[i].body);
//        }
//        console.log('****************************************');
//        
//        response.send(JSON.stringify(dat));
    });
});

//글쓰기뷰
app.get('/write', function(request, response, next) {
    fs.readFile('views/write.html', function(error, data) {
        response.send(header + menu + data.toString() + footer);
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

//글저장
app.post('/write', function(request, response, next) {
    var dat = {'state':0, 'msg': ''};
    var client = conn();
    client.query('insert into horse_bbs (title, body, viewCnt, regDate) values (?, ?, 0, now())'
                , [request.param('title'), request.param('body')]
                , function(error, results, fields) {
                    if(error) {
                        dat['state'] = -1;
                        dat['msg'] = 'query filed...';
                        console.log(dat['msg']);
                    } else {
                        dat['state'] = 1;
                        dat['data'] = results;
                        console.log(results);
                        console.log(fields);
                        client.end();
                    }
                    response.send(JSON.stringify(dat));
    });
});

http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});

/* function */
var conn = function() {
    var client = mysql.createConnection({
        user: 'nhbaby',
        password: 'nhbaby1',
        database: 'horse'
    });
    return client;
};
