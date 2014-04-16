var util = require('util');
var express = require('express');
var cheerio = require('cheerio');
var request = require('request');
var routes = require('./routes');
var http = require('http');
var url = require('url');
var scrap = require('./routes/scrap');
var app = express();

app.configure(function() {
    app.set('port', process.env.PORT || 3000);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'ejs');
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

app.get('/', scrap.index);
//app.get('/', function(req, res) {
//    res.end();
//});

app.get('/watch/:id', function(req, res) {
    res.render('video', {title: 'watch', vid: req.params.id});
});

app.get('/node', function(req, res) {
    request({
        url: 'http://www.slrclub.com/bbs/zboard.php?id=free'
    }, function(err, response, body) {
//        console.log('************************');
//        console.log(this);
        var self = this;
        self.items = new Array();
        
//        console.log('************************');
//        console.log(body);
        var $ = cheerio.load(body);
        
        
        if(err && response.statusCode !== 200) {
            console.log('Request error...');
        }

        $('#bbs_list tr').each(function(i, element) {
//            console.log( $(this) );

            $(this).find('td').each(function(k, item) {
                console.log( $(item).text() );
            });
        });

//        var $ = require('jquery')(window);
//        var c = $('#bbs_list tr td:first').text();
//        console.log(c);
//        jsdom.env({
//            html: body,
//            scripts: ['http://code.jquery.com/jquery-1.6.min.js']
//        }, function(err, window) {
//            var $ = window.jQuery;
//            
//            $body = $('body');
//            $bbsList = $body.find('#bbs_list tr');
//        });
    });
});

http.createServer(app).listen(app.get('port'), function(){

    console.log(scrap);
    console.log(routes);
    console.log('Express server listening on port ' + app.get('port'));
});