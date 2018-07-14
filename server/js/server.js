// import { setTimeout, clearTimeout } from 'timers';

//nodejs服务器主逻辑，管理与客户端的连接与信息收发

var server = module.exports = {},
	UUID = require('node-uuid'),
	mysql = require('mysql'),
	copy = require(global.ROOTPATH + '/util/js/copy.js')
dp = require(global.ROOTPATH + '/util/js/dprint.js'),
	py = require(global.ROOTPATH + '/server/js/python.js'),
	game = require(global.ROOTPATH + '/server/js/game.js'),
	copy
connection = mysql.createConnection({
	host: 'localhost',
	user: global.mysql_user,
	password: global.mysql_password,
	database: global.database
});

server.clients = {};
server.rooms = {};
var players_games = {};
var players_rooms = {};
var games = {};
var default_map = '';
var role_list = ['fap001fc', 'fap001fc2', 'frchara01', 'frchara09', 'fschara02', 'fschara04', 'sa1_1fc'];

//服务器初始化
server.init = function () {
	py.init();
	server.pyConnect();
};

//连接python
server.pyConnect = function () {
	py.connect();
	py.setCallback('connect', this.onPyConnect);
	py.setCallback('data', this.onPyGetData);
	py.setCallback('error', this.onPyError);
	py.setCallback('end', this.onPyEnd);
	py.setCallback('close', this.onPyClose);
};

//由客户端id获取客户端	
server.getClient = function (clientID) {
	return server.clients[clientID];
};

//某一客户端连接服务器时	
server.onConnect = function (client) {
	dp.print('socket.io:player ' + client.username + 'connnected');
	client.emit('onconnected', { id: client.username });
	// client.send("connect send");
};

//某一js客户端发送消息	
server.onGetMessage = function (client, message) {
	// client.emit('onconnected', { id:client.username });
	dp.print('socket.io:player ' + client.username + ' message ' + message.account + message.pw);
	client.send("nodejs return: " + message);
};

//某一客户端断开连接时	
server.onDisconnect = function (client) {
	dp.print('socket.io:player ' + client.username + ' disconnnected');
};

//某一客户端重新连接时（暂时不做）	
server.onReconnect = function (client) {
	dp.print('socket.io:player ' + client.username + ' reconnnected');
};

//综合某一客户端发送事件时的处理函数		
server.initEventListener = function (client) {
	dp.print('socket.io:player ' + client.username + ' initEventListener');
	client.on('js2sql', this.onJs2sql.bind(client));
	client.on('js2py', this.onJs2py.bind(client));
	client.on('create_game', this.onCreateGame.bind(client));
	client.on('game_info', this.onGameInfo.bind(client));
	client.on('create_room', this.onCreateRoom.bind(client));
	client.on('req_room_list', this.onReqRoomList.bind(client));
	client.on('click_room', this.onClickRoom.bind(client));
	client.on('ready', this.onReady.bind(client));
	client.on('change_role', this.onChangeRole.bind(client));

};

server.onJs2sql = function (data) {

	var data = JSON.parse(data);
	console.log(data)
	connection.connect();

	var addSql = 'INSERT INTO users(user_id,username,password,email,win,loss,escape) VALUES(0,?,?,?,?,?,?)';
	var addSqlParams = [data.account, data.pw, null, 0, 0, 0];
	//增		
	connection.query(addSql, addSqlParams, function (err, result) {
		if (err) {
			console.log('[INSERT ERROR] - ', err.message);
			return;
		}

		console.log('--------------------------INSERT----------------------------');
		//console.log('INSERT ID:',result.insertId);        
		console.log('INSERT ID:', result);
		console.log('-----------------------------------------------------------------\n\n');
	});

	connection.end()
};

//js往python发送消息，nodejs为桥梁	
server.onJs2py = function (data) {
	var client = this;
	py.send(data, client.username);
};

server.onCreateRoom = function (data) {
	var client = this;
	var username = client.username;
	var players = {};
	players[username] = {
		ready: false,
		role: role_list[0],
	};
	var room = {
		owner: username,
		map: default_map,
		players: players,
		begin: false,
	};

	server.rooms[username] = room;
	players_rooms[username] = room;
	client.emit('enter_room', room);
	server.emitAll('increment', room);
}

server.onReqRoomList = function (data) {
	var client = this;
	var username = client.username;
	var obj = {
		rooms: server.rooms,
	}

	if (players_games[username]) {
		obj['old_game_room'] = players_rooms[username];
	} else {
		obj['old_game_room'] = false;
	}

	client.emit('res_room_list', obj);
}

