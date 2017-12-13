var TopDownGame = TopDownGame || {};

TopDownGame.Game = function() {};

TopDownGame.Game.prototype = {

	PLAYER_SPEED: 65, // player movement speed
	ENEMY_SPEED: 35, // enemy movement speed
	EPSILON: 2, // used for enemy fork collision 
	STAGE: 0, // 0: finding treasure, 1: found treasure, 2: dead/found door
	CRUMBS: 3, // starting number of crumbs
	LEVEL: 1, // level number


	init: function(levelNumber, crumbsLeft) {
		if (levelNumber !== undefined) {
			this.LEVEL = levelNumber;
			this.ENEMY_SPEED = Math.min(35 + (levelNumber * 3), 59); // enemy moves faster as you go
		}
		if (crumbsLeft !== undefined)
			this.CRUMBS = crumbsLeft;

		console.log("LEVEL: " + this.LEVEL);
		console.log("ENEMY SPEED: " + this.ENEMY_SPEED);
	},

	preload: function() {
		// generate level
		this.levelJSON = Converter.convertMapToTileMap(Generator.createMap(25, 60, 4, 7));
		console.log(this.levelJSON); // for debugging

		// load tilemap from generated json
		this.load.tilemap('level', null, this.levelJSON, Phaser.Tilemap.TILED_JSON);
	},

	create: function() {

		this.STAGE = 0;

		// TILEMAP

		this.map = this.game.add.tilemap('level'); // add the tilemap
		this.map.addTilesetImage('small_tiles', 'gameTiles'); // add its tileset image

		this.backgroundLayer = this.map.createLayer('backgroundLayer');
		this.blockedLayer = this.map.createLayer('blockedLayer');

		this.map.setCollisionBetween(1, 1000, true, 'blockedLayer');

		this.backgroundLayer.resizeWorld(); // make game world same size as map

		// ITEMS

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
		this.player.body.setSize(10, 10, 3, 3);
		this.game.camera.follow(this.player);

		this.player.direction = 'right';
		this.player.lastLR = 'right'; // for animations
		this.player.crumbsLeft = this.CRUMBS;

		this.player.animations.add('right_idle', [0]);
		this.player.animations.add('right', [1, 2]);
		this.player.animations.add('left_idle', [3]);
		this.player.animations.add('left', [4, 5]);

		this.player.animations.play('right_idle');

		// INPUT

		this.cursors = this.game.input.keyboard.createCursorKeys();

		this.wasd = {
			up: this.game.input.keyboard.addKey(Phaser.Keyboard.W),
			down: this.game.input.keyboard.addKey(Phaser.Keyboard.S),
			left: this.game.input.keyboard.addKey(Phaser.Keyboard.A),
			right: this.game.input.keyboard.addKey(Phaser.Keyboard.D),
		};

		this.spaceKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
		this.spaceKey.onDown.add(this.dropCrumb, this);

		// CRUMBS

		this.crumbs = this.game.add.group();
		this.crumbs.enableBody = true;
		this.behindPlayerGroup.add(this.crumbs); // render behind the player

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
		this.alertText = this.game.add.bitmapText(this.game.width / 2, this.game.height / 2 + 48, 'pixeled', '', 6);
		this.alertText.setText("THERE'S TREASURE HERE SOMEWHERE...");
		this.alertText.anchor.setTo(0.5);
		this.alertText.align = 'center';
		this.alertText.fixedToCamera = true;
		this.game.time.events.add(2000, function() {
				this.alertText.text = "";
		}, this);

		// display level number
		this.levelText = this.game.add.bitmapText(this.game.width - 8, 8, 'pixeled', '', 6);
		this.levelText.anchor.setTo(1, 0);
		this.levelText.setText('LEVEL ' + this.LEVEL);
		this.levelText.fixedToCamera = true;

		// FADE IN

		this.black = this.game.add.sprite(this.player.x, this.player.y, 'black');
		this.black.anchor.setTo(0.5);
		this.behindTextGroup.add(this.black);
		this.game.add.tween(this.black).to({
			alpha: 0
		}, 1000, Phaser.Easing.Linear.None, true);
	},

	update: function() {

		// INPUT

		this.player.body.velocity.y = 0;
		this.player.body.velocity.x = 0;

		var animationSpeed = 7;

		if (this.STAGE < 2) {
			if (this.cursors.up.isDown || this.wasd.up.isDown) {
				this.player.body.velocity.y -= this.PLAYER_SPEED;
				this.player.animations.play(this.player.lastLR, animationSpeed);
				this.player.direction = 'up';
			} else if (this.cursors.down.isDown || this.wasd.down.isDown) {
				this.player.body.velocity.y += this.PLAYER_SPEED;
				this.player.animations.play(this.player.lastLR, animationSpeed);
				this.player.direction = 'down';
			} else if (this.cursors.left.isDown || this.wasd.left.isDown) {
				this.player.body.velocity.x -= this.PLAYER_SPEED;
				this.player.animations.play('left', animationSpeed);
				this.player.direction = 'left';
				this.player.lastLR = 'left';
			} else if (this.cursors.right.isDown || this.wasd.right.isDown) {
				this.player.body.velocity.x += this.PLAYER_SPEED;
				this.player.animations.play('right', animationSpeed);
				this.player.direction = 'right';
				this.player.lastLR = 'right';
			}
		}

		if (this.game.input.activePointer.isDown) {
			if (this.STAGE < 2) {
				// TODO: player direction on markers
				this.game.physics.arcade.moveToPointer(this.player, this.PLAYER_SPEED);
			} else {
				// at the end of the game
				this.goToTitle();
			}
		}

		if (this.player.body.velocity.x == 0 && this.player.body.velocity.y == 0) {
			this.player.animations.play(this.player.lastLR + '_idle');
		}

		// FOG (follows player)

		this.fog.x = this.player.x + this.player.width / 2;
		this.fog.y = this.player.y + this.player.height / 2;

		// COLLISION

		this.game.physics.arcade.collide(this.player, this.blockedLayer);
		this.game.physics.arcade.overlap(this.player, this.treasure, this.findTreasure, null, this);

		// markers
		if (this.STAGE > 0) {
			// we only update markers once the chase has begun in stage 1
			this.forkMarkers.forEach(function(marker) {
				if (this.game.physics.arcade.overlap(this.player, marker)) {
					this.updateMarkerDirection(this.player, marker);
				} else {
					marker.overlapped = false;
				}
			}, this);
		}

		// door
		if (this.STAGE > 0) {
			// can only open the door once the chase has begun
			this.game.physics.arcade.overlap(this.player, this.doors, this.openDoor, null, this);
		} else {
			// otherwise it acts like a wall
			this.game.physics.arcade.collide(this.player, this.doors);
		}

		// ENEMIES

		if (this.STAGE > 0) { // enemy/ies only appear in stage 1

			if (this.STAGE == 1)
				this.enemies.forEach(this.moveEnemy, this);
			else
				this.enemies.forEach(function(enemy) {
					enemy.body.velocity.x = 0;
					enemy.body.velocity.y = 0
				}, this);
			this.game.physics.arcade.collide(this.enemies, this.blockedLayer);
			this.game.physics.arcade.collide(this.enemies, this.doors);

			if (this.STAGE != 2)
				this.game.physics.arcade.overlap(this.player, this.enemies, this.touchEnemy, null, this);

		}

	},

	moveEnemy: function(enemy) {
		// use enemy.direction to set the enemy's velocity
		var direction = this.directionToVelocity(enemy.direction);
		enemy.body.velocity.x = direction[0] * this.ENEMY_SPEED;
		enemy.body.velocity.y = direction[1] * this.ENEMY_SPEED;

		if (enemy.direction == 'left')
			enemy.lastLR = 'left';
		else if (enemy.direction == 'right')
			enemy.lastLR = 'right';
		enemy.animations.play(enemy.lastLR, 7);

		if (this.game.physics.arcade.overlap(enemy, this.forkMarkers, function(enemy, marker) {
				// the enemy is touching a fork
				// only change direction when enemy is inside marker
				if (Phaser.Rectangle.containsRect(enemy.body, marker.body)) {
					enemy.direction = marker.data.direction;
				} else if (enemy.direction != marker.data.direction) {
					// we're overlapping but not at the centre; move towards centre
					this.game.physics.arcade.moveToObject(enemy, marker, 50);
				}
			}, null, this)) {

			// handled inside callback

		} else {

			// not touching a fork, so just follow the corridor

			if (this.game.physics.arcade.collide(enemy, this.blockedLayer)) {

				if (enemy.body.blocked[enemy.direction]) { // we've hit a wall

					if (enemy.lastCollisionPosition && (Math.abs(enemy.x - enemy.lastCollisionPosition[0]) > 10 || Math.abs(enemy.y - enemy.lastCollisionPosition[1]) > 10)) {
						// new collision, so reset the directions to try
						enemy.directionsToTry = this.directionsToTry(enemy.direction);
					}

					// update collision position so we can compare whether next collision is new
					enemy.lastCollisionPosition = [enemy.x, enemy.y]

					// no list? we're in a dead end (have already tried all directions and failed)
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
					// remove this direction so we don't try it again
					enemy.directionsToTry.splice(i, 1);
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
		// returns directions orthogonal to supplied direction
		var directions = ['up', 'right', 'down', 'left'];
		directions = directions.filter(function(d) {
			return (d != direction) && (d != this.opposite(direction));
		}, this);

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

	createTreasure: function() {
		result = this.findObjectsByType('treasure', this.map, 'objectsLayer');

		// expect just one treasure
		if (result.length > 0) {
			this.treasure = this.createFromTiledObject(result[0]);
			this.game.physics.arcade.enable(this.treasure);
		} else {
			throw "No treasure object found to create";
		}
	},

	createDoors: function() {
		this.doors = this.game.add.group();
		this.doors.enableBody = true;
		result = this.findObjectsByType('door', this.map, 'objectsLayer');

		result.forEach(function(element) {
			this.createFromTiledObjectToGroup(element, this.doors);
		}, this);

		this.doors.forEach(function(door) {
			door.body.immovable = true; // don't want player to push door
		}, this);
	},

	createEnemies: function() {
		this.behindTextGroup.add(this.enemies); // enemies group created in findTreasure
		this.enemies.enableBody = true;
		result = this.findObjectsByType('enemy', this.map, 'objectsLayer');

		result.forEach(function(element) {
			this.createFromTiledObjectToGroup(element, this.enemies);
		}, this);

		this.enemies.forEach(function(enemy) {
			enemy.body.setSize(12, 12, 2, 2); // more forgiving collision
			enemy.direction = 'right'; // will get updated immediately by treasure
			enemy.lastLR = 'right'; // for animation

			enemy.directionsToTry = this.directionsToTry(enemy.direction);
			enemy.lastCollisionPosition = [enemy.x, enemy.y];

			enemy.animations.add('right', [0, 1]);
			enemy.animations.add('left', [2, 3]);
		}, this);
	},

	createMarkers: function() {
		this.forkMarkers = this.game.add.group();
		this.forkMarkers.enableBody = true;

		result = this.findObjectsByType('fork', this.map, 'objectsLayer');
		result.forEach(function(element) {
			this.createFromTiledObjectToGroup(element, this.forkMarkers);
		}, this);

		this.forkMarkers.forEach(function(marker) {
			// initialise each marker with a direction
			marker.data.direction = 'right';
		}, this);
	},

	// find objects in a Tiled layer that contain a property called "type" equal to a certain value
	findObjectsByType: function(type, map, layer) {
		var result = new Array();

		map.objects[layer].forEach(function(element) {
			if (element.properties.type === type) {
				//Phaser uses top left, Tiled bottom left so we have to adjust the y position
				element.y -= map.tileHeight;
				result.push(element);
			}
		});

		return result;
	},

	// create a sprite from an object and add it to group
	createFromTiledObjectToGroup: function(element, group) {
		var sprite = group.create(element.x, element.y, element.properties.sprite);

		Object.keys(element.properties).forEach(function(key) {
			sprite[key] = element.properties[key];
		});
	},

	createFromTiledObject: function(element) {
		var sprite = this.game.add.sprite(element.x, element.y, element.properties.sprite);

		Object.keys(element.properties).forEach(function(key) {
			sprite[key] = element.properties[key];
		});

		return sprite;
	},

	findTreasure: function(player, treasure) {
		if (this.STAGE == 0) { // finding treasure for first time

			treasure.frame = 1; // open the chest

			// enemies spawn after a short delay
			this.game.time.events.add(2000, function() {
				this.createEnemies();
			}, this);

			this.alertText.text = "YOU FOUND THE TREASURE\n\nTIME TO RUN";
			this.game.time.events.add(2000, function() {
				this.alertText.text = "";
			}, this);

			this.enemies = this.game.add.group();
			this.STAGE = 1; // update game stage
			this.forkMarkers.add(treasure); // treasure is now a fork marker

			// decrease radius of vision
			this.fog.kill();
			this.fog = this.game.add.sprite(player.x, player.y, 'fog_small');
			this.fog.anchor.setTo(0.5);
			this.behindPlayerGroup.add(this.fog);

		} else { // already found treasure; treat it like a fork marker

			treasure.data.direction = player.direction;

		}
	},

	touchEnemy: function(player, enemy) {
		if (this.player.crumbsLeft > 0) {
			this.alertText.text = "YOU DIED\n\nYOU LOSE ALL YOUR CRUMBS";
			this.STAGE = 2;
			this.finishLevel(-this.player.crumbsLeft);
		} else {
			this.alertText.text = "YOU DIED WITH NO CRUMBS\n\nGAME OVER";
			this.STAGE = 2;
			this.game.time.events.add(2000, function() {
				this.finishGame();
			}, this);
		}

	},

	openDoor: function(player, door) {
		this.alertText.text = "YOU ESCAPED\n\nYOU FIND 2 MORE CRUMBS";
		this.STAGE = 2;
		this.finishLevel(2);
	},

	updateMarkerDirection: function(player, marker) {
		// for debugging, if the marker sprite isn't none we can change its frame
		var changeSprite = (marker.key == 'none');

		if (player.direction == 'up') {
			if (changeSprite)
				marker.frame = 0;
			marker.data.direction = player.direction;
		} else if (player.direction == 'right') {
			if (changeSprite)
				marker.frame = 1;
			marker.data.direction = player.direction;
		} else if (player.direction == 'down') {
			if (changeSprite)
				marker.frame = 2;
			marker.data.direction = player.direction;
		} else if (player.direction == 'left') {
			if (changeSprite)
				marker.frame = 3;
			marker.data.direction = player.direction;
		}

	},

	finishLevel: function(extraCrumbs) {
		// fade to black
		this.game.add.tween(this.black).to({
			alpha: 1
		}, 1000, Phaser.Easing.Linear.None, true);

		// reset level after 2s
		this.game.time.events.add(2000, function() {
			this.state.start('Game', true, false, this.LEVEL + 1, this.player.crumbsLeft + extraCrumbs); // levelnumber, crumbsleft
		}, this);
	},

	finishGame: function() {
		this.alertText.text = "YOU REACHED LEVEL " + this.LEVEL + "\n\nplay again?";

		// fade in
		this.black.x = this.player.x;
		this.black.y = this.player.y;
		this.game.add.tween(this.black).to({
			alpha: 1
		}, 1000, Phaser.Easing.Linear.None, true);

		this.spaceKey.onDown.add(this.goToTitle, this);
	},

	goToTitle: function() {
		this.state.start('Title');
	},
}