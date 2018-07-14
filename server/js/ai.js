var UUID = require('node-uuid');
var dp = require(global.ROOTPATH + '/util/js/dprint.js');

function ai(eventEmiter) {
    this.eventEmiter = eventEmiter;
    
    this.init = function (params) {
        this.registerCallback('show_dice', this.dicing);
        this.registerCallback('show_buy', this.buying);
        this.registerCallback('show_build', this.building);
        this.registerCallback('show_directions', this.moving);
    }
    
    this.callbacks = {};
    
    this.registerCallback = function (event, callback) {
        this.callbacks[event] = callback.bind(this);
    }
    
    this.recv = function (message, player_name) {
        console.log('ai.recv', message, player_name);
        var event = message.event;
        var data = message.data;
        this.callbacks[event](data, player_name);
    }
    
    this.dicing = function (data, player_name) {
        var obj = {STAGE:'dicing'};
        this.send('dicing', obj, player_name);
    }
    
    this.buying = function (data, player_name) {
        var obj = {STAGE:'buying', SKIP:false};
        this.send('buying', obj, player_name);
    }
    
    this.building = function (data, player_name) {
        var obj = {STAGE:'building', SKIP:false};
        this.send('building', obj, player_name);
    }
    
    this.moving = function (data, player_name) {
        for (var di in data.DIRECTIONS) {
            var direction = data.DIRECTIONS[di];
            var obj = {STAGE:'choose_direction', 'DIRECTION': direction };
            this.send('choose_direction', obj, player_name);
            break;
        }
    }
    
    this.send = function (event, data, player_name) {
        console.log('ai.send', event, data, player_name);
        this.eventEmiter.emit(event, data, player_name);
    }
}

module.exports = ai;