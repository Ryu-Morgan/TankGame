let express = require("express");
let app = express();
let http = require("http");
let server = http.createServer(app);
let socketIo = require("socket.io");
var io = socketIo(server);

// Tank options
let tankOptions = ["red_tank.jpg", "blue_tank.jpg"];

// List to keep track of loaded tank images
let takenTanks = {};

// Keep track of rooms
let rooms = [];

let tankRooms = {};

// Middleware to add CORS headers
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

// Serve static files from the 'public' directory
app.use(express.static("public"));

// Serve static files from the 'assets' directory
app.use("/assets", express.static("assets"));

let port = 3000;
let hostname = "localhost";

// Serve home.html on the starting route
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/home.html");
});

// Serve waiting.html for waiting rooms
app.get("/waiting/:roomID", (req, res) => {
  res.sendFile(__dirname + "/public/waiting.html");
});

// Return the number of players in a room
app.get("/api/room/:roomID", (req, res) => {
  let { roomID } = req.params;
  let players = io.sockets.adapter.rooms.get(roomID);
  res.json({ playerCount: players ? players.size : 0 });
});

// Create a new room
app.post("/api/create-room", (req, res) => {
  let roomId = Math.random().toString(36).substring(7);
  rooms.push(roomId);
  console.log("Available rooms:", rooms);
  res.json({ roomId });
});

// Join an existing room
app.post("/api/join-room", express.json(), (req, res) => {
  let { roomId } = req.body;
  if (rooms.includes(roomId)) {
    res.json({ message: "Room found", roomId });
  } else {
    res.status(404).json({ message: "Room not found" });
  }
});

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("join room", (roomId) => {
    if (rooms.includes(roomId)) {
      socket.join(roomId);
      console.log(`User joined room: ${roomId}`);
      io.to(roomId).emit("new queued player", {
        playerCount: io.sockets.adapter.rooms.get(roomId).size,
      });
    } else {
      socket.emit("error", { message: "Room not found" });
    }
  });

  socket.on("simple join", (roomId) => {
    // same of join room but we should simply socket.join(roomId)
    if (rooms.includes(roomId)) {
      // we should look for the room in the tankRooms object, if it doesn't exist we should create it (it's a dict containing the roomID as key and an array dicts with the socketID and the tankImage as value).
      // We populate the dict with the socketID and the non-taken tankImage
      if (!tankRooms[roomId]) {
        tankRooms[roomId] = [];
      }
      if (!takenTanks[roomId]) {
        takenTanks[roomId] = [];
      }
      // Counterintuitively, takenTanks[roomId] is an array of tankImages that are available to be taken.
      // So we should just pop the first element of the array and assign it to the player.
      let tankImage = takenTanks[roomId].shift();
      // Make sure tankImage is not undefined
      if (tankImage) {
        takenTanks[roomId].push(tankImage);
        tankRooms[roomId].push({ socketID: socket.id, tankImage: tankImage });
      }
      socket.join(roomId);
      console.log(`User joined game room: ${roomId}`);
    }
  });

  socket.on("game transition", (roomId) => {
    if (rooms.includes(roomId)) {
      console.log(`Game transition in room: ${roomId}`);
      // send game transition event to all players in the room
      // for each player in the room, emit game transition event along with their player number
      let playersInRoom = Array.from(io.sockets.adapter.rooms.get(roomId));
      takenTanks[roomId] = [];

      playersInRoom.forEach((playerSocketId, index) => {
        let tankImage = tankOptions[index % tankOptions.length];
        takenTanks[roomId].push(tankImage);
        io.to(playerSocketId).emit("game transition", { tankImage: tankImage });
      });
    } else {
      socket.emit("error", { message: "Room not found" });
    }
  });

  socket.on("player move", (data) => {
    // get the socketID of the player who sent the move
    let socketId = socket.id;
    // We need to get the tank image for the player who sent the move.
    // We look in the tankRooms object for the room the player is in (taken from data.roomID) and find the player's tankImage.
    let tankImage = tankRooms[data.roomID].find((player) => player.socketID === socketId).tankImage;
    // data does not come with tankImage so we add it to the data object
    data.tankImage = tankImage;
    console.log("Received player move:", data);
    io.to(data.roomID).emit("player move", data);
  });


  socket.on("player shoot", (data) => {
    let socketId = socket.id;
    let tankImage = tankRooms[data.roomID].find((player) => player.socketID === socketId).tankImage;
    data.tankImage = tankImage;
    console.log("Received player shoot:", data);
    io.to(data.roomID).emit("player shoot", data);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
    for (let roomId in takenTanks) {
      let index = takenTanks[roomId].indexOf(socket.id);
      if (index !== -1) {
        takenTanks[roomId].splice(index, 1);
      }
    }
  });
});

server.listen(port, hostname, () => {
  console.log(`http://${hostname}:${port}`);
});
