var util = require('util');
var express = require('express');
var cheerio = require('cheerio');
var request = require('request');
var routes = require('./routes');
var http = require('http');
var url = require('url');
var scrap = require('./routes/scrap');
var app = express();
var path = require('path');
var fs = require('fs');

//var baseUrl = 'http://www.slrclub.com/bbs/';
var baseUrl = 'http://fun.jjang0u.com/chalkadak/';


app.configure(function() {
    app.set('port', process.env.PORT || 3000);
    app.engine('.html', require('ejs').__express);
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'html');
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(__dirname + '/public'));
    app.use(express.urlencoded());
    app.use(express.json());
    app.use(express.multipart());
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

app.get('/', scrap.index);
// app.get('/', function(req, res) {
   //res.end();
   // res.render('scrapList');
// });

app.get('/watch/:id', function(req, res) {
    res.render('video', {title: 'watch', vid: req.params.id});
});

var filePath = __dirname + '\\public\\scrap\\';
var loadCnt = 0;
var getContentImage = function(ele, url) {

    request({
        url: url
    }, function(err, response, body) {
        var $ = cheerio.load(body);

        $(ele).each(function(index, item) {
            var imgUrl = $(item).attr('src');

            var options = {
                url: imgUrl,
                encoding: 'binary',
                host: 'media.slrclub.com',
                Referer: 'http://www.slrclub.com/bbs/vx2.php?id=theme_gallery&divpage=352&no=1913998',
                Accept: 'image/webp,*/*;q=0.8',
                Connection:'keep-alive'
            };

            request.get(options, function (err, response, body) {
                // console.log('===============');
                // console.log(response);
                // console.log(body);

// console.log('============================');
// console.log(imgUrl);
// console.log(typeof imgUrl.match(/[-_\w]+[.][\w]+$/i)[0]);
// console.log(imgUrl.match(/[-_\w]+[.][\w]+$/i));

                if(typeof imgUrl.match(/[-_\w]+[.][\w]+$/i)[0] == 'string') {
                    fs.writeFile(filePath + imgUrl.match(/[-_\w]+[.][\w]+$/i)[0], body, 'binary', function(err) {
                        if(err) {
                            console.log('file save error : ' + imgUrl);
                            console.log(err);
                        } else {
                            loadCnt++;
                            // console.log("The file was saved!");
                        }
                        delete imgUrl;
                        delete options;
                    }); 
                }
            });
        });
    });
};

var loadContent = function() {

    console.log('run!!!');
    console.log( new Date() );
    console.log('load count : ' + loadCnt);
    console.log('\n\n');

    request({
        url: 'http://fun.jjang0u.com/chalkadak/list?db=160'
    }, function(err, response, body) {
        var self = this;
        self.items = new Array();
        
        var $ = cheerio.load(body);
        
        
        if(err && response.statusCode !== 200) {
            console.log('Request error...');
        }

        var data = [];
        
        $('#list_set .img_sum').each(function(i, element) {
            
            var tmp = {id: null, url: null, text: null, body: null, img: null};
            //$(this).find('td').each(function(k, item) {
            $(this).find('.img_sum a').each(function(k, item) {

                tmp['url'] = $(item).attr('href');
                tmp['url'] = tmp['url'].substring(2);
                tmp['url'] = baseUrl + tmp['url'];
            });
            data.push(tmp);
            delete tmp;
        });
        delete $;

        for(var i in data) {
            getContentImage( '#vw_view img',data[i].url );
        }
        delete data;
    });
};

var postRequest = function(req, res, url, opt, callback) {
    console.log('go 1');
    // request.post('http://127.0.0.1:3000/post', { id: 'abc', pw: '123' } , function (error, response, body) {
    //     if (!error && response.statusCode == 200) {
    //         console.log(body)
    //     }
    // });


    request.post({
        uri : url,
        headers:{'content-type': 'application/x-www-form-urlencoded'},
        body:require('querystring').stringify(opt)
    }, function(error, response, body) {
        console.log('==> post response');
        console.log(body);
        console.log(error);
        // console.log(response);
        // response.writeHead(200, body, {'content-type' : 'text/plain'});
        // response.end();
        // res.send(body);
        callback(body);
    });
};

//http://122.199.174.254:20094/blockAdmin
//http://122.199.174.254:20094/blockAdmin/main

app.post('/post', function(req, res) {
    console.log('=====================');
    console.log('post');
    // console.log(req);
    console.log( req.body['id'] );
    console.log( req.body['pw'] );
    res.send('id : ' + req.body['id'] + ', pw : ' + req.body['pw']);
});

app.get('/postRequest', function(req, res) {
    var opt = {'id': 'nh', 'pw': 'nh'};
    var url = 'http://122.199.174.254:20094/blockAdmin/login';
    postRequest(req, res, url, opt, function() {
        postRequest(req, res, 'http://122.199.174.254:20094/blockAdmin/main', {}, function(body) {
            console.log(body);
        });
    });
});

app.get('/node', function(req, res) {
    loadContent();
});

app.get('/health', function(req, res) {
  res.send(new Buffer(JSON.stringify({
    pid: process.pid,
    memory: process.memoryUsage(),
    uptime: process.uptime()
  })));
});

http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));

    //setInterval(loadContent, 10000);
});