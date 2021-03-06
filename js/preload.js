var TopDownGame = TopDownGame || {};
 
//loading the game assets
TopDownGame.Preload = function(){};
 
TopDownGame.Preload.prototype = {
  preload: function() {
    // show loading screen
    this.preloadBar = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'preloadbar');
    this.preloadBar.anchor.setTo(0.5);
 
    this.load.setPreloadSprite(this.preloadBar);

    // // font
    // this.load.bitmapFont('pixeled', 'assets/fonts/font/font.png', 'assets/fonts/font/font.xml');
 
    // sprites
    // this.load.tilemap('level1', 'assets/tilemaps/level1.json', null, Phaser.Tilemap.TILED_JSON);
    this.load.tilemap('level1', 'assets/tilemaps/level_3.json', null, Phaser.Tilemap.TILED_JSON);
    this.load.image('gameTiles', 'assets/images/small_tiles.png');

    this.load.image('none', 'assets/images/none.png');

    this.load.image('crumb', 'assets/images/crumb.png');
    this.load.image('door', 'assets/images/door.png');
    this.load.image('fog', 'assets/images/fog3.png'); // the 'fog of war'
    this.load.image('fog_small', 'assets/images/fog4.png'); // smaller visible radius
    this.load.image('black', 'assets/images/black.png');

    this.load.spritesheet('player', 'assets/images/player.png', 16, 16);
    this.load.spritesheet('mummy', 'assets/images/mummy.png', 16, 16);
    this.load.spritesheet('treasure', 'assets/images/treasure.png', 16, 16, 2);
    // this.load.spritesheet('none', 'assets/images/arrow.png', 16, 16);

    this.load.image('greencup', 'assets/images/greencup.png');
    this.load.image('bluecup', 'assets/images/bluecup.png');
    
  },
  create: function() {
      // this.state.start('Game', true, false, 1, 4); // 1 is level number, 4 is crumbs
      this.state.start('Title', true, false);
  }
};