// Function where rendering is done

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

    let playerLayer = game.createLayer('players');
    var socket = io();

    let myTank = '';

    let players = {};

    socket.on('new player', function (data) {
      console.log('new player', data);
      myTank = data.tankImage;
      let player1 = new PixelJS.Player();
      player1.addToLayer(playerLayer);
      // if myTank is red_tank.png, , use x:200, y:300, if blue_tank.png, use x:400, y:300
      if (myTank === 'red_tank.png') {
        player1.pos = { x: 200, y: 300 };
      } else {
        player1.pos = { x: 400, y: 300 };
      }
      player1.size = { width: 32, height: 32 };
      player1.velocity = { x: 100, y: 100 };
      player1.asset = new PixelJS.AnimatedSprite();
      player1.asset.prepare({
        name: myTank,
        frames: 3,
        rows: 4,
        speed: 100,
        defaultFrame: 1,
      });
      players[myTank] = player1;
      playerLayer.registerCollidable(player1);
    });

    socket.on('player move', function (data) {
      let tankToMove = data.tankImage;
      let playerToMove = players[tankToMove];
      if (data.direction === 'up') {
        playerToMove.pos.y -= playerToMove.velocity.y * dt;
      }
      if (data.direction === 'down') {
        playerToMove.pos.y += playerToMove.velocity.y * dt;
      }
      if (data.direction === 'left') {
        playerToMove.pos.x -= playerToMove.velocity.x * dt;
      }
      if (data.direction === 'right') {
        playerToMove.pos.x += playerToMove.velocity.x * dt;
      }
    });

    // player_obj is an json combined of player and data.tankImage

    // Player layer setup

    // Player 2 setup
    // let player2 = new PixelJS.Player();
    // player2.addToLayer(playerLayer);
    // player2.pos = { x: 400, y: 300 };
    // player2.size = { width: 32, height: 32 };
    // player2.velocity = { x: 100, y: 100 };
    // player2.asset = new PixelJS.AnimatedSprite();
    // player2.asset.prepare({
    //   name: 'blue_tank.png',
    //   frames: 3,
    //   rows: 4,
    //   speed: 100,
    //   defaultFrame: 1,
    // });

    // Register the player for collisions (optional, if you have future collidables)

    // Movement state for both players
    let keys = {};

    // function captures player
    function move() {
      // if player1 presses "w" key, send the move up to the server in a json format
      if (keys['w']) {
        socket.emit('player move', {
          tankImage: 'red_tank.png',
          direction: 'up',
          amount: 1,
        });
      }
      if (keys['s']) {
        socket.emit('player move', {
          tankImage: 'red_tank.png',
          direction: 'down',
          amount: 1,
        });
      }
      if (keys['a']) {
        socket.emit('player move', {
          tankImage: 'red_tank.png',
          direction: 'left',
          amount: 1,
        });
      }
      if (keys['d']) {
        socket.emit('player move', {
          tankImage: 'red_tank.png',
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

      // // Move player 1 (Red) using Arrow keys
      // if (keys['i']) player1.pos.y -= player.velocity.y * dt;
      // if (keys['k']) player1.pos.y += player.velocity.y * dt;
      // if (keys['j']) player1.pos.x -= player.velocity.x * dt;
      // if (keys['l']) player1.pos.x += player.velocity.x * dt;

      // // Move player 2 (Blue) using WASD keys
      // if (keys['w']) player2.pos.y -= player2.velocity.y * dt;
      // if (keys['s']) player2.pos.y += player2.velocity.y * dt;
      // if (keys['a']) player2.pos.x -= player2.velocity.x * dt;
      // if (keys['d']) player2.pos.x += player2.velocity.x * dt;
    });
  }
};
