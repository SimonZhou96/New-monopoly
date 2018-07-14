var lobby_rooms;
var room;

function create_room() {
    console.log('create_room');
    var obj = {};
    socket.emit('create_room', obj);
}

function resRoomList(data) {
    console.log('resRoomList', data);
    if (data.old_game_room) {
        room = data.old_game_room;
        var reconnect = document.getElementById('reconnect');
        reconnect.style.visibility="visible";
    } else {
        var reconnect = document.getElementById('reconnect');
        reconnect.style.visibility="hidden";
    }
    lobby_rooms = data.rooms;
    for (var key in lobby_rooms) {
        var new_room = lobby_rooms[key];
        if (!new_room.begin) {
            increment(new_room);
        }
    }
}

function increment(room) {
    console.log('increment', room);
    var Odiv = document.createElement("li");//创建一个div
	var Odiv1 = document.createElement("li");//创建一个div
    var a = document.createElement("a");
    a.id = room.owner.toString();
    a.addEventListener('click', function(){clickRoom(event, button);}, false);
    a.href = "/room";
    var b = document.createElement("b");
    var img = document.createElement("img");
    img.src = "/client/images/money.jpg";
	var txt = document.createElement("textarea");
	txt.onfocus = this.blur();	
	txt.value = room.owner.toString();
	txt.style.cssText = ""
    b.appendChild(img);
    Odiv.appendChild(b);
	Odiv.appendChild(txt);
	a.appendChild(Odiv);
	

    var main = document.getElementById("mainmenu");
    a.style.cssText = "border:none; width:100%; height:100%; cursor:pointer";
    Odiv.style.cssText = "border: groove; float:left;margin-left: 2.5%;margin-top: 2.5%;width: 30%;border-radius:3px;overflow:hidden;";
    Odiv.background = "#25db1e";
    main.appendChild(a);
    lobby_rooms[room.owner.toString()] = room;
}

function clickRoom(event, button) {
    console.log('clickRoom', event, button);
    var owner = button.id;
    room = lobby_rooms[owner];
    socket.emit('click_room', room);
}

function enterRoom(room) {
    console.log(room);
    localStorage.setItem('room', JSON.stringify(room));
    location.href = "/room";
}

function reconnect() {
    console.log('room', room);
    localStorage.setItem('room', JSON.stringify(room));
    location.href = "/game";
}

(function () {
    // listenEvents();
    socket.on('enter_room', enterRoom);
    socket.on('increment', increment);
    socket.on('res_room_list', resRoomList);
    socket.emit('req_room_list', {});
}());