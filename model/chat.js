var Chat = exports.chat = function()
{
	this.users = [];
	this.usersOnline = [];
	this.messages = [];
};

Chat.prototype.addUser = function (id)
{
	this.users.push(id);
};

Chat.prototype.getMessages = function ()
{
	return this.messages;
};

Chat.prototype.addMessage = function (message)
{
	this.messages.push(message);
};

