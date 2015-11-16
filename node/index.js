var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

// app.get('/', function(req, res){
//   res.sendFile(__dirname + '/index.html');
// });

// app.get('/jquery/jquery.js', function(req, res) {
//     res.sendfile(__dirname + '/node_modules/jquery/dist/jquery.min.js');
// });

// io.on('connection', function(socket){
// });

http.listen(3000, function(){
  console.log('listening on *:3000');
});

io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
  socket.on('game', function(msg){
    console.log('message: ' + msg);
    console.log('message.json: ', JSON.stringify(msg))
    socket.broadcast.emit('game', msg);
  });
});
