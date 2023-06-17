const socket = io();

let username = '';

function createHTML() {
    var input = Object.assign(document.createElement("input"), {className: "input", value: "Username", onfocus: function() { if (this.value === "Username") { this.value = ""; } }});
    var button = Object.assign(document.createElement("button"), {className: "send", textContent: "Send"});
    var div = document.createElement("div");
    div.className = "center-bottom";
    div.append(input, button);
    document.body.append(div);
  }
  
  createHTML();