var Converter = (function() {

	// values to correspond to the tile image
	var outerWall = 11;
	var innerWall = 6;

	var template = function(dimension) {
		// given tilemap dimension, returns base JSON tilemap

		var base = {
			height: dimension,
			layers: [{
				data: [],
				height: dimension,
				name: "backgroundLayer",
				opacity: 1,
				type: "tilelayer",
				visible: true,
				width: dimension,
				x: 0,
				y: 0
			}, {
				data: [],
				height: dimension,
				name: "blockedLayer",
				opacity: 1,
				type: "tilelayer",
				visible: true,
				width: dimension,
				x: 0,
				y: 0
			}, {
				draworder: "topdown",
				name: "objectsLayer",
				objects: [],
				opacity: 1,
				type: "objectgroup",
				visible: true,
				x: 0,
				y: 0
			}],
			nextobjectid: 0,
			orientation: "orthogonal",
			renderorder: "right-down",
			tiledversion: "1.0.3",
			tileheight: 16,
			tilesets: [{
				columns: 5,
				firstgid: 1,
				image: "..\/images\/small_tiles.png",
				imageheight: 80,
				imagewidth: 80,
				margin: 0,
				name: "small_tiles",
				spacing: 0,
				tilecount: 25,
				tileheight: 16,
				tilewidth: 16
			}],
			tilewidth: 16,
			type: "map",
			version: 1,
			width: dimension
		};

		// bglayer is always all 1s (black tile)
		var bgLayer = [];
		for (var i = 0; i < dimension * dimension; i++) {
			bgLayer.push(1);
		}
		base.layers[0].data = bgLayer;

		return base;
	};

	var playerStart = function(x, y) {
		return {
			"gid": 3,
			"height": 16,
			"id": 1,
			"name": "",
			"properties": {
				"type": "playerStart"
			},
			"propertytypes": {
				"type": "string"
			},
			"rotation": 0,
			"type": "",
			"visible": true,
			"width": 16,
			"x": x,
			"y": y
		}
	};

	var door = function(x, y) {
		return {
			"gid": 2,
			"height": 16,
			"id": 2,
			"name": "",
			"properties": {
				"sprite": "door",
				"type": "door"
			},
			"propertytypes": {
				"sprite": "string",
				"type": "string"
			},
			"rotation": 0,
			"type": "",
			"visible": true,
			"width": 16,
			"x": x,
			"y": y
		}
	};

	var treasure = function(x, y) {
		return {
			"gid": 11,
			"height": 16,
			"id": 3,
			"name": "",
			"properties": {
				"sprite": "treasure",
				"type": "treasure"
			},
			"propertytypes": {
				"sprite": "string",
				"type": "string"
			},
			"rotation": 0,
			"type": "",
			"visible": true,
			"width": 16,
			"x": x,
			"y": y
		}
	};

	var enemy = function(x, y) {
		return {
			"gid": 8,
			"height": 16,
			"id": 4,
			"name": "",
			"properties": {
				"sprite": "mummy",
				"type": "enemy"
			},
			"propertytypes": {
				"sprite": "string",
				"type": "string"
			},
			"rotation": 0,
			"type": "",
			"visible": true,
			"width": 16,
			"x": x,
			"y": y
		}
	};

	var fork = function(x, y, id) {
		return {
			"gid": 12,
			"height": 16,
			"id": id,
			"name": "",
			"properties": {
				"sprite": "none",
				"type": "fork",
			},
			"propertytypes": {
				"sprite": "string",
				"type": "string"
			},
			"rotation": 0,
			"type": "",
			"visible": true,
			"width": 16,
			"x": x,
			"y": y
		}
	};

	var convertMapToTileMap = function(m) {
		// m is the grid from generator.js
		var map = m;

		// add 2 to grid dimensions - for the border of outer walls
		var tilemap = template(map.length + 2);

		// find the treasure first, and the forks
		var treasureRow, treasureCol;
		var forkCells = [];
		for (var row = 0; row < map.length; row++) {
			var currentRow = map[row];
			for (var col = 0; col < map.length; col++) {
				if (currentRow[col] == 2) {
					// treasure
					treasureRow = row + 1;
					treasureCol = col + 1;
				} else if (currentRow[col] == 3) {
					// fork
					forkCells.push([row + 1, col + 1]);
				}
			}
		}
		console.log("fork");
		console.log(forkCells);

		console.log("treasure read in at " + treasureRow + ", " + treasureCol);

		// convert 1s to innerwall, and everything else to 0
		for (var row = 0; row < map.length; row++) {
			map[row] = map[row].map(function(e) {
				return (e == 1) ? innerWall : 0
			});
		}

		// add the border to each row
		for (var row = 0; row < map.length; row++) {
			map[row].unshift(outerWall);
			map[row].push(outerWall);
		}

		// add first and final row
		var outerWallRow = []
		for (var i = 0; i < map.length + 2; i++) {
			outerWallRow.push(outerWall);
		}
		map.unshift(outerWallRow);
		map.push(outerWallRow);

		// remove outer wall where door is
		map[map.length - 2][0] = 0;

		// flatten 2d array
		var flattened = [].concat.apply([], map);

		// insert it into the tilemap JSON
		tilemap.layers[1].data = flattened;

		// OBJECTS

		var objects = []

		// insert player position at bottom left next to door
		var ps = playerStart(16, 16 * (map.length - 1));
		objects.push(ps);

		// insert door at bottom left corner
		var d = door(0, 16 * (map.length - 1));
		objects.push(d);

		// insert treasure
		var t = treasure(16 * treasureCol, 16 * (treasureRow + 1));
		objects.push(t);

		// enemy spawns on top of treasure
		var e = enemy(16 * treasureCol, 16 * (treasureRow + 1));
		objects.push(e);

		// forks
		var id = 5;
		for (var i = 0; i < forkCells.length; i++) {
			var f = fork(16 * forkCells[i][1], 16 * (forkCells[i][0] + 1), id);
			objects.push(f);
			id++;
		}

		// put objects array into tilemap json
		tilemap.layers[2].objects = objects;
		tilemap.nextobjectid = objects.length;

		return tilemap;
	};

	return {
		convertMapToTileMap: convertMapToTileMap,
	}

}());