const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./chat.db');

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      message TEXT,
      username TEXT,
      room TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS rooms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT,
      room TEXT,
      UNIQUE(username, room)
    )
  `);
});

function saveMessage(message, username, room) {
  const query = `INSERT INTO messages (message, username, room) VALUES (?, ?, ?)`;
  return new Promise((resolve, reject) => {
    db.run(query, [message, username, room], function (err) {
      if (err) reject(err);
      else resolve(this.lastID);
    });
  });
}

function getLast100Messages(room) {
  const query = `SELECT * FROM messages WHERE room = ? ORDER BY created_at DESC LIMIT 100`;
  return new Promise((resolve, reject) => {
    db.all(query, [room], (err, rows) => {
      if (err) reject(err);
      else resolve(rows.reverse()); 
    });
  });
}

function createRoom(roomName) {
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT name FROM rooms WHERE LOWER(name) = LOWER(?)`,
      [roomName],
      (err, row) => {
        if (err) return reject(err);
        if (row) return reject(new Error('Room already exists')); 
        db.run(
          `INSERT INTO rooms (name) VALUES (?)`,
          [roomName],
          function (err) {
            if (err) reject(err);
            else resolve(this.lastID);
          }
        );
      }
    );
  });
}

function getRooms() {
  const query = `SELECT name FROM rooms`;
  return new Promise((resolve, reject) => {
    db.all(query, [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows.map(row => row.name));
    });
  });
}

function addUserToRoom(username, room) {
  const query = `INSERT INTO users (username, room) VALUES (?, ?)`;
  return new Promise((resolve, reject) => {
    db.run(query, [username, room], function (err) {
      if (err) reject(err);
      else resolve(this.lastID);
    });
  });
}

function checkUsernameInRoom(username, room) {
  const query = `SELECT username FROM users WHERE username LIKE ? AND room = ?`;
  return new Promise((resolve, reject) => {
    db.get(query, [`${username}%`, room], (err, row) => {
      if (err) reject(err);
      else resolve(!!row);
    });
  });
}

module.exports = {
  saveMessage,
  getLast100Messages,
  createRoom,
  getRooms,
  addUserToRoom,
  checkUsernameInRoom,
};