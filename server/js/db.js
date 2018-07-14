
function db() {
    var mysql = require('mysql');
    var connection = mysql.createConnection({
        host: 'localhost',
        user: global.mysql_user,
        password: global.mysql_password,
        database: global.database
    });

    connection.connect();

    this.insert = function (table, params, callback) {
        var columns = '(';
        var values = 'VALUES(';
        var addSqlParams = [];
        for (var column in params) {
            columns += column + ',';
            var value = params[column];
            values += '?,';
            addSqlParams.push(value);
        }

        columns = columns.substring(0, columns.length - 1);
        values = values.substring(0, values.length - 1);

        var addSql = "INSERT INTO users(user_id, username, password, ) VALUES(0,?,?,)";
        var addSql = 'INSERT INTO ' + table + columns + ') ' + values + ')';
        // var addSqlParams = ['we', '122332'];

        var query_result = '';
        connection.query(addSql, addSqlParams, function (err, result) {
            if (err) {
                console.log('[INSERT ERROR] - ', err.message);
                // return;
            }

            console.log('--------------------------INSERT----------------------------');
            //console.log('INSERT ID:',result.insertId);        
            console.log('INSERT ID:', result);
            console.log('-----------------------------------------------------------------\n\n');

            callback(err, result);
        });

    }

    this.select = function (table, where_column, key, columns, callback) {

        var columns_str = '';
        for (var column_id in columns) {
            var column = columns[column_id];
            columns_str += column + ',';
        }

        columns_str = columns_str.substring(0, columns_str.length - 1);
        var sql = 'SELECT ' + columns_str + ' FROM ' + table;
        sql += ' WHERE ' + where_column + "='" + key + "'";

        //查

        // sql = 'SELECT'
        console.log(sql);
        var select_result;
        connection.query(sql, function (err, result) {
            if (err) {
                console.log('[SELECT ERROR] - ', err.message);
                // return;
            }

            console.log('--------------------------SELECT----------------------------');
            console.log(result[0]);
            console.log('------------------------------------------------------------\n\n');

            callback(err, result);
        });
    }

}

module.exports = db;