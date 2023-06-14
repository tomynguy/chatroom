const express = require('express');
const app = express();
const http = require('http').Server(app);
const io =  require('socket.io')(http);

let PORT = 3000;

app.use(express.static('public'));

app.get('/', (req,res) => {
    res.sendFile(__dirname + '/public/index.html')
});

io.on('connection', (socket) => {
    console.log('A user connected');
  
    socket.on('disconnect', () => {
      console.log('A user disconnected');
    });
  });

http.listen(PORT, () => {
    console.log('Server listening on http://localhost:' + PORT);
});