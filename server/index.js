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

// Настройка CORS для Express
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST'],
  credentials: true
}));

const server = http.createServer(app);

// Настройка CORS для Socket.IO
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log('Пользователь подключился:', socket.id);

  // Проверка имени пользователя в комнате
  socket.on('check_username', async ({ username, room }, callback) => {
    try {
      const isDuplicate = await checkUsernameInRoom(username, room);
      callback(isDuplicate);
    } catch (err) {
      console.error('Ошибка при проверке имени пользователя:', err);
      callback(false);
    }
  });

  // Присоединение к комнате
  socket.on('join_room', async ({ username, room }) => {
    try {
      await addUserToRoom(username, room); // Добавляем пользователя в комнату
      socket.join(room);
      const messages = await getLast100Messages(room); // Загружаем последние 100 сообщений
      socket.emit('last_100_messages', messages);
      console.log(`${username} присоединился к комнате ${room}`);
    } catch (err) {
      console.error('Ошибка при присоединении к комнате:', err);
    }
  });

  // Отправка сообщения
  socket.on('send_message', async (data) => {
    try {
      await saveMessage(data.message, data.username, data.room); // Сохраняем сообщение
      io.to(data.room).emit('receive_message', data); // Отправляем всем в комнате
    } catch (err) {
      console.error('Ошибка при отправке сообщения:', err);
    }
  });

  // Создание новой комнаты
  socket.on('create_room', async (roomName, callback) => {
    try {
      await createRoom(roomName); // Создаём комнату в базе
      callback({ success: true, message: 'Комната успешно создана' });
      console.log(`Создана новая комната: ${roomName}`);
    } catch (err) {
      console.error('Ошибка при создании комнаты:', err);
      callback({ success: false, message: err.message || 'Не удалось создать комнату' });
    }
  });

  // Получение списка всех комнат
  socket.on('get_rooms', async (callback) => {
    try {
      const rooms = await getRooms(); // Получаем комнаты из базы
      callback(rooms);
    } catch (err) {
      console.error('Ошибка при получении списка комнат:', err);
      callback([]);
    }
  });

  // Отключение пользователя
  socket.on('disconnect', () => {
    console.log('Пользователь отключился:', socket.id);
  });
});

server.listen(4000, () => {
  console.log('Сервер запущен на порту 4000');
});
