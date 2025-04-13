import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';

const Home = ({ username, setUsername, room, setRoom, socket, rooms, createRoom }) => {
  const navigate = useNavigate();
  const [newRoom, setNewRoom] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

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
              socket.emit('check_username', { username: newUsername, room }, resolve);
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

  const filteredRooms = rooms.filter(r =>
    r.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Header />
      <main className="container">
        <form onSubmit={(e) => e.preventDefault()} className="form-box">
          <div className="form-group">
            <label htmlFor="username">Nickname:</label>
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
              className={usernameError ? 'error-input' : ''}
            />
            {usernameError && <p className="error">{usernameError}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="room">Выбор комнаты:</label>
            <input
              type="text"
              placeholder="Поиск комнаты..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              id="room"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
            >
              <option value="">-Список комнат-</option>
              {filteredRooms.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <div className="create-room">
            <label>Создать новую комнату</label>
            <div className="create-room-row">
              <input
                type="text"
                placeholder=""
                value={newRoom}
                onChange={(e) => setNewRoom(e.target.value)}
              />
              <button type="button" onClick={handleCreateRoom}>
                Создать
              </button>
            </div>
          </div>
          <button className="start-btn" type="button" onClick={joinRoom}>
            Начать общение
          </button>
        </form>
      </main>
    </>
  );
};

export default Home;
