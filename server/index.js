const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const {
  saveMessage,
  getLast100Messages,
  createRoom,
  getRooms,
  addUserToRoom,
  checkUsernameInRoom,
} = require('./database');

const app = express();

app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST'],
  credentials: true
}));

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log('Пользователь подключился:', socket.id);

  socket.on('check_username', async ({ username, room }, callback) => {
    try {
      const isDuplicate = await checkUsernameInRoom(username, room);
      callback(isDuplicate);
    } catch (err) {
      console.error('Ошибка при проверке имени пользователя:', err);
      callback(false);
    }
  });

  socket.on('join_room', async ({ username, room }) => {
    try {
      await addUserToRoom(username, room);
      socket.join(room);
      const messages = await getLast100Messages(room);
      socket.emit('last_100_messages', messages);
      console.log(`${username} присоединился к комнате ${room}`);
    } catch (err) {
      console.error('Ошибка при присоединении к комнате:', err);
    }
  });

  socket.on('send_message', async (data) => {
    try {
      const messageId = await saveMessage(data.message, data.username, data.room);
      const messageData = {
        message: data.message,
        username: data.username,
        room: data.room,
        created_at: new Date().toISOString(), 
      };
      io.to(data.room).emit('receive_message', messageData);
    } catch (err) {
      console.error('Ошибка при отправке сообщения:', err);
    }
  });

  socket.on('create_room', async (roomName, callback) => {
    try {
      await createRoom(roomName);
      callback({ success: true, message: 'Комната успешно создана' });
      console.log(`Создана новая комната: ${roomName}`);
    } catch (err) {
      console.error('Ошибка при создании комнаты:', err);
      callback({ success: false, message: err.message || 'Не удалось создать комнату' });
    }
  });

  socket.on('get_rooms', async (callback) => {
    try {
      const rooms = await getRooms();
      callback(rooms);
    } catch (err) {
      console.error('Ошибка при получении списка комнат:', err);
      callback([]);
    }
  });

  socket.on('disconnect', () => {
    console.log('Пользователь отключился:', socket.id);
  });
});

server.listen(4000, () => {
  console.log('Сервер запущен на порту 4000');
});
