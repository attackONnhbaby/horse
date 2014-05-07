
/*
 * GET blog page.
 */

exports.index = function(req, res){
    console.log('============================');
    console.log(config.horse);
    console.log('============================');
    getList(0, function(data) {
        listData = JSON.stringify(convertListData(data));
        response.render('list', {
            pageNum: 0,
            listData: listData
        });
        delete data;
    });
};

exports.viewContents = function(req, res) {
    fs.readFile('views/singlePage.html', function(error, data) {
        response.send(header + menu + data.toString() + footer);
    });
};