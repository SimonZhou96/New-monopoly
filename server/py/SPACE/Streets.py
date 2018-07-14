from GAME_CONTROL.Public_constant import direction as D
from SPACE.Space import Space


class streets(Space):
    def __init__(self, name, position, size):
        """
        Parameters / initial setting / input
        ------------------------------------
        name : string
            unique name
            example :
               'Rick streets'
        position : dict / 2_elements
            {x:int, y:int}
            example :
                {x:2, y:1}
        size : dict / 2_elements
            {width:int, length:int}
            example:
                {width:2, width:3}

        Parameters / default setting
        ----------------------------
        adjacent : dict /4 elements
            {Dirction.left:Space, Dirction.down:Space, Dirction.up:Space, Dirction.right:Space}
            example:
                {Dirction.left:None, Dirction.down:Rick_ street, Direciton.up:None, Direction.right:Sunny_street}
            default:
                {}
        """
        super(streets, self).__init__(name, position, size)
        self.adjacent = {}
        self.player_list = []
        # default setting
        self.function = None

    def alternative_direction(self, direction):
        '''
        parameters
        ----------
        direction : Dirction
            the current dirction of player
        '''
        alternative = self.adjacent.copy()
        i_derection=D[direction.value]
        del alternative[i_derection]
        return alternative

    def link_adjacent(self, direction, street_b):
        '''
        link street_a and street_b
            where street_a's direction is street_b
        ==========================================
        parameters
        ----------
        direction : Direction
        street_b : streets
        '''
        self.adjacent[direction] = street_b

    def print_inf(self):
        super(streets, self).print_inf()
        print('adjacent: {}'.format(self.adjacent))
        print('player_list: {}'.format(self.player_list))
        print('function: {}'.format(self.function))


# test code
# my_s_0 = streets('obj_0', (1, 2), (1, 1))
# my_s_1 = streets('obj_1', (1, 3), (1, 1))
# my_s_0.print_inf()
# my_s_1.print_inf()
# my_s_0.link_adjacent(direction.up, my_s_1)
# my_s_0.print_inf()
# my_s_1.print_inf()
