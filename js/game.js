var TopDownGame = TopDownGame || {};

TopDownGame.Game = function(){};

TopDownGame.Game.prototype = {
	PLAYER_SPEED: 100,


	create: function() {

		// TILEMAP

		this.map = this.game.add.tilemap('mine'); // create tilemap from json
		this.map.addTilesetImage('tiles', 'gameTiles'); // add its tileset image

		this.backgroundLayer = this.map.createLayer('backgroundLayer');
		this.blockedLayer = this.map.createLayer('blockedLayer');

		this.map.setCollisionBetween(1, 1000, true, 'blockedLayer');

		this.backgroundLayer.resizeWorld(); // make game world same size as map

		// ITEMS

		this.createItems();
		this.createTreasure();

		// PLAYER

		var result = this.findObjectsByType('playerStart', this.map, 'objectsLayer');
		this.player = this.game.add.sprite(result[0].x, result[0].y, 'player');
		this.game.physics.arcade.enable(this.player);

		this.game.camera.follow(this.player);

		this.cursors = this.game.input.keyboard.createCursorKeys();

		// FOG

		this.fog = this.game.add.sprite(0, 0, 'fog');
		// this.fog.fixedToCamera = true;
		// this.fog.scale.setTo(0.5);
		this.fog.anchor.setTo(0.5);
	},

	update: function() {

		// INPUT

		this.player.body.velocity.y = 0;
		this.player.body.velocity.x = 0;

		if(this.cursors.up.isDown) {
			this.player.body.velocity.y -= this.PLAYER_SPEED;
		}
		else if(this.cursors.down.isDown) {
			this.player.body.velocity.y += this.PLAYER_SPEED;
		}
		if(this.cursors.left.isDown) {
			this.player.body.velocity.x -= this.PLAYER_SPEED;
		}
		else if(this.cursors.right.isDown) {
			this.player.body.velocity.x += this.PLAYER_SPEED;
		}

		// FOG
		this.fog.x = this.player.x;
		this.fog.y = this.player.y;

		// COLLISION

		this.game.physics.arcade.collide(this.player, this.blockedLayer);
		this.game.physics.arcade.overlap(this.player, this.items, this.collect, null, this);
		this.game.physics.arcade.overlap(this.player, this.treasure, this.findTreasure, null, this);

	},

	createItems: function() {
		this.items = this.game.add.group();
		this.items.enableBody = true;

		var item;
		result = this.findObjectsByType('items', this.map, 'objectsLayer');
		result.forEach(function(element) {
			this.createFromTiledObject(element, this.items);
		}, this);
	},

	createTreasure: function() {
		this.treasure = this.game.add.group();
		this.treasure.enableBody = true;

		result = this.findObjectsByType('treasure', this.map, 'objectsLayer');
		this.treasure.create(result[0].x, result[0].y, 'treasure');
	},

	// find objects in a Tiled layer that contain a property called "type" equal to a certain value
	findObjectsByType: function(type, map, layer) {
		var result = new Array();

		map.objects[layer].forEach(function(element){
			if(element.properties.type === type) {
				//Phaser uses top left, Tiled bottom left so we have to adjust the y position
				element.y -= map.tileHeight;
				result.push(element);
			}      
		});

		return result;
	},

	// create a sprite from an object
	createFromTiledObject: function(element, group) {
		var sprite = group.create(element.x, element.y, element.properties.sprite);

		Object.keys(element.properties).forEach(function(key) {
			sprite[key] = element.properties[key];
		});
	},

	collect: function(player, item) {
		item.destroy();
	},

	findTreasure: function(player, treasure) {
		treasure.frame = 1;
	}
}