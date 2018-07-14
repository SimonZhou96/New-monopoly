
var os=require('os');
//设置服务端nodejsjs参数

//设置是否开启dprint
global.dpEnable = true;

//是否同时开启python连接脚本（若开启则无法即时获取python控制台打印）
global.runPython = false;

//与js连接的端口
global.jsPort = 4004;

//与python连接的端口
global.pyPort = 3368;

//mysql user
global.mysql_user = 'root';

//mysql password
global.mysql_password = '123456';
console.log(os.platform());
if (os.platform() == 'linux'){
    global.mysql_password = 'Sustc115';
}

//database
global.database = 'monopoly';