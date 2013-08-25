var DEBUG_TYPES = {
	GOOD: 1,
	BAD: 2,
	ERROR: 3
};

var ChatClient = function (settings) {
	this.socket = null;
	this.container = settings.Container;

	this.render();
};

ChatClient.prototype.render = function() {
	//Debug div
	this.debugContainer = document.createElement("div");
	this.container.appendChild(this.debugContainer);
	//Messages list
	this.messagesContainer = document.createElement("div");
	this.messagesContainer.style.borderWidth = "1px";
	this.messagesContainer.style.borderStyle = "solid";
	this.messagesContainer.style.height = "300px";
	this.container.appendChild(this.messagesContainer);
	//Message input
	this.messageInput = document.createElement("input");
	this.messageInput.type = "text";
	this.messageInput.onkeypress = this.onTextInputKeyPress.bind(this);
	this.container.appendChild(this.messageInput);
	//Send button
	this.sendButton = document.createElement("input");
	this.sendButton.type = "button";
	this.sendButton.value = "Send";
	this.sendButton.onclick = this.onSendButtonClick.bind(this);
	this.container.appendChild(this.sendButton);
};

ChatClient.prototype.start = function() {
	var socket = this.socket = io.connect(window.location.hostname);

	var chat = this;
	socket.on('connect', function (data) {
		chat.debug("Connected", DEBUG_TYPES.GOOD);
	});
	socket.on('disconnect', function() {
		chat.debug("Server is down", DEBUG_TYPES.BAD);
	});

	socket.on("message", function (data) {
		switch (data.event) {
			case "allMessages":
				chat.refreshAllMessages(data.response)
				break;
			case "newMessage":
				chat.addNewMessage(data.response)
				break;
			default:
				console.log("Unknown message");
				break;
		}
	});
};

ChatClient.prototype.refreshAllMessages = function (response) {
	this.messagesContainer.innerHTML = "";
	for (var messageIndex in response) {
		var message = response[messageIndex];
		this.addNewMessage(message);
	};
}

ChatClient.prototype.addNewMessage = function (message) {
	var messageContainer = document.createElement("p");

	var date = new Date(message.time);
	messageContainer.innerHTML = "(" + moment(date).format("HH:mm:ss") + ") " + message.user + " : " + message.text;

	this.messagesContainer.appendChild(messageContainer);
};

ChatClient.prototype.onSendButtonClick = function (event) {
	this.sendMessage();
};

ChatClient.prototype.onTextInputKeyPress = function (event) {
	if (event.which == 13) {
		this.sendMessage();
	}
};

ChatClient.prototype.sendMessage = function () {
	var text = this.messageInput.value;
	this.socket.send(JSON.stringify({
		"type": "message",
		"data": text
	}));
	this.messageInput.value = "";
};

ChatClient.prototype.debug = function(message, type) {
	var p = document.createElement("p");
	p.innerHTML = message;
	switch (type) {
		case DEBUG_TYPES.GOOD:
			p.style.color = "#00FF00";
			break;
		case DEBUG_TYPES.BAD:
			p.style.color = "#FFFF00";
			break;
		case DEBUG_TYPES.ERROR:
			p.style.color = "#FF0000";
			break;
	}
	this.debugContainer.appendChild(p);
};

