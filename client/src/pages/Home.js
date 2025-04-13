import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Home = ({ username, setUsername, room, setRoom, socket, rooms, createRoom }) => {
  const navigate = useNavigate();
  const [newRoom, setNewRoom] = useState('');
  const [usernameError, setUsernameError] = useState('');

  const joinRoom = () => {
    if (username.length > 20) {
      setUsernameError('Имя не должно превышать 20 символов');
      return;
    }
    if (room !== '' && username !== '') {
      socket.emit('check_username', { username, room }, async (isDuplicate) => {
        let newUsername = username;
        if (isDuplicate) {
          let counter = 1;
          while (isDuplicate) {
            newUsername = `${username}#${counter}`;
            const isDup = await new Promise((resolve) => {
              ((currentUsername) => {
                socket.emit('check_username', { username: currentUsername, room }, (isDup) => {
                  resolve(isDup);
                });
              })(newUsername);
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
      alert('Название комнаты не может быть пустым');
      return;
    }
    createRoom(newRoom);
    setNewRoom('');
  };

  return (
    <main className="container">
      <h1>FreeRooms</h1>
      <form onSubmit={(e) => e.preventDefault()}>
        <div className="form-group">
          <label htmlFor="username">Имя пользователя:</label>
          <input
            id="username"
            type="text"
            placeholder="Введите имя..."
            value={username}
            onChange={(e) => {
              if (e.target.value.length <= 20) {
                setUsernameError('');
                setUsername(e.target.value);
              } else {
                setUsernameError('Имя не должно превышать 20 символов');
              }
            }}
          />
          {usernameError && <p style={{ color: 'red' }}>{usernameError}</p>}
        </div>
        <div className="form-group">
          <label htmlFor="room">Выберите комнату:</label>
          <select
            id="room"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
          >
            <option value="">-- Выберите комнату --</option>
            {rooms.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
        <button type="button" onClick={joinRoom}>
          Войти в комнату
        </button>
      </form>
      <div className="create-room">
        <input
          type="text"
          placeholder="Создать новую комнату..."
          value={newRoom}
          onChange={(e) => setNewRoom(e.target.value)}
        />
        <button type="button" onClick={handleCreateRoom}>
          Создать комнату
        </button>
      </div>
    </main>
  );
};

export default Home;
