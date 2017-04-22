var CardSprite = function(game,x,y,suit,number) {
	Phaser.Group.call(this, game);
	this.x = x;
	this.y = y;
	this.addChild(new Phaser.Sprite(game,0,0,suit,number-1));
	this.card = new Card(number,suit);
	this.value = this.card.value();
}

CardSprite.prototype = Object.create(Phaser.Group.prototype);
CardSprite.prototype.constructor = CardSprite;

CardSprite.prototype.flipToShallow = function(suit,number,duration){
	child = this.children[0];//card should be only child
	tmp_width = this.width;
	
	half_flip_a = this.game.add.tween(child).to( { width: 0, x:child.width/2 }, duration/2, Phaser.Easing.Circular.easeIn);
	half_flip_a.onComplete.add(function(sprite,tween){sprite.loadTexture(suit,number)},this);
	half_flip_b = this.game.add.tween(child).to( { width: tmp_width, x:0}, duration/2, Phaser.Easing.Circular.easeIn);
	half_flip_a.chain(half_flip_b);
	half_flip_a.start();
}

CardSprite.prototype.flipTo = function(suit,number, duration){
	this.flipToShallow(suit,number,duration);
	this.card = new Card(suit,number);
}

CardSprite.prototype.reveal = function(duration){
	if (this.children[0].key != this.card.suit || this.children[0].frame != this.card.number){
		this.flipToShallow(this.card.suit,this.card.number,duration);
	}
}







