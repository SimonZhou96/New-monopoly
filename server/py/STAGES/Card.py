from STAGES.Stage import stage


class use_cards(stage):
    '''
    In this stage current player can use his hands
    ==============================================
    '''

    @staticmethod
    def is_mesg_vaild(GC, mesg):
        if mesg['STAGE'] == 'use_card':
            use_cards(GC, mesg)

    def __init__(self, GC, instrucion):
        super(use_cards, self).__init__(GC, instrucion)
