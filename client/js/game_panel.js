
var can = document.getElementById("canvas");
var cxt = can.getContext("2d");
var w = 40, h = 40;
var players;
var properties;
var streets;
var curMap = [];
var w_length = 14, h_length = 24;
var username = localStorage.getItem('username');
var room;
var callbacks = {};
var initialized = false;
var current_player;
var role_sex = {
    fap001fc: 'Woman',
    fap001fc2: 'Woman',
    frchara01: 'Man',
    frchara09: 'Woman',
    fschara02: 'Man',
    fschara04: 'Woman',
    sa1_1fc: 'Man',
}

var oImgs = {
    "grass1": "client/images/grass1.png",
    "grass2": "client/images/grass2.png",
    "grass3": "client/images/grass3.png",
    "grass4": "client/images/grass4.png",
    "grass5": "client/images/grass5.png",
    "grass6": "client/images/grass6.png",
    "water1": "client/images/water1.png",
    "water2": "client/images/water2.png",
    "water3": "client/images/water3.png",
    "water4": "client/images/water4.png",
    "water6": "client/images/water6.png",
    "water7": "client/images/water7.png",
    "water8": "client/images/water8.png",
    "water9": "client/images/water9.png",
    "property": "client/images/property.png",
    "street": "client/images/street.png",

};

function setImgs() {
    for (var player_name in room.players) {
        var role = room.players[player_name].role;
        // console.log(player_name, room.players[player_name], role);
        oImgs[player_name] = "client/images/role/" + role + ".png";
        oImgs[player_name + '_p'] = "client/images/property/" + role + ".png";
    };
}

//预加载所有图片
var images = {};
function imgPreload(srcs, callback) {
    var count = 0, imgNum = 0;

    for (var src in srcs) {
        imgNum++;
    }
    for (var src in srcs) {
        images[src] = new Image();
        images[src].onload = function () {
            //判断是否所有的图片都预加载完成
            if (++count >= imgNum) {
                callback(images);
            }
        }
        images[src].src = srcs[src];
    }
}

var cursor = { x: 0, y: 0 }
function showTooltip(e) {
    // print(e);
    var x = e.layerX;
    var y = e.layerY;
    var cw = can.width;
    var ch = can.height;

    var cow = can.offsetWidth;
    var coh = can.offsetHeight;

    var i = Math.floor((x / w) * (cw / cow));
    var j = Math.floor((y / h) * (ch / coh));
    if (i != cursor.x || j != cursor.y) {
        cursor.x = i;
        cursor.y = j;
        $('canvas').poshytip('hide');
		
        var tooltip = 'x:' + i + ', y:' + j + '\n';
		

        for (var street_name in streets) {
			
            var street = streets[street_name];
            var street_po = street.position;
            if (street_po.x == i && street_po.y == j) {
                tooltip += 'Street: ' + street_name + '\n';  
            }
        }

        for (var property_name in properties) {
            var property = properties[property_name];
            var property_po = property.position;
            if (property_po.x == i && property_po.y == j) {
                tooltip += 'Property: ' + property_name + ', Owner:' + property.owner + ', Level: ' + property.level + ', Price: ' + property.ini_price + ',\n'; 
                tooltip += ' Build cost:' + property.build_cost + ', Rental:' + property.rental + '\n';  
            }
        }

        for (var player_name in players) {
            var player = players[player_name];
            var street_name = player.position;
            var player_po = streets[street_name].position;
            if (player_po.x == i && player_po.y == j) {
                tooltip += 'Player: ' + player_name + ', Cash: ' + player.cash + '\n';  
            }
        }

        $('canvas').poshytip('update', tooltip);
        $('canvas').poshytip('showDelayed', 1000);
    }
}

