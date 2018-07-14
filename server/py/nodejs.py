#!/usr/bin/python
# -*- coding: UTF-8 -*-
# python与nodejs的交互器
# 以python做服务端收发客户端nodejs信息
# author：pilaoda 793493083@qq.com

import socket               # 导入 socket 模块
import traceback
from threading import Thread
import json
from time import sleep

print("load nodejs.py")

HOST = '127.0.0.1'
PORT = 3368
BUF_SIZE = 1024

# nodejs与python交互器类
class nodejs():
    def __init__(self):
        self.sock = socket.socket()
        self.sock.bind((HOST, PORT))
        self.answer = "python handshake nodejs"
        self.clients = []
        self.recvCallback = None
        self.messages = []

    # 开始监听端口
    def listen(self):
        self.sock.listen(5)
        th = Thread(target=self.accept, args=())
        th.start()

    # 判断尝试连接的客户端线程
    def accept(self):
        while True:
            print('waiting')
            client, addr = self.sock.accept()
            print("adddress: ", addr[0])
            if addr[0] != HOST:
                client.close()
                print('refuse another host')
            else:
                if self.handshake(client):
                    print('accept')
                    self.clients.append(client)
                    th = Thread(target=self.recv, args=(self.recvCallback, client))
                    th.start()
                    self.sendMessages(client)
                else:
                    client.close()
                    print('refuse wrong handshake')

    # 与尝试连接的客户端握手
    def handshake(self, client):
        try:
            obj = {"data": "python", "event": "handshake"}
            strObj = json.dumps(obj).encode()
            client.send(strObj)

            answerStr = client.recv(BUF_SIZE).decode()
            answerObj = json.loads(answerStr)
            answer = answerObj['data']
        except Exception as e:
            traceback.print_exc()
            return False

        return (answer == self.answer)

    # 设置接收信息回调函数
    def setRecvCallback(self, callback):
        self.recvCallback = callback

    # 接收信息线程
    def recv(self, callback, client):
        while True:
            try:
                data = client.recv(BUF_SIZE).decode()
                if data:
                    dataObj = json.loads(data)
                    callback(dataObj)
            except Exception as e:
                traceback.print_exc()
                if client:
                    client.close()
                    self.clients.remove(client)
                break

    # 发送之前发不出去的消息
    def sendMessages(self, client):
        # print(self.messages)
        for message in self.messages:
            sleep(0.01)
            client.send(message)
        self.messages = []

    # 发送信息到nodejs客户端
    def send(self, event, data, gameID=None):
        # print(event, data, clientIDs)
        obj = {"event":event, "data":data, "gameID":gameID}
        strObj = json.dumps(obj).encode()

        if len(self.clients) == 0:
            self.messages.append(strObj)

        for client in self.clients:
            try:
                client.send(strObj)
            except Exception as e:
                traceback.print_exc()
                if client:
                    client.close()
                    self.clients.remove(client)
