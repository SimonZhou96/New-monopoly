#!/usr/bin/python
# -*- coding: UTF-8 -*-
# python客户端，python运行起点
import traceback
import nodejs
from time import sleep
import game
import json

con = nodejs.nodejs()
games = {}

def onNodeGet(obj):
    print("recv", obj)
    if obj['event'] == 'initial':
        players = obj['data']['players'] #需要改成多名玩家
        new_game = game.game(con, players, obj['gameID'])
        games[obj['gameID']] = new_game
        with open("./maps/map1.json", 'r') as map_json:
            init_msg = json.load(map_json)
        new_game.recv(init_msg)
    elif obj['event']   == 'game_info':
        try:
            g = games[obj['gameID']]
            g.recv(obj['data'])
        except Exception as e:
            traceback.print_exc()

    # if obj['data'] == 'from js':
    #     con.send("return from py: "+ obj['data'], (obj['senderID'],))

con.setRecvCallback(onNodeGet)
con.listen()

while True:
    # sleep(1.0)
    try:
        str = input("input:\n")
        con.send('input_test', str)
    except Exception:
        print (Exception)