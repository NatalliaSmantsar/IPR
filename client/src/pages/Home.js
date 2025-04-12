import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Home = ({ username, setUsername, room, setRoom, socket }) => {
  const navigate = useNavigate();

  const joinRoom = () => {
    if (room !== '' && username !== '') {
      socket.emit('join_room', { username, room });
      navigate('/chat', { replace: true });
    }
  };

  return (
    <main className="container" aria-labelledby="main-heading">
      <h1 id="main-heading">DevRooms</h1>
      <form onSubmit={(e) => e.preventDefault()} aria-labelledby="form-heading">
        <h2 id="form-heading" className="visually-hidden">Join a Room</h2>
        <div className="form-group">
          <label htmlFor="username">Username:</label>
          <input
            id="username"
            type="text"
            placeholder="Enter your name..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            aria-required="true"
          />
        </div>
        <div className="form-group">
          <label htmlFor="room">Select Room:</label>
          <select
            id="room"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            aria-required="true"
          >
            <option value="">-- Select Room --</option>
            <option value="javascript">JavaScript</option>
            <option value="node">Node</option>
            <option value="react">React</option>
          </select>
        </div>
        <button type="button" onClick={joinRoom} aria-label="Join Room">
          Join Room
        </button>
      </form>
    </main>
  );
};

export default Home;
