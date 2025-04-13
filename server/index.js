const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors'); // Импортируем cors
const {
  saveMessage,
  getLast100Messages,
  createRoom,
  getRooms,
  addUserToRoom,
  checkUsernameInRoom,
} = require('./database');

const app = express();

// Настройка CORS для Express
app.use(cors({
  origin: 'http://localhost:3000', // Разрешить запросы с этого домена
  methods: ['GET', 'POST'], // Разрешенные HTTP-методы
  credentials: true // Разрешить передачу куки и заголовков авторизации
}));

const server = http.createServer(app);

// Настройка CORS для Socket.IO
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000', // Разрешить запросы с этого домена
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Проверить имя пользователя в комнате
  socket.on('check_username', async ({ username, room }, callback) => {
    try {
      const isDuplicate = await checkUsernameInRoom(username, room);
      callback(isDuplicate);
    } catch (err) {
      console.error(err);
      callback(false);
    }
  });

  // Присоединиться к комнате
  socket.on('join_room', async ({ username, room }) => {
    try {
      await addUserToRoom(username, room); // Добавить пользователя в комнату
      socket.join(room);
      const messages = await getLast100Messages(room); // Получить последние 100 сообщений
      socket.emit('last_100_messages', messages);
    } catch (err) {
      console.error(err);
    }
  });

  // Отправить сообщение
  socket.on('send_message', async (data) => {
    try {
      await saveMessage(data.message, data.username, data.room); // Сохранить сообщение в БД
      io.to(data.room).emit('receive_message', data);
    } catch (err) {
      console.error(err);
    }
  });

  // Создать комнату
  socket.on('create_room', async (roomName, callback) => {
    try {
      await createRoom(roomName); // Создать комнату в БД
      callback({ success: true, message: 'Room created successfully' });
    } catch (err) {
      console.error(err);
      callback({ success: false, message: err.message || 'Failed to create room' });
    }
  });

  // Получить список комнат
  socket.on('get_rooms', async (callback) => {
    try {
      const rooms = await getRooms(); // Получить список комнат из БД
      callback(rooms);
    } catch (err) {
      console.error(err);
      callback([]);
    }
  });

  // Отключение пользователя
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

server.listen(4000, () => {
  console.log('Server is running on port 4000');
});
