import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Home = ({ username, setUsername, room, setRoom, socket, rooms, createRoom }) => {
  const navigate = useNavigate();
  const [newRoom, setNewRoom] = useState('');

  const joinRoom = () => {
    if (room !== '' && username !== '') {
      socket.emit('check_username', { username, room }, async (isDuplicate) => {
        let newUsername = username; // Объявляем newUsername здесь
        if (isDuplicate) {
          let counter = 1;
          while (isDuplicate) {
            newUsername = `${username}#${counter}`;
            const isDup = await new Promise((resolve) => {
              // Используем IIFE для создания локальной области видимости
              ((currentUsername) => {
                socket.emit('check_username', { username: currentUsername, room }, (isDup) => {
                  resolve(isDup);
                });
              })(newUsername); // Передаем текущее значение newUsername
            });
            isDuplicate = isDup;
            counter++;
          }
        }
        setUsername(newUsername);
        socket.emit('join_room', { username: newUsername, room });
        navigate('/chat', { replace: true });
      });
    }
  };

  const handleCreateRoom = () => {
    if (newRoom.trim() === '') {
      alert('Room name cannot be empty');
      return;
    }
    createRoom(newRoom);
    setNewRoom('');
  };

  return (
    <main className="container">
      <h1>DevRooms</h1>
      <form onSubmit={(e) => e.preventDefault()}>
        <div className="form-group">
          <label htmlFor="username">Username:</label>
          <input
            id="username"
            type="text"
            placeholder="Enter your name..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="room">Select Room:</label>
          <select
            id="room"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
          >
            <option value="">-- Select Room --</option>
            {rooms.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
        <button type="button" onClick={joinRoom}>
          Join Room
        </button>
      </form>
      <div className="create-room">
        <input
          type="text"
          placeholder="Create a new room..."
          value={newRoom}
          onChange={(e) => setNewRoom(e.target.value)}
        />
        <button type="button" onClick={handleCreateRoom}>
          Create Room
        </button>
      </div>
    </main>
  );
};

export default Home;
