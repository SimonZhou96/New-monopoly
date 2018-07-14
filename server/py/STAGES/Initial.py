from GAME_CONTROL.Public_constant import direction
from PLAYERS.Players import players

from SPACE.Property import property
from SPACE.Streets import streets
from STAGES import Round_Begin
from STAGES.Stage import stage
import copy


class initial(stage):
    @staticmethod
    def is_mesg_vaild(GC, mesg):
        if mesg['STAGE'] == 'initial':
            initial(GC, mesg)
            mesg['NEXT_STAGE'] = 'round_begin'
            GC.send(mesg, event='initial')

    def __init__(self, GC, instruction):
        '''
        When this function finished, this stage is also finished, game_state will be update
        ===================================================================================
        Parameters
        ----------
        instruction : dict
           +----------+-----------+--------------------+
           | KEY      | VALUE     | REMARK             |
           +----------+-----------+--------------------+
           | STAGE    | 'initial' |                    |
           | STREETS  | dict      | see initial_map    |
           | PROPERTY | dict      | see initial_map    |
           | PLAYERS  | dict      | see initial_player |
           | CARDS    | dict      | see initial_cards  |
           | CRISIS   | integer   |                    |
           +----------+-----------+--------------------+
        '''
        super(initial, self).__init__(GC, instruction)
        self.map_init(instruction['STREETS'], instruction['PROPERTIES'])
        self.players_init(instruction['PLAYERS'])
        self.cards_init(instruction['CARDS'])
        self.global_init(instruction['CRISIS_RATIO'])
        self.control_init()
        self.next_stage()

    def map_init(self, streets_data, property_data):
        '''
        Initial map
        ===========
        Parameters
        ----------
        streets_data : dict
            +-------------+---------------------------------+
            | KEY         | VALUE : dict                    |
            +-------------+----------+--------+-------------|
            |             | KEY      | VALUE  | REMARK      |
            |             +----------+--------+-------------+
            | street_name | position |  dict  | see space   |
            |             | size     |  dict  | see space   |
            |             | adjacent |  dict  | see streets |
            |             | function |  Space | see streets |
            +-------------+----------+--------+-------------+
        property_data : dict
            +-----------------+----------------------------------------+
            | KEY             | VALUE : dict                           |
            +-----------------+------------+----------+----------------+
            |                 | KEY        | VALUE    | REMARK         |
            |                 +------------+----------+----------------+
            |                 | position   | dict     | see space      |
            | properties_name | size       | dict     | see space      |
            |                 | street     | String   | see properties |
            |                 | ini_price  | integer  |                |
            |                 | rental     | 2D-array | see properties |
            |                 | build_cost | 1D-array |                |
            +-----------------+------------+----------+----------------+
        '''
        GC = self.GC
        # add streets to game_control
        for name, info in streets_data.items():
            temp_street = streets(name, info['position'], info['size'])
            GC.streets_dict[name] = temp_street
            temp_street.function = info['function']
        # link streets
        for name_0, street_0 in streets_data.items():
            for d, name_1 in street_0['adjacent'].items():
                GC.streets_dict[name_0].link_adjacent(direction[d], GC.streets_dict[name_1])
        # add property to game_control
        for name, info in property_data.items():
            temp_street = GC.streets_dict[info['street']]
            temp_property = property(name, info['position'], info['size'], temp_street, info['ini_price'],
                                     info['rental'], info['build_cost'])
            GC.property_dict[name] = temp_property

        for name, street in GC.streets_dict.items():
            if street.function!='None':
              street.function = GC.property_dict[street.function]

    def players_init(self, players_data):
        '''
        Initial players
        ===============
        Parameters
        ----------
        players_data : dict
            +------+-------------------------------------+
            | KEY  | VALUE : dict                        |
            +------+----------+---------+----------------+
            | name | KEY      | VALUE   | REMARK         |
            |      +----------++--------++---------------+
            |      | position  | dict    | see players   |
            |      | cash      | integer | see players   |
            |      | direction | Enum    | see direction |
            +------+-----------+---------+---------------+
        '''
        player_names = self.GC.player_names
        print(len(players_data), players_data, player_names)
        while len(players_data) > len(player_names):
            k = list(players_data.keys())[0]
            print(k)
            del players_data[k]

        player_keys = list(players_data.keys())
        for i in range(len(player_names)):
            new_name = player_names[i]
            old_name = player_keys[i]
            players_data[new_name] = copy.deepcopy(players_data[old_name])
            del players_data[old_name]

        for name, info in players_data.items():
            street = self.GC.streets_dict[info['position']]
            temp_player = players(name, street, info['cash'], info['direction'])
            self.GC.players_dict[name] = temp_player

    def cards_init(self, cards_data):
        pass

    def global_init(self, crisis_ratio):
        self.GC.crisis_ratio = crisis_ratio

    def control_init(self):
        for i in self.GC.players_dict:
            p = self.GC.players_dict[i]
            self.GC.action_queue.append(p)

    def next_stage(self):
        self.GC.game_stage = Round_Begin.round_begin
