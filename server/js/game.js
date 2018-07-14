var events = require('events');
var UUID = require('node-uuid');
var dp = require(global.ROOTPATH + '/util/js/dprint.js');
var ai = require(global.ROOTPATH + '/server/js/ai.js');

function game(players, map_name, communication) {
    this.gameID = UUID();
    this.pyCallbacks = {};
    this.jsCallbacks = {};
    this.send_py = communication.send_py.bind(this);
    this.send_js = communication.send_js.bind(this);
    this.onGameEnd = communication.onGameEnd.bind(this);

    this.player_names = [];
    this.players = players;
    this.properties = {};
    this.streets = {};
    this.cards = {};
    this.map_name = map_name;
    this.current_player = null;
    this.stage = null;
    this.move_info = null;
    this.directions_info = null;
    this.initialized = false;
    this.last_send_js_msg = null;

    this.registerJsCallback = function (event, callback) {
        this.jsCallbacks[event] = callback;
    }

    this.registerPyCallback = function (event, callback) {
        this.pyCallbacks[event] = callback;
    }

    this.recv_js = function (message, player_name) {
        var event = message["STAGE"];
        // console.log('recv_js', message);
        this.jsCallbacks[event](message, player_name);
    }

    this.recv_py = function (message) {
        var event = message['event'];
        this.pyCallbacks[event](message.data);
    }


    this.init = function () {
        this.registerJsCallback('req_full_game', this.js_req_full_game.bind(this));
        this.registerJsCallback('dicing', this.js_dicing.bind(this));
        this.registerJsCallback('choose_direction', this.js_choose_direction.bind(this));
        this.registerJsCallback('buying', this.js_buying.bind(this));
        this.registerJsCallback('building', this.js_building.bind(this));
        this.registerJsCallback('skip', this.js_skip.bind(this));
        this.registerJsCallback('use_card', this.js_use_card.bind(this));

        this.registerPyCallback('initial', this.py_initial.bind(this));
        this.registerPyCallback('round_begin', this.py_round_begin.bind(this));
        this.registerPyCallback('dicing', this.py_dicing.bind(this));
        this.registerPyCallback('moving', this.py_moving.bind(this));
        this.registerPyCallback('buying', this.py_buying.bind(this));
        this.registerPyCallback('building', this.py_building.bind(this));
        this.registerPyCallback('pay_rent', this.py_pay_rent.bind(this));
        this.registerPyCallback('use_card', this.py_use_card.bind(this));
        this.registerPyCallback('round_end', this.py_round_end.bind(this));
        this.registerPyCallback('game_end', this.py_game_end.bind(this));
        
        this.action_timeout = null;
        this.eventEmitter = new events.EventEmitter();
        this.ai = new ai(this.eventEmitter);
        this.ai.init();

        this.eventEmitter.on('dicing', this.js_dicing.bind(this));
        this.eventEmitter.on('choose_direction', this.js_choose_direction.bind(this));
        this.eventEmitter.on('buying', this.js_buying.bind(this));
        this.eventEmitter.on('building', this.js_building.bind(this));

        
        for (var player_name in players) {
            this.player_names.push(player_name);
        }
    }

    this.is_action_js_event = function (event) {
        if (event == 'show_dice') {
            return true;
        } else if (event == 'show_directions') {
            return true;
        } else if (event == 'show_buy') {
            return true;
        } else if (event == 'show_build') {
            return true;
        } else {
            return false;
        }
    }

    this.js_req_full_game = function (params, player_name) {
        // console.log('js_req_full_game', params, player_name);
        if (this.initialized) {
            var data = {
                PLAYERS:this.players,
                PROPERTIES:this.properties,
                STREETS:this.streets,
                CARDS:this.cards,
                CRISIS_RATIO:this.crisis_ratio,
                STAGE:this.stage,
                CURRENT_PLAYER:this.current_player,
                DIRECTIONS_INFO:this.directions_info,
            };
            this.send_js('res_full_game', data, [player_name]);
        }
    }

    this.js_dicing = function (params, player_name) {
        clearTimeout(this.action_timeout);
        console.log(params, player_name, this.current_player);
        if (player_name == this.current_player) {
            this.send_py(params);
        }
    }

    this.js_choose_direction = function (params, player_name) {
        // console.log(params, this.move_info);
        clearTimeout(this.action_timeout);
        if (this.move_info && player_name == this.current_player){
            var direction = params['DIRECTION'];
            var destination = this.move_info.ALTERNATIVE[direction];
            var player = this.players[player_name];
            player.direction = direction;
            player.position = destination;
            var obj = {
                PLAYER:player_name,
                DIRECTION:direction,
                DESTINATION:destination
            }
            this.send_js('move_player', obj);
    
            delete obj['DESTINATION'];
            obj['STAGE'] = this.stage;
            obj['STEPS'] = this.move_info.STEPS;
            this.move_info = null;
            this.directions_info = null;
            this.send_py(obj);
        }
    }

    this.js_buying = function (params, player_name) {
        clearTimeout(this.action_timeout);
        if (player_name == this.current_player) {
            var obj = { 'STAGE': 'buying', 'SKIP': false };
            this.send_py(obj);
        }
    }

    this.js_building = function (params, player_name) {
        clearTimeout(this.action_timeout);
        if (player_name == this.current_player) {
            var obj = { 'STAGE': 'building', 'SKIP': false };
            this.send_py(obj);
        }
    }

    this.js_skip = function (params, player_name) {
        clearTimeout(this.action_timeout);
        if (player_name == this.current_player) {
            if (this.stage == 'buying' || this.stage == 'building' ) {
                var obj = { 'STAGE': this.stage, 'SKIP': true };
                this.send_py(obj);
            }
        }
    }

    this.js_use_card = function (params, player_name) {
        clearTimeout(this.action_timeout);
        if (player_name == this.current_player) {
            var obj = { 'STAGE': 'use_card', 'SKIP': false };
            this.send_py(obj);
        }
    }

    this.py_initial = function (data) {
        this.stage = data['NEXT_STAGE'];
        // console.log(data);
        // this.send_js('res_full_game', data);
        this.players = data.PLAYERS;
        this.properties = data.PROPERTIES;
        this.streets = data.STREETS;
        this.cards = data.CARDS;
        this.crisis_ratio = data.CRISIS_RATIO;
        this.initialized = true;
        this.send_py({ STAGE: 'round_begin' });
    }

    this.py_round_begin = function (data) {
        this.stage = data['NEXT_STAGE'];
        this.send_py({STAGE:this.stage});
    }

    this.py_dicing = function (data) {
        this.stage = data['NEXT_STAGE'];
        this.current_player = data['PLAYER'];
        delete data['NEXT_STAGE'];
        this.send_js('update_current_player', this.current_player);
        this.send_js('show_dice', data, [this.current_player]);
    }

    this.py_moving = function (data) {
        this.stage = data['NEXT_STAGE'];
        delete data['NEXT_STAGE'];
        if (data.LOYALTY) {
            var property_name = data.LOYALTY[0];
            var new_price = data.LOYALTY[1];
            this.properties[property_name].ini_price = new_price;
            var obj = {
                property_name:property_name,
                new_price:new_price,
            };
            this.send_js('update_price', obj);
        }
        if (data.ALTERNATIVE == 'None') {
            // dicing 结束
            data['DIRECTION'] = 'None';
            data['STAGE'] = this.stage;
            this.send_js('show_dice_num', data.STEPS);
            this.send_py(data);
        } else {
            // moving
            var player = this.players[data.PLAYER];
            var alternative = data.ALTERNATIVE;
            var keys = [];
            for (k in alternative) {
                keys.push(k);
            }

            if (keys.length == 1) {
                // 只有一个方向，直接前进
                var direction = keys[0];
                var destination = alternative[direction];
                player.direction = direction;
                player.position = destination;
                var obj = {
                    PLAYER:data.PLAYER,
                    DIRECTION:direction,
                    DESTINATION:destination
                }
                this.send_js('move_player', obj);

                delete data['ALTERNATIVE'];
                data['STAGE'] = this.stage;
                data['DIRECTION'] = direction;
                this.send_py(data);
            } else {
                var obj = {
                    PLAYER:data.PLAYER,
                    DIRECTIONS:keys,
                }
                this.move_info = data;
                this.directions_info = obj;
                this.send_js('show_directions', obj, [data.PLAYER]);
            }
        }
    }

    this.py_buying = function (data) {
        this.stage = data['NEXT_STAGE'];
        delete data['NEXT_STAGE'];
        this.send_js('show_buy', data, [data['PLAYER']]);
    }

    this.py_building = function (data) {
        this.stage = data['NEXT_STAGE'];
        delete data['NEXT_STAGE'];
        this.send_js('show_build', data, [data['PLAYER']]);
    }

    this.py_pay_rent = function (data) {
        this.stage = data['NEXT_STAGE'];
        delete data['NEXT_STAGE'];
        this.send_py({STAGE:this.stage});
    }

    this.py_use_card = function (data) {
        this.stage = data['NEXT_STAGE'];
        this.current_player = data['PLAYER'];
        delete data['NEXT_STAGE'];
    }

    this.py_round_end = function (data) {
        this.stage = data['NEXT_STAGE'];
        delete data['NEXT_STAGE'];
        this.send_js('round_end', data);

        if (data.hasOwnProperty('PLAYER')) {
            var player = this.players[data.PLAYER];
            if (data.hasOwnProperty('PLAYER')) {
                if (data.hasOwnProperty('CASH')) {
                    player.cash = data.CASH;
                }
                if (data.hasOwnProperty('PROPERTY')) {
                    this.properties[data.PROPERTY]['owner'] = data.PLAYER;
                    if (data.hasOwnProperty('BUILDING_LEVEL')) {
                        this.properties[data.PROPERTY]['level'] = data.BUILDING_LEVEL;
                    }
                }
            }
        }
        this.send_py({STAGE:this.stage});
    }

    this.py_game_end = function (data) {
        this.stage = data['NEXT_STAGE'];
        delete data['NEXT_STAGE'];
        this.send_js('game_end', data.PLAYER);
        this.onGameEnd(this);
    }

}


module.exports = game;