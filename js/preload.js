var TopDownGame = TopDownGame || {};
 
//loading the game assets
TopDownGame.Preload = function(){};
 
TopDownGame.Preload.prototype = {
  preload: function() {
    //show loading screen
    this.preloadBar = this.add.sprite(this.game.world.centerX, this.game.world.centerY + 128, 'preloadbar');
    this.preloadBar.anchor.setTo(0.5);
 
    this.load.setPreloadSprite(this.preloadBar);
 
    //load game assets
    this.load.tilemap('level1', 'assets/tilemaps/level1.json', null, Phaser.Tilemap.TILED_JSON);
    this.load.tilemap('mine', 'assets/tilemaps/mine.json', null, Phaser.Tilemap.TILED_JSON);
    this.load.image('gameTiles', 'assets/images/tiles.png');

    this.load.image('greencup', 'assets/images/greencup.png');
    this.load.image('bluecup', 'assets/images/bluecup.png');
    this.load.image('player', 'assets/images/player.png');
    this.load.image('browndoor', 'assets/images/browndoor.png');

    this.load.image('fog', 'assets/images/fog.png'); // the 'fog of war'

    this.load.spritesheet('treasure', 'assets/images/treasure.png', 16, 16);
    
  },
  create: function() {
    this.state.start('Game');
  }
};