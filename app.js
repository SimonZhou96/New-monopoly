'use strict'

//服务器启动文件，项目启动入口

//项目根目录
global.ROOTPATH = __dirname;

global.users = { 'aa': 1 , 'ss':1 };
require(global.ROOTPATH + '/server/js/setting.js');

var
	//设置端口
	gameport = process.env.PORT || global.jsPort,
	secret = 'sustc',

	io = require('socket.io'),
	db = require('./server/js/db.js'),
	express = require('express'),
	UUID = require('node-uuid'),
	server = require('./server/js/server.js'),
	http = require('http'),
	session = require('express-session'),
	cookieParser = require('cookie-parser')(secret),
	app = express(),
	bodyParser = express.bodyParser,
	http_server = http.createServer(app),
	sessionStore = new express.session.MemoryStore();

db = new db();

//监听端口
http_server.listen(gameport);
console.log('\t :: Express listen to port:' + gameport);

app.use(bodyParser());
// app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser);

// 设置session
app.use(
	session({
		// name: 'sessionid',
		secret: secret,
		cookie: { maxAge: 60 * 60 * 1000 },
		saveUninitialized: false,
		resave: true,
		store: sessionStore,
	})
);

//登录请求
app.post('/login', function (req, res) {
	// console.log(req.body);
	var username = req.body.username;
	var password = req.body.password;
	db.select('users', 'username', username, ['username', 'password'], function (err, params) {
		console.log(err, params);
		if (err) {
			console.log(err);
			req.session.destroy();
			res.json({"success":false});
		} else if (params && params[0] && username == params[0].username && password == params[0].password) {
			console.log('login successfully');
			req.session.login = true;
			req.session.name = username;
			res.json({"success":true});
		} else {
			console.log('wrong');
			req.session.destroy();
			res.json({"success":false});
		}
	});
});

//设置注册页面
app.get('/enroll', function (req, res) {
	res.sendfile('/client/html/enroll.html', { root: __dirname });
});

app.post('/enroll', function (req, res) {
	// res.sendfile('/client/html/enroll.html', { root: __dirname });
	var username = req.body.username;
	var password = req.body.password;
	console.log(req);
	db.insert('users', {username:username, password:password}, function (err, params) {
		console.log(err, params);
		if (err) {
			console.log(err);
			req.session.destroy();
			res.json({"success":false});
		} else {
			console.log('enroll successfully');
			req.session.destroy();
			res.json({"success":true});
		}
	});
});

//设置游戏大厅
app.all('/lobby', function (req, res) {
	if (req.session.login) {//检查用户是否已经登录，如果已登录展现的页面	
		res.sendfile('/client/html/lobby.html', { root: __dirname });
	} else {//否则展示index页面	
		req.session.destroy();
		res.redirect('/');
	}
});

//设置游戏房间
app.all('/room', function (req, res) {
	if (req.session.login) {//检查用户是否已经登录，如果已登录展现的页面	
		res.sendfile('/client/html/room.html', { root: __dirname });
	} else {//否则展示index页面	
		req.session.destroy();
		res.redirect('/');
	}
});

//设置游戏
app.all('/game', function (req, res) {
	if (req.session.login) {//检查用户是否已经登录，如果已登录展现的页面	
		res.sendfile('/client/html/game.html', { root: __dirname });
	} else {//否则展示index页面	
		req.session.destroy();
		res.redirect('/');
	}
});

//设置主页
app.all('/', function (req, res) {
	// console.log(req);
	// console.log(res);
	res.sendfile('/client/html/login.html', { root: __dirname });
});

//监听/×文件
app.all('/*', function (req, res, next) {
	var file = req.params[0];
	console.log('\t :: Express :: file requested: ' + file, file.substring(0, 6));
	if (file.substring(0, 6) == 'client'){ 
		res.sendfile(__dirname + '/' + file);
	};
});

//创建socket io	
var sio = io.listen(http_server);

function findCookie(handshake) {
	var key = 'connect.sid';
	if (handshake)
		return (handshake.secureCookies && handshake.secureCookies[key]) ||
			(handshake.signedCookies && handshake.signedCookies[key]) ||
			(handshake.cookies && handshake.cookies[key]);
}

sio.set('log level', 0);
// socket请求的验证	
sio.set('authorization', function (handshake, accept) {
	// 检查cookie是否对应有效session	
	if (handshake.headers.cookie) {
		cookieParser(handshake, {}, function (parseErr) {
			var sessionLookupMethod = sessionStore.load || sessionStore.get;
			var finded = findCookie(handshake);
			sessionLookupMethod.call(sessionStore, finded, function (storeErr, session) {
				var err = parseErr || storeErr || null;
				if (err || !session) {
					accept('Error', false);
				} else {
					accept(null, true);
				}
			});
		});
    } else {
       return accept('No cookie transmitted.', false);
    }
});

// 创建session sockets	
var SessionSockets = require('session.socket.io'),
	sessionSockets = new SessionSockets(sio, sessionStore, cookieParser);


//客户端socket连接服务器
sessionSockets.on('connection', function (err, client, session) {
	// console.log(err, client, session);
	// 将session用户名，即登录用的用户名存入client这个socket中	
	client.username = session.name;
	// console.log(client);
	server.clients[client.username] = client;
	server.onConnect(client);

	server.initEventListener(client);


	client.on('message', function (message) {
		server.onGetMessage(client, message);
	});

	client.on('disconnect', function () {
		server.onDisconnect(client);
		server.clients[client.username] = null;
	});
});