//请求游戏所有信息后的回复  
function res_full_game(data) {
    initialized = true;

    print(data);
    players = data.PLAYERS;
    properties = data.PROPERTIES;
    streets = data.STREETS;
    current_player = data.CURRENT_PLAYER;

    InitMap();//初始化地板

    for (var i = 0; i < w_length; i++) {
        for (var j = 0; j < h_length; j++) {
            if (i == 0 && j == 0) {
                curMap[i][j] = 'water1';
            } else if (i == 0 && j == h_length - 1) {
                curMap[i][j] = 'water3';
            } else if (i == w_length - 1 && j == 0) {
                curMap[i][j] = 'water7';
            } else if (i == w_length - 1 && j == h_length - 1) {
                curMap[i][j] = 'water9';
            } else if (i == 0) {
                curMap[i][j] = 'water2';
            } else if (j == 0) {
                curMap[i][j] = 'water4';
            } else if (j == h_length - 1) {
                curMap[i][j] = 'water6';
            } else if (i == w_length - 1) {
                curMap[i][j] = 'water8';
            }
        }
    }

    for (var i in properties) {
        var po = properties[i].position;
        curMap[po.y][po.x] = 'property';
    }

    for (var i in streets) {
        var po = streets[i].position;
        curMap[po.y][po.x] = 'street';
    }

    for (var i in players) {
        var p = players[i];
        p['move_state'] = 0;
        p['name'] = i;
        updatePlayerImg(p);
    }


    if (data.CURRENT_PLAYER == username) {
        if (data.STAGE == 'buying') {
            show_buy();
        } else if (data.STAGE == 'dicing') {
            show_dice();
        } else if (data.STAGE == 'building') {
            show_build();
        } else if (data.DIRECTIONS_INFO) {
            show_directions(data.DIRECTIONS_INFO);
        }
    }


    draw();
}

function draw() {
    // print(curMap);
    DrawMap(curMap);//绘制出当前等级的地图
    DrawProperties();
    DrawPlayers();
}

//绘制地板
function InitMap() {
    for (var i = 0; i < w_length; i++) {
        curMap[i] = [];
        for (var j = 0; j < h_length; j++) {
            curMap[i][j] = 'grass' + GetRandomNum(1, 6).toString();
        }
    }

}
//绘制每个游戏关卡地图
function DrawMap(curMap) {
    console.log(curMap);
    for (var i = 0; i < curMap.length; i++) {
        for (var j = 0; j < curMap[i].length; j++) {
            var pic_name = curMap[i][j];
            if (pic_name.substring(0, 5) == 'grass') {
                var pic = images[pic_name];//初始图片
                cxt.drawImage(pic, w * j, h * i, w, h);
            }
        }
    }
    for (var i = 0; i < curMap.length; i++) {
        for (var j = 0; j < curMap[i].length; j++) {
            var pic_name = curMap[i][j];
            if (pic_name.substring(0, 5) != 'grass') {
                var pic = images[pic_name];//初始图片
                var x = w * j
                var pw = w;
                var ph = (pic.height / pic.width) * w;
                var y = h * (i + 1) - (pic.height / pic.width) * w;
                cxt.drawImage(pic, x, y, pw, ph);
            }
        }
    }
}

function DrawPlayers() {
    for (var player_name in players) {
        var p = players[player_name];
        if (p.cash <= 0) {
            if (!p.alerted) {
                alert(player_name + ' bankrupt!');
                p.alerted = true;
                if (player_name == username) {
                    var src = '/client/music/lose.m4a' ;
                    var audio = new Audio(src);
                    audio.play();

                    var player_role = room.players[player_name].role;
                    var sex = role_sex[player_role];
                    if (sex == 'Man') {
                        var src = '/client/music/1006.m4a' ;
                        var audio = new Audio(src);
                        audio.play();
                    } else {
                        var src = '/client/music/2006.m4a' ;
                        var audio = new Audio(src);
                    }
                }
            }
            continue;
        }
        // print(p);
        var po = streets[p.position].position;
        var p_img = images[player_name];
        var img_w = 40;
        var img_h = 60;
        var img_x = w * po.x - (img_w - w) / 2;
        var img_y = h * po.y - (img_h - h);

        cxt.drawImage(p_img, p.sx, p.sy, 32, 48, img_x, img_y, img_w, img_h);
    }
}

function DrawProperties() {
    for (var pro_name in properties) {
        var property = properties[pro_name];
        if (typeof property.level == 'undefined') {
            property.level = 0;
        }
        // print(p);
        var owner = property.owner;
        if (owner) {
            var po = property.position;
            var p_img = images[owner + '_p'];
            var img_w = 40;
            var img_h = 40;
            var img_x = w * po.x - (img_w - w) / 2;
            var img_y = h * po.y - (img_h - h);
            var sx = 0;
            var sy = (property.level) * 64;

            cxt.drawImage(p_img, sx, sy, 64, 64, img_x, img_y, img_w, img_h);
        }
    }
}

function updatePlayerImg(p) {
    var direction = p.direction;
    switch (direction) {
        case 'up':
            p['sy'] = 144;
            break;
        case 'down':
            p['sy'] = 0;
            break;
        case 'left':
            p['sy'] = 48;
            break;
        case 'right':
            p['sy'] = 96;
            break;
        default:
            break;
    }

    var move_state = p['move_state'];
    switch (move_state) {
        case 0:
            p['sx'] = 32;
            break;
        case 1:
            p['sx'] = 0;
            break;
        case 2:
            p['sx'] = 64;
            break;
        default:
            break;
    }
}

