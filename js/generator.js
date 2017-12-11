var Generator = (function() {

	var createGrid = function(n, char) {
		// create a 2d array of dimensions nxn filled with char

		var grid = [];

		for (var i = 0; i < n; i++) {
			grid.push([]);
			for (var j = 0; j < n; j++) {
				grid[i].push(char);
			}
		}

		return grid;
	};

	// N, E, S, W
	var allDirections = [
		[-1, 0],
		[0, 1],
		[0, -1],
		[1, 0] 
	]

	// if we start in bottom left corner, can only go N or E
	var startingDirections = [
		[-1, 0],
		[0, 1]
	]

	var outOfBounds = function(x, y, n) {
		// check whether x, y is a valid coord for an nxn grid
		return x < 0 || x >= n || y < 0 || y >= n;
	};

	var getAdjacentCells = function(x, y, n) {
		// given an x, y cord, return the N, E, S, W neighbour coords within the nxn grid

		var neighbourOffsets = [[1, 0], [-1, 0], [0, 1], [0, -1]];
		var toReturn = [];

		for (var i = 0; i < neighbourOffsets.length; i++) {
			var offset = neighbourOffsets[i];
			if (!outOfBounds(x + offset[0], y + offset[1], n))
				toReturn.push([x + offset[0], y + offset[1]]);
		}

		return toReturn;
	};

	var markForks = function(map, openCells) {
		// mark all open cells that are forks with a 3

		var forkCells = [];
		var newMap = map;

		for (var i = 0; i < openCells.length; i++) {
			var openCell = openCells[i];
			if (map[openCell[0]][openCell[1]] == 2) // this is the treasure, don't mark it
				continue;

			var adjacentCells = getAdjacentCells(openCell[0], openCell[1], map.length);
			var count = 0;
			for (var j = 0; j < adjacentCells.length; j++) {
				if (map[adjacentCells[j][0]][adjacentCells[j][1]] == 0
					|| map[adjacentCells[j][0]][adjacentCells[j][1]] == 2 
					|| map[adjacentCells[j][0]][adjacentCells[j][1]] == 3)
					// 2 is treasure; 3 is another fork; both count as being open
					count++;
			}

			if (count > 2) {
				forkCells.push(openCell);
				newMap[openCell[0]][openCell[1]] = 3;
			}
		}

		return newMap;
	};

	var cellEquals = function(a, b) {
		return a[0] == b[0] && a[1] == b[1];
	};

	var createMap = function(n, tunnelNo, tunnelMin, tunnelMax) {

		var map = createGrid(n, 1); // create nxn grid of 1s
		
		// starting point is bottom left
		var currentRow = n-1;
		var currentCol = 0;
		map[currentRow][currentCol] = 0;

		// initialise
		var currentDirection = allDirections[Math.floor(Math.random() * allDirections.length)];

		var tunnelsLeft = tunnelNo;
		var openCells = [];
		while (tunnelsLeft > 0) {

			var previousDirection = currentDirection;
			var oppositePreviousDirection = [-1*previousDirection[0], -1*previousDirection[1]];

			// pick a new direction to go in that isn't the same or the opposite
			do {
				currentDirection = allDirections[Math.floor(Math.random() * allDirections.length)];
			} while (currentDirection == previousDirection || currentDirection == oppositePreviousDirection);

			// pick a tunnel length
			var length = Math.ceil(Math.random() * (tunnelMax - tunnelMin)) + tunnelMin;

			// dig the tunnel
			var dugLength = -1;
			var dugCells = []; // remember the cells we've dug
			var nextCellIsOpen = false;
			var startingPoint = [currentRow, currentCol];
			var lastOpenCell = startingPoint;
			
			while (dugLength < length) {

				// check how many NESW neighbour cells are already open
				var adjacentCells = getAdjacentCells(currentRow, currentCol, n);
				var count = 0;
				var isTunnel = 0;
				var nextCell = [currentRow + currentDirection[1], currentCol + currentDirection[0]];
				var prevCell = [currentRow - currentDirection[1], currentCol - currentDirection[0]];
				for (var i = 0; i < adjacentCells.length; i++) {
					if (map[adjacentCells[i][0]][adjacentCells[i][1]] == 0) {
						count++;

						if (cellEquals([adjacentCells[i][0],adjacentCells[i][1]], nextCell) || cellEquals([adjacentCells[i][0],adjacentCells[i][1]], prevCell))
							isTunnel++;
					}

				}

				// console.log("tunnel " + (count == 2 && isTunnel == 2));

				// only dig if the cell has 1 or fewer adjacent open cells, or is a tunnel
				// and is actually connected
				if ((count < 2 && count > 0) || (count == 2 && isTunnel == 2)) {
					if (map[currentRow][currentCol] != 0)
						dugCells.push([currentRow, currentCol]);
					map[currentRow][currentCol] = 0;
					lastOpenCell = [currentRow, currentCol];
				}
				
				// move
				currentRow += currentDirection[1];
				currentCol += currentDirection[0];

				// check if we've hit the edges
				if (outOfBounds(currentRow, currentCol, n)) {
					// undo last move
					currentRow -= currentDirection[1];
					currentCol -= currentDirection[0];

					nextCellIsOpen = false;
					break;
				} else {
					nextCellIsOpen = (map[currentRow][currentCol] == 0);
				}

				dugLength++;
			}

			// is this just an unnecessary alcove
			// if (dugCells.length == 1) {
			// 	// undo it
			// 	console.log("hm " + dugCells[0][0] + ", " + dugCells[0][1]);
			// 	map[dugCells[0][0]][dugCells[0][1]] = 1;
			// 	dugCells = [];
			// 	dugLength = 0;
			// 	currentRow = startingPoint[1];
			// 	currentCol = startingPoint[0];
			// }

			// store the cells we've dug
			for (var i = 0; i < dugCells.length; i++)
				openCells.push([dugCells[i][0], dugCells[i][1]]);

			// only count this as a tunnel if we managed to dig
			if (dugLength > 0)
				tunnelsLeft--;

			// console.log(tunnelsLeft);
			currentRow = lastOpenCell[0];
			currentCol = lastOpenCell[1];
		}

		// place treasure somewhere in top right quadrant
		var halfN = Math.ceil(n/2);
		var randomCell;
		var failures = 0;
		console.log(openCells);
		do {
			randomCell = openCells[Math.floor(Math.random() * openCells.length)];
			failures++;			
		} while ((failures < 100) && (randomCell[0] > halfN || randomCell[1] < halfN));

		map[randomCell[0]][randomCell[1]] = 2
		console.log("treasure at " + randomCell[0] + ", " + randomCell[1]);

		
		// mark forks
		map = markForks(map, openCells);

		return map;

	};

	var displayMap = function(map) {

		var n = map.length;
		for (var i = 0; i < n; i++) {
			var row = "|";
			for (var j = 0; j < n; j++) {
				row += map[i][j] + "|"
			}
			console.log(row);
		}

	};

	return {
		createMap: createMap,
		displayMap: displayMap,
	}

}());