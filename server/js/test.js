
var db = require('./db.js');
// global.ROOTPATH = __dirname;
require('./setting.js');

db = new db();

var params = {
    'user_id':0,
    'username':'aasa',
    'password':'123'
}

function callback(err, params) {
    console.log(err, params);
};

// db.insert('users', params, callback);

db.select('users', 'username', '1111', ['username', 'password'], callback);