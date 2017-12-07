var TopDownGame = TopDownGame || {};
 
//loading the game assets
TopDownGame.Preload = function(){};
 
TopDownGame.Preload.prototype = {
  preload: function() {
    // show loading screen
    this.preloadBar = this.add.sprite(this.game.world.centerX, this.game.world.centerY + 128, 'preloadbar');
    this.preloadBar.anchor.setTo(0.5);
 
    this.load.setPreloadSprite(this.preloadBar);

    // font
    this.load.bitmapFont('pixeled', 'assets/fonts/font/font.png', 'assets/fonts/font/font.xml');
 
    // sprites
    // this.load.tilemap('level1', 'assets/tilemaps/level1.json', null, Phaser.Tilemap.TILED_JSON);
    this.load.tilemap('level1', 'assets/tilemaps/level_1.json', null, Phaser.Tilemap.TILED_JSON);
    this.load.image('gameTiles', 'assets/images/small_tiles.png');

    this.load.image('none', 'assets/images/none.png');

    this.load.image('crumb', 'assets/images/crumb.png');
    this.load.image('door', 'assets/images/door.png');
    this.load.image('mummy', 'assets/images/mummy.png');
    this.load.image('fog', 'assets/images/fog2.png'); // the 'fog of war'

    this.load.spritesheet('player', 'assets/images/player.png', 16, 16);
    this.load.spritesheet('treasure', 'assets/images/treasure.png', 16, 16);
    // this.load.spritesheet('none', 'assets/images/arrow.png', 16, 16);

    this.load.image('greencup', 'assets/images/greencup.png');
    this.load.image('bluecup', 'assets/images/bluecup.png');
    
  },
  create: function() {
    this.state.start('Game', true, false, 1, 4); // 1 is level number, 4 is crumbs
  }
};