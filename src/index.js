const express = require("express");
const http = require("http");
const path = require("path");
const socketio = require("socket.io");
const Filter = require("bad-words");
const { messageGen, locationGen } = require("./util/message")
const { addUser, removeUser, getUser, getUserInRoom } = require('./util/users')

const app = express();
const server = http.createServer(app);
const io = socketio(server);

PORT = process.env.PORT || 3000;

const appPath = path.join(__dirname, "../public");
app.use(express.static(appPath));

app.get("/", (req, res) => {
  app.render("index.html");
});

io.on("connection", socket => {
  console.log("new connection on web server");


  socket.on('join', ({ username, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, username, room })
    if (error) {
      return callback(error)
    }
    socket.join(user.room)
    socket.emit("message", messageGen('Admin', 'welcome'));
    socket.broadcast.to(user.room).emit("message", messageGen('Admin', `${user.username} has joined!`));

    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUserInRoom(user.room)
    })

    callback()
  })

  socket.on("sendMessage", (message, cb) => {
    const filter = new Filter();
    const user = getUser(socket.id)
    if (filter.isProfane(message)) {
      return cb("no profane is allowed");
    }
    io.to(user.room).emit("message", messageGen(user.username, message));
    cb();
  });

  socket.on("sendLocation", (coords, cb) => {
    const user = getUser(socket.id)
    io.to(user.room).emit(
      "messageUrl", locationGen(user.username, coords.latitude, coords.longitude)
      //`https://google.com/maps?q=${coords.latitude},${coords.longitude}`
    );
    cb();
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id)
    if (user) {
      io.to(user.room).emit("message", messageGen('Admin', `${user.username} has left`));
      io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUserInRoom(user.room)
      })

    }
  });
});

server.listen(PORT, () => {
  console.log("Listning from port : ", PORT);
});
