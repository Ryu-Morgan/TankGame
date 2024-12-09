// Function where rendering is done
let socket = io();

let players = {};
let playerCount = 0;
let tanks = ["red_tank.jpg", "blue_tank.jpg"];
let lastDirections = {
  "red_tank.jpg": "right",
  "blue_tank.jpg": "left",
};

// get the number of players in the room
function getPlayersInRoom(roomID) {
  return fetch(`/api/room/${roomID}`)
    .then((response) => response.json())
    .then((data) => data.playerCount);
}

// Get the room ID and tankImage from the query parameters
let urlParams = new URLSearchParams(window.location.search);
let roomID = urlParams.get("roomId");

socket.emit("simple join", roomID);
// assign enemyTank to the tank that is not myTank

function addPowerUp(pos, playerLayer) {
  let powerUp = playerLayer.createEntity();
  powerUp.pos = pos;
  powerUp.size = { width: 100, height: 100 };
  powerUp.asset = new PixelJS.AnimatedSprite();
  powerUp.asset.prepare({
    name: "power_up.png",
    frames: 1,
    rows: 1,
    speed: 20,
    defaultFrame: 1,
  });

  playerLayer.registerCollidable(powerUp);

  console.log("Power-up added:", powerUp);
  return powerUp;
}

function addPlayer(tankImage, pos, playerLayer, visible = true) {
  let player = new PixelJS.Player();
  player.addToLayer(playerLayer);
  player.pos = pos;
  player.size = { width: 32, height: 32 };
  player.velocity = { x: 1, y: 1 };
  player.asset = new PixelJS.AnimatedSprite();
  player.asset.prepare({
    name: tankImage,
    frames: 3,
    rows: 4,
    speed: 100,
    defaultFrame: 1,
  });
  player.visible = visible;

  players[tankImage] = player;
  playerLayer.registerCollidable(player);
  console.log("Player added:", player);
}

function addBullet(pos, playerLayer) {
  let bullet = playerLayer.createEntity();
  bullet.pos = pos;
  bullet.size = { width: 5, height: 2 };
  bullet.asset = new PixelJS.AnimatedSprite();
  bullet.asset.prepare({
    name: "bullet.png",
    frames: 1,
    rows: 1,
    speed: 20,
    defaultFrame: 1,
  });

  playerLayer.registerCollidable(bullet);

  console.log("Bullet added:", bullet);
  return bullet;
}

function addHorizontalWall(pos, playerLayer) {
  let wall = playerLayer.createEntity();
  wall.pos = pos;
  wall.size = { width: 100, height: 10 };
  wall.asset = new PixelJS.AnimatedSprite();
  wall.asset.prepare({
    name: "wall_top.png",
    frames: 1,
    rows: 1,
    speed: 20,
    defaultFrame: 1,
  });

  playerLayer.registerCollidable(wall);

  console.log("Bullet added:", wall);
  return wall;
}

function addVerticalWall(pos, playerLayer) {
  let wall = playerLayer.createEntity();
  wall.pos = pos;
  wall.size = { width: 10, height: 100 };
  wall.asset = new PixelJS.AnimatedSprite();
  wall.asset.prepare({
    name: "wall_right.png",
    frames: 1,
    rows: 1,
    speed: 20,
    defaultFrame: 1,
  });

  playerLayer.registerCollidable(wall);

  console.log("Bullet added:", wall);
  return wall;
}

// Handle player movement
socket.on("player move", function (data) {
  // console.log(data);
  let playerToMove = players[data.tankImage];
  if (playerToMove) {
    if (data.direction === "up") {
      playerToMove.pos.y -= playerToMove.velocity.y * data.amount;
    }
    if (data.direction === "down") {
      playerToMove.pos.y += playerToMove.velocity.y * data.amount;
    }
    if (data.direction === "left") {
      playerToMove.pos.x -= playerToMove.velocity.x * data.amount;
    }
    if (data.direction === "right") {
      playerToMove.pos.x += playerToMove.velocity.x * data.amount;
    }
    lastDirections[data.tankImage] = data.direction; // Update last direction
  }
});

socket.on;

