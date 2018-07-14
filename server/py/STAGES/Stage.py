class stage():
    def __init__(self, GC, instruction):
        '''
        Take action when user send vaild instruction
        End when need user's new instruction
        Update current Stage
        ====================
        Parameters
        ----------
        GC : Game_control
            the Game_control of this Stage
        instruction : object
            instruction get from user
        '''
        self.GC = GC
        self.insruction = instruction

    @staticmethod
    def is_mesg_vaild(GC, mesg):
        pass

    def next_stage(self):
        pass


