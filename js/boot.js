var TopDownGame = TopDownGame || {};
 
TopDownGame.Boot = function(){};
 
//setting game configuration and loading the assets for the loading screen
TopDownGame.Boot.prototype = {
  preload: function() {
    //assets we'll use in the loading screen
    this.load.image('preloadbar', 'assets/images/preloader-bar.png');
  },
  create: function() {
    //loading screen will have a white background
    this.game.stage.backgroundColor = '#fff';
    this.game.stage.smoothed = false;
 
    //scaling options
    // this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    // scale the game 4x
    this.scale.scaleMode = Phaser.ScaleManager.USER_SCALE;  
    this.scale.setUserScale(4, 4);

    // enable crisp rendering
    this.game.renderer.renderSession.roundPixels = true;  
    Phaser.Canvas.setImageRenderingCrisp(this.game.canvas) 
    
    //have the game centered horizontally
    this.scale.pageAlignHorizontally = true;
    this.scale.pageAlignVertically = true;
 
    //physics system
    this.game.physics.startSystem(Phaser.Physics.ARCADE);

    this.game.add.text(0, 0, "hack", {font:"1px Pixelated", fill:"#FFFFFF"});
    
    this.state.start('Preload');
  }
};