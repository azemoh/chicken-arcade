"use strict";

var ENEMY_COUNT = 5,
	LIFE_COUNT = 4,
	ENEMY_INIT_X = -200,
	MOVE_X = 101,
	MOVE_Y = 83,
	PLAYER_INIT_X = 202,
	PLAYER_INIT_Y = 422,
	ENTITY_HEIGHT = 50,
	ENTITY_WIDTH = 90,
	CANVAS_OFFSET = 90,
	CANVAS_WIDTH = 505,
	CANVAS_HEIGHT = 584;

var sprites = {
	player: 'images/chicken.png',
	playerDead: 'images/chicken-dead.png',
	enemy1: 'images/enemy-car-1.png',
	enemy2: 'images/enemy-car-2.png',
	enemy3: 'images/enemy-car-3.png'
};

//Helper functions

var randomNo = function () {
	return Math.floor((Math.random() * 300) + 50);
};

/* Helper function to place enemies at random Y positions
 * return: float
 */
var random_Y = function () {
	return CANVAS_OFFSET + Math.floor(Math.random() * 3) * MOVE_Y;
};

/* Helper function to return random enemy images.
 * return: string
 */
var randomEnemyImage = function () {
	var sprite = Math.random();
	
	if (0 <= sprite && sprite <= 0.33) {
		sprite = sprites.enemy1;
	} else if (0.34 <= sprite && sprite <= 0.66) {
		sprite = sprites.enemy2;
	} else {
		sprite = sprites.enemy3;
	}
	
	return sprite;
};

/* Enemy class to create enemy instances
 */
var Enemy = function () {
	this.sprite = randomEnemyImage();
	this.y = random_Y();
	this.x = ENEMY_INIT_X;
	this.height = ENTITY_HEIGHT;
	this.width = ENTITY_WIDTH;
	this.speed = randomNo();
};

/* Update the enemy's position
 * param: dt, a time delta between ticks
 */
Enemy.prototype.update = function (dt) {
	// x is multiplied by the dt parameter
	// which ensures the game runs at the same speed for all computers.
	this.x = this.x + this.speed * dt;
	// Return enemy to the start when they go out of screen
	// Change enemy image, speed and y position.
	if (this.x > CANVAS_WIDTH) {
		this.x = ENEMY_INIT_X;
		this.sprite = randomEnemyImage();
		this.speed = randomNo();
		this.y = random_Y();
	}
};

// Draw the enemy on the screen
Enemy.prototype.render = function () {
	ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

/* Static function to create enemies
 * return: Enemy[]
 */
Enemy.createEnemies = function () {
	var enemies = [];
	for (var i = 0; i < ENEMY_COUNT; i++ ) {
		var enemy = new Enemy();
		enemies.push(enemy)
	}
	return enemies;
};

/* Player class to create player entities
 */
var Player = function () {
	this.sprite = sprites.player;
	this.x = PLAYER_INIT_X;
	this.y = PLAYER_INIT_Y;
	this.height = ENTITY_HEIGHT;
	this.width = ENTITY_WIDTH;
	this.lives = LIFE_COUNT;
	this.score = 0;
};

// Draw player on the screen
Player.prototype.render = function () {
	ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// Return player to initial position
Player.prototype.reset = function () {
	game.isOn = true;
	this.x = PLAYER_INIT_X;
	this.y = PLAYER_INIT_Y;
	this.sprite = sprites.player;
};

// When player crosses the road
Player.prototype.win = function () {
	this.score += 10;
	game.updateScore();
	this.reset();
};

/* Player dies and looses 1 life,
 * also check if player still have lives.
 */
Player.prototype.die = function () {
	game.isOn = false;
	
	this.lives -= 1;
	game.lives.pop();
	this.sprite = sprites.playerDead;
	
	if(this.lives > 0) {
		var player = this;
		setTimeout(function () {
			player.reset()
		}, 150);
	} else if (this.lives === 0) {
		game.over();
	}
};

/* handle key input and update player position
 * param: key@string
 */
Player.prototype.update = function (key) {
	
	if (game.isOn) {
		switch (key) {
			case 'up':
				this.y -= MOVE_Y;
				break;
			case 'down':
				this.y += MOVE_Y;
				if (this.y > PLAYER_INIT_Y) this.y = PLAYER_INIT_Y;
				break;
			case 'left':
				this.x -= MOVE_X;
				if (this.x < 0) this.x = 0;
				break;
			case 'right':
				this.x += MOVE_X;
				if (this.x > CANVAS_WIDTH - this.width) this.x = CANVAS_WIDTH - MOVE_X;
				break;
		}
		// player gets to the top
		if (this.y < CANVAS_OFFSET) {
			this.win()
		}
		
	} else if (key == 'space') {
		game.isOn = true;
		game.reset();
	}
	
};
/* Life class to create life instances
 * param: x@float
 */
var Life = function (x) {
	this.sprite = 'images/heart.png';
	this.x = x;
	this.y = -8;
	this.width = 101/3;
	this.height = 171/3;
};

/* Static function to create life instances
 * return: Life[]
 */
Life.addLives = function () {
	var lives = [];
	for (var i = 0; i < LIFE_COUNT; i++) {
		lives.push(new Life(10 + i * 40));
	}
	return lives;
};

// Draw lives on the screen
Life.prototype.render = function() {
  ctx.drawImage(Resources.get(this.sprite), this.x, this.y, this.width, this.height);
};

/* This listens for key presses and sends the keys to
 * Player.update() method
 */
document.addEventListener('keyup', function (e) {
	var allowedKeys = {
		32: 'space',
		37: 'left',
		38: 'up',
		39: 'right',
		40: 'down'
	};

	player.update(allowedKeys[e.keyCode]);
});

// Initialize the game
var game = {
	enemies: Enemy.createEnemies(),
	lives: Life.addLives(),
	isOn: true
};

var gameScreen = document.createElement('div'),
	scoreBoard = document.createElement('div'),
	gameOverBanner = document.createElement('div');

// Run the game
game.init = function () {
	gameScreen.id = 'game';
	gameScreen.style.height = CANVAS_HEIGHT + 'px';
	gameScreen.style.width = CANVAS_WIDTH + 'px';
	document.body.appendChild(gameScreen);
	
	gameOverBanner.innerHTML = 'Game Over! <br> Hit space to try again.';
	gameOverBanner.id = 'game-over';
	scoreBoard.id = 'score';
	
	this.updateScore();
	gameScreen.appendChild(scoreBoard);
};

// Update scoreboard
game.updateScore = function () {
	scoreBoard.innerHTML = 'Score: ' + player.score;
};

// Game Over function
game.over = function () {
	gameScreen.appendChild(gameOverBanner);
	this.enemies = [];
};

// Reset game
game.reset = function () {
	gameScreen.removeChild(gameOverBanner);
	player.reset();
	player.lives = LIFE_COUNT;
	player.score = 0;
	this.updateScore()
	this.enemies = Enemy.createEnemies();
	this.lives = Life.addLives();
};

// create player instance
var player = new Player();
game.init();
