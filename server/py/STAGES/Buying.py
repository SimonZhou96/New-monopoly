from STAGES.Stage import stage
from STAGES import Round_End


class buying(stage):
    @staticmethod
    def is_mesg_vaild(GC, mesg):
        if mesg['STAGE'] == 'buying':
            buying(GC, mesg)

    def __init__(self, GC, instruction):
        super(buying, self).__init__(GC, instruction)
        if instruction['SKIP']:
            self.next_stage(1)
        else:
            property = self.GC.current_player.position.function
            property.buying(self.GC.current_player)
            self.next_stage(0)


    def next_stage(self,skip):
        if skip:
            feedback = {
                'NEXT_STAGE': 'round_end',
            }
        else:
            feedback = {
                'NEXT_STAGE': 'round_end',
                'PLAYER': self.GC.current_player.name,
                'CASH': self.GC.current_player.cash,
                'PROPERTY': self.GC.current_player.position.function.name,
                'BUILDING_LEVEL': self.GC.current_player.position.function.building_level
            }
        self.GC.game_stage = Round_End.round_end
        self.GC.send(feedback)


