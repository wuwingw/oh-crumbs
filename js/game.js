var TopDownGame = TopDownGame || {};

TopDownGame.Game = function(){};

TopDownGame.Game.prototype = {

	PLAYER_SPEED: 80,
	ENEMY_SPEED: 60,
	EPSILON: 2,
	STAGE: 0,
	CRUMBS: 4,
	LEVEL: 1,


	init: function(levelNumber, crumbsLeft) {
		if (levelNumber)
			this.LEVEL = levelNumber;
		if (crumbsLeft)
			this.CRUMBS = crumbsLeft;
		console.log(this.LEVEL);
	},

	preload: function() {
		// GENERATE LEVEL
		this.levelJSON = Converter.convertMapToTileMap(Generator.createMap(30, 60, 3, 8));
		// this.game.cache.addJSON('levelJSON', null, this.levelJSON);
		this.load.tilemap('level', null, this.levelJSON, Phaser.Tilemap.TILED_JSON);
	},

	create: function() {

		this.STAGE = 0;

		// TILEMAP

		// this.map = this.game.add.tilemap('level' + this.LEVEL); // create tilemap from json
		this.map = this.game.add.tilemap('level');
		this.map.addTilesetImage('small_tiles', 'gameTiles'); // add its tileset image

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
		this.player.body.setSize(10, 12, 3, 2);
		this.game.camera.follow(this.player);

		this.player.direction = 'right';
		this.player.markerQueue = [];
		this.player.crumbsLeft = this.CRUMBS;

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

		// TEXT

    	this.behindTextGroup = this.game.add.group();

	    // display the number of crumbs left
    	this.crumbsText = this.game.add.bitmapText(8, 8, 'pixeled', '', 6);
    	this.crumbsText.setText(this.player.crumbsLeft + ' CRUMBS LEFT');
    	this.crumbsText.fixedToCamera = true;

    	// for alerts in the middle of the screen
    	this.alertText = this.game.add.bitmapText(this.game.width/2, this.game.height/2 + 48, 'pixeled', '', 6);
    	this.alertText.anchor.setTo(0.5);
    	this.alertText.fixedToCamera = true;

    	// display level number
    	this.levelText = this.game.add.bitmapText(this.game.width - 8, 8, 'pixeled', '', 6);
    	this.levelText.anchor.setTo(1, 0);
    	this.levelText.setText('LEVEL ' + this.LEVEL);
    	this.levelText.fixedToCamera = true;

	},

	update: function() {

		// INPUT

		this.player.body.velocity.y = 0;
		this.player.body.velocity.x = 0;

		if (this.STAGE < 2) {
			if(this.cursors.up.isDown) {
				this.player.body.velocity.y -= this.PLAYER_SPEED;
				this.player.direction = 'up';
			}
			else if(this.cursors.down.isDown) {
				this.player.body.velocity.y += this.PLAYER_SPEED;
				this.player.direction = 'down';
			}
			else if(this.cursors.left.isDown) {
				this.player.body.velocity.x -= this.PLAYER_SPEED;
				this.player.frame = 1;
				this.player.direction = 'left';
			}
			else if(this.cursors.right.isDown) {
				this.player.body.velocity.x += this.PLAYER_SPEED;
				this.player.frame = 0;
				this.player.direction = 'right';
			}

			if (this.game.input.activePointer.isDown) {
				// TODO: player direction
				this.game.physics.arcade.moveToPointer(this.player, this.PLAYER_SPEED);
			}
		}

		// FOG

		this.fog.x = this.player.x + this.player.width/2;
		this.fog.y = this.player.y + this.player.height/2;

		// COLLISION

		this.game.physics.arcade.collide(this.player, this.blockedLayer);
		this.game.physics.arcade.overlap(this.player, this.items, this.collect, null, this);
		this.game.physics.arcade.overlap(this.player, this.treasure, this.findTreasure, null, this);

        // markers
        if (this.STAGE > 0) {
        	this.exitMarkers.forEach(function(marker){
        		if (this.game.physics.arcade.overlap(this.player, marker)) {
    				this.updateMarkerDirection(this.player, marker);
    				this.addMarkerToQueue(this.player, marker);
        		} else {
        			marker.overlapped = false;
        		}
        	}, this);

        	this.forkMarkers.forEach(function(marker){
        		if (this.game.physics.arcade.overlap(this.player, marker)) {
    				this.updateMarkerDirection(this.player, marker);
        		} else {
        			marker.overlapped = false;
        		}
        	}, this);
            // this.game.physics.arcade.overlap(this.player, this.exitMarkers, this.updateMarker, null, this);
        }

        // door
        if (this.STAGE > 0) {
        	this.game.physics.arcade.overlap(this.player, this.doors, this.openDoor, null, this);
        } else {
        	this.game.physics.arcade.collide(this.player, this.doors);
        }

		// ENEMIES

		if (this.STAGE > 0) {

			if (this.STAGE == 1)
				this.enemies.forEach(this.moveEnemy, this);
			else
				this.enemies.forEach(function(enemy){
					enemy.body.velocity.x = 0;
					enemy.body.velocity.y = 0}, this);
			this.game.physics.arcade.collide(this.enemies, this.blockedLayer);
			this.game.physics.arcade.collide(this.enemies, this.doors);
			this.game.physics.arcade.overlap(this.player, this.enemies, this.touchEnemy, null, this);

		}

	},

	checkReachedMarker: function(enemy, marker, setInRoomTo) {
		if (Math.abs(enemy.x - marker.x) < this.EPSILON && Math.abs(enemy.y - marker.y) < this.EPSILON) {
			// console.log("reached");

			// enemy has got to this marker; onto the next one
			enemy.body.velocity.x = 0;
			enemy.body.velocity.y = 0;
			this.player.markerQueue.shift();
			enemy.inRoom = setInRoomTo
			// console.log(enemy.inRoom);

			// if we've just left a room, use marker to decide which way to go
			if (!enemy.inroom) {
				enemy.direction = marker.direction;
				enemy.directionsToTry = this.directionsToTry(enemy.direction);
				enemy.lastCollisionPosition = [enemy.x, enemy.y];
			}
		}
	},

	moveEnemy: function(enemy) {
		var nextMarker = this.player.markerQueue.length ? this.player.markerQueue[0] : undefined;

		if (enemy.inRoom) {

			if (nextMarker) {
				// player has left room via nextMarker
				this.game.physics.arcade.moveToObject(enemy, nextMarker, this.ENEMY_SPEED);

				// check if we've left the room
				this.checkReachedMarker(enemy, nextMarker, false);				
			} else {
				// player is in same room
				this.game.physics.arcade.moveToObject(enemy, this.player, this.ENEMY_SPEED);
			}

		} else if (!enemy.inRoom) {

			var direction = this.directionToVelocity(enemy.direction);
			enemy.body.velocity.x = direction[0]*this.ENEMY_SPEED;
			enemy.body.velocity.y = direction[1]*this.ENEMY_SPEED;

			if (nextMarker && this.game.physics.arcade.overlap(enemy, nextMarker)) {

				// check if we've entered a room
				this.checkReachedMarker(enemy, nextMarker, true);

			} else if (this.game.physics.arcade.overlap(enemy, this.forkMarkers, function(enemy, marker) { 
				// console.log("touching fork");
				if (marker.direction && (Math.abs(enemy.x - marker.x) < this.EPSILON) && (Math.abs(enemy.y - marker.y)) < this.EPSILON) {
					enemy.direction = marker.direction;
				}
			}, null, this)) {

				// change direction if we walk over (the centre of) a fork marker
				// handled in the callback

			} else {

				// just follow the corridor

				if (this.game.physics.arcade.collide(enemy, this.blockedLayer)) {

					if (enemy.body.blocked[enemy.direction]) {
						// we've hit a wall
						
						if (Math.abs(enemy.x - enemy.lastCollisionPosition[0]) > 16 || Math.abs(enemy.y - enemy.lastCollisionPosition[1]) > 16) {
							// new collision
							enemy.directionsToTry = this.directionsToTry(enemy.direction);
						}

						enemy.lastCollisionPosition = [enemy.x, enemy.y]
		
						// no list? we're in a dead end.
						if (!enemy.directionsToTry.length) {
							enemy.body.velocity.x = 0;
							enemy.body.velocity.y = 0;
						}

						// try going in each direction (if we have a list)
						var i = 0;
						for (i = 0; i < enemy.directionsToTry.length; i++) {
							var direction = enemy.directionsToTry[i];
							if (direction != enemy.direction) {
								enemy.direction = direction;
								break;
							}
						}
						enemy.directionsToTry.splice(i, 1); // remove this direction
						// console.log(enemy.directionsToTry);
					}
				}

			}
			
		}

	},

	directionToVelocity: function(direction) {
		if (direction == 'up') {
			return [0, -1];
		} else if (direction == 'right') {
			return [1, 0];
		} else if (direction == 'down') {
			return [0, 1];
		} else if (direction == 'left') {
			return [-1, 0];
		}
	},

	directionsToTry: function(direction) {
		var directions = ['up', 'right', 'down', 'left'];
		directions = directions.filter(function(d) {
			return (d != direction) && (d != this.opposite(direction));
		}, this);

		// console.log("try!");
		// console.log(directions);
		return directions;
	},

	opposite: function(direction) {
		if (direction == 'up') {
			return 'down';
		} else if (direction == 'right') {
			return 'left';
		} else if (direction == 'down') {
			return 'up';
		} else if (direction == 'left') {
			return 'right';
		}
	},

	dropCrumb: function() {
		if (this.player.crumbsLeft > 0 && this.STAGE == 0) {
			this.crumbs.create(this.player.x, this.player.y, 'crumb');
			this.player.crumbsLeft--;
			this.crumbsText.text = this.player.crumbsLeft + " CRUMBS LEFT";
		}
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

	    this.doors.forEach(function(door){
	    	door.body.immovable = true;
	    }, this);
	},

	createEnemies: function() {
		// this.enemies = this.game.add.group();
		this.behindTextGroup.add(this.enemies);
		this.enemies.enableBody = true;
	    result = this.findObjectsByType('enemy', this.map, 'objectsLayer');
	 
	    result.forEach(function(element){
	      this.createFromTiledObject(element, this.enemies);
	    }, this);

	    this.enemies.forEach(function(enemy){
 			enemy.body.setSize(14, 14, 1, 1); // more forgiving collision
 			enemy.inRoom = true;
	    }, this);	
	},

    createMarkers: function() {
        this.exitMarkers = this.game.add.group();
        this.exitMarkers.enableBody = true;
        this.forkMarkers = this.game.add.group();
        this.forkMarkers.enableBody = true;

        result = this.findObjectsByType('exit', this.map, 'objectsLayer');
        result.forEach(function(element){
                this.createFromTiledObject(element, this.exitMarkers);
        }, this);

        result = this.findObjectsByType('fork', this.map, 'objectsLayer');
        result.forEach(function(element){
                this.createFromTiledObject(element, this.forkMarkers);
        }, this);

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

			this.game.time.events.add(3000, function() {
				this.createEnemies();
			}, this);

			this.alertText.text = "TIME TO RUN";
			this.game.time.events.add(2000, function() {
				this.alertText.text = "";
			}, this);

			// this.createEnemies(); // time to run!
			this.enemies = this.game.add.group();
			this.STAGE = 1; // update game stage
			player.markerQueue = []; // initialise empty queue
		}
	},

	touchEnemy: function(player, enemy) {
		this.alertText.text = "YOU DIED";
		this.STAGE = 2;
		this.finishLevel();
	},

	openDoor: function(player, door) {
		this.alertText.text = "YOU ESCAPED";
		this.STAGE = 2;
		this.finishLevel();
	},

	addMarkerToQueue: function(player, marker) {
		if (!marker.overlapped) {
			player.markerQueue.push(marker);

			marker.overlapped = true;
			console.log(player.markerQueue);
			console.log(player.markerQueue.length);
		}
	},

	updateMarkerDirection: function(player, marker) {
		if (player.direction == 'up') {
			marker.frame = 0;
			marker.direction = player.direction;
		} else if (player.direction == 'right') {
			marker.frame = 1;
			marker.direction = player.direction;
		} else if (player.direction == 'down') {
			marker.frame = 2;
			marker.direction = player.direction;
		} else if (player.direction == 'left') {
			marker.frame = 3;
			marker.direction = player.direction;
		}
	},

	finishLevel: function() {
		this.game.time.events.add(2000, function() {
    		this.state.start('Game', true, false, this.LEVEL + 1, this.player.crumbsLeft); // levelnumber, crumbsleft
		}, this);
	},
}