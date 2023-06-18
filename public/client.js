const socket = io();

let usernameInput, usernameButton, title, center, center_top, chatInput, chatButton, center_bottom;

socket.on('getUser', (username) => {
    // Initialize all html elements
    usernameInput = Object.assign(document.createElement('input'), {className: 'input', value: username, onfocus: function() { if (this.value === username) { this.value = ''; username = '';} }});
    usernameButton = Object.assign(document.createElement('button'), {className: 'send', textContent: 'Send'});
    title = Object.assign(document.createElement('h1'), {textContent: '~Tuktopia~'});
    center = document.createElement('div');
    center_top = document.createElement('div');
    chatInput = Object.assign(document.createElement('input'), {className: 'input', value: 'Send message...', onfocus: function() { if (this.value === 'Send message...') { this.value = ''; } }});
    chatButton = Object.assign(document.createElement('button'), {className: 'send', textContent: 'Send'});
    center_bottom = document.createElement('div');

    // Set Div Classes
    center.className = 'center';
    center_top.className = 'center-top';
    center_bottom.className = 'center-bottom';

    // Append elements to their respective divs
    center.append(usernameInput, usernameButton);
    center_top.append(title);
    center_bottom.append(chatInput, chatButton);

    // Add elements to doc and add button functionality
    document.body.append(center, center_top);
    usernameButton.onclick = login;
    usernameInput.addEventListener('keypress', function(event) {
        if (event.key == 'Enter') {
            event.preventDefault();
            usernameButton.click();
        }
    });
});

function login() {
    socket.emit('login', usernameInput.value);
}

socket.on('loginFail', () => {
    usernameInput.value = 'Username Taken';
});

socket.on('loginSuccess', () => {
    usernameInput.remove();
    usernameButton.remove();
    title.remove();
    center.remove();
    center_top.remove();
    document.body.append(center_bottom);
});