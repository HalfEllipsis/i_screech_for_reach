var Card = function(number, suit) {

    console.log("Creating a class with " + number + suit);
    this.number = number;
    this.suit = suit;

};

Card.SPADES = 'Spades';
Card.CLUBS = 'Clubs';
Card.HEARTS = 'Hearts';
Card.DIAMONDS = 'Diamonds';
Card.SUITS = [Card.SPADES, Card.CLUBS, Card.HEARTS, Card.DIAMONDS];

Card.JACK = 'Jack';
Card.QUEEN = 'Queen';
Card.KING = 'King';
Card.ACE = 'Ace';

Card.NUMBER_STR_DICT = {
        1: Card.ACE,
        2: '2',
        3: '3',
        4: '4',
        5: '5',
        6: '6',
        7: '7',
        8: '8',
        9: '9',
        10: '10',
        11: Card.JACK,
        12: Card.QUEEN,
        13: Card.KING,
} ;

Card.NUMBERS = []; 
for (i = 0; i <= 13; i++) {
    Card.NUMBERS.push(i);
}

Card.SHORT_SPADES = 'S';
Card.SHORT_CLUBS = 'C';
Card.SHORT_HEARTS = 'H';
Card.SHORT_DIAMONDS = 'D';
Card.SHORT_SUITS = [Card.SHORT_SPADES, Card.SHORT_CLUBS, Card.SHORT_HEARTS, Card.SHORT_DIAMONDS];

//Card.SUIT_TO_SHORT_SUIT_DICT = {
//    Card.SPADES: Card.SHORT_SPADES, 
//    Card.CLUBS: Card.SHORT_CLUBS,
//    Card.HEARTS: Card.SHORT_HEARTS,
//    Card.DIAMONDS: Card.SHORT_DIAMONDS,
//};

Card.CardFromShortSuit = function(number, short_suit) {
    // Ghetto backwards map logic
    i = Card.SHORT_SUITS.indexOf(short_suit);
    suit = Card.SUITS[i];
    return new Card(number, suit);
};

Card.CardsFromJSON = function(str) {
    cards = [];
    console.log("Passed into CardsFromJSON" + str);
    regex = /([0-9]{1,2}[DCSH]{1})/g;
    cards_str = str.match(regex);
    for (i in cards_str) {
        card_str = cards_str[i];
        regex = /[0-9]{1,2}/;
        number = card_str.match(regex).toString();
        number = parseInt(number);
        regex = /[DCSH]{1}/;
        short_suit = card_str.match(regex).toString();
        cards.push(Card.CardFromShortSuit(number, short_suit));
    }
    return cards;
};
