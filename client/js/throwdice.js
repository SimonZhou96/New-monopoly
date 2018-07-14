
var dicex = 500;
var dicey = 400;
var dicewidth = 100;
var diceheight = 100;
var dotard = 6;
var ctx;
var dx;
var dy;
var firstturn = true;
// new_element=document.createElement("script");
// new_element.setAttribute("type","text/javascript");
// new_element.setAttribute("src","./client/js/game_panel.js");// 在这里引入了game_panel.js
// document.body.appendChild(new_element);
throw_one_dice = function (){
    var ch = 1+ Math.floor(Math.random()*6);
    dx = dicex;
    dy = dicey;
    var count = 0;
    alert('当前点数为: '+ch);
    if(firstturn){
        count = count+1;
        go(ch);
        if(count == ch)
        {
            firstturn==false;
        }
    }
    function drawface(n){
        ctx = document.getElementById('canvas').getContext('2d');
        ctx.lineWidth = 5;
        ctx.clearRect(dx,dy,dicewidth,diceheight);
        ctx.strokeRect(dx,dy,dicewidth,diceheight);
        var dotx;
        var doty;
        ctx.fillStyle = "#009966";
        switch(n){
            case 1:
                draw1();
                break;
            case 2:
                draw2();
                break;
            case 3:
                draw2();
                draw1();
                break;
            case 4:
                draw4();
                break;
            case 5:
                draw4();
                draw1();
                break;
            case 6:
                draw4();
                draw2mid();
                break;
        }
    }
    function draw1(){
        //这里没问题
        var dotx;
        var doty;
        ctx.beginPath();
        dotx = dx + .5*dicewidth;
        doty = dy + .5*diceheight;
        ctx.arc(dotx,doty,dotard,0,Math.PI*2,true);
        ctx.closePath();
        ctx.fill();
    }
    function draw2(){
        alert('移动'+ch+"步");
        var dotx;
        var doty;
        ctx.beginPath();
        dotx = dx + 3*dotard;
        doty = dy + 3*dotard;
        ctx.arc(dotx,doty,dotard,0,Math.PI*2,true);
        dotx = dx + dicewidth-3*dotard;
        doty = dy + diceheight-3*dotard;
        ctx.arc(dotx,doty,dotard,0,Math.PI*2,true);
        ctx.closePath();
        ctx.fill();
    }
    function draw4(){
        alert('移动'+ch+"步");
        var dotx;
        var doty;
        ctx.beginPath();
        dotx = dx + 3*dotard;
        doty = dy + 3*dotard;
        ctx.arc(dotx,doty,dotard,0,Math.PI*2,true);
        dotx = dx + dicewidth-3*dotard;
        doty = dy + diceheight-3*dotard;
        ctx.arc(dotx,doty,dotard,0,Math.PI*2,true);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        dotx = dx + 3*dotard;
        doty = dy + diceheight-3*dotard;
        ctx.arc(dotx,doty,dotard,0,Math.PI*2,true);
        dotx = dx + dicewidth-3*dotard
        doty = dy + 3*dotard;
        ctx.arc(dotx,doty,dotard,0,Math.PI*2,true);
        ctx.closePath();
        ctx.fill();
    }
    function draw2mid(){
        alert('移动'+ch+"步");
        var dotx;
        var doty;
        ctx.beginPath();
        dotx = dx + 3*dotard;
        doty = dy + .5*dotard;
        ctx.arc(dotx,doty,dotard,0,Math.PI*2,true);
        dotx = dx + dicewidth-3*dotard;
        doty = dy + .5*diceheight;
        ctx.arc(dotx,doty,dotard,0,Math.PI*2,true);
        ctx.closePath();
        ctx.fill();
    }

}