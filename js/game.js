var TopDownGame = TopDownGame || {};

TopDownGame.Game = function(){};

TopDownGame.Game.prototype = {

	PLAYER_SPEED: 100,
	STAGE: 0,


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
		this.createDoors();
		this.createMarkers();

		// RENDERING GROUPS

		this.behindPlayerGroup = this.game.add.group();
		this.behindFogGroup = this.game.add.group();
		this.behindFogGroup.add(this.behindPlayerGroup);

		// PLAYER

		var result = this.findObjectsByType('playerStart', this.map, 'objectsLayer');
		this.player = this.game.add.sprite(result[0].x, result[0].y, 'player');
		this.game.physics.arcade.enable(this.player);
		this.player.direction = 'right';
		this.game.camera.follow(this.player);

		// INPUT
		
		this.cursors = this.game.input.keyboard.createCursorKeys();
		this.spaceKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
		this.spaceKey.onDown.add(this.dropCrumb, this);

		// CRUMBS
		this.crumbs = this.game.add.group();
		this.crumbs.enableBody = true;
		this.behindPlayerGroup.add(this.crumbs);

		// FOG

		this.fog = this.game.add.sprite(0, 0, 'fog');
		this.fog.anchor.setTo(0.5);
	},

	update: function() {

		// INPUT

		this.player.body.velocity.y = 0;
		this.player.body.velocity.x = 0;

		if(this.cursors.up.isDown) {
			this.player.body.velocity.y -= this.PLAYER_SPEED;
			this.player.direction = 'up';
		}
		else if(this.cursors.down.isDown) {
			this.player.body.velocity.y += this.PLAYER_SPEED;
			this.player.direction = 'down';
		}
		if(this.cursors.left.isDown) {
			this.player.body.velocity.x -= this.PLAYER_SPEED;
			this.player.frame = 1;
			this.player.direction = 'left';
		}
		else if(this.cursors.right.isDown) {
			this.player.body.velocity.x += this.PLAYER_SPEED;
			this.player.frame = 0;
			this.player.direction = 'right';
		}

		// FOG

		this.fog.x = this.player.x;
		this.fog.y = this.player.y;

		// ENEMIES

		if (this.STAGE > 0) {

			this.enemies.forEach(function(enemy) {
				this.game.physics.arcade.moveToObject(enemy, this.player, 30);
			}, this);
			// this.game.physics.arcade.collide(this.enemies, this.blockedLayer);

		}

		// COLLISION

		this.game.physics.arcade.collide(this.player, this.blockedLayer);
		this.game.physics.arcade.overlap(this.player, this.items, this.collect, null, this);
		this.game.physics.arcade.overlap(this.player, this.treasure, this.findTreasure, null, this);

        // markers
        if (true) {
            this.game.physics.arcade.overlap(this.player, this.exitMarkers, this.updateMarker, null, this);
        }

	},

	dropCrumb: function() {
		this.crumbs.create(this.player.x, this.player.y, 'crumb');
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

	    result.forEach(function(element){
	     	this.createFromTiledObject(element, this.treasure);
	    }, this);
	},

	createDoors: function() {
	    this.doors = this.game.add.group();
	    this.doors.enableBody = true;
	    result = this.findObjectsByType('door', this.map, 'objectsLayer');
	 
	    result.forEach(function(element){
	      this.createFromTiledObject(element, this.doors);
	    }, this);
	},

	createEnemies: function() {
		this.enemies = this.game.add.group();
		this.behindFogGroup.add(this.enemies);
		this.enemies.enableBody = true;
	    result = this.findObjectsByType('enemy', this.map, 'objectsLayer');
	 
	    result.forEach(function(element){
	      this.createFromTiledObject(element, this.enemies);
	    }, this);		
	},

    createMarkers: function() {
        this.markers = this.game.add.group();
        this.exitMarkers = this.game.add.group();
        this.exitMarkers.enableBody = true;
        this.forkMarkers = this.game.add.group();
        this.forkMarkers.enableBody = true;
        this.markers.add(this.exitMarkers);
        this.markers.add(this.forkMarkers);
        this.markers.enableBody = true;

        result = this.findObjectsByType('exit', this.map, 'objectsLayer');
        result.forEach(function(element){
                this.createFromTiledObject(element, this.exitMarkers);
        }, this);

        result = this.findObjectsByType('fork', this.map, 'objectsLayer');
        result.forEach(function(element){
                this.createFromTiledObject(element, this.forkMarkers);
        }, this);

        // this.exitMarkers.forEach(function(element){
        //      element.sprite = 'arrow';
        // });
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
		if (treasure.frame == 0) {
			treasure.frame = 1; // open the chest
			this.createEnemies(); // time to run!
			this.STAGE = 1;
		}
	},

	updateMarker: function(player, marker) {
		console.log("yo");
		if (player.direction == 'up')
			marker.frame = 0;
		else if (player.direction == 'right')
			marker.frame = 1;
		else if (player.direction == 'down')
			marker.frame = 2;
		else if (player.direction == 'left')
			marker.frame = 3;
	}
}