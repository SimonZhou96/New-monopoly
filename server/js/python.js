// python与nodejs的本地交互器
// 在服务器内部，以nodejs做客户端与服务端python收发消息，host均为本地
// author:pilaoda 793493083@qq.com

"use strict";
var python = module.exports = {};
var dp = require(global.ROOTPATH + '/util/js/dprint.js');
var net = require("net");
var exec = require('child_process').exec;

//得到ip和端口
var host = "127.0.0.1";
var port = global.pyPort;
python.retryTimeout = 3000

//python交互器初始化
python.init = function (){
	if (global.runPython){
		this.runPython();
	}
}

//往python发送消息
python.send = function (objStr){
	var obj = null;
	dp.print('send', objStr); 
	if (typeof objStr == 'object') {
		obj = objStr
	} else {
		obj = JSON.parse(objStr);
	}
	this.client.write(JSON.stringify(obj));
}

//设置python连接某一事件的回调函数
python.setCallback = function (event, callback){
	this.client.on(event, callback);
}

//启动python服务端
python.runPython = function (){
	dp.print('python.runPython');

	var filename = global.ROOTPATH + '/server/py/server.py';

	exec('python '+ filename, function(err,stdout,stdin){

    	if(err){
        	console.log('err', err, stdout, stdin);
    	}
    	if(stdout){
        	//parse the string
        	console.log(stdout);
        	// var astr = stdout.split('\r\n').join('');//delete the \r\n
        	// var obj = JSON.parse(astr);

    	}
	});
}

//连接python
python.connect = function (){
	// dp.print('python.connect');
	this.client = net.connect({port: port});
}
