from .card import Card
from .deck import Deck
from .player import Player
from .trick import Trick

import logging

class Game():
    '''This class will represent an individual game

    Attributes:
        channel: channel to connect to (honestly this shouldn't be here, if
            anything, this should be the group of channels to communicate 
            with)
        players: The amount of players connected to the game. Cannot be higher
            than MAX_PLAYERS
        gameID: The game's unique identifier
        MAX_PLAYERS: The maximum amount of players that can be connected to 
            this game
    '''
    MAX_PLAYERS = 4

    def __init__(self, channel, ID):
        '''Constructor

        Args:
            channel: channel to connect to (honestly this shouldn't be here, if
                anything, this should be the group of channels to communicate 
                with)
            ID: the unique identifier of the game (should this be passed in 
                as a parameter or should the game itself decide??
        '''
        self.channel = channel
        self.players = []
        self.gameID = ID
        self.round = 0

    def isFull(self):
        '''Returns whether or not the game is full'''
        if len(self.players) == Game.MAX_PLAYERS:
            return True
        elif len(self.players) > Game.MAX_PLAYERS:
            logging.warn('The game %s somehow has more players than the maximum',
                    self.gameID)
            return True
        else:
            return False

    def addPlayer(self, channel):
        '''Adds a player to the game

        Args:
            channel: The django channel used to communicate with the player's
                client
        '''
        #TODO: Add the player to the game's group
        channel.send({'text': '{"id":' + str(self.gameID) + '}'})
        new_player = Player(channel)
        self.players.append(new_player)
        position = self.players.index(new_player)
        new_player.position = position
        print ('Game', self.gameID, 'has', self.players, 'players')
    
    def setup_game(self):
        '''Sets up the game'''
        deck = Deck()
        deck.populate_and_randomize()
        self.deal_cards(deck)
        self.send_players_their_cards()
        ### deals with hand passing logic
        self.round += 1
        if (self.round)%4 == 1:
            self.direction = 1
        elif (self.round)%4 == 2:
            self.direction = -1
        elif (self.round)%4 == 3:
            self.direction = 2
        else:
            self.direction = 0
        ### done with hand passing logic
        self.start_game()
        

    def deal_cards(self, deck):
        '''Deal the cards to each player'''
        print ("Deck length", len(deck.cards))
        while len(deck.cards) > 0:
            for player in self.players:
                player.hand.append(deck.cards.pop())

    def send_players_their_cards(self):
        '''Sends a message to each player telling them which cards are 
        theirs'''
        for player in self.players:
            cards_str = ''
            for card in player.hand:
                cards_str += card.to_json()
            player.channel.send({'text': '{"Cards":"' + cards_str + '"}'})
            
    def start_game(self):
        self.organize_hand()
        
    def organize_hand(self):
        for i in range(0,len(self.players)):
            self.players[i].hand.sort()
            print ("player %s's hand: %s" % (i ,self.players[i].hand))
        self.pass_card_thing()
    
    def pass_card_thing(self):
        print ("self direction")
        print (self.direction)
        print (self.players[0].hand)
        if self.direction == 0:
                pass
        else:
            for player in self.players:
                player.pass_hand += player.hand[0:3]
                player.hand.remove(player.hand[0])
                player.hand.remove(player.hand[0])
                player.hand.remove(player.hand[0])
            for i in range(0,len(self.players)):
                self.players[i].hand += self.players[(i+self.direction)%4].pass_hand
        print (self.players[0].hand)
        self.who_goes_first()
        
    def who_goes_first(self):
        self.who_starts = 0
        any_two_of_clubs = 0
        two_of_clubs = Card(2,'Clubs')
        for i in range(0,len(self.players)):
            if self.players[i].hand[0] == two_of_clubs:
                self.who_starts = i
                any_two_of_clubs += 1
        #need some kind of thing about if 0 goes first, then 1 goes,
        # then 2 goes, then 3 goes, then trick ends and cards are
        # collected into pile in front of player who won trick.
        if any_two_of_clubs == 0:
            pass
   
    
