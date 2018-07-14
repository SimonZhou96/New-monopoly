from GAME_CONTROL.Public_constant import states, skip_exception
from STAGES import Initial


class game_control:
    def __init__(self, send, player_names):
        self.game_stage = Initial.initial
        self.obj_def()
        self.global_def()
        self.control_def()
        self.send = send
        self.player_names = player_names

    def obj_def(self):
        '''
        usually not change after initial stage
        ======================================
        '''
        self.streets_dict = {}
        self.property_dict = {}
        self.players_dict = {}

    def global_def(self):
        '''
        some global middle variable
        ===========================
        '''
        self.crisis_ratio = 1

    def control_def(self):
        '''
        usually changed when gaming
        ===========================
        '''
        self.action_queue = []
        self.current_player = None
        self.round = 0
        self.count = 0
        self.crisis = 1

    def get_crisis(self):
        '''
        disaster will increase as round increase
        ========================================
        '''
        return self.round * self.crisis_ratio

    def update_round(self):
        self.current_player = self.action_queue[0]
        self.count = self.count + 1
        if self.count == 1 + len(self.players_dict):
            self.count = 1
            self.round = self.round + 1
        return (self.current_player, self.count, self.round)

    def check_winner(self):
        count = 0
        print('count={} '.format(count))
        total = 0
        print('total={}'.format(total))
        for p_id, player in self.players_dict.items():
            print('name={} state={}'.format(p_id, player.state))
            total = total + 1
            print('total={}'.format(total))
            if player.state != states.bankruptcy:
                count = count + 1
                print('count={} '.format(count))
                winner = player
        if count > 1:
            winner = None
        return count, winner

    def loyalty_sys(self, street):
        new_price = None
        property_name = None
        # print(self.property_dict)
        if street.function != 'None' and street.function.name in self.property_dict.keys():
            property = self.property_dict[street.function.name]
            property_name = property.name
            if property.onwer == None:
                new_price = property.loyalty_sys()
        return property_name, new_price

    def alternative_direction(self, player):
        street = self.streets_dict[player.position.name]
        alternative = street.alternative_direction(player.direction)
        return alternative

    def can_buying(self):
        property = self.current_player.position.function
        if property == 'None':
            return False
        elif property.sellable == True and self.current_player.cash > property.price and property.onwer != self.current_player:
            return True
        else:
            return False

    def can_building(self):
        property = self.current_player.position.function
        if property == 'None':
            return False
        elif property.onwer == self.current_player and property.building_level <= 1:
            if property.build_cost[property.building_level] < self.current_player.cash:
                return True
            else:
                return False
        else:
            return False

    def should_pay_rent(self):
        property = self.current_player.position.function
        if property == 'None':
            return False
        elif property.onwer != None and property.onwer != self.current_player:
            if property.onwer.state == states.normal:
                return True
            else:
                return False
        else:
            return False

    def execute(self, mesg):
        self.game_stage.is_mesg_vaild(self, mesg)


def my_turn(self):
    '''
    It's player's round
    ===================
    parameters
    ----------
    player : Players
        people who take action this time
    '''
    try:
        self.disaster_coming(self.current_player)
        self.update_states()
        if self.current_player.state == states.normal:
            distance = self.current_player.dicing()
            '''
            uncode yet 
            get the direction player choose
            '''
            self.current_player.set_direction()  # uncode yet
            destination = self.current_player.move(distance)
            self.position_action(destination)
        if self.current_player.state == states.normal:
            self.hands_stage()
    except  skip_exception as e:
        print(e.mesg)
        pass

# def mian_loop(self):
#     '''
#     the body of one game
#     ====================
#     '''
#     self.initialize()
#     while self.survival > 1:  # no winner yet
#         self.count = self.count + 1
#         # update around
#         if self.count > self.p:
#             self.count = 1
#             self.round = self.round + 1
#             self.update_disaster()
#         # set current player
#         self.current_player = self.action_queue[0]
#         if self.current_player.state != states.bankruptcy:
#             try:
#                 self.my_turn(self.current_player)
#             except skip_exception:
#                 pass
#         # adjust action_queue
#         self.action_queue.append(self.current_player)
#         del self.action_queue[0]  # list = [1, 2, 45, 31, 1]
