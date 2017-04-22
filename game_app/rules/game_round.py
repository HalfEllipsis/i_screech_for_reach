from channels import Channel
from django.db import transaction

from game_app.multiplex_transmit import game_transmit
from game_app.deck import Deck
from game_app.card import Card

from . import game as grz
from . import trick_turn as trrz
from . import pass_round as prrz

from game_app.models.pass_round import PassRound
from game_app.models.trick_turn import TrickTurn

PHASE_TRICK = 'IN_TRICK'
PHASE_PASS = 'PHASE_PASS'


def setup(game_round, game, number):
    '''Sets up the given GameRound object and adds it to the given game.
    
    This function guarentees a save of the GameRound object.
    
    Arguments:
        game_round: the GameRound database entry
        game: the Game database entry
        number: the 0 index number of the game round
    '''
    game_round.game = game
    game_round.number = number
    game_round.save()
    with transaction.atomic():
        for player in game_round.game.player_set.select_for_update().all():
            player.hand_points = 0
            player.save()

def start(gr):
    gr.active = True
    gr.save()
    deck = Deck()
    deck.populate_and_randomize()
    deal_cards(gr,deck)
    send_players_their_cards(gr)
    
    pass_direction = determine_passing(gr)
    if pass_direction != 0:
        add_pass_phase(gr,pass_direction)
    else:
        bypass_pass_phase(gr)
        
def deal_cards(gr, deck):
    '''Deal the cards to each player'''
    print ("Deck length", len(deck.cards))
    player_list = list(gr.game.player_set.all())
    hand_size = int(len(deck.cards)/len(player_list))
    for ind in range(0,len(player_list)):
        card_offset = ind*hand_size
        player_list[ind].hand = deck.cards[card_offset:card_offset+hand_size]
        player_list[ind].hand.sort()
        player_list[ind].save()
        print ("player %s's hand: %s" % (player_list[ind].position ,player_list[ind].hand))
        
def send_players_their_cards(gr):
    '''Sends a message to each player telling them which cards are 
    theirs'''
    for player in gr.game.player_set.all():
        cards_str = Card.list_to_str(player.hand)
        game_transmit(Channel(player.channel),{"Cards":cards_str})
        
def send_players_initial_valid_cards(gr):
    for player in gr.game.player_set.all():
        valid_cards = player.hand
        send_player_valid_cards(gr,player, valid_cards)
        
def send_player_valid_cards(gr, player, valid_cards):
    cards_str = Card.list_to_str(valid_cards)
    game_transmit(Channel(player.channel),{"valid_cards":cards_str})
        
def determine_passing(gr):
    if (gr.number)%4 == 0:
        direction = 1
    elif (gr.number)%4 == 1:
        direction = -1
    elif (gr.number)%4 == 2:
        direction = 2
    else:
        direction = 0
    return direction

def add_pass_phase(gr,pass_direction):
    gr.phase = PHASE_PASS
    gr.save()
    send_group_the_phase(gr)
    pr = PassRound()
    prrz.setup(pr,gr,pass_direction)
    send_players_initial_valid_cards(gr)
    prrz.start(pr)
    
def bypass_pass_phase(gr):
    add_first_trick_phase(gr)
    
def add_first_trick_phase(gr):
    gr.phase = PHASE_TRICK
    gr.save()
    add_trick_phase(gr,what_seat_has_two_of_clubs(gr))

def add_trick_phase(gr,seat_to_go_first):
    if len(gr.trickturn_set.all()) >=13:
        finish(gr)
    else:
        send_group_the_phase(gr)
        tr = TrickTurn()
        trrz.setup(tr,gr,len(gr.trickturn_set.all()),seat_to_go_first,gr.hearts_broken)
        trrz.start(tr)

def what_seat_has_two_of_clubs(gr):
    two_of_clubs = Card(2,'Clubs')
    for player in gr.game.player_set.all():
        if two_of_clubs in player.hand:
            return player.position

def send_group_the_phase(gr):
    grz.send_group_the_phase(gr.game,gr.phase)
    
def finish(gr):
    gr.active = False
    gr.save()
    players =  list(gr.game.player_set.all())
    for i in players:
        #checking if player shot the moon and if so applying exception#
        if i.hand_points == 26:
            for j in players:
                j.hand_points = 27
            i.hand_points = 0
    for i in players:
        if i.hand_points == 27:
            i.hand_points -= 1
    for i in players:
        i.game_points += i.hand_points
        i.save()
    grz.add_round(gr.game)

        

            