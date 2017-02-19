/**
 * Creates the irresistible beautiful game board
 */

/**
 * Creates the graphics for the game to be synced up with the server which 
 * holds the game logic
 */
function createGame() {
    var board_length = 800;
    var board_height = 500;

    var card_length = 198;
    var card_height = 260;

    var player_cards = [];

	var game = new Phaser.Game(board_length, board_height, Phaser.AUTO, '', { preload: preload, create: create, update: update });

	/**
	 * Load images and such to be used in the game
	 */
	function preload() {

		game.load.spritesheet(Card.CLUBS, '../static/third_party/assets/card_images/clubs/different_playing_card_vector_graphic.jpg', card_length, card_height);
		game.load.spritesheet(Card.DIAMONDS, '../static/third_party/assets/card_images/diamonds/different_playing_card_vector_graphic.jpg', card_length, card_height);
		game.load.spritesheet(Card.HEARTS, '../static/third_party/assets/card_images/hearts/different_playing_card_vector_graphic.jpg', card_length, card_height);
		game.load.spritesheet(Card.SPADES, '../static/third_party/assets/card_images/spades/different_playing_card_vector_graphic.jpg', card_length, card_height);

        register_event_handler("Cards", got_cards);
	}
	
	/**
	 * Create the game
	 */
	function create () {
        show_facedown_cards();
	}

	/**
	 * Update the game
	 */
	function update() {

	}

    function got_cards(card_str) {
        console.log("got cards " + card_str);
        cards = Card.CardsFromJSON(card_str);
        player_cards = cards;
        show_facedown_cards();
    }


    function show_facedown_cards() {
        total_hor_space_of_cards = 300;
        hor_start_x = board_length/2 - (total_hor_space_of_cards/2);
        hor_end_x = board_length/2 + (total_hor_space_of_cards/2 - 60);
        ver_start_x = board_height/2 - (total_hor_space_of_cards/2);
        ver_end_x = board_height/2 + (total_hor_space_of_cards/2 - 60);

        createHorizontalCards([], 50, hor_start_x, hor_end_x);
        createHorizontalCards(player_cards, board_height - 50 - 130, hor_start_x, hor_end_x);
        createVerticalCards(50, ver_start_x, ver_end_x);
        createVerticalCards(board_length - 50 - 60, ver_start_x, ver_end_x);
    }

	/**
	 * This function is bad. Make it better. :)
	 */
	function createHorizontalCards(cards, y, start_x, end_x) {
        var use_fd = false;
        var len = cards.length;
        if (len == 0) {
            use_fd = true; 
            len = 13;
        } else {
            len = cards.length;
        }
		for (var i = 0; i < len; i++) {
			var x = ((end_x - start_x) / len * i) + start_x;

            var sprint = null;
            if (use_fd) {
			    sprite = create_facedown_card(game, x, y);
            } else {
                sprite = create_card_sprite(game, x, y, cards[i]);
                sprite.inputEnabled = true;
                sprite.events.onInputOver.add(mouseOn, this);
                sprite.events.onInputOut.add(mouseOff, this);
            }
		}
	}

	function createVerticalCards(x, start_y, end_y) {
        var len = 13;
		for (var i = 0; i < len; i++) {
			var y = ((end_y - start_y) / len * i) + start_y;

			var sprite = create_facedown_card(game, x, y);
		}
	}
	
	function mouseOn(sprite) {
		current_scale_x = sprite.scale.x;
		current_scale_y = sprite.scale.y;
		sprite.scale.set(current_scale_x * 1.2, current_scale_y * 1.2);
		sprite.tint = .8 * 0xFFFFFF;
	}
	
	function mouseOff(sprite) {
		current_scale_x = sprite.scale.x;
		current_scale_y = sprite.scale.y;
		sprite.scale.set(current_scale_x / 1.2, current_scale_y / 1.2);
		sprite.tint = 0xFFFFFF;
	}
}
