require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const { saveMessage, getLast100Messages } = require('./database');

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

const CHAT_BOT = 'ChatBot';
let chatRoom = '';
let allUsers = [];

io.on('connection', (socket) => {
  console.log(`User connected ${socket.id}`);

  // Присоединение пользователя к комнате
  socket.on('join_room', async (data) => {
    const { username, room } = data;
    socket.join(room);

    chatRoom = room;
    allUsers.push({ id: socket.id, username, room });
    chatRoomUsers = allUsers.filter((user) => user.room === room);

    // Приветственное сообщение
    let __createdtime__ = Date.now();
    socket.emit('receive_message', {
      message: `Welcome ${username}`,
      username: CHAT_BOT,
      __createdtime__,
    });

    // Отправляем список пользователей
    socket.to(room).emit('chatroom_users', chatRoomUsers);
    socket.emit('chatroom_users', chatRoomUsers);

    // Получаем последние 100 сообщений
    const last100Messages = await getLast100Messages(room);
    socket.emit('last_100_messages', last100Messages);
  });

  // Отправка сообщения
  socket.on('send_message', async (data) => {
    const { message, username, room, __createdtime__ } = data;
    io.in(room).emit('receive_message', data);
    await saveMessage(message, username, room);
  });

  // Выход из комнаты
  socket.on('leave_room', (data) => {
    const { username, room } = data;
    socket.leave(room);
    allUsers = allUsers.filter((user) => user.id !== socket.id);
    socket.to(room).emit('chatroom_users', allUsers);
    socket.to(room).emit('receive_message', {
      username: CHAT_BOT,
      message: `${username} has left the chat`,
      __createdtime__: Date.now(),
    });
    console.log(`${username} has left the chat`);
  });

  // Отключение пользователя
  socket.on('disconnect', () => {
    console.log('User disconnected');
    const user = allUsers.find((user) => user.id === socket.id);
    if (user) {
      allUsers = allUsers.filter((user) => user.id !== socket.id);
      socket.to(chatRoom).emit('chatroom_users', allUsers);
      socket.to(chatRoom). emit('receive_message', {
        username: CHAT_BOT,
        message: `${user.username} has disconnected`,
      });
    }
  });
});

server.listen(4000, () => console.log('Server is running on port 4000'));
