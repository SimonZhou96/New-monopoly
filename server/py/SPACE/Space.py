class Space:
    def __init__(self, name, position, size):
        """
        Parameters
        ----------
        GC : Game_control
            the uplayer Game_control
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
        """
        self.name = name
        self.position = position
        self.size = size

    def print_inf(self):
        print('\nInformation about {}'.format(self.name))
        print('name: {}'.format(self.name))
        print('position: {}'.format(self.position))
        print('size: {}'.format(self.size))
