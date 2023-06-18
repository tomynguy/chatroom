const express = require('express');
const app = express();
const http = require('http').Server(app);
const io =  require('socket.io')(http);

const userPrefix = "User";
let PORT = 3000;
let users = new Set();
let invalidWords = new Set(['']);
app.use(express.static('public'));

app.get('/', (req,res) => {
    res.sendFile(__dirname + '/public/index.html')
});

io.on('connection', (socket) => {
    console.log('A user connected');
    socket.emit("getUser", randUser(userPrefix, 0));

    socket.on('login', (username) => {
      if (users.has(username)) {
        socket.emit("loginFail", "Username Taken");
      } else if (invalidWords.has(username)){
        socket.emit("loginFail", "Invalid Username");
      } else {
        console.log(username + ' logged in');
        users.add(username);
        socket.emit("loginSuccess", username);
        socket.join("room");
      }
    });

    socket.on('disconnect', () => {
      console.log('A user disconnected');
    });

    socket.on('messageSent', (user, message) => {
      if (invalidWords.has(message)) return;
      const newMessage = user + " : " + message;
      console.log(newMessage)
      io.to("room").emit("messageRecieved", newMessage);
    });

  });

http.listen(PORT, () => {
    console.log('Server listening on http://localhost:' + PORT);
});

// Find a unique random name. If random name isn't found after 5 tries, append another digit.
function randUser(username, recurse) {
  for (let i = 0; i < (5 + recurse/5); i++) username += Math.floor(Math.random() * 10);
  if (users.has(username)) return randUser(userPrefix, recurse + 1);
  return username;
}