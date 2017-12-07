var TopDownGame = TopDownGame || {};
 
TopDownGame.Boot = function(){};
 
//setting game configuration and loading the assets for the loading screen
TopDownGame.Boot.prototype = {
  preload: function() {
    //assets we'll use in the loading screen
    this.load.image('preloadbar', 'assets/images/preloader-bar.png');

    // font
    this.load.bitmapFont('pixeled', 'assets/fonts/font/font.png', 'assets/fonts/font/font.xml');
  },
  create: function() {
    //have the game centered horizontally
    this.scale.pageAlignHorizontally = true;
    this.scale.pageAlignVertically = true;

    this.game.stage.backgroundColor = '#000';
    this.game.stage.smoothed = false;
 
    //scaling options
    // this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    this.scale.scaleMode = Phaser.ScaleManager.USER_SCALE;  
    this.scale.setUserScale(4, 4);

    // enable crisp rendering
    this.game.renderer.renderSession.roundPixels = true;  
    Phaser.Canvas.setImageRenderingCrisp(this.game.canvas) 
 
    //physics system
    this.game.physics.startSystem(Phaser.Physics.ARCADE);
    
    // this.game.time.events.add(2000, function() {
        this.state.start('Preload');
    // }, this);

  }
};