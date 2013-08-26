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
	var panel = document.createElement("div");
	panel.className = "panel panel-primary";

	var panelHeader = document.createElement("div");
	panelHeader.className = "panel-heading";
	panelHeader.innerText = "Chat content";
	panel.appendChild(panelHeader);

	this.messagesContainer = document.createElement("div");
	// this.messagesContainer.style.borderWidth = "1px";
	// this.messagesContainer.style.borderStyle = "solid";
	this.messagesContainer.className = "panel-body";

	panel.appendChild(this.messagesContainer);
	// this.messagesContainer.style.height = "300px";
	this.container.appendChild(panel);

	var sendGroup = document.createElement("div");
	sendGroup.className = "input-group";

	//Message input
	this.messageInput = document.createElement("input");
	this.messageInput.className = "form-control";
	this.messageInput.onkeypress = this.onTextInputKeyPress.bind(this);
	sendGroup.appendChild(this.messageInput);

	var buttonSpan = document.createElement("span");
	buttonSpan.className = "input-group-btn";

	//Send button
	this.sendButton = document.createElement("button");
	this.sendButton.type = "button";
	this.sendButton.className = "btn btn-primary";
	this.sendButton.innerHTML = "Send";
	this.sendButton.onclick = this.onSendButtonClick.bind(this);
	buttonSpan.appendChild(this.sendButton);
	sendGroup.appendChild(buttonSpan);
	panel.appendChild(sendGroup);

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

	var avatarImage = document.createElement("img");
	messageContainer.appendChild(avatarImage);

	var timeContainer = document.createElement("span");
	timeContainer.className = "label label-default";
	var date = new Date(message.time);
	timeContainer.innerText = moment(date).format("HH:mm:ss");
	messageContainer.appendChild(timeContainer);

	var userContainer = document.createElement("span");
	userContainer.className = "label label-info";
	userContainer.innerText = message.user;
	userContainer.style.marginLeft = "8px";
	messageContainer.appendChild(userContainer);

	var textContainer = document.createElement("span");
	// textContainer.className = "label";
	textContainer.innerText = message.text;
	textContainer.style.marginLeft = "8px";
	messageContainer.appendChild(textContainer);

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
	var container = document.createElement("div");
	container.innerText = message;
	container.className = "alert";
	switch (type) {
		case DEBUG_TYPES.GOOD:
			container.className += " alert-success";
			break;
		case DEBUG_TYPES.BAD:
			container.className += " alert-warning";
			break;
		case DEBUG_TYPES.ERROR:
			container.className += " alert-danger";
			break;
	}
	this.debugContainer.appendChild(container);
};

