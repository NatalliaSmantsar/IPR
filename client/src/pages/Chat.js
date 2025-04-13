import React, { useState, useEffect, useRef } from 'react';

const Chat = ({ socket, username, room }) => {
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    socket.on('receive_message', (data) => {
      setMessages((prev) => [...prev, data]);
    });

    socket.on('last_100_messages', (messages) => {
      setMessages(messages);
    });

    return () => {
      socket.off('receive_message');
      socket.off('last_100_messages');
    };
  }, [socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (messageInput.trim() !== '') {
      const __createdtime__ = new Date().toLocaleTimeString();
      socket.emit('send_message', { username, room, message: messageInput, __createdtime__ });
      setMessageInput('');
    }
  };

  return (
    <main className="chat-container">
      <h1>Комната: {room}</h1>
      <section className="messages">
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.username === username ? 'sent' : 'received'}`}>
            <span className="username">{msg.username}: </span>
            <span className="text">{msg.message}</span>
            <span className="time">{msg.__createdtime__}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </section>
      <section className="input-area">
        <input
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          placeholder="Введите сообщение..."
        />
        <button onClick={sendMessage}>Отправить</button>
      </section>
    </main>
  );
};

export default Chat;
