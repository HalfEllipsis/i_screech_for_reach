function create_sprite_for_card(card) {}

function create_facedown_card(game, x, y) {
    sprite =  game.add.sprite( x, y, Card.CLUBS, 14);
    sprite.scale.set(.5, .5);
    return sprite;
}

function create_card_sprite(game, x, y, card) {
    sprite =  game.add.sprite( x, y, card.suit, card.number);
    sprite.scale.set(.5, .5);
    return sprite;
}

    
    
    
