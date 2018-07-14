#!/usr/bin/python
# -*- coding: UTF-8 -*-
import time
from threading import Thread
from GAME_CONTROL.Game_control import game_control
from GAME_CONTROL.Public_constant import *


class game():
    def __init__(self, con, player_names, gameID):
        self.con = con
        self.state = 0
        self.not_end = True
        self.mail_box = []
        self.GC = game_control(self.send, player_names)
        self.gameID = gameID
        self.interval = 1 / 30
        th = Thread(target=self.gameLoop, args=())
        th.start()

    def recv(self, data):
        self.mail_box.append(data)

    def send(self, data, event=None):
        print('send', data)
        if event is None:
            event = data['NEXT_STAGE']
        self.con.send(event, data, self.gameID)

    def gameLoop(self):
        while self.GC.game_stage != 'game_end':
            if len(self.mail_box) > 0:
                mesg = self.mail_box[0]
                del self.mail_box[0]
                print(mesg['STAGE'], self.GC.game_stage)
                self.GC.execute(mesg)

            time.sleep(self.interval)
