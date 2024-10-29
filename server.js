let axios = require('axios');
let express = require('express');
let app = express();
app.use(express.static('public'));

let port = 3000;
let hostname = 'localhost';

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, hostname, () => {
  console.log(`http://${hostname}:${port}`);
});
