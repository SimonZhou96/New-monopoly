from GAME_CONTROL.Game_control import game_control
from GAME_CONTROL.Public_constant import *

# interface between stages and class
# GC = game_control()
# used for rececive and send message
mail_box = []
# while True:
#     try:
#         if len(mail_box) > 0:
#             mesg = mail_box[0]
#             GC.execute(mesg)
#             del mail_box[0]
#         else:
#             sleep(1)
#     except Exception:
#         break

GC = game_control()
mesg = {
    'STAGE': 'initial',
    'STREETS': {
        's1': {
            'position': {'x': 1, 'y': 1},
            'size': {'width': 1, 'length': 1},
            'adjacent': {},
            'function': None
        },
    },
    'PROPERTIES': {
        'p1': {
            'position': {'x': 1, 'y': 1},
            'size': {'width':1, 'length':1},
            'street': 's1',
            'ini_price': 3,
            'rental': 2,
            'build_cost': 2
        }
    },
    'CARDS': {},
    'PLAYERS': {
        'a1':{
            'position': 's1',
            'cash': 10,
            'direction': direction['up'],
        },
        'a2': {
            'position': 's1',
            'cash': 100,
            'direction': direction['left'],
        }
    },
    'CRISIS_RATIO': 0.1
}
GC.execute(mesg)
