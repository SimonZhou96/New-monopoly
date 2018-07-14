from GAME_CONTROL.Game_control import states
from GAME_CONTROL.Public_constant import *
import random


class players:
    def __init__(self, name, position, cash, direction_str):
        '''
        Parameters / initial setting
        ----------
        name : string
            example:
                Rick
        position : Space
            example:
                hospital
        cash : integer
            example:
                1000
        direction : str
            Direction
            example:
                'up'
        '''
        self.name = name
        self.position = position
        self.cash = cash
        self.direction = direction[direction_str]
        '''
        Parameters / default setting
        ----------------------------
        properties : list_like 
            [properties_0, properties_1, ....]
            example:
                [hotel, school] 
            default:
                []
        state : Enum
            State
            example:
                State.hospital
            default:
                State.normal 
        hands : List_like
            [cards_0, cards_1, ...]
            example:
                [steal, traffic accident]
            default:
                []        
        '''
        self.properties = []
        self.state = states.normal
        self.hands = []

    def cash_increase(self, increase):
        self.cash = self.cash + increase
        return self.cash

    def cash_decrease(self, decrease):
        self.cash = self.cash - decrease
        if self.cash <= 0:
            self.bankruptcy()
        return self.cash

    def one_step(self):
        '''
        go to reachable streets with distance 1
        '''
        (new_direction, new_position) = self.position.Direction_select(self.direction)
        self.set_direction(new_direction)
        self.position = new_position
        '''
        uncode yet
        move one step animation
        '''

    def move(self, distance):
        '''
        parameters
        ----------
        distance : integer
            the step numbers of this move
            example:
                4
        returns
        -------
        destination : Streets
            where Players will achieve
        '''
        for i in range(0, distance):
            self.one_step()
        destination = self.position
        return destination

    def set_direction(self, new_direction):
        '''
        parameters
        ----------
        new_direction : Direction
            new direction
        '''
        if self.position.adjacent.haskey(new_direction):
            self.direction = new_direction
            '''
            uncode yet
            direction change animation
            '''
        else:
            raise Exception('invaild direction')

    def bankruptcy(self):
        '''
        take action when player is bankruptcy
        =====================================
        parameters / input
        player : Players
            who is bankruptcy
        '''
        self.state = states.bankruptcy
        # self.survival = self.survival - 1
        for i in self.properties:
            i.onwer = None
            i.sellable = True
        '''
        uncode yet 
        Player disappear animation
        '''


def dicing(n=1, offset=0):
    '''
    parameters
    ----------
    n : integer
        the number of dices
    offset : integer
        the offset of the result

    returns
    -------
    result : integer
        the result of dicing
        example:
            3
    '''
    result = 0
    for i in range(0, n):
        result = result + random.randint(1, 6)
    result = result + offset
    if result < 0:
        result = 1
    '''
    uncode yet
    dicing animation
    '''
    return result
