// src/main.js

import Phaser from "phaser";

// Game configuration
const config = {
  type: Phaser.AUTO,
  width: 600,
  height: 600,
  parent: "game-container",
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
  pixelArt: true, // Ensures crisp pixel art rendering
  backgroundColor: "#000000",
};

// Initialize the game
const game = new Phaser.Game(config);

// Game variables
let player;
let enemies;
let road;
let cursors;
let score = 0;
let scoreText;
let gameOver = false;

// Preload assets
function preload() {
  this.load.image("player", "assets/player_car.png");
  this.load.image("enemy1", "assets/car_purple.png");
  this.load.image("enemy2", "assets/car_red.png");
  this.load.image("enemy3", "assets/car_green.png"); // Added new enemy car
  this.load.image("road", "assets/road.png");
}

// Create game objects
function create() {
  // Add road background (scrolling)
  road = this.add
    .tileSprite(0, 0, config.width, config.height, "road")
    .setOrigin(0, 0);

  // Add player
  player = this.physics.add.sprite(
    config.width / 2,
    config.height - 64,
    "player"
  );
  player.setCollideWorldBounds(true); // Prevent player from leaving the screen

  // Add enemy group
  enemies = this.physics.add.group();

  // Input
  cursors = this.input.keyboard.createCursorKeys();

  // Score text
  scoreText = this.add.text(10, 10, "Score: 0", {
    fontSize: "20px",
    fill: "#fff",
  });

  // Spawn enemies periodically
  this.time.addEvent({
    delay: 1000, // Spawn every 1 second
    callback: spawnEnemy,
    callbackScope: this,
    loop: true,
  });

  // Collision detection
  this.physics.add.overlap(player, enemies, handleCollision, null, this);
}

// Update game state
function update() {
  if (gameOver) {
    return;
  }

  // Scroll road background
  road.tilePositionY -= 3; // Adjust speed for scrolling effect

  // Player movement
  const speed = 5;
  if (cursors.left.isDown) {
    player.setVelocityX(-speed * 60); // Multiply by 60 to convert to pixels/second
  } else if (cursors.right.isDown) {
    player.setVelocityX(speed * 60);
  } else {
    player.setVelocityX(0);
  }

  // Update enemies (remove off-screen enemies and increase score)
  enemies.getChildren().forEach((enemy) => {
    if (enemy.y > config.height) {
      enemy.destroy();
      score += 10;
      scoreText.setText(`Score: ${score}`);
    }
  });
}

// Spawn a new enemy
function spawnEnemy() {
  const enemyTypes = ["enemy1", "enemy2", "enemy3"]; // Added new enemy type
  const enemyType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
  const enemy = enemies.create(
    Phaser.Math.Between(0, config.width),
    -32,
    enemyType
  );
  enemy.setVelocityY(180); // Speed of enemies moving downward
}

// Handle collision between player and enemy
function handleCollision(player, enemy) {
  this.physics.pause(); // Pause the game
  gameOver = true;

  // Display game over text
  const gameOverText = this.add
    .text(config.width / 2 - 100, config.height / 2, "Game Over!", {
      fontSize: "40px",
      fill: "#ff0000",
    })
    .setOrigin(0.5);

  // Optional: Add restart button
  const restartButton = this.add
    .text(config.width / 2 - 50, config.height / 2 + 50, "Restart", {
      fontSize: "20px",
      fill: "#fff",
    })
    .setOrigin(0.5)
    .setInteractive();

  restartButton.on("pointerdown", () => {
    this.scene.restart();
    gameOver = false;
    score = 0;
    scoreText.setText("Score: 0");
  });
}
