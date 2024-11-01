let axios = require('axios');
let express = require('express');
let http = require('http');
let socketIo = require('socket.io');

let app = express();
let server = http.createServer(app);
let io = socketIo(server);

app.use(express.static('public'));

let port = 3000;
let hostname = 'localhost';

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('player move', (data) => {
    console.log('Received player move:', data); // Add this line
    io.emit('player move', data);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

server.listen(port, hostname, () => {
  console.log(`http://${hostname}:${port}`);
});