var Converter = (function() {

	var outerWall = 11;
	var innerWall = 6;

	var template = function(dimension) {
		// given tilemap dimension, returns base JSON tilemap

		var base = {
			height: dimension,
			layers: [
				{
					data: [],
					height: dimension,
					name: "backgroundLayer",
					opacity: 1,
					type: "tilelayer",
					visible: true,
					width: dimension,
					x: 0,
					y: 0
				},
				{
					data: [],
					height: dimension,
					name: "blockedLayer",
					opacity: 1,
					type: "tilelayer",
					visible: true,
					width: dimension,
					x: 0,
					y: 0
				},
				{
					draworder: "topdown",
					name: "objectsLayer",
					objects: [],
					opacity: 1,
					type: "objectgroup",
					visible: true,
					x: 0,
					y: 0
				}
				],
			nextobjectid: 0,
			orientation: "orthogonal",
			renderorder: "right-down",
			tiledversion: "1.0.3",
			tileheight: 16,
			tilesets: [
		        {
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
		for (var i = 0; i < dimension*dimension; i++) {
			bgLayer.push(1);
		}
		base.layers[0].data = bgLayer;

		return base;
	};

	var playerStart = function(x, y) {
		return {
			"gid":3,
			"height":16,
			"id":1,
			"name":"",
			"properties":
				{
					 "type":"playerStart"
				},
			"propertytypes":
				{
					 "type":"string"
				},
			"rotation":0,
			"type":"",
			"visible":true,
			"width":16,
			"x": x,
			"y": y
		}
	};

	var door = function(x, y) {
		return {
			"gid":2,
			"height":16,
			"id":2,
			"name":"",
			"properties":
				{
					 "sprite":"door",
					 "type":"door"
				},
			"propertytypes":
				{
					 "sprite":"string",
					 "type":"string"
				},
			"rotation":0,
			"type":"",
			"visible":true,
			"width":16,
			"x": x,
			"y": y
		}
	}

	var treasure = function(x, y) {
		return {
			"gid":11,
			"height":16,
			"id":3,
			"name":"",
			"properties":
				{
					 "sprite":"treasure",
					 "type":"treasure"
				},
			"propertytypes":
				{
					 "sprite":"string",
					 "type":"string"
				},
			"rotation":0,
			"type":"",
			"visible":true,
			"width":16,
			"x": x,
			"y": y
		}
	}

	var enemy = function(x, y) {
		return {
			"gid":8,
			"height":16,
			"id":4,
			"name":"",
			"properties":
				{
					 "sprite":"mummy",
					 "type":"enemy"
				},
			"propertytypes":
				{
					 "sprite":"string",
					 "type":"string"
				},
			"rotation":0,
			"type":"",
			"visible":true,
			"width":16,
			"x": x,
			"y": y
		}
	}

	var convertMapToTileMap = function(m) {
		var map = m;
		
		// add 2 to grid dimensions - for the border
		var tilemap = template(map.length + 2);

		// find the treasure first
		var treasureRow, treasureCol;
		for (var row = 0; row < map.length; row++) {
			if (map[row].indexOf(2) > -1) {
				treasureCol = map[row].indexOf(2);
				treasureRow = row;
				break;
			}
		}
		treasureRow++;
		treasureCol++;

		// convert 1s to innerwall
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
		for (var i = 0; i < map.length + 2; i ++) {
			outerWallRow.push(outerWall);
		}
		map.unshift(outerWallRow);
		map.push(outerWallRow);

		// flatten 2d array
		var flattened = [].concat.apply([], map);

		// insert it into the tilemap JSON
		tilemap.layers[1].data = flattened;

		// OBJECTS

		var objects = []

		// insert player position at bottom left next to door
		var ps = playerStart(16, 16*(map.length-1));
		objects.push(ps);

		// insert door at bottom left corner
		var d = door(0, 16*(map.length-1));
		objects.push(d);

		// insert treasure
		var t = treasure(16*treasureCol, 16*treasureRow);
		objects.push(t);

		// enemy spawns on top of treasure
		var e = enemy(16*treasureCol, 16*treasureRow);
		objects.push(e);

		// put objects array into tilemap json
		tilemap.layers[2].objects = objects;
		tilemap.nextobjectid = objects.length;

		return tilemap;
	};

	return {
		convertMapToTileMap: convertMapToTileMap,
	}

}());