// Function where rendering is done
var socket = io();

var players = {};
var playerCount = 0;
var myTank = 'red_tank.png';
var blueTank = 'blue_tank.png';

// Function to add a new player
function addPlayer(tankImage, pos, playerLayer, visible = true) {
  var player = new PixelJS.Player();
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
  console.log('Player added:', player);
  playerLayer.redraw = true;
}

// Handle new player joining
socket.on('new player', function (data) {
  console.log('New player joined:', data);
  myTank = data.tankImage;
  playerCount++;
  if (playerCount === 2) {
    players[blueTank].visible = true;
    console.log('Blue player is now visible');
  }
});

// Handle player movement
socket.on('player move', function (data) {
  console.log('Player move:', data);
  let playerToMove = players[data.tankImage];
  if (playerToMove) {
    if (data.direction === 'up') {
      playerToMove.pos.y -= playerToMove.velocity.y * data.amount;
    }
    if (data.direction === 'down') {
      playerToMove.pos.y += playerToMove.velocity.y * data.amount;
    }
    if (data.direction === 'left') {
      playerToMove.pos.x -= playerToMove.velocity.x * data.amount;
    }
    if (data.direction === 'right') {
      playerToMove.pos.x += playerToMove.velocity.x * data.amount;
    }
  }
});

document.onreadystatechange = function () {
  if (document.readyState == 'complete') {
    var game = new PixelJS.Engine();
    game.init({
      container: 'game_container',
      width: 800,
      height: 600,
    });

    // Background layer setup
    let backgroundLayer = game.createLayer('background');
    let grass = backgroundLayer.createEntity();
    backgroundLayer.static = true;
    grass.pos = { x: 0, y: 0 };
    grass.asset = new PixelJS.Tile();
    grass.asset.prepare({
      name: 'grass.png',
      size: {
        width: 800,
        height: 600,
      },
    });

    console.log('Background layer:', backgroundLayer);

    var playerLayer = game.createLayer('items');

    // Initial player setup
    addPlayer(myTank, { x: 200, y: 300 }, playerLayer);
    addPlayer(blueTank, { x: 400, y: 300 }, playerLayer, false); // Add blue player initially invisible

    // Movement state for both players
    let keys = {};

    // Function to capture player movement
    function move() {
      if (keys['w']) {
        socket.emit('player move', {
          tankImage: myTank,
          direction: 'up',
          amount: 1,
        });
      }
      if (keys['s']) {
        socket.emit('player move', {
          tankImage: myTank,
          direction: 'down',
          amount: 1,
        });
      }
      if (keys['a']) {
        socket.emit('player move', {
          tankImage: myTank,
          direction: 'left',
          amount: 1,
        });
      }
      if (keys['d']) {
        socket.emit('player move', {
          tankImage: myTank,
          direction: 'right',
          amount: 1,
        });
      }
    }

    // Event listeners for key press and release
    document.addEventListener('keydown', function (event) {
      keys[event.key] = true;
    });

    document.addEventListener('keyup', function (event) {
      keys[event.key] = false;
    });

    // Game loop
    game.loadAndRun(function (elapsedTime, dt) {
      move();
    });
  }
};