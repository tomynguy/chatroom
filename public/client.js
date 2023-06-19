const socket = io();

let usernameInput, usernameButton, title, center, center_top, chatInput, chatButton, center_bottom, user, chatbox;
let color = (255,255,255);

socket.on('getUser', (username) => {

    // Initialize all html elements
    usernameInput = Object.assign(document.createElement('input'), {className: 'login', value: username, onfocus: function() { if (this.value === username) { this.value = ''; username = '';} }});
    usernameButton = Object.assign(document.createElement('button'), {className: 'send', textContent: 'Send'});
    usernameInvalid = Object.assign(document.createElement('label'), {className: 'invalid'});
    title = Object.assign(document.createElement('h1'), {className: 'title', textContent: '~Tuktopia~'});
    center = Object.assign(document.createElement('div'), {className: 'center'});
    center_top = Object.assign(document.createElement('div'), {className: 'center_top'});

    chatInput = Object.assign(document.createElement('input'), {className: 'chat', placeholder: 'Send Message...'});
    chatButton = Object.assign(document.createElement('button'), {className: 'send', textContent: 'Send'});
    center_bottom = Object.assign(document.createElement('div'), {className: 'center_bottom'});
    chatbox = Object.assign(document.createElement('div'), {className: 'chatbox'});

    // Append elements to their respective divs
    center.append(usernameInput, usernameButton, usernameInvalid);
    center_top.append(title);
    center_bottom.append(chatInput, chatButton);

    // Add elements to doc and add button functionality
    document.body.append(center, center_top);
    usernameButton.onclick = login;
    usernameInput.addEventListener('keydown', function(event) {
        if (event.key == 'Enter' && !event.repeat) {
            event.preventDefault();
            usernameButton.click();
        }
    });

    chatButton.onclick = messageSend;
    chatInput.addEventListener('keydown', function(event) {
        if (event.key == 'Enter' && !event.repeat) {
            event.preventDefault();
            chatButton.click();
        }
    });
});

function login() {
    socket.emit('login', usernameInput.value);
}

function messageSend() {
    socket.emit('messageSent', user, chatInput.value);
    chatInput.value = '';
}

socket.on('loginFail', (errmsg) => {
    usernameInput.value = '';
    usernameInvalid.innerHTML = errmsg;
    usernameInvalid.style.display = 'block';
    if (errmsg == 'Admin Bypass') usernameInvalid.style.color = 'lime';
});

socket.on('loginSuccess', (username) => {
    center.remove();
    center_top.remove();
    document.body.append(center_bottom, chatbox);
    user = username;
    color = getColor(username);
});

socket.on('messageRecieved', (author, message) => {
    let authorElement = Object.assign(document.createElement('span'), {textContent: author, className: 'author'});
    let messageElement = Object.assign(document.createElement('p'), {className: 'message', textContent: message});
    authorElement.style.color = color;
    chatbox.append(authorElement, messageElement);
    messageElement.scrollIntoView();
});

function getColor(username) {
    let seed = [0,0,0];
    for (let i = 0; i < username.length; i++) {
        seed[i % 3] += username.charCodeAt(i);
    }
    let sum = 0;
    seed = seed.map(element => {
        element = (element % 5 == 0) ? 0 : element * 2;
        sum += element %= 256;
        return element;
    });
    return `rgb(${seed[sum % 3]}, ${seed[++sum % 3]}, ${seed[++sum % 3]})`;
}