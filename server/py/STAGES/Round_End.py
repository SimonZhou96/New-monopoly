from STAGES import Round_Begin
from STAGES.Stage import stage


class round_end(stage):
    @staticmethod
    def is_mesg_vaild(GC, mesg):
        if mesg['STAGE'] == 'round_end':
            round_end(GC, mesg)

    def __init__(self, GC, instruction):
        super(round_end, self).__init__(GC, instruction)
        player = GC.action_queue[0]
        del GC.action_queue[0]
        self.GC.action_queue.append(player)
        self.next_stage()

    def next_stage(self):
        self.GC.game_stage = Round_Begin.round_begin
        feedback = {'NEXT_STAGE': 'round_begin'}
        self.GC.send(feedback)
