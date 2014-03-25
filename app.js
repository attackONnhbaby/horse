
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

// app.get('/', function(request, response, next) {
//     fs.readFile('views/header.html', function(error, data) {
//         header = data.toString();
//     });
//     fs.readFile('views/menu.html', function(error, data) {
//         menu = data.toString();
//     });
//     fs.readFile('views/footer.html', function(error, data) {
//         footer = data.toString();
//     });

//     fs.readFile('views/mainBody.html', function(error, data) {
//         response.send(header + menu + data.toString() + footer);
//     });
// });

//상세보기
app.get('/viewContents', function(request, response, next) {
    fs.readFile('views/singlePage.html', function(error, data) {
        response.send(header + menu + data.toString() + footer);
    });
});



//리스트뷰
app.get('/', function(request, response) {
    getList(0, function(data) {
        listData = JSON.stringify(convertListData(data));
        response.render('list', {
            pageNum: 0,
            listData: listData
        });
        delete data;
    });
});

//리스트 목록 추가 로드
app.post('/list', function(request, response) {
    getList(request.param('pageNum'), function(data) {
        response.send(JSON.stringify(convertListData(data)));
    });
});

//글쓰기뷰
app.get('/write', function(request, response, next) {
    var client = conn();
    client.query('SELECT categoryIDX, categoryName FROM horse_category ORDER BY categoryIDX'
                , []
                , function(error, results, fields) {
                    if(error) {
                        response.send('mysql error. #1');
                        return;
                    } else {
                        response.render('write', {
                            category: JSON.stringify(results)
                        });
                        client.end();
                    }
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
                var url = {link: '/upload/' + request.files.file.name};
                response.send(JSON.stringify(url));
            }
        });
    });
});

//글저장
app.post('/write', function(request, response, next) {
    var dat = {'state':0, 'msg': ''};
    var client = conn();
    client.query('insert into horse_bbs (categoryIDX, title, body, viewCnt, regDate) values (?, ?, ?, 0, now())'
                , [request.param('categoryIDX'), request.param('title'), request.param('body')]
                , function(error, results, fields) {
                    if(error) {
                        dat['state'] = -1;
                        dat['msg'] = 'query filed...';
                    } else {
                        dat['state'] = 1;
                        dat['data'] = results;
                        client.end();
                    }
                    response.send(JSON.stringify(dat));
    });
});

//글보기
app.get('/view/:id', function(request, response) {
    var client = conn();
    var sql = 'SELECT a.id, b.categoryName, a.title, a.body, a.viewCnt FROM horse_bbs AS a LEFT JOIN horse_category AS b ON a.categoryIDX = b.categoryIDX WHERE a.id = ?';
    client.query(sql, request.param('id'), function(error, results, fields) {
        client.end();
        if(error) {
            response.send('view mysql error. #1');
            return;
        } else {
            console.log(results);
            response.render('view', {
                'id': results[0]['id']
                , 'categoryName': results[0]['categoryName']
                , 'title': results[0]['title']
                , 'body': results[0]['body']
                , 'viewCnt': results[0]['viewCnt']
            });
        }
    });
});

http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});

/* function */
//mysql 통신
var conn = function() {
    // var client = mysql.createConnection({
    //     user: 'nhbaby',
    //     password: 'nhbaby1',
    //     database: 'horse'
    // });
    var client = mysql.createConnection({
        user: 'nhbaby',
        password: '',
        database: 'c9'
    });
    return client;
};

//html태그 제거
function strip_tags (input, allowed) {
    allowed = (((allowed || "") + "").toLowerCase().match(/<[a-z][a-z0-9]*>/g) || []).join(''); // making sure the allowed arg is a string containing only tags in lowercase (<a><b><c>)
    var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi,
        commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;
    return input.replace(commentsAndPhpTags, '').replace(tags, function ($0, $1) {        return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : '';
    });
};

//mysql list load
function getList(offset, callback) {
    var limit = 10;
    var client = conn();
    var sql = 'SELECT a.id, a.categoryIDX, b.categoryName, a.title, a.body, a.viewCnt FROM horse_bbs AS a LEFT JOIN horse_category AS b ON a.categoryIDX = b.categoryIDX order by id desc limit ?, ?';
    client.query(sql, [offset * limit, limit], function(error, results, fields) {
        client.end();
        if(error) {
            return false;
        } else {
            if(typeof callback === 'function') {
                callback(results);
            }
        }
    });
};

//리스트 데이타 변환
function convertListData(data) {
    var listData = new Array();
    if(data.length > 0) {
        for(var i in data) {
            var tmp = {};

            var t = data[i].body;
            // var strReg = new RegExp("http://*[^>]*\\.(jpg|gif|png)","gim");
            var strReg = new RegExp("[^= \"']*\.(gif|jpg|bmp)");
            var imgArr =  t.match(strReg);
            if(imgArr != null && typeof imgArr[0] !== 'undefined') {
                tmp['img'] = imgArr[0];
            }
            delete imgArr;

            tmp['id'] = data[i].id;
            tmp['title'] = data[i].title;
            tmp['body'] = strip_tags(data[i].body, '');
            if(tmp['body'].length > 50) {
                tmp['body'] = tmp['body'].substr(0, 100) + '...';
            }
            tmp['categoryIDX'] = data[i].categoryIDX;
            tmp['categoryName'] = data[i].categoryName;

            listData.push(tmp);
            delete tmp;
        }
    }
    return listData;
};