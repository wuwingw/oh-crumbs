var TopDownGame = TopDownGame || {};
 
//loading the game assets
TopDownGame.Title = function(){};
 
TopDownGame.Title.prototype = {
  create: function() {
      this.titleText = this.game.add.bitmapText(this.game.width/2, this.game.height/2 - 16, 'pixeled', 'O H _ C R U M B S', 6);
      this.titleText.anchor.setTo(0.5);

      this.subtitleText = this.game.add.bitmapText(this.game.width/2, this.game.height/2 + 16, 'pixeled', 'hit space', 6);
      this.subtitleText.anchor.setTo(0.5);

      this.crumb = this.game.add.sprite(this.game.width/2, this.game.height/2, 'crumb');
      this.crumb.anchor.setTo(0.5);
  },

  update: function() {
      this.spaceKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
      this.spaceKey.onDown.add(function() {
        this.state.start('Game', true, false, 1, 4); // 1 is level number, 4 is crumbs
      }, this);
  }
};