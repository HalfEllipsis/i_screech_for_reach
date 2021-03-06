/**
 * Creates the irresistible beautiful game board
 */

/**
 * Creates the graphics for the game to be synced up with the server which 
 * holds the game logic
 */

var board_length = 800;
var board_height = 600;

var card_length = 198;
var card_height = 260;
var sprite_group = null;
var sprite_discard_group = null;

var sprite_discard_counter = 0;
var sprite_discard_trick_counter = 0;

var score_textbox = null;

var my_location_x = (board_length/2) - 10;
var my_location_y = (board_height/1.13);

var left_location_x = (board_length/50);
var left_location_y = (board_height/2);

var across_location_x = (board_length/2) - 10;
var across_location_y = (board_height/30);

var right_location_x = (board_length/1.04);
var right_location_y = (board_height/2);



function show_facedown_cards(game_board, player_cards) {
	if(sprite_group != null){
		sprite_group.destroy();
	}
	
	sprite_group = game_board.add.group();
	
    total_hor_space_of_cards = 300;
    hor_start_x = board_length/2 - (total_hor_space_of_cards/2);
    hor_end_x = board_length/2 + (total_hor_space_of_cards/2 - 60);
    ver_start_x = board_height/2 - (total_hor_space_of_cards/2) + 70;
    ver_end_x = board_height/2 + (total_hor_space_of_cards/2 - 60) + 80;

    createHorizontalCards([], 50, hor_start_x, hor_end_x, game_board);
    createHorizontalCards(player_cards, board_height - 50 - 130, hor_start_x, hor_end_x, game_board);
    createVerticalCards(50, ver_start_x, ver_end_x, game_board);
    createVerticalCards(board_length - 50 - 60 - 40, ver_start_x, ver_end_x, game_board);
}

/**
 * This function is bad. Make it better. :)
 */
function createHorizontalCards(cards, y, start_x, end_x, game_board) {
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
		    sprite = create_facedown_card(game_board, x, y);
        } else {
            sprite = create_card_sprite(game_board, x, y, cards[i]);
            sprite.card = cards[i];
            sprite.inputEnabled = true;
            sprite.clicked = false;
            sprite.events.onInputOver.add(mouseOn, game_board);
            sprite.events.onInputOut.add(mouseOff, game_board);
            sprite.events.onInputUp.add(cardClicked, game_board);
        }
        sprite_group.add(sprite);
	}
}

function createVerticalCards(x, start_y, end_y, game_board) {
    var len = 13;
	for (var i = 0; i < len; i++) {
		var y = ((end_y - start_y) / len * i) + start_y;

		var sprite = create_facedown_card(game_board, x, y);
		sprite_group.add(sprite);
		sprite.angle -= 90;
	}
}

function destroy_discards_after_hand(){
	sprite_discard_group.destroy();
	sprite_discard_counter = 0;
	sprite_discard_group = null;
}

function createHorizontalDiscards(card, discard_player_position){
	sprite_discard_counter += 1;
	if(sprite_discard_counter == 5){
		sprite_discard_counter = 1;
		sprite_discard_group.destroy();
		sprite_discard_group = null;
	}
	if(sprite_discard_group == null){
		sprite_discard_group = game_board.add.group();
	}
	// if you discarded
	if(discard_player_position == player_pos){
		sprite = create_card_sprite(game_board, (board_length/2), (board_height/2), card);
	}
	// player to the right
	if((discard_player_position + 3)%4 == player_pos){
		sprite = create_card_sprite(game_board, (board_length/2), (board_height/2), card);
		sprite.angle = 90;
	}
	// across
	if((discard_player_position + 2)%4 == player_pos){
		sprite = create_card_sprite(game_board, (board_length/2), (board_height/2), card);
		sprite.angle = 180;
	}
	// left
	if((discard_player_position + 1)%4 == player_pos){
		sprite = create_card_sprite(game_board, (board_length/2), (board_height/2), card);
		sprite.angle = -90;
	} 
	sprite_discard_group.add(sprite)
}

function mouseOn(sprite) {
	if (my_turn && is_card_valid(sprite.card)) {
		if (!sprite.clicked) {
			current_scale_x = sprite.scale.x;
			current_scale_y = sprite.scale.y;
			sprite.scale.set(current_scale_x * 1.1, current_scale_y * 1.1);
			sprite.tint = .8 * 0xFFFFFF;
		}
	}
}

function mouseOff(sprite) {
	if (my_turn && is_card_valid(sprite.card)) {
		if (!sprite.clicked) {
			current_scale_x = sprite.scale.x;
			current_scale_y = sprite.scale.y;
			sprite.scale.set(current_scale_x / 1.1, current_scale_y / 1.1);
			sprite.tint = 0xFFFFFF;
		}
	}
}

