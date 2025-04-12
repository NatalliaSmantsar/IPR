const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./chat.db');

// Создаем таблицу для сообщений
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
});

// Сохранить сообщение
function saveMessage(message, username, room) {
  const query = `INSERT INTO messages (message, username, room) VALUES (?, ?, ?)`;
  return new Promise((resolve, reject) => {
    db.run(query, [message, username, room], function (err) {
      if (err) reject(err);
      else resolve(this.lastID);
    });
  });
}

// Получить последние 100 сообщений
function getLast100Messages(room) {
  const query = `SELECT * FROM messages WHERE room = ? ORDER BY created_at DESC LIMIT 100`;
  return new Promise((resolve, reject) => {
    db.all(query, [room], (err, rows) => {
      if (err) reject(err);
      else resolve(rows.reverse()); // Сортируем по времени
    });
  });
}

module.exports = { saveMessage, getLast100Messages };
