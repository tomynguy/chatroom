const express = require('express');
const app = express();
const http = require('http').Server(app);
const io =  require('socket.io')(http);
const fs = require('fs');

const [PORT, userPrefix, adminKey, printSize] = setConfig();
const invalidWords = getInvalidWords();
let users = new Set();
let admins = new Set();
app.use(express.static('public'));

app.get('/', (req,res) => {
    res.sendFile(__dirname + '/public/index.html')
});

io.on('connection', (socket) => {
    console.log('A user connected');
    socket.emit("getUser", randUser(userPrefix, 0));

    socket.on('login', (username) => {
      if (admins.has(socket)) login(socket, username);

      if (username == adminKey) {
        admins.add(socket);
        console.log("Admin Bypass");
        socket.emit("loginFail", "Admin Bypass");
      }
      else if (users.has(username)) socket.emit("loginFail", "Username Taken");
      else if (stringFilter(username)) socket.emit("loginFail", "Invalid Username");
      else login(socket, username);
    });

    socket.on('disconnect', () => {
      console.log('A user disconnected');
    });

    socket.on('messageSent', (user, message) => {
      if (stringFilter(message)) return;
      let newMessage = user + ": " + message;
      if (newMessage.length > printSize) newMessage = newMessage.substring(0, 150) + "...";
      console.log(newMessage);
      io.to("room").emit("messageRecieved", user, message);
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
  return csvContent.split('\n').map(line => line.trim());
}

function setConfig() {
  const csvFilePath = 'src/config.txt';
  const csvContent = fs.readFileSync(csvFilePath, 'utf-8');
  const csvLines = csvContent.split('\n').map(line => line.trim());
  let ret = [];
  for (const line in csvLines)
    ret[line] = (csvLines[line].substring(csvLines[line].indexOf(':') + 2, csvLines[line].length));
  return ret;
}

function login(socket, username) {
  console.log(username + ' logged in');
  users.add(username);
  socket.emit("loginSuccess", username);
  socket.join("room");
}