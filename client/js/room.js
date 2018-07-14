var room;
var username;
//0代表准备好了，1代表还没准备好
var bol = 0;
var img_id = 0;//若每一个用户都准备好了，给他们一个id
var img;
var role_list = ['fap001fc', 'fap001fc2', 'frchara01', 'frchara09', 'fschara02', 'fschara04', 'sa1_1fc'];

function ready() {
    socket.emit('ready', room);
}

function judge_if_can_go() {

    for (var username in room.players) {
        var player = room.players[username];
        if (!player.ready) {
            alert('not all ready');
            return;
        }
	
	}
    socket.emit('create_game', room);
}

function updataRoom(updated_room) {
    room = updated_room;
    console.log(room);

    var btn = document.getElementById('ready');
    var btn_i = btn.childNodes[1];

    if (room.players[username].ready) {
        btn_i.innerText = 'retract';
    } else {
        btn_i.innerText = 'ready';
    }

    showUserNames();
}

function enterGame(data) {
    var role = room.players[username].role;
    localStorage.setItem('room', JSON.stringify(room));
    console.log('enterGame');
    location.href = "/game";
}

function showRoles(params) {
    var roles = document.getElementById("roles");
    for (var i in role_list) {
        var role_name = role_list[i];
        var div = document.createElement("div");
        div.id = role_name;
        div.classList.add('role');

        var img = document.createElement("img");
        var src = "/client/images/role/" + role_name + ".png";
        img.style.backgroundImage = 'url('+src+')';

        img.classList.add('role_img');
        roles.appendChild(div);
        div.appendChild(img);

        div.addEventListener('click', function(){clickRole(event, this);}, false);
    }
}

function showUserNames(params) {
    for (var player_name in room.players) {
        var player = room.players[player_name];
        var role_name = player.role;

        var role_div = document.getElementById(role_name);
        // console.log(role_div, role_name);
        var oldText = document.getElementById('user_' + player_name);
        removeElement(oldText);

        var textParent = document.createElement("div");
        textParent.textContent = player_name;
        textParent.id = 'user_' + player_name; 
        textParent.classList.add('text_username');

        role_div.appendChild(textParent);

        var oldReady = document.getElementById('ready_' + player_name);
        removeElement(oldReady);
        console.log(player.ready);
        if (player.ready) {
            var textReady = document.createElement("div");
            textReady.textContent = 'Ready';
            textReady.id = 'ready_' + player_name; 
            textReady.classList.add('text_ready');
            role_div.appendChild(textReady);
        }
    }   
}

function clickRole(event, div) {
    var data = {
        room:room,
        role:div.id,
    }
    socket.emit('change_role', data);
}

function removeElement(_element){
    if (_element) {
        var _parentElement = _element.parentNode;
        if(_parentElement) {
            _parentElement.removeChild(_element);  
        }
    }
}

(function () {
    room = JSON.parse(localStorage.getItem('room'));
    console.log(room);

    username = localStorage.getItem('username');
    socket.on('updata_room', updataRoom);
    socket.on('enter_game', enterGame);
    
    window.onload = function () {
        showRoles();
        showUserNames();
    }
}());