/**
 * Creates the graphics for the game to be synced up with the server which holds
 * the game logic
 */

CARD_SPRITE_SHEET = 'cards';

var board_length = 800;
var board_height = 600;

var card_length = 146;
var card_height = 195.5;

var score_textbox = null;

var my_location_x = (board_length/2) - 10;
var my_location_y = (board_height/1.13);

var left_location_x = (board_length/50);
var left_location_y = (board_height/2);

var across_location_x = (board_length/2) - 10;
var across_location_y = (board_height/30);

var right_location_x = (board_length/1.04);
var right_location_y = (board_height/2);

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

function create_turn_indicator(game, x, y, image) {
	sprite = game.add.sprite(x, y, image);
}

function createGame() {

	var game = new Phaser.Game(board_length, board_height, Phaser.AUTO, 'game_board', { preload: preload, create: create, update: update });
	/**
	 * Load images and such to be used in the game
	 */
	function preload() {

		game.load.spritesheet(Card.BACK, '../static/third_party/assets/card_images/card_back.png', card_length, card_height);
		game.load.spritesheet(CARD_SPRITE_SHEET, '../static/third_party/assets/card_images/card_sheet.png', card_length, card_height, 52);
		
		game.load.image("turn_no", "../static/homemade/assets/turn_no.png");
		game.load.image("turn_yes", "../static/homemade/assets/turn_yes.png");
		
		game.load.image("background", "../static/homemade/assets/table_bg.png");
	}
	
	/**
	 * Create the game
	 */
	function create () {
		background = game.add.tileSprite(0, 0, 800, 600, "background");
		
		hand_group = game_board.add.group();
		hand_group.addChild(new Hand(game,20,50)).position = new Phaser.Point(my_location_x,my_location_y-210);
		hand_group.addChild(new Hand(game,20,50)).position = new Phaser.Point(left_location_x+210,left_location_y);
		hand_group.addChild(new Hand(game,20,50)).position = new Phaser.Point(across_location_x,across_location_y+210);
		hand_group.addChild(new Hand(game,20,50)).position = new Phaser.Point(right_location_x-210,right_location_y);
		
		var scale_factor = new Phaser.Point(0.7,0.7);
		hand_group.children[0].angle =   0;
		hand_group.children[1].angle =  90;
		hand_group.children[2].angle = 180;
		hand_group.children[3].angle = 270;
		scale_factor.copyTo(hand_group.children[0].scale);
		scale_factor.copyTo(hand_group.children[1].scale);
		scale_factor.copyTo(hand_group.children[2].scale);
		scale_factor.copyTo(hand_group.children[3].scale);
		
		trick_group = game_board.add.group();

		myTimer = new Timer(game_board);
		game_board.stage.addChild(myTimer.textDisplay);

		
		/// creating the not someone's turn indicators at near-player-card locations  ///
		create_turn_indicator(game_board, my_location_x + 33, my_location_y,"turn_no");
		create_turn_indicator(game_board, left_location_x, left_location_y + 30,"turn_no");
		create_turn_indicator(game_board, across_location_x + 30, across_location_y,"turn_no");
		create_turn_indicator(game_board, right_location_x, right_location_y + 30,"turn_no");
		
        //show_facedown_cards(this, player_cards);
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