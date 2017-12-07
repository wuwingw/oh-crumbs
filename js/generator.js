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

	var createMap = function(n, tunnelNo, tunnelMin, tunnelMax) {

		var map = createGrid(n, 1); // create nxn grid of 1s
		
		// starting point is bottom left
		var currentRow = n-1;
		var currentCol = 0;

		// initialise
		var currentDirection = allDirections[Math.floor(Math.random() * allDirections.length)];

		var tunnelsLeft = tunnelNo;
		while (tunnelsLeft > 0) {

			var previousDirection = currentDirection;
			var oppositePreviousDirection = [-1*previousDirection[0], -1*previousDirection[1]];

			// pick a new direction to go in that isn't the same or the opposite
			do {
				currentDirection = allDirections[Math.floor(Math.random() * allDirections.length)];
			} while (currentDirection == previousDirection || currentDirection == oppositePreviousDirection);

			// console.log("direction " + currentDirection[0] + ", " + currentDirection[1]);

			// pick a tunnel length
			var length = Math.ceil(Math.random() * (tunnelMax - tunnelMin)) + tunnelMin;
			// var length = tunnelLength;

			// dig the tunnel
			var dugLength = -1;
			while (dugLength < length) {
				// dig!
				map[currentRow][currentCol] = 0;
				// console.log("digging at " + currentRow + ", " + currentCol);
				
				// move
				currentRow += currentDirection[1];
				currentCol += currentDirection[0];

				// check if we've hit the edges
				if (currentRow < 0 || currentRow >= n || currentCol < 0 || currentCol >= n) {
					// console.log("hit the edge after digging " + dugLength);
					// undo last move
					currentRow -= currentDirection[1];
					currentCol -= currentDirection[0];

					break;
				}

				dugLength++;
			}

			// only count this as a tunnel if we managed to dig
			if (dugLength > 0)
				tunnelsLeft--;

		}

		// place treasure somewhere in top right quadrant
		var halfN = Math.ceil(n/2);
		var randomX, randomY;
		do {
			randomX = Math.floor(Math.random() * (n - halfN)) + halfN;
			randomY = Math.floor(Math.random() * (halfN));
		} while (map[randomY][randomX] == 1)

		map[randomY][randomX] = 2
		console.log("treasure at " + randomX + ", " + randomY);

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