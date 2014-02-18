(function(global) {
	function Dungeon(x, y, maxRoom) {
		this.x = x;
		this.y = y;
		this.room = 0;
		this.maxRoom = maxRoom;

		this.field = [];
		for (var i = 0; i < y; i++) {
			var temp = [];
			for (var j = 0; j < x; j++) temp[j] = Dungeon.WALL;
			this.field[i] = temp;
		}

		var areas = [[{"x":0,"y":0}, {"x":x-1,"y":y-1}]];
		if (this.x > Dungeon.AT_LEAST_SIZE*2 && this.y > Dungeon.AT_LEAST_SIZE*2) {
			while (this.room < this.maxRoom) {
				areas = shuffle(areas);
				var area = areas.pop();
				var divined = divineField(area[0], area[1], this.field);
				if (divined) areas = areas.concat(divined);
				this.room++;
			}
		}

		var rooms = [];
		for (var i = 0; i < areas.length; i++) {
			rooms.push(createRoom(areas[i][0], areas[i][1], this.field));
		}
		for (var i = 0; i < rooms.length; i++) {
			createWay(rooms[i].leftUp, rooms[i].rightDown, this.field);
		}

		if (rooms.length > 1) {
			joinWay(this.field);
		}

		cleanUp(this.field);
	}

	function draw(context) {
		var width = context.canvas.width / this.x;
		var height = context.canvas.height / this.y;

		context.clearRect(0, 0, context.canvas.width, context.canvas.height);
		for (var i = 0; i < this.y; i++) {
			for (var j = 0; j < this.x; j++) {
				switch(this.field[i][j]) {
					case Dungeon.BORDER:
						context.fillStyle = "red";
						context.fillRect(j * width, i * height, width, height);
						break;
					case Dungeon.NONE:
						context.fillStyle = "black";
						context.strokeRect(j * width, i * height, width, height);
						break;
					case Dungeon.WALL:
						context.fillStyle = "black";
						context.fillRect(j * width, i * height, width, height);
						break;
					default:
						context.fillStyle = "blue";
						context.fillRect(j * width, i * height, width, height);
						break;
				}
			}
		}
	}

	function shuffle(list) {
		var i = list.length;

		while (--i) {
			var j = Math.floor(Math.random() * (i + 1));
			if (i == j) continue;
			var k = list[i];
			list[i] = list[j];
			list[j] = k;
		}

		return list;
	}

	function divineField(leftUp, rightDown, field) {
		var divinedField = [[{}, {}], [{}, {}]];
		if ((Math.abs(leftUp.x - rightDown.x) < Dungeon.AT_LEAST_SIZE*2  &&
					Math.abs(leftUp.y - rightDown.y) < Dungeon.AT_LEAST_SIZE*2)) {
			return;
		}
		else if (Math.abs(leftUp.x - rightDown.x) >= Dungeon.AT_LEAST_SIZE*2 &&
				Math.abs(leftUp.y - rightDown.y) >= Dungeon.AT_LEAST_SIZE*2) {
			if (Math.floor(Math.random()*100)%2 == 0) {
				//x divine
				divinedField = divX(leftUp, rightDown, field);
			}
			else {
				//y divine
				divinedField = divY(leftUp, rightDown, field);
			}
		}
		else if (Math.abs(leftUp.y - rightDown.y) < Dungeon.AT_LEAST_SIZE*2) {
			divinedField = divX(leftUp, rightDown, field);
		}
		else if (Math.abs(leftUp.x - rightDown.x) < Dungeon.AT_LEAST_SIZE*2) {
			divinedField = divY(leftUp, rightDown, field);
		}

		return divinedField;
	}

	function divX(leftUp, rightDown, field) {
		var divinedField = [[{}, {}], [{}, {}]];
		var distance = (rightDown.x - Dungeon.AT_LEAST_SIZE) - (leftUp.x + Dungeon.AT_LEAST_SIZE);
		var x = Math.floor(distance / 2) + (leftUp.x + Dungeon.AT_LEAST_SIZE);
		for (var i = leftUp.y; i <= rightDown.y; i++) {
			field[i][x] = Dungeon.BORDER;
		}
		divinedField[0][0] = {
			"x": leftUp.x,
			"y": leftUp.y
		};
		divinedField[0][1] = {
			"x": x-1,
			"y": rightDown.y
		};
		divinedField[1][0] = {
			"x": x+1,
			"y": leftUp.y
		};
		divinedField[1][1] = {
			"x": rightDown.x,
			"y": rightDown.y
		};

		return divinedField;
	}

	function divY(leftUp, rightDown, field) {
		var divinedField = [[{}, {}], [{}, {}]];
		var distance = (rightDown.y - Dungeon.AT_LEAST_SIZE) - (leftUp.y + Dungeon.AT_LEAST_SIZE);
		var y = Math.floor(distance / 2) + (leftUp.y + Dungeon.AT_LEAST_SIZE);
		for (var i = leftUp.x; i <= rightDown.x; i++) {
			field[y][i] = Dungeon.BORDER;
		}
		divinedField[0][0] = {
			"x": leftUp.x,
			"y": leftUp.y
		};
		divinedField[0][1] = {
			"x": rightDown.x,
			"y": y-1
		};
		divinedField[1][0] = {
			"x": leftUp.x,
			"y": y+1
		};
		divinedField[1][1] = {
			"x": rightDown.x,
			"y": rightDown.y
		};

		return divinedField;
	}

	function createRoom(leftUp, rightDown, field) {
		var room = {
			"leftUp": {
				"x": 0,
				"y": 0
			},
			"rightDown": {
				"x": 0,
				"y": 0
			}
		};

		if (rightDown.x - leftUp.x <= Dungeon.AT_LEAST_SIZE) {
			room.leftUp.x = leftUp.x + 1;
			room.rightDown.x = rightDown.x - 1;
		}
		else {
			var distance = rightDown.x - leftUp.x - 1;
			var x = [];
			do {
				x[0] = Math.floor(Math.random() * distance) + leftUp.x + 1;
				x[1] = Math.floor(Math.random() * distance) + leftUp.x + 1;
			} while(Math.abs(x[0] - x[1]) < Dungeon.ROOM_SIZE);
			room.leftUp.x = Math.min(x[0], x[1]);
			room.rightDown.x = Math.max(x[0], x[1]);
		}

		if (rightDown.y - leftUp.y <= Dungeon.AT_LEAST_SIZE) {
			room.leftUp.y = leftUp.y + 1;
			room.rightDown.y = rightDown.y - 1;
		}
		else {
			var distance = rightDown.y - leftUp.y - 1;
			var y = [];
			do {
				y[0] = Math.floor(Math.random() * distance) + leftUp.y + 1;
				y[1] = Math.floor(Math.random() * distance) + leftUp.y + 1;
			} while(Math.abs(y[0] - y[1]) < Dungeon.ROOM_SIZE);
			room.leftUp.y = Math.min(y[0], y[1]);
			room.rightDown.y = Math.max(y[0], y[1]);
		}

		for (var i = room.leftUp.y; i <= room.rightDown.y; i++) {
			for (var j = room.leftUp.x; j <= room.rightDown.x; j++) {
				field[i][j] = Dungeon.NONE;
			}
		}

		return room;
	}

	function createWay(leftUp, rightDown, field) {
		for (var i = leftUp.x; i >= 0; i--) {
			if (field[leftUp.y][i] == Dungeon.BORDER) {
				var distance = rightDown.y - leftUp.y;
				var y = Math.floor(Math.random() * distance) + leftUp.y;
				for (var j = leftUp.x; j > i; j--) {
					field[y][j] = Dungeon.NONE;
				}
				break;
			}
		}
		for (var i = rightDown.x; i < field[0].length; i++) {
			if (field[rightDown.y][i] == Dungeon.BORDER) {
				var distance = rightDown.y - leftUp.y;
				var y = Math.floor(Math.random() * distance) + leftUp.y;
				for (var j = rightDown.x; j < i; j++) {
					field[y][j] = Dungeon.NONE;
				}
				break;
			}
		}
		for (var i = leftUp.y; i >= 0; i--) {
			if (field[i][leftUp.x] == Dungeon.BORDER) {
				var distance = rightDown.x - leftUp.x;
				var x = Math.floor(Math.random() * distance) + leftUp.x;
				for (var j = leftUp.y; j > i; j--) {
					field[j][x] = Dungeon.NONE;
				}
				break;
			}
		}
		for (var i = rightDown.y; i < field.length; i++) {
			if (field[i][rightDown.x] == Dungeon.BORDER) {
				var distance = rightDown.x - leftUp.x;
				var x = Math.floor(Math.random() * distance) + leftUp.x;
				for (var j = rightDown.y; j < i; j++) {
					field[j][x] = Dungeon.NONE;
				}
				break;
			}
		}
	}

	function joinWay(field) {
		for (var i = 1; i < field[0].length-1; i++) {
			if (field[0][i] === Dungeon.BORDER) {
				checkPortraitOnBorder({"x": i, "y": 0}, field, true);
			}
		}
		for (var i = 1; i < field.length-1; i++) {
			if (field[i][0] === Dungeon.BORDER) {
				checkHorizontalOnBorder({"x": 0, "y": i}, field, true);
			}
		}
	}

	function checkPortraitOnBorder(start, field, goDown) {
		var buffer = null;
		if (goDown) {
			for (var j = start.y; j < field.length; j++) {
				if (field[j][start.x] == Dungeon.WALL) {
					break;
				}

				var left = field[j][start.x - 1];
				var right = field[j][start.x + 1];
				//field[j][start.x] = Dungeon.WALL;
				if (left === Dungeon.NONE || right === Dungeon.NONE) {
					if (buffer) {
						for (var k = buffer.y; k <= j; k++) {
							field[k][start.x] = Dungeon.NONE;
						}
					}
					buffer = {"x": start.x, "y": j};
				}
				if (left === Dungeon.BORDER) {
					checkHorizontalOnBorder({"x": start.x-1, "y": j}, field, false);
				}
				if (right === Dungeon.BORDER) {
					checkHorizontalOnBorder({"x": start.x+1, "y": j}, field, true);
				}
			}
		}
		else {
			for (var j = start.y; j >= 0; j--) {
				if (field[j][start.x] == Dungeon.WALL) {
					break;
				}

				var left = field[j][start.x - 1];
				var right = field[j][start.x + 1];
				//field[j][start.x] = Dungeon.WALL;
				if (left === Dungeon.NONE || right === Dungeon.NONE) {
					if (buffer) {
						for (var k = buffer.y; k >= j; k--) {
							field[k][start.x] = Dungeon.NONE;
						}
					}
					buffer = {"x": start.x, "y": j};
				}
				if (left === Dungeon.BORDER) {
					checkHorizontalOnBorder({"x": start.x-1, "y": j}, field, true);
				}
				if (right === Dungeon.BORDER) {
					checkHorizontalOnBorder({"x": start.x+1, "y": j}, field, false);
				}
			}
		}

		if (buffer) {
			field[buffer.y][buffer.x] = Dungeon.NONE;
		}
	}

	function checkHorizontalOnBorder(start, field, goRight) {
		var buffer = null;
		if (goRight) {
			for (var j = start.x; j < field[0].length; j++) {
				if (field[start.y][j] == Dungeon.WALL) {
					break;
				}

				var up = field[start.y - 1][j];
				var down = field[start.y + 1][j];
				//field[start.y][j] = Dungeon.WALL;
				if (up === Dungeon.NONE || down === Dungeon.NONE) {
					if (buffer) {
						for (var k = buffer.x; k <= j; k++) {
							field[start.y][k] = Dungeon.NONE;
						}
					}
					buffer = {"x": j, "y": start.y};
				}
				if (up === Dungeon.BORDER) {
					checkPortraitOnBorder({"x": j, "y": start.y-1}, field, false);
				}
				if (down === Dungeon.BORDER) {
					checkPortraitOnBorder({"x": j, "y": start.y+1}, field, true);
				}
			}
		}
		else {
			for (var j = start.x; j >= 0; j--) {
				if (field[start.y][j] == Dungeon.WALL) {
					break;
				}

				var up = field[start.y - 1][j];
				var down = field[start.y + 1][j];
				//field[start.y][j] = Dungeon.WALL;
				if (up === Dungeon.NONE || down === Dungeon.NONE) {
					if (buffer) {
						for (var k = buffer.x; k >= j; k--) {
							field[start.y][k] = Dungeon.NONE;
						}
					}
					buffer = {"x": j, "y": start.y};
				}
				if (up === Dungeon.BORDER) {
					checkPortraitOnBorder({"x": j, "y": start.y-1}, field, false);
				}
				if (down === Dungeon.BORDER) {
					checkPortraitOnBorder({"x": j, "y": start.y+1}, field, true);
				}
			}
		}

		if (buffer) {
			field[buffer.y][buffer.x] = Dungeon.NONE;
		}
	}

	function cleanUp(field) {
		for (var i = 0; i < field.length; i++) {
			for (var j = 0; j < field[i].length; j++) {
				if (field[i][j] === Dungeon.BORDER) {
					field[i][j] = Dungeon.WALL;
				}
			}
		}
	}

	Dungeon.BORDER = -1;
	Dungeon.NONE   =  0;
	Dungeon.WALL   =  1;

	Dungeon.ROOM_SIZE = 6;
	Dungeon.AT_LEAST_SIZE = Dungeon.ROOM_SIZE + 2;

	Dungeon.prototype.draw = draw;

	global.Dungeon = Dungeon;
})(this.self || global);
