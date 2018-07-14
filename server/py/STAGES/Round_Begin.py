from GAME_CONTROL.Public_constant import states
from STAGES import Card
from STAGES import Dicing
from STAGES import Round_End
from STAGES import Stage


class round_begin(Stage.stage):
    @staticmethod
    def is_mesg_vaild(GC, mesg):
        if mesg['STAGE'] == 'round_begin':
            round_begin(GC, mesg)

    def __init__(self, GC, instruction):
        super(round_begin, self).__init__(GC, instruction)
        count, winner = GC.check_winner()
        self.GC.update_round()
        if winner != None:
            self.next_stage('game_end')
        else:

            # current player not bankruptcy yet
            if self.GC.current_player.state != states.bankruptcy:
                self.crisis_coming()
                print('cash={} sate={}'.format(self.GC.current_player.cash, self.GC.current_player.state.name))
                if self.GC.current_player.state == states.normal:
                    if len(self.GC.current_player.hands) > 0:
                        self.next_stage('use_card')
                    else:
                        self.next_stage('dicing')
                elif self.GC.current_player.state == states.hospital:
                    self.GC.current_player.state = states.normal
                    self.next_stage('round_end')
                elif self.GC.current_player.state == states.prison:
                    self.GC.current_player.state = states.normal
                    self.next_stage('round_end')
                else:
                    self.next_stage('round_end')
            else:
                self.next_stage('round_end')

    def crisis_coming(self):
        self.GC.crisis = self.GC.get_crisis()
        self.GC.current_player.cash_decrease(self.GC.crisis)

    def next_stage(self, new_stage):
        cash = self.GC.current_player.cash
        print('new_stage={} cash={} sate={}'.format(new_stage,cash,self.GC.current_player.state.name))
        if new_stage == 'game_end':
            self.GC.game_stage = 'game_end'
            count, winner = self.GC.check_winner()
            feedback = {'NEXT_STAGE': new_stage, 'PLAYER': winner.name}
        else:
            if new_stage == 'round_end':
                self.GC.game_stage = Round_End.round_end
                feedback = {'NEXT_STAGE': new_stage, 'PLAYER': self.GC.current_player.name, 'CASH': cash}
            elif new_stage == 'dicing':
                self.GC.game_stage = Dicing.dicing
                feedback = {'NEXT_STAGE': new_stage, 'PLAYER': self.GC.current_player.name,'CASH':cash}
            elif new_stage == 'use_card':
                self.GC.game_stage = Card.use_cards
                feedback = {'NEXT_STAGE': new_stage, 'PLAYER': self.GC.current_player.name,'CASH':cash}
            else:
                feedback = {'NEXT_STAGE': new_stage, 'PLAYER': self.GC.current_player.name,'CASH':cash}
        self.GC.send(feedback)
