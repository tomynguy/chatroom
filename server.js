const express = require('express');
const app = express();
const http = require('http').Server(app);
const io =  require('socket.io')(http);

const userPrefix = "User";
let PORT = 3000;
let users = new Set();

app.use(express.static('public'));

app.get('/', (req,res) => {
    res.sendFile(__dirname + '/public/index.html')
});

io.on('connection', (socket) => {
    console.log('A user connected');
    socket.emit("getUser", randUser());

    socket.on('login', (username) => {
      if (users.has(username)) {
        socket.emit("loginFail");
      } else {
        console.log(username + ' logged in');
        users.add(username);
        socket.emit("loginSuccess");
      }
    });

    socket.on('disconnect', () => {
      console.log('A user disconnected');
    });
  });

http.listen(PORT, () => {
    console.log('Server listening on http://localhost:' + PORT);
});

function randUser() {
  let username = userPrefix;
  for (let i = 0; i < 5; i++) username += Math.floor(Math.random() * 10);

  if (users.has(username)) {
    username = userPrefix;
    return randUser();
  }

  return username;
}