let express = require("express");
let app = express();
let http = require("http");
let server = http.createServer(app);
let socketIo = require("socket.io");
var io = socketIo(server);

// Tank options
let tankOptions = ["red_tank.png", "blue_tank.png"];

// Data structure to keep track of players and their tanks in each room
let roomPlayers = {};

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
  roomPlayers[roomId] = [];
  res.json({ roomId });
});

// Join an existing room
app.post("/api/join-room", express.json(), (req, res) => {
  let { roomId } = req.body;
  if (roomPlayers[roomId]) {
    res.json({ message: "Room found", roomId });
  } else {
    res.status(404).json({ message: "Room not found" });
  }
});

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("join room", (roomId) => {
    if (roomPlayers[roomId]) {
      roomPlayers[roomId].push({ socketId: socket.id });
      socket.join(roomId);
      console.log(`User joined room: ${roomId}`);
      io.to(roomId).emit("new queued player", {
        playerCount: io.sockets.adapter.rooms.get(roomId).size,
      });
    } else {
      socket.emit("error", { message: "Room not found" });
    }
  });

  socket.on("game start join", (roomId) => {
    if (roomPlayers[roomId]) {
      socket.join(roomId);
      console.log(`User joined game room: ${roomId}`);

      // Assign tank images to players in the room
      let playersInRoom = Array.from(io.sockets.adapter.rooms.get(roomId));
      roomPlayers[roomId] = playersInRoom.map((playerSocketId, index) => {
        return {
          socketId: playerSocketId,
          tankImage: tankOptions[index % tankOptions.length],
        };
      });

      // Send the player data to all clients in the room
      io.to(roomId).emit("game start", roomPlayers[roomId]);
    } else {
      socket.emit("error", { message: "Room not found" });
    }
  });

  socket.on("player move", (data) => {
    console.log("Received player move:", data);
    io.to(data.roomID).emit("player move", data);
  });

  

  socket.on("disconnect", () => {
    console.log("user disconnected");
    for (let roomId in roomPlayers) {
      roomPlayers[roomId] = roomPlayers[roomId].filter(
        (player) => player.socketId !== socket.id
      );
    }
  });
});

server.listen(port, hostname, () => {
  console.log(`http://${hostname}:${port}`);
});
