//前端js连服务端nodejs
//

var socket = io.connect('/')
var timesend


function clickBtn(){
	console.log('显示数据库信息')
}

function calInJs(){
	console.log('calInJs');
	timesend = new Date().getTime();
	socket.send( 'user_info' );
}

function calInPy(){
	console.log('calInPy');
	timesend = new Date().getTime();
	
	socket.emit('js2py',"from js");
}

function listenEvents(){
	socket.on('onconnected', onConnect);
	socket.on('message', onGetMessage);
	// socket.on('send_python', onSendPython);

}

function onConnect ( data ){
	console.log('Connected successfully. server ID:' + data.id);
	// console.log('localStorage ID:' + localStorage.getItem('username'));
	localStorage.setItem('username', data.id);
}

function onGetMessage ( message ){
	console.log('received');
	timecost = new Date().getTime() - timesend;
	alert("从js到nodejs到返回耗时:" + timecost);
	console.log('client receive message',message);
	
}

function send2node(event, message, callback) {
	socket.emit('js2node',"from js");
}

function send2py(event, obj) {
	obj['STAGE'] = event;
	console.log('send2py', event, obj);
	socket.emit('js2py',JSON.stringify(obj));
}

( function () {
	listenEvents();

}() );