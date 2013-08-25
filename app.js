

var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var socketio = require('socket.io');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(app.router);
app.use(require('stylus').middleware(__dirname + '/public'));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);

var server = http.createServer(app);
server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

var chatModel = require('./model/chat');
var chat = new chatModel.chat;

chat.addMessage({ 
	"text": "Welcome", 
	"user": "admin",
	"time": new Date().getTime()
});

var io = socketio.listen(server);

io.configure(function () {
  io.set('transports', ['xhr-polling']);
});

io.sockets.on('connection', function (socket) {
	console.log("connected!");

	chat.addUser(socket.id.toString());

	socket.json.send({ 
		"event": "allMessages",
		"response": chat.getMessages()
	});

	socket.on("message", function (message) {
		var messageObj = JSON.parse(message);
		switch (messageObj.type) {
			case "message":
				var newMessage = {
					"user": socket.id.toString(),
					"text": messageObj.data,
					"time": new Date().getTime()
				};
				chat.addMessage(newMessage);


				socket.json.send({ 
					"event": "newMessage",
					"response": newMessage
				});

				socket.broadcast.json.send({ 
					"event": "newMessage",
					"response": newMessage
				});

				break;

			default:
				console.log("Unknown message");
				break;
		}
	});
});

