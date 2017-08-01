var CardGrouping = function(game) {
	Phaser.Group.call(this, game);

	// Since Phaser.Group's constructor overrides this.classType, we need to
	// set it again after that constructor call
    this.classType = CardSprite;
}

CardGrouping.prototype = Object.create(Phaser.Group.prototype);
CardGrouping.prototype.constructor = CardGrouping;
CardGrouping.prototype.classType = CardSprite;

CardGrouping.prototype.materialize = function(card_sprites,position,duration,relativeFlag=true,forward=true){
	var card_sprite, move_tween, vis_tween, destPoint;
	for (var i=0;i<card_sprites.length;i++){
		card_sprite = card_sprites[i];
		move_tween = this.game.add.tween(card_sprite);
		vis_tween = this.game.add.tween(card_sprite);
			
		if (relativeFlag){
			destPoint = Phaser.Point.add(position,card_sprite.position);
		}else{
			destPoint = position;
		}
		
		if (forward){
			move_tween.from({x:destPoint.x,y:destPoint.y}, duration, Phaser.Easing.Cubic.Out);
			vis_tween.to({alpha:1} , duration, Phaser.Easing.Linear.None);
		}else{
			move_tween.to({x:destPoint.x,y:destPoint.y}, duration, Phaser.Easing.Cubic.Out);
			vis_tween.to({alpha:0} , duration, Phaser.Easing.Linear.None);
			vis_tween.onComplete.add(function(sprite,tween){this.remove(sprite,true,true)},this);
		}
		move_tween.start();
		vis_tween.start();
	}
}

CardGrouping.prototype.dematerialize = function(card_sprites,position,duration,relativeFlag=true){
	var forward = false;
	this.materialize(card_sprites,position,duration,relativeFlag,forward);
}

CardGrouping.prototype.getPositions = function(number_of_cards){
	var result = new Array();
	for (var i=0;i<number_of_cards;i++){
		result.push(new Phaser.Point(0,0));
	}
	return result;
}

CardGrouping.prototype.getAngles = function(number_of_cards){
	return Array(number_of_cards).fill(0);
}

CardGrouping.prototype.sortCards = function(){
	this.sort('value',Phaser.Group.SORT_ASCENDING);
}

CardGrouping.prototype.getGeometryByCardSprite = function(card_sprites){
	this.sortCards();
	var all_positions = this.getPositions(this.countLiving());
	var all_angles = this.getAngles(this.countLiving());
	var result = {'position':[],'angle':[]};
	for (var j=0;j<card_sprites.length;j++){
		var card_sprite = card_sprites[j];
		var dead_sprites_below = this.filter(function(child,ind,all){return !child.alive && child.z<card_sprite.z}).list;
		result['position'].push(all_positions[card_sprite.z-dead_sprites_below.length]);
		result['angle'].push(all_angles[card_sprite.z-dead_sprites_below.length]);
	}
	return result;
}


CardGrouping.prototype.applyPositions = function(card_sprites){
	var geometry = this.getGeometryByCardSprite(card_sprites);
	for (var i=0;i<card_sprites.length;i++){
		geometry['position'][i].copyTo(card_sprites[i]);
		card_sprites[i].angle = geometry['angle'][i];
	}
}

CardGrouping.prototype.slideToPositions = function(card_sprites,duration){
	var geometry = this.getGeometryByCardSprite(card_sprites);
	for (var i=0;i<card_sprites.length;i++){
		var move_tween = this.game.add.tween(card_sprites[i]);
		move_tween.to(
				{'x':geometry['position'][i].x,'y':geometry['position'][i].y,'angle':geometry['angle'][i]},
				duration, Phaser.Easing.Cubic.Out);
		move_tween.start();
	}
}

CardGrouping.prototype.slideToPositionCopies = function(card_sprites, card_sprites_to_copy, duration, flip_duration=600,
		position_easing=Phaser.Easing.Cubic.Out, rotation_easing=Phaser.Easing.Cubic.Out, scale_easing= Phaser.Easing.Cubic.Out){
	var num_pairs = card_sprites.length;
	var capsules = [];
	for (var i=0;i<num_pairs;i++){	
		capsules.push(this.add(new TweenCapsule(this.game,card_sprites[i])));
	}
	this.game.stage.updateTransform();
	for (var i=0;i<num_pairs;i++){
		capsules[i].makeTween(card_sprites_to_copy[i],duration,position_easing,rotation_easing,scale_easing);
		card_sprites[i].reveal(flip_duration);
	}
	return capsules;
}

CardGrouping.prototype.throwToPositionCopies = function(card_sprites,card_sprites_to_copy,duration,flip_duration = 600){
	return this.slideToPositionCopies(card_sprites,card_sprites_to_copy,duration,flip_duration,
			Phaser.Easing.Cubic.Out,Phaser.Easing.Cubic.Out,Phaser.Easing.Cubic.Out);
}

CardGrouping.prototype.ghostAddCards = function(cards){
	var created_sprites = [];
	for (i=0;i<cards.length;i++){
		var new_sprite = this.create(0,0,cards[i].suit,cards[i].number);
		new_sprite.alpha = 0;
		created_sprites.push(new_sprite);
	}
	return created_sprites;
}

