const express = require('express');
const app = express();
const http = require('http').Server(app);
const io =  require('socket.io')(http);
const fs = require('fs');

const userPrefix = "User";
let PORT = 3000;
let users = new Set();
const invalidWords = getInvalidWords();

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
      } else if (stringFilter(username)){
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
      if (stringFilter(message)) return;
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

// Filters out naughty words...
function stringFilter(string) {
  let filtered_string = string.replace(/[^a-zA-Z0-9]/g, '');
  for (const word in invalidWords) {
    if (filtered_string.includes(invalidWords[word])) return true;
  }
  return string.replace(/\s+/g, '').length == 0;
}

function getInvalidWords() {
  const csvFilePath = 'src/invalidWords.csv';
  const csvContent = fs.readFileSync(csvFilePath, 'utf-8');
  const csvLines = csvContent.split('\n').map(line => line.trim());
  return Array.from(csvLines);
}