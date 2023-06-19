const express = require('express');
const app = express();
const http = require('http').Server(app);
const io =  require('socket.io')(http);
const fs = require('fs');

const [PORT, userPrefix, adminKey, printSize, username_retry, maxUserLength, minUserLength] = setConfig();
const invalidWords = getInvalidWords();
let users = new Set();
let socket_to_user = new Map();
let admins = new Set();
app.use(express.static('public'));

app.get('/', (req,res) => {
    res.sendFile(__dirname + '/public/index.html')
});

io.on('connection', (socket) => {
    console.log('Client connected');
    socket.emit('getUser', randUser(userPrefix, 0));

    socket.on('login', (username) => {
      if (admins.has(socket)) login(socket, username);
      else {
        username = username.replace(/(\r\n|\n|\r)/gm, "");
        if (username == adminKey) {
          admins.add(socket);
          console.log('Admin Bypass');
          socket.emit('loginFail', 'Admin Bypass');
        }
        else if (users.has(username)) socket.emit('loginFail', 'Username Taken');
        else if (stringFilter(username)) socket.emit('loginFail', 'Invalid Username');
        else if (username.length > maxUserLength) socket.emit('loginFail', 'Name cannot exceed ' + maxUserLength + ' characters')
        else if (username.replace(/\s+/g, '').length < minUserLength) socket.emit('loginFail', 'Name must be at least ' + minUserLength + ' characters')
        else login(socket, username);
      }
    });

    socket.on('disconnect', () => {
      if (socket_to_user.has(socket)) {
        let user = socket_to_user.get(socket);
        console.log(user + ' disconnected');
        users.delete(user);
      }
      else console.log('Client disconnected');
    });

    socket.on('messageSent', (user, message) => {
      if (stringFilter(message)) {
        consolePrint(user + ' sent restricted message: ' + message);
        return;
      }
      consolePrint(user + ': ' + message);
      io.to('room').emit('messageRecieved', user, message);
    });

  });

http.listen(PORT, () => {
    console.log('Server listening on http://localhost:' + PORT);
});

// Find a unique random name. If random name isn't found after 5 tries, append another digit.
function randUser(username, recurse) {
  for (let i = 0; i < (5 + recurse / username_retry); i++) username += Math.floor(Math.random() * 10);
  if (users.has(username)) return randUser(userPrefix, recurse + 1);
  return username;
}

// Filters out naughty words...
function stringFilter(string) {
  let filtered_string = string.replace(/[^a-zA-Z]/g, '').toLowerCase();
  for (const word in invalidWords) if (filtered_string.includes(invalidWords[word])) return true;
  return false;
}


// Retrieves an array of invalid words from invalidWords.csv
function getInvalidWords() {
  const csvFilePath = 'src/invalidWords.csv';
  const csvContent = fs.readFileSync(csvFilePath, 'utf-8');
  return csvContent.split('\n').map(line => line.trim());
}

// Gets array from a parsed config.txt
function setConfig() {
  const csvFilePath = 'src/config.txt';
  const csvContent = fs.readFileSync(csvFilePath, 'utf-8');
  const csvLines = csvContent.split('\n').map(line => line.trim());
  let ret = [];
  for (const line in csvLines)
    ret[line] = (csvLines[line].substring(csvLines[line].indexOf(':') + 2, csvLines[line].length));
  return ret;
}

// Handles user login
function login(socket, username) {
  consolePrint(username + ' logged in');
  socket_to_user.set(socket, username);
  users.add(username);
  socket.emit('loginSuccess', username);
  socket.join('room');
}

// Handles extrenous prints to server-console
function consolePrint(string) {
  if (string.length > printSize) string = string.substring(0, printSize) + '...';
  console.log(string);
}