CardGrouping.prototype.findCardSprites = function(cards,forward=true){
	var unmatched_cards = [];
	var matched_card_sprites = [];
	var unused_card_sprites = [];
	var available_card_sprites = this.getCardSpriteList();
	if (available_card_sprites == null){
		return {'unmatched':cards,'matched':[],'unused':[]};
	}
	
	var used = Array(available_card_sprites.length).fill(false);
	
	for (i=0;i<cards.length;i++){
		var match_found = false;
		var face_down = new Card(0,Card.BACK);
		var available_face_down_index = null;
		for (j=0;j<available_card_sprites.length;j++){
			if (forward){
				var k = j;
			}else{
				var k = available_card_sprites.length -j -1;
			}
			if (!used[k]){
				if(	cards[i].equals(available_card_sprites[k].card)){
					match_found = true;
					matched_card_sprites.push(available_card_sprites[k]);
					used[k] = true;
					break;
				}else if(	available_face_down_index == null &&
							available_card_sprites[k].card.equals(face_down)){
					available_face_down_index = k;
				}
			}
		}
		if (!match_found && available_face_down_index != null){
			matched_card_sprites.push(available_card_sprites[available_face_down_index]);
			available_card_sprites[available_face_down_index].card = new Card(cards[i].number,cards[i].suit);
			used[available_face_down_index] = true;
		}else if (!match_found){
			unmatched_cards.push(cards[i]);
		}
	}
	for (i=0;i<available_card_sprites.length;i++){
		if (!used[i]){
			unused_card_sprites.push(available_card_sprites[i]);
		}
	}
	return {'unmatched':unmatched_cards,'matched':matched_card_sprites,'unused':unused_card_sprites};
}

CardGrouping.prototype.setAlive = function(display_objects,setting=true){
	for (i=0;i<display_objects.length;i++){
		display_objects[i].alive = setting;
	}
}

CardGrouping.prototype.updateCardState = function(cards,duration){
	var groups = this.findCardSprites(cards);
	
	var card_sprites_to_slide  = groups['matched'];
	var card_sprites_to_delete = groups['unused'];
	var card_sprites_to_create = this.ghostAddCards(groups['unmatched']);
	
	
	this.setAlive(card_sprites_to_delete,false);
	this.applyPositions(card_sprites_to_create);
	this.slideToPositions(card_sprites_to_slide,duration);
	this.materialize(card_sprites_to_create,new Phaser.Point(0,-10),duration);
	this.dematerialize(card_sprites_to_delete,new Phaser.Point(0,10),duration);
}

CardGrouping.prototype.revealAll = function(duration=400){
	this.callAll('reveal',null,duration);
}

CardGrouping.prototype.hideAll = function(duration=400){
	this.callAll('flipToShallow',null,'Back',0,duration);
}

CardGrouping.prototype.deepHideAll = function(duration=400){
	this.callAll('flipTo',null,'Back',0,duration);
}

CardGrouping.prototype.getCardSpriteList = function(){
	return this.filter(function(child,ind,all){return child instanceof CardSprite}).list;
}

CardGrouping.prototype.getCardList = function(){
	var card_sprites = this.getCardSpriteList();
	var cards = [];
	for (i=0;i<card_sprites.length;i++){
		cards.push(card_sprites[i].card);
	}
	return cards;
}



CardGrouping.prototype.passToCardGroup = function(cards,cardGrouping,duration=1000){
	var groups = this.findCardSprites(cards);
	if (groups['unmatched'].length > 1){
		var current_cards = this.getCardList();
		this.updateCardState(current_cards.concat(groups['unmatched']));
		groups = this.findCardSprites(cards);
	}
	
	var substitute_card_sprites = cardGrouping.prepareToReceivePass(cards);
	
	this.setAlive(groups['matched'],false);
	this.slideToPositions(groups['unused']);
	this.setAlive(groups['matched'],true);
	var tween_capsules = this.slideToPositionCopies(groups['matched'],substitute_card_sprites);
	
	this.completePassToCardGroup(tween_capsules,substitute_card_sprites,cardGrouping);

}

CardGrouping.prototype.completePassToCardGroup = function(card_sprites,substitute_card_sprites,cardGrouping,duration){
	cardGrouping.completeReceivePass(card_sprites,substitute_card_sprites,duration);
}

CardGrouping.prototype.prepareToReceivePass = function(cards,cardGrouping){
	var card_sprites_to_slide  = this.filter(function(child,ind,all){return child.alive},true).list;
	var substitute_card_sprites = this.ghostAddCards(cards);
	this.applyPositions(substitute_card_sprites);
	return substitute_card_sprites;
}

CardGrouping.prototype.completeReceivePass = function(tween_capsules,substitute_card_sprites,duration){
	this.slideToPositions(this.getCardSpriteList(),duration);
	var num_pairs = tween_capsules.length;
	for (i=0;i<num_pairs;i++){
		tween_capsules[i].switchToParent(this,substitute_card_sprites[i].z);
		this.remove(substitute_card_sprites[i],true,true);
	}
}

CardGrouping.prototype.fillWithFaceDowns = function(count,duration){
	var cards = [];
	for (var i=0;i<count;i++){
		cards.push(new Card(0,'Back'));
	}
	this.updateCardState(cards,duration);
}