function move_player(data) {
    var player = players[data.PLAYER];
    player.position = data.DESTINATION;
    player.direction = data.DIRECTION;
    updatePlayerImg(player);

    draw();
}

function hide_all() {
    var directions = ['up', 'down', 'left', 'right'];
    for (var di in directions) {
        var direction = directions[di];
        var button = document.getElementById(direction);
        // button.addClass('button_plain');
        button.classList.remove('button-highlight');
        button.classList.add('button-plain');
    }
    document.getElementById('dice').classList.remove('button-primary');
    document.getElementById('dice').classList.add('button_plain');
    document.getElementById('buy').classList.remove('button-primary');
    document.getElementById('buy').classList.add('button_plain');
    document.getElementById('build').classList.remove('button-primary');
    document.getElementById('build').classList.add('button_plain');
    document.getElementById('skip').classList.remove('button-primary');
    document.getElementById('skip').classList.add('button_plain');
}

function update_price(data) {
    var property = properties[data.property_name];
    property.ini_price = data.new_price;
}

function update_current_player(player_name) {
    current_player = player_name;
}

function show_directions(data) {
    hide_all();
    for (var di in data.DIRECTIONS) {
        direction = data.DIRECTIONS[di];
        var button = document.getElementById(direction);
        button.classList.remove('button-plain');
        button.classList.add('button-highlight');
    }
}

function show_dice(data) {
    hide_all();
    console.log('show_dice', data, username);
    if (data && data.PLAYER) {
        current_player = data.PLAYER;
    }
    if (current_player == username) {
        document.getElementById('dice').classList.remove('button_plain');
        document.getElementById('dice').classList.add('button-primary');
    }
}

function show_dice_num(data) {
    // 激活骰子按钮
    // sendGameInfo('dicing', {});
    var dice_num = data;
    print(dice_num);

    var player = room.players[current_player];
    var sex = role_sex[player.role];

    var src = '/client/music/' + sex + '_' + dice_num + '.ogg';

    var audio = new Audio(src);
    audio.play();
}

function show_buy() {
    hide_all();
    document.getElementById('buy').classList.remove('button_plain');
    document.getElementById('buy').classList.add('button-primary');
    document.getElementById('skip').classList.remove('button_plain');
    document.getElementById('skip').classList.add('button-primary');
}

function show_build() {
    hide_all();
    document.getElementById('build').classList.remove('button_plain');
    document.getElementById('build').classList.add('button-primary');
    document.getElementById('skip').classList.remove('button_plain');
    document.getElementById('skip').classList.add('button-primary');
}

function pay_rent() {
    // sendGameInfo('round_end', {});
}

function use_card(params) {
    sendGameInfo('use_card', {});
}

function round_end(data) {
    // 更新ui数据
    hide_all();
    if (data.hasOwnProperty('PLAYER')) {
        var player = players[data.PLAYER];
        if (data.hasOwnProperty('PLAYER')) {
            if (data.hasOwnProperty('CASH')) {
                player.cash = data.CASH;
            }
            if (data.hasOwnProperty('PROPERTY')) {
                properties[data.PROPERTY]['owner'] = data.PLAYER;

                var player = room.players[current_player];
                var sex = role_sex[player.role];
                var src = '/client/music/' + sex + '_Order.ogg' ;
                var audio = new Audio(src);
                audio.play();
                
                if (data.hasOwnProperty('BUILDING_LEVEL')) {
                    properties[data.PROPERTY]['level'] = data.BUILDING_LEVEL;
                }
            }
        }
    }
    draw();
}

function game_end(data) {
    // 更新ui数据
    hide_all();
    alert(data + ' is the winner!');
    if (data == username) {
        var src = '/client/music/win.m4a' ;
        var audio = new Audio(src);
        audio.play();
    }
    draw();
}

create_game = function () {
    var obj = {
        player_names: [username],
        map: 'map'
    }
    socket.emit('create_game', obj);
}

throw_one_dice = function () {
    var obj = {};
		('dicing', obj);
}

buy_property = function () {
    var obj = { 'SKIP': false };
    sendGameInfo('buying', obj);
}

build_property = function () {
    var obj = { 'SKIP': false };
    sendGameInfo('building', obj);
}

skip_action = function () {
    var obj = { 'SKIP': true };
    sendGameInfo('skip', obj);
}

choose_direction = function (direction) {
    sendGameInfo('choose_direction', { 'DIRECTION': direction });
}


