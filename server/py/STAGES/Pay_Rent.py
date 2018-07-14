from STAGES.Stage import stage
from STAGES import Round_End


class pay_rent(stage):
    def is_mesg_vaild(GC, mesg):
        if mesg['STAGE'] == 'pay_rent':
            pay_rent(GC, mesg)

    def __init__(self, GC, instruction):
        super(pay_rent, self).__init__(GC, instruction)
        property = GC.current_player.position.function
        property.pay_rent(self.GC.current_player)
        cash = self.GC.current_player.cash
        self.next_stage(cash)

    def next_stage(self, cash):
        self.GC.game_stage = Round_End.round_end
        feedback = {'NEXT_STAGE': 'round_end', 'PLAYER': self.GC.current_player.name, 'CASH': cash}
        self.GC.send(feedback)
