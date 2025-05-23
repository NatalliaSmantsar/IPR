import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Chat from './pages/Chat';
import io from 'socket.io-client';
import './styles.css';

const socket = io.connect('http://localhost:4000');

function App() {
  const [username, setUsername] = useState('');
  const [room, setRoom] = useState('');
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    socket.emit('get_rooms', (rooms) => {
      setRooms(rooms);
    });
  }, []);

  const createRoom = (newRoom) => {
    socket.emit('create_room', newRoom, (response) => {
      if (response.success) {
        setRooms((prevRooms) => [...prevRooms, newRoom]);
        alert(response.message);
      } else {
        alert(response.message); 
      }
    });
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route
            path="/"
            element={
              <Home
                username={username}
                setUsername={setUsername}
                room={room}
                setRoom={setRoom}
                socket={socket}
                rooms={rooms}
                createRoom={createRoom}
              />
            }
          />
          <Route
            path="/chat"
            element={<Chat username={username} room={room} socket={socket} />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;