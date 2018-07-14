from GAME_CONTROL import Game_control
from SPACE.Space import Space
from SPACE.Streets import streets


class property(Space):
    def __init__(self, name, position, size, street, ini_price, rental, build_cost):
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
        street : Space
            example:
                Rick_street
        ini_price : integer
            example:
                120
        rental : 2D-array_like
            rental[i][j] means rental with building level i and priority j
            example:
                [20, 30, 40]
                [40, 60, 80]
                [60, 90, 120]
        build_cost : 1D-array_like
            build_cost[i] means the cost from level i ot level i+1
            example:
            [40, 50]
        """
        super(property, self).__init__(name, position, size)
        self.street = street
        self.ini_price = ini_price
        self.price = ini_price
        self.rental = rental
        self.build_cost = build_cost
        '''
        paameters / default setting
        ---------------------------
        onwer : Players
            the onwer of this Properties
            default:
                None
        building_level : integer
            the level of building usually in {0,1,2}
            default:
                0
        hotel_level : 1D-array_like
             [Players_0,Players_1,...] means Players_0 has highest priority and Players_1 has second highest priority
             default:
                []  
        sellable : boolean 
            identify is this Properties can be sold
            default:
                True
        reword : ?       
        '''
        self.onwer = None
        self.building_level = 0
        self.hotel_level = []
        self.sellable = True
        self.reward = None

    def loyalty_sys(self):
        self.price = int(0.8 * self.price)
        return self.price

    def print_inf(self):
        super(property, self).print_inf()
        print('street: {}'.format(self.street))
        print('ini_price  {}'.format(self.ini_price))
        print('price: {}'.format(self.price))
        print('rental: {}'.format(self.rental))
        print('building_level): {}'.format(self.building_level))
        print('hotel_level: {}'.format(self.hotel_level))
        print('sellable: {}'.format(self.sellable))
        print('reward: {}'.format(self.reward))

    def buying(self, buyer):
        """
        Parameters
        ----------
        buyer : players
            the buyer who will buy this Properties
            example:
                Rick
        """
        if buyer.cash > self.price:
            self.onwer = buyer
            self.sellable = False

            buyer.cash_decrease(self.price)
            buyer.properties.append(self)
        else:
            raise Exception('not enough money')

    def building(self):
        if self.onwer.cash > self.build_cost[self.building_level]:
            self.onwer.cash = self.onwer.cash - self.build_cost[self.building_level]
            self.building_level = self.building_level + 1
        else:
            raise Exception('not enough money')

    def pay_rent(self, customer):
        '''
        customer should pay rent to this Properties's onwer
        ===================================================
        parameters / input
        ------------------
        customer : Players
            the one who pay rent
        '''
        # get priority
        priority_index = None
        for i in range(0, len(self.hotel_level)):
            if self.hotel_level[i] == customer:
                priority_index = i
                break
        if priority_index == None:
            priority_index = len(self.hotel_level)
            self.hotel_level.append(customer)
        # get rent
        rent = self.rental[self.building_level][priority_index]
        rent = min(rent, customer.cash);
        self.onwer.cash_increase(rent)
        customer.cash_decrease(rent)
        return rent, self.onwer.name, self.onwer.cash

# test code


# my_s_0 = streets('obj_0', (1, 2), (3, 4), (0, 0, 0, 0))
# my_s_0.function = 314
# my_s_0.print_inf()
# my_p_0 = property('obj_1', (1, 3), (3, 4), my_s_0, 10, 2)
# my_p_0.print_inf()
