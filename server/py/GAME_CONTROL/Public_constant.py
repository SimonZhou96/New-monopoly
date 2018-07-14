from enum import unique, Enum


@unique
class direction(Enum):
    left = 'right'
    down = 'up'
    up = 'down'
    right = 'left'


@unique
class states(Enum):
    normal = 'normal'
    hospital = 'hospital'
    prison = 'prison'
    bankruptcy = 'bankruptcy'


class skip_exception(Exception):
    def __init__(self, mesg='skip this around'):
        self.mesg = mesg


class invaild_mesg_exception(Exception):
    def __init__(self, mesg='invaild_mesg'):
        self.mesg = mesg

# class bankruptcy_Exception(Exception):
#     def __init__(self, mesg="Someone bankruptcy", player=None):
#         self.mesg = mesg
#         self.player = player

# for i in direction:
#     print(i.name)
# print(direction['up'])