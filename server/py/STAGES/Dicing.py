from STAGES import Moving
from STAGES import Stage
from PLAYERS import Players


class dicing(Stage.stage):
    @staticmethod
    def is_mesg_vaild(GC, mesg):
        if mesg['STAGE'] == 'dicing':
            dicing(GC, mesg)

    def __init__(self, GC, instrucion):
        super(dicing, self).__init__(GC, instrucion)
        result = Players.dicing()
        self.next_stage(result)

    def next_stage(self, result):
        self.GC.game_stage = Moving.moving
        feedback = {'NEXT_STAGE': 'moving', 'PLAYER': self.GC.current_player.name, 'STEPS': result,
                    'ALTERNATIVE': 'None'}
        self.GC.send(feedback)
