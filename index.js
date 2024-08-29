const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const route = require('./route');
const { addUser, findUser, getRoomUsers, deleteUser } = require('./users');

const app = express();

app.use(cors({ origin: '*' }));
app.use(route);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});


io.on('connection', socket => {
  socket.on('join', ({ name, room }) => {
    socket.join(room);
    const { isExist, user } = addUser({ name, room });

    const userMessage = isExist
      ? `${user.name}, you are here again`
      : `Привет, ${user.name}!`;

    socket.emit('message', {
      data: { user: { name: 'Admin' }, message: userMessage }
    });

    socket.broadcast.to(user.room).emit('message', {
      data: { user: { name: 'Admin' }, message: `${user.name} has joined` }
    });

    io.to(user.room).emit('room', {
      data: { room: user.room, users: getRoomUsers(user.room) }
    });
  });

  socket.on('sendMessage', ({ message, userParams }) => {
    const user = findUser(userParams);

    if (user) {
      io.to(user.room).emit('message', {
        data: { user, message }
      });
    }
  });

  socket.on('leftRoom', ({ userParams }) => {
    deleteUser(userParams);
    socket.broadcast.to(userParams.room).emit('message', {
      data: {
        user: { name: 'Admin' },
        message: `${userParams.name} left chat :(`
      }
    });
  });

  io.on('disconnect', () => {
    console.log('disconnect');
  });
});

server.listen(5001, () => {
  console.log('server is running');
});
