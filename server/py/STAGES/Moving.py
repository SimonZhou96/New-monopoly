from STAGES import Building
from STAGES import Buying
from STAGES import Pay_Rent
from STAGES import Stage
from GAME_CONTROL.Public_constant import direction as D
from STAGES import Round_End


class moving(Stage.stage):
    @staticmethod
    def is_mesg_vaild(GC, mesg):
        if mesg['STAGE'] == 'moving':
            moving(GC, mesg)

    def __init__(self, GC, instruction):
        super(moving, self).__init__(GC, instruction)
        if instruction['DIRECTION'] != 'None':
            direction = D[instruction['DIRECTION']]
            if instruction['STEPS'] > 1:
                property_name, new_price = self.GC.loyalty_sys(GC.current_player.position)
                self.go_one_step(self.GC.current_player, direction)
                left_steps = instruction['STEPS'] - 1
                alternative = self.alternative_direction(self.GC.current_player)
                if new_price is None:
                    self.feedback = {'NEXT_STAGE': 'moving', 'PLAYER': instruction['PLAYER'], 'STEPS': left_steps,
                                     'ALTERNATIVE': alternative}
                else:
                    self.feedback = {'NEXT_STAGE': 'moving', 'PLAYER': instruction['PLAYER'], 'STEPS': left_steps,
                                     'ALTERNATIVE': alternative, 'LOYALTY': (property_name, new_price)}
                self.next_stage('moving')
            elif instruction['STEPS'] == 1:
                self.go_one_step(self.GC.current_player, direction)
                self.next_stage('not_moving')
        else:  # no decide direction
            alternative = self.alternative_direction(self.GC.current_player)
            self.feedback = {'NEXT_STAGE': 'moving', 'PLAYER': instruction['PLAYER'], 'STEPS': instruction['STEPS'],
                             'ALTERNATIVE': alternative}
            self.next_stage('moving')

    def alternative_direction(self, player):
        alternative = self.GC.alternative_direction(player)
        result = {}
        for i, street in alternative.items():
            result[i.name] = street.name
        return result

    def go_one_step(self, player, direction):
        player.direction = direction
        dst = player.position.adjacent[direction]
        player.position = dst

    def go_straight(self, player):
        dst = player.position.adjacent[player.direction]
        player.position = dst

    def next_stage(self, next_stage):
        if next_stage == 'moving':
            self.GC.game_stage = moving
        elif next_stage == 'not_moving':
            if self.GC.can_buying():
                self.GC.game_stage = Buying.buying
                self.feedback = {'NEXT_STAGE': 'buying', 'PLAYER': self.GC.current_player.name}
            elif self.GC.can_building():
                self.GC.game_stage = Building.building
                self.feedback = {'NEXT_STAGE': 'building', 'PLAYER': self.GC.current_player.name}
            elif self.GC.should_pay_rent():
                self.GC.game_stage = Pay_Rent.pay_rent
                self.feedback = {'NEXT_STAGE': 'pay_rent'}
            else:
                cash = self.GC.current_player.cash
                self.GC.game_stage = Round_End.round_end
                self.feedback = {'NEXT_STAGE': 'round_end', 'PLAYER': self.GC.current_player.name, 'CASH': cash}
        self.GC.send(self.feedback)
