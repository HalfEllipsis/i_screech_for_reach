var Hand = function(game,gap,offset) {
	CardGrouping.call(this, game);
    this.gap = gap;
    this.offset = offset;
}
Hand.prototype = Object.create(CardGrouping.prototype);
Hand.prototype.constructor = Hand; 

Hand.prototype.getPositions = function(numberOfCards){
	var result = new Array();
	for (i=0;i<numberOfCards;i++){
		var x = -(this.offset+(numberOfCards-1)*this.gap)/2 + (i-1)*this.gap;
		result.push(new Phaser.Point(x,0));
	}
	return result;
}





