var TopDownGame = TopDownGame || {};
 
//loading the game assets
TopDownGame.Title = function(){};
 
TopDownGame.Title.prototype = {
  create: function() {
      this.titleText = this.game.add.bitmapText(this.game.width/2, this.game.height/2 - 16, 'pixeled', 'O H   C R U M B S', 6);
      this.titleText.anchor.setTo(0.5);

      this.subtitleText = this.game.add.bitmapText(this.game.width/2, this.game.height/2 + 16, 'pixeled', 'WASD to move\nSPACE to drop a crumb', 6);
      this.subtitleText.align = 'center';
      this.subtitleText.anchor.setTo(0.5);

      this.crumb = this.game.add.sprite(this.game.width/2 - 24, this.game.height/2 - 16, 'crumb');
      this.crumb.anchor.setTo(0.5);

      // this.treasure = this.game.add.sprite(this.game.width/2, this.game.height/2, 'mummy');
      // this.treasure.anchor.setTo(0.5);
  },

  startGame: function() {
      this.state.start('Game', true, false, 1, undefined); // 1 is level number, 4 is crumbs
  },

  update: function() {
      this.spaceKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
      this.spaceKey.onDown.add(this.startGame, this);

      if(this.game.input.activePointer.justPressed()) {
        this.game.state.start('Game');
      }
  }
};