var addEvent = (function () {
    if (document.addEventListener) {
        return function (el, type, fn) {
            if (el.length) {
                for (var i = 0; i < el.length; i++) {
                    addEvent(el[i], type, fn);
                }
            } else {
                el.addEventListener(type, fn, false);
            }
        };
    } else {
        return function (el, type, fn) {
            if (el.length) {
                for (var i = 0; i < el.length; i++) {
                    addEvent(el[i], type, fn);
                }
            } else {
                el.attachEvent('on' + type, function () {
                    return fn.call(el, window.event);
                });
            }
        };
    }
})();

function print(s) {
    console.log(s);
}

function GetRandomNum(Min, Max) {
    var Range = Max - Min;
    var Rand = Math.random();
    return (Min + Math.round(Rand * Range));
}

function onGetGameInfo(message) {
    console.log('onGetGameInfo', message);
    var event = message['event'];
    callbacks[event](message.data);
}

function registCallback(event, callback) {
    callbacks[event] = callback;
}

function sendGameInfo(event, obj) {
    obj['STAGE'] = event;
    console.log('sendGameInfo', event, obj);
    socket.emit('game_info', obj);
}

function reqFullGame() {
    if (!initialized) {
        sendGameInfo('req_full_game', {});
        window.setTimeout(reqFullGame, 1000);
    }
}

function resize() {
    var width = window.innerWidth;
    var height = window.innerHeight;

    var gameDiv = document.getElementById('game');
    gameDiv.style.height = height + 'px';

    var dice = document.getElementById('dice');
    var dice_wrap = document.getElementById('dice_wrap');
    var buy = document.getElementById('buy');
    var buy_wrap = document.getElementById('buy_wrap');
    var build = document.getElementById('build');
    var build_wrap = document.getElementById('build_wrap');
    var up = document.getElementById('up');
    var up_wrap = document.getElementById('up_wrap');
    var down = document.getElementById('down');
    var down_wrap = document.getElementById('down_wrap');
    var left = document.getElementById('left');
    var left_wrap = document.getElementById('left_wrap');
    var right = document.getElementById('right');
    var right_wrap = document.getElementById('right_wrap');

    var button_width = width * 0.1;
    var button_height = height * 0.07;
    dice.style.width = button_width + 'px';
    dice.style.height = button_height + 'px';
    dice.style['line-height'] = '0px';
    dice.style['font-size'] = button_height * 0.5 + 'px';
    buy.style.width = button_width + 'px';
    buy.style.height = button_height + 'px';
    buy.style['line-height'] = '0px';
    buy.style['font-size'] = button_height * 0.5 + 'px';
    build.style.width = button_width + 'px';
    build.style.height = button_height + 'px';
    build.style['line-height'] = '0px';
    build.style['font-size'] = button_height * 0.5 + 'px';
    skip.style.width = button_width + 'px';
    skip.style.height = button_height + 'px';
    skip.style['line-height'] = '0px';
    skip.style['font-size'] = button_height * 0.5 + 'px';

    button_width = button_width * 0.6;
    up.style.width = button_width + 'px';
    up.style.height = button_width + 'px';
    up.style['font-size'] = button_width * 0.3 + 'px';
    down.style.width = button_width + 'px';
    down.style.height = button_width + 'px';
    down.style['font-size'] = button_width * 0.3 + 'px';
    right.style.width = button_width + 'px';
    right.style.height = button_width + 'px';
    right.style['font-size'] = button_width * 0.3 + 'px';
    left.style.width = button_width + 'px';
    left.style.height = button_width + 'px';
    left.style['font-size'] = button_width * 0.3 + 'px';
}

(function () {
    resize()
    window.addEventListener('resize', resize);

    socket.on('game_info', onGetGameInfo);
    registCallback('res_full_game', res_full_game);
    registCallback('update_price', update_price);
    registCallback('update_current_player', update_current_player);
    registCallback('show_dice', show_dice);
    registCallback('show_dice_num', show_dice_num);
    registCallback('show_directions', show_directions);
    registCallback('move_player', move_player);
    registCallback('show_buy', show_buy);
    registCallback('show_build', show_build);
    registCallback('pay_rent', pay_rent);
    registCallback('use_card', use_card);
    registCallback('round_end', round_end);
    registCallback('game_end', game_end);

    room = JSON.parse(localStorage.getItem('room'));
    console.log(room);
    // localStorage.removeItem('room');

    $('canvas').poshytip({
        showTimeout: 1,
        followCursor: true,
        slide: false
    });

    setImgs();

    imgPreload(oImgs, function (images) {
        reqFullGame();
    });

    hide_all();
}());
