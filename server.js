let express = require("express");
let app = express();
let http = require("http");
let server = http.createServer(app);
let socketIo = require("socket.io");
var io = socketIo(server);

//Tank options
let tankOptions = ["red_tank.png", "blue_tank.png"];

//List to keep track of loaded tank images
let takenTanks = [];

// keep track of rooms
let rooms = [];

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

// Requests to POST /api/:roomID
app.post("/api/create-room", (req, res) => {
  let roomId = Math.random().toString(36).substring(7);
  rooms.push(roomId);
  res.json({ roomId });
});

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
  // Iterate through the tank options to find an available tank

  let tankImage = "";
  for (let elem of tankOptions) {
    if (!takenTanks.includes(elem)) {
      takenTanks.push(elem);
      tankImage = elem;
      break;
    }
  }

  console.log(`Assigned tank image: ${tankImage}`);
  io.emit("new player", { tankImage: tankImage });

  socket.on("player move", (data) => {
    console.log("Received player move:", data); // Add this line
    io.emit("player move", data);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
    let index = takenTanks.indexOf(tankImage);
    if (index !== -1) {
      takenTanks.splice(index, 1);
    }
  });
});

server.listen(port, hostname, () => {
  console.log(`http://${hostname}:${port}`);
});
