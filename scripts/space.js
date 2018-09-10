// Author: Aviral Gupta

var game = (function() {

	var	CANVAS_WIDTH = 600;
	var	CANVAS_HEIGHT = 600;
	var	canvasElement = $("<canvas width='" + CANVAS_WIDTH + "' height='"+ CANVAS_HEIGHT +"'></canvas>");
	var	canvas = canvasElement.get(0).getContext("2d");
	canvasElement.appendTo('body');
	var	FPS = 30;
	canvas.font = "20px Georgia";
	
	//For Game Styling	
	var wWidth = $(window).width();
	var wHeight = $(window).height();
	$("canvas").addClass("canvasClass");
	$("particles-js-canvas-el").removeClass("canvasClass");
	var mLeft = wWidth/2 - CANVAS_WIDTH/2;
	var mTop = wHeight/2 - CANVAS_HEIGHT/2;
	$(".canvasClass").css("margin-left", mLeft + "px");
	$(".canvasClass").css("margin-top", mTop + "px");
	//Game Styling Ends

	var scoreboard = {
		score: 0,
		x: CANVAS_WIDTH - 110,
		y: 50,
		draw: function() {
			canvas.fillStyle = "white";
			canvas.fillText("Score:\n" + this.score, this.x, this.y);
		}
	};

	var lives = {
		livesLeft: 3,
		x: CANVAS_WIDTH - 110,
		y: 80,
		draw: function() {
			canvas.fillStyle = "white";
			canvas.fillText("Lives Left:\n" + this.livesLeft, this.x, this.y);
		}
	}

	var playerLevel = {
		level: 1,
		nextLevelScore: 100,
		x: CANVAS_WIDTH - 100,
		y: 110,
		draw: function() {
			canvas.fillStyle = "white";
			canvas.fillText("Level:\n" + this.level, this.x, this.y);
		}	
	}

	var player = {
		color: "#00A",
		x: CANVAS_WIDTH/2 - 20,
		y: CANVAS_HEIGHT - 50,
		width: 32,
		height: 32,
		draw: function() {
			canvas.fillStyle = this.color;
			canvas.fillRect(this.x, this.y, this.width, this.height);
		}
	};

	player.shoot = function() {
		Sound.play("shoot");
		var bulletPosition = this.midpoint();
		playerBullets.push(Bullet({
			speed: 5,
			x: bulletPosition.x,
			y: bulletPosition.y
		}));
	};

	player.midpoint = function() {
		return {
			x: this.x + this.width/2,
			y: this.y + this.height/2
		};
	};

	player.sprite = Sprite("player");

	player.draw = function() {
		this.sprite.draw(canvas, this.x, this.y);	
	};

	player.explode = function() {
		this.active = false;
		Sound.play("explosion");
	};

	var playerBullets = [];
	var enemies = [];
	var newEnemies = [];

	function reset() {
		scoreboard.score = 0;
		lives.livesLeft = 3;
		playerBullets = [];
		enemies = [];
		newEnemies = [];
		player.x = 220;
		playerLevel.level = 1;
		playerLevel.nextLevelScore = 100;
	}

	function update() {
		if(keydown.space) {
			player.shoot();
		}
		if(keydown.left) {
			player.x -= 5;
		}
		if(keydown.right) {
			player.x += 5;
		}
		player.x = player.x.clamp(0, CANVAS_WIDTH - player.width);

		playerBullets.forEach(function(bullet) {
			bullet.update();
		});

		enemies.forEach(function(enemy) {
			enemy.update();
		});

		newEnemies.forEach(function(newEnemy) {
			newEnemy.update();
		});

		handleCollisions();

		playerBullets = playerBullets.filter(function(bullet) {
			return bullet.active;
		});

		enemies = enemies.filter(function(enemy) {
			return enemy.active;
		});
		newEnemies = newEnemies.filter(function(newEnemy) {
			return newEnemy.active;
		});
		if(Math.random() < 0.1) {
			enemies.push(Enemy());
		}
		if(Math.random() < 0.04) {
			newEnemies.push(newEnemy());
		}
		if(lives.livesLeft <= 0) {
			alert("Game Over\nClick OK to Restart");
			reset();
		}
		if(scoreboard.score >= playerLevel.nextLevelScore) {
			playerLevel.level +=1;
			playerLevel.nextLevelScore = playerLevel.nextLevelScore * 5;
		}
	}

	function draw() {
		canvas.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
		player.draw();
		playerBullets.forEach(function(bullet) {
			bullet.draw();
		});
		enemies.forEach(function(enemy) {
			enemy.draw();
		});
		newEnemies.forEach(function(newEnemy) {
			newEnemy.draw();
		});
		scoreboard.draw();
		lives.draw();
		playerLevel.draw();
	}

	function Bullet(I) {
		I.active = true;
		I.xVelocity = 0;
		I.yVelocity = -I.speed;
		I.width = 3;
		I.height = 3;
		I.color = "red";
		I.inBounds = function() {
			return I.x >= 0 && I.x <= CANVAS_WIDTH && I.y >= 0 && I.y <= CANVAS_HEIGHT;
		};
		I.draw = function() {
			canvas.fillStyle = this.color;
			canvas.fillRect(this.x, this.y, this.width, this. height);
		};
		I.update = function() {
			I.x += I.xVelocity;
			I.y += I.yVelocity;
			I.active = I.active && I.inBounds();
		};
		return I;	
	}

	function Enemy(I) {
		I = I || {};
		I.active = true;
		I.age = Math.floor(Math.random() * 128);
		I.color = "#A2B";
		I.x = CANVAS_WIDTH/4 + Math.random() * CANVAS_WIDTH/2;
		I.y = 0;
		I.xVelocity = 0;
		I.yVelocity = 2 * playerLevel.level;
		I.width = 32;
		I.height = 32;
		I.inBounds = function() {
			return I.x >= 0 && I.x <= CANVAS_WIDTH && I.y >= 0 && I.y <= CANVAS_HEIGHT;
		};
		I.sprite = Sprite("enemy");
		I.draw = function() {
			this.sprite.draw(canvas, this.x, this.y);
		};
		I.update = function() {
			I.x += I.xVelocity;
			I.y += I.yVelocity;

			I.xVelocity = 3 * Math.sin(I.age * Math.PI / 64);

			I.age++;
			I.active = I.active && I.inBounds();
		};
		I.explode = function() {
			Sound.play("explosion");
			this.active = false;
		};

		return I;
	}

	function newEnemy(I) {
		I = I || {};
		I.active = true;
		I.age = Math.floor(Math.random() * 128);
		I.color = "#A2B";
		I.x = CANVAS_WIDTH/4 + Math.random() * CANVAS_WIDTH/2;
		I.y = 0;
		I.xVelocity = 0;
		I.yVelocity = 2 * playerLevel.level;
		I.width = 32;
		I.height = 32;
		I.inBounds = function() {
			return I.x >= 0 && I.x <= CANVAS_WIDTH && I.y >= 0 && I.y <= CANVAS_HEIGHT;
		};
		I.sprite = Sprite("monster");
		I.draw = function() {
			this.sprite.draw(canvas, this.x, this.y);
		};
		I.update = function() {
			I.x += I.xVelocity;
			I.y += I.yVelocity;

			I.xVelocity = 3 * Math.sin(I.age * Math.PI / 64);

			I.age++;
			I.active = I.active && I.inBounds();
		};
		I.explode = function() {
			Sound.play("explosion");
			this.active = false;
		};

		return I;
	}

	function collides(a, b) {
		return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
	}
	
	function handleCollisions() {
		playerBullets.forEach(function(bullet) {
			enemies.forEach(function(enemy) {
				if (collides(bullet, enemy)) {
					enemy.explode();
					bullet.active = false;
					scoreboard.score +=10;
				}
			});
			newEnemies.forEach(function(newEnemy) {
				if (collides(bullet, newEnemy)) {
					newEnemy.explode();
					bullet.active = false;
					scoreboard.score +=20;
				}
			});
		});

		enemies.forEach(function(enemy) {
			if(collides(enemy, player)) {
				enemy.explode();
				player.explode();
				lives.livesLeft -=1;
			}
			else if(enemy.y >= CANVAS_HEIGHT) {
				lives.livesLeft -=1;
				enemy.active = false;
			}
		});

		newEnemies.forEach(function(newEnemy) {
			if(collides(newEnemy, player)) {
				newEnemy.explode();
				player.explode();
				lives.livesLeft -=1;
			}
			else if(newEnemy.y >= CANVAS_HEIGHT) {
				lives.livesLeft -=1;
				newEnemy.active = false;
			}
		});
	}

	function init() {

		setInterval(function () {
			update();
			draw();
		}, 1000/FPS);	
	}
	return {
		init : init,
	};
})();





