function cardClicked(sprite) {
	if (my_turn && is_card_valid(sprite.card)) {
		if (game_state != BEFORE_GAME) {
			if (!sprite.clicked) {
			
				sprite.tint = 0xFF0000;
				sprite.clicked = true;
				selected_cards.push(sprite.card);

				if (selected_cards.length == cards_to_select) {
					all_cards_selected();
				}
				
			} else {
				sprite.tint = 0xFFFFFF;
				sprite.clicked = false;
				selected_cards.pop(sprite.card);
			} 
			
		}
	}
}

function createGame() {

	var game = new Phaser.Game(board_length, board_height, Phaser.AUTO, 'game_board', { preload: preload, create: create, update: update });
//	game.scale.setGameSize(board_length, board_height);
	/**
	 * Load images and such to be used in the game
	 */
	function preload() {
		
		game.load.spritesheet(Card.CLUBS, '../static/third_party/assets/card_images/clubs/different_playing_card_vector_graphic.jpg', card_length, card_height);
		game.load.spritesheet(Card.DIAMONDS, '../static/third_party/assets/card_images/diamonds/different_playing_card_vector_graphic.jpg', card_length, card_height);
		game.load.spritesheet(Card.HEARTS, '../static/third_party/assets/card_images/hearts/different_playing_card_vector_graphic.jpg', card_length, card_height);
		game.load.spritesheet(Card.SPADES, '../static/third_party/assets/card_images/spades/different_playing_card_vector_graphic.jpg', card_length, card_height);
		
		game.load.image("turn_no", "../static/homemade/assets/turn_no.png");
		game.load.image("turn_yes", "../static/homemade/assets/turn_yes.png");
		
		game.load.image("background", "../static/homemade/assets/table_bg.png");
	}
	
	/**
	 * Create the game
	 */
	function create () {
		background = game.add.tileSprite(0, 0, 800, 600, "background");
		
		myTimer = new Timer(game_board);
		game_board.stage.addChild(myTimer.textDisplay);
		
		/// creating the not someone's turn indicators at near-player-card locations  ///
		create_turn_indicator(game_board, my_location_x + 33, my_location_y,"turn_no");
		create_turn_indicator(game_board, left_location_x, left_location_y + 30,"turn_no");
		create_turn_indicator(game_board, across_location_x + 30, across_location_y,"turn_no");
		create_turn_indicator(game_board, right_location_x, right_location_y + 30,"turn_no");
		
        show_facedown_cards(this, player_cards);
        ///super terrible lazy code, going to be deleted anyways later cus temporary///
        score_textbox_p0 = game.add.text((board_length/1.25), (board_height/7), "0");
        score_textbox_p0.fill = "blue";
        score_textbox_p1 = game.add.text((board_length/1.25) + 40, (board_height/7), "0");
        score_textbox_p1.fill = "red";
        score_textbox_p2 = game.add.text((board_length/1.25) + 80, (board_height/7), "0");
        score_textbox_p2.fill = "green";
        score_textbox_p3 = game.add.text((board_length/1.25) + 120, (board_height/7), "0");
        score_textbox_p3.fill = "yellow";
        if(player_pos == 0){
        	p0 = game.add.text(my_location_x, my_location_y,"p0");
    		p1 = game.add.text(left_location_x, left_location_y,"p1");
    		p2 = game.add.text(across_location_x, across_location_y,"p2");
    		p3 = game.add.text(right_location_x, right_location_y,"p3");
        } else if(player_pos == 1){
        	p1 = game.add.text(my_location_x, my_location_y,"p1");
    		p2 = game.add.text(left_location_x, left_location_y,"p2");
    		p3 = game.add.text(across_location_x, across_location_y,"p3");
    		p0 = game.add.text(right_location_x, right_location_y,"p0");
        } else if(player_pos == 2){
        	p2 = game.add.text(my_location_x, my_location_y,"p2");
    		p3 = game.add.text(left_location_x, left_location_y,"p3");
    		p0 = game.add.text(across_location_x, across_location_y,"p0");
    		p1 = game.add.text(right_location_x, right_location_y,"p1");
        } else if(player_pos == 3){
        	p3 = game.add.text(my_location_x, my_location_y,"p3");
    		p0 = game.add.text(left_location_x, left_location_y,"p0");
    		p1 = game.add.text(across_location_x, across_location_y,"p1");
    		p2 = game.add.text(right_location_x, right_location_y,"p2");
        }
		p0.fill = "blue";
        p1.fill = "red";
        p2.fill = "green";
        p3.fill = "yellow";
        ///-///
	}
	
	/**
	 * Update the game
	 */
	function update() {

	}

	return game;
}