let i = 0;
socket.on("player shoot", function (data) {
  let playerShooting = players[data.tankImage];
  if (playerShooting) {
    let bulletData = bullets.find((bulletData) => !bulletData.bullet.visible);
    if (!bulletData) {
      bulletData = bullets[i];
      i++;
      if (i >= bullets.length) {
        i = 0;
      }
    }

    bulletData.direction = lastDirections[data.tankImage]; // Set bullet direction

    if (bulletData.direction === "right") {
      bulletData.bullet.pos = {
        x: playerShooting.pos.x + playerShooting.size.width,
        y:
          playerShooting.pos.y +
          playerShooting.size.height / 2 -
          bulletData.bullet.size.height / 2,
      };
    } else if (bulletData.direction === "left") {
      bulletData.bullet.pos = {
        x: playerShooting.pos.x - bulletData.bullet.size.width,
        y:
          playerShooting.pos.y +
          playerShooting.size.height / 2 -
          bulletData.bullet.size.height / 2,
      };
    } else if (bulletData.direction === "up") {
      bulletData.bullet.pos = {
        x:
          playerShooting.pos.x +
          playerShooting.size.width / 2 -
          bulletData.bullet.size.width / 2,
        y: playerShooting.pos.y - bulletData.bullet.size.height,
      };
    } else if (bulletData.direction === "down") {
      bulletData.bullet.pos = {
        x:
          playerShooting.pos.x +
          playerShooting.size.width / 2 -
          bulletData.bullet.size.width / 2,
        y: playerShooting.pos.y + playerShooting.size.height,
      };
    }

    bulletData.bullet.visible = true;
  }
});