server.onClickRoom = function (room) {
	var client = this;
	var username = client.username;
	var room = server.rooms[room.owner];

	var new_role;

	console.log(room);
	for (var i in role_list) {
		var role_left = role_list[i];
		for (var player_name in room.players) {
			var player = room.players[player_name];
			console.log(player.role, role_list[i], role_left);
			if (player.role == role_list[i]) {
				role_left = false;
				continue;
			}
		}
		if (role_left) {
			new_role = role_left;
			console.log(new_role);
			break;
		}
	}

	room.players[username] = {
		ready: false,
		role: new_role,
	}

	for (var username in room.players) {
		var p_client = server.clients[username];
		if (p_client) {
			p_client.emit('updata_room', room);
		}
	}

	players_rooms[username] = room;
	client.emit('enter_room', room);
}

server.onChangeRole = function (data) {
	var client = this;
	var username = client.username;
	var role = data.role;
	var room = data.room;

	room.players[username].role = role;

	for (var username in room.players) {
		var p_client = server.clients[username];
		if (p_client) {
			p_client.emit('updata_room', room);
		}
		players_rooms[username] = room;
	}

	server.rooms[room.owner] = room;
}

server.onReady = function (room) {
	var client = this;
	var username = client.username;

	room.players[username].ready = !room.players[username].ready;

	for (var username in room.players) {
		var p_client = server.clients[username];
		if (p_client) {
			p_client.emit('updata_room', room);
		}
		players_rooms[username] = room;
	}

	server.rooms[room.owner] = room;
}

//js往创建游戏，往python发送消息	
server.onCreateGame = function (room) {
	room.begin = true;

	for (var username in room.players) {
		var p_client = server.clients[username];
		if (p_client) {
			p_client.emit('enter_game', {});
		}
	}

	var communication = {
		send_py: server.send_py,
		send_js: server.send_js,
		onGameEnd: server.onGameEnd,
	}

	var players_copy = copy.deepCopy(room.players);
	var new_game = new game(players_copy, room.map, communication);
	new_game.init();

	var client = this;
	for (var username in players_copy) {
		players_rooms[username] = room;
		players_games[username] = new_game;
	}

	games[new_game.gameID] = new_game;
	var obj = {
		event: 'initial',
		data: { players: new_game.player_names },
		gameID: new_game.gameID,
	};
	py.send(obj);


	server.rooms[room.owner] = room;
};

server.onGameInfo = function (data) {
	var client = this;
	var player_name = client.username;
	var game_obj = players_games[player_name];
	game_obj.recv_js(data, player_name);
}

server.onGameEnd = function (game_obj) {
	delete games[game_obj.gameID];

	for (var username in game_obj.player_names) {
		if (server.rooms.hasOwnProperty(username)) {
			delete server.rooms[username];
		}
		delete players_rooms[username];
		delete players_games[username];
	}
}

server.emitAll = function (event, data) {
	for (key in server.clients) {
		var client = server.clients[key];
		if (client) {
			client.emit(event, data);
		}
	}
}

server.send_js = function (event, data, players_names) {
	var obj = {
		event: event,
		data: data,
	};
	// this.last_send_js_msg = obj;

	var pnames = players_names;
	if (!(pnames && pnames.length > 0)) {
		pnames = this.player_names;
	};

	for (var i = pnames.length - 1; i >= 0; i--) {
		var pname = pnames[i]
		var client = server.clients[pname];
		if (client) {
			client.emit('game_info', obj);
		};

		if (this.is_action_js_event(event)) {
			this.action_timeout = setTimeout(
				function () { this.ai.recv(obj, pname); }.bind(this),
				20 * 1000
			);
		}
	};

};

server.send_py = function (data) {
	// console.log('this', this);
	var obj = {
		event: 'game_info',
		data: data,
		gameID: this.gameID,
	};
	py.send(obj);
};

//python连接成功事件	
server.onPyConnect = function () {
	dp.print("onPyConnect");
};

//收到python发来的消息	
var str_buffer = '';
server.onPyGetData = function (buf) {
	// dp.print("onGetPyData buf", buf);
	var buf2str = buf.toString()

	str_buffer += buf2str;
	try {
		var obj = JSON.parse(str_buffer);
		dp.print("recv", obj);
		var gameID = obj['gameID'];
		var event = obj['event']
		// console.log("handshake",handshake, true)
		if (event == 'handshake') {
			var answer = {
				'data': obj['data'] + ' handshake nodejs',
				'event': event,
			};
			py.send(answer);
		} else if (gameID) {
			var game = games[gameID];
			game.recv_py(obj);
		} else {

		};
		str_buffer = '';

	} catch (error) {
		console.log(error);
		console.log('recv error py', str_buffer);
	}

};

//python连接错误	
server.onPyError = function (data) {
	dp.print("onPyError", data);
};

//python连接终止	
server.onPyEnd = function (data) {
	dp.print("onPyEnd", data);
};

//python连接关闭	
server.onPyClose = function (data) {
	dp.print("onPyClose", data);
	setTimeout(server.pyConnect.bind(server), py.retryTimeout);
};

(function () {
	server.init();

}());