document.onreadystatechange = function () {
  if (document.readyState == "complete") {
    let game = new PixelJS.Engine();
    game.init({
      container: "game_container",
      width: 800,
      height: 600,
    });

    // Background layer setup
    let backgroundLayer = game.createLayer("background");
    let grass = backgroundLayer.createEntity();
    backgroundLayer.static = true;
    grass.pos = { x: 0, y: 0 };
    grass.asset = new PixelJS.Tile();
    grass.asset.prepare({
      name: "grass.png",
      size: {
        width: 800,
        height: 600,
      },
    });

    console.log("Background layer:", backgroundLayer);

    let playerLayer = game.createLayer("players");

    let powerUp = addPowerUp({ x: 490, y: 350 }, playerLayer);

    // Initial player setup
    addPlayer("red_tank.jpg", { x: 200, y: 300 }, playerLayer);
    addPlayer("blue_tank.jpg", { x: 450, y: 300 }, playerLayer); // Add blue player initially invisible

    bullets = [];
    
    let walls = [];

    // Walls around red tank
    walls.push(addHorizontalWall({ x: 175, y: 240 }, playerLayer));
    walls.push(addVerticalWall({ x: 265, y: 250 }, playerLayer));
    walls.push(addHorizontalWall({ x: 175, y: 350 }, playerLayer));

    // Walls around blue tank
    walls.push(addHorizontalWall({ x: 385, y: 240 }, playerLayer));
    walls.push(addVerticalWall({ x: 385, y: 250 }, playerLayer));
    walls.push(addHorizontalWall({ x: 385, y: 350 }, playerLayer));

    walls.push(addVerticalWall({ x: 209, y: 93 }, playerLayer));

    walls.push(addVerticalWall({ x: 440, y: 393 }, playerLayer));

    for (let i = 0; i < 10; i++) {
      bullets.push({
        bullet: addBullet({ x: i, y: 0 }, playerLayer),
        direction: "right",
      });
    }

    bullets.forEach((bulletData) => {
      bulletData.bullet.visible = false;
    });

    // Movement state for both players
    let keys = {};
    let lastShot = Date.now();
    // Function to capture player movement
    function move() {
      if (keys["w"]) {
        socket.emit("player move", {
          direction: "up",
          amount: 1,
          roomID: roomID,
        });
      }
      if (keys["s"]) {
        socket.emit("player move", {
          direction: "down",
          amount: 1,
          roomID: roomID,
        });
      }
      if (keys["a"]) {
        socket.emit("player move", {
          direction: "left",
          amount: 1,
          roomID: roomID,
        });
      }
      if (keys["d"]) {
        socket.emit("player move", {
          direction: "right",
          amount: 1,
          roomID: roomID,
        });
      }
      if (keys[" "]) {
        if (Date.now() - lastShot > 500) {
          socket.emit("player shoot", {
            roomID: roomID,
          });
          lastShot = Date.now();
        }
      }
    }

    // Event listeners for key press and release
    document.addEventListener("keydown", function (event) {
      keys[event.key] = true;
    });

    document.addEventListener("keyup", function (event) {
      keys[event.key] = false;
    });

    function moveBullets() {
      bullets.forEach((bulletData) => {
        if (bulletData.bullet.visible) {
          if (bulletData.direction === "right") {
            bulletData.bullet.pos.x += 5;
          } else if (bulletData.direction === "left") {
            bulletData.bullet.pos.x -= 5;
          } else if (bulletData.direction === "up") {
            bulletData.bullet.pos.y -= 5;
          } else if (bulletData.direction === "down") {
            bulletData.bullet.pos.y += 5;
          }

          if (
            bulletData.bullet.pos.x > 800 ||
            bulletData.bullet.pos.x < 0 ||
            bulletData.bullet.pos.y > 600 ||
            bulletData.bullet.pos.y < 0
          ) {
            bulletData.bullet.visible = false;
          }
        }
      });
    }

    bullets.forEach((bulletData) => {
      bulletData.bullet.onCollide(function (entity) {
        // Only hide if bullet isn't colliding with powerup
        if (entity === powerUp || bulletData.bullet.visible === false) {
          return;
        }
        console.log("Bullet hit:", entity);
        bulletData.bullet.visible = false;
        bulletData.bullet.pos = { x: 0, y: 0 };
        if (entity === players["red_tank.jpg"]) {
          console.log("Red tank hit!");
          health_tracker["red_tank.jpg"] -= 10;
        }
        if (entity === players["blue_tank.jpg"]) {
          console.log("Blue tank hit!");
          health_tracker["blue_tank.jpg"] -= 10;
        }
        scoreLayer.redraw = true;
        scoreLayer.drawText(
          "Red Health: " + health_tracker["red_tank.jpg"],
          200,
          50,
          '14pt "Trebuchet MS", Helvetica, sans-serif',
          "#FFFFFF",
          "left"
        );
        scoreLayer.drawText(
          "Blue Health: " + health_tracker["blue_tank.jpg"],
          400,
          50,
          '14pt "Trebuchet MS", Helvetica, sans-serif',
          "#FFFFFF",
          "left"
        );

        if (health_tracker["red_tank.jpg"] <= 0) {
          alert("Blue tank wins!");
          window.location.href = "/waiting/" + roomID;
          health_tracker["red_tank.jpg"] = 30;
        }
        if (health_tracker["blue_tank.jpg"] <= 0) {
          alert("Red tank wins!");
          window.location.href = "/waiting/" + roomID;
          health_tracker["blue_tank.jpg"] = 30;
        }
      });
    });

    var health_tracker = { "blue_tank.jpg": 30, "red_tank.jpg": 30 };
    var scoreLayer = game.createLayer("score");
    scoreLayer.static = true;
    scoreLayer.redraw = true;
    scoreLayer.drawText(
      "Red Health: " + health_tracker["red_tank.jpg"],
      200,
      50,
      '14pt "Trebuchet MS", Helvetica, sans-serif',
      "#FFFFFF",
      "left"
    );
    scoreLayer.drawText(
      "Blue Health: " + health_tracker["blue_tank.jpg"],
      400,
      50,
      '14pt "Trebuchet MS", Helvetica, sans-serif',
      "#FFFFFF",
      "left"
    );
    // Game loop
    game.loadAndRun(function (elapsedTime, dt) {
      move();
      moveBullets();

      // bullets.forEach((bulletData) => {
      //   if (bulletData.bullet.visible) {
      //     if (players["blue_tank.jpg"].collidesWith(bulletData.bullet)) {
      //       bulletData.bullet.visible = false;
      //       bulletData.bullet.pos = { x: 0, y: 0 };
      //     }
      //   }
      // });
    });
  }
};
