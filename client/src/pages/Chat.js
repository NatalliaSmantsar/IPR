import React, { useState, useEffect, useRef } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

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
      socket.emit('send_message', {
        username,
        room,
        message: messageInput,
      });
      setMessageInput('');
    }
  };

  return (
    <>
      <div className="side-panel left"></div>
      <Header />
      <div className="side-panel right"></div>
      
      <main className="main-content">
        <div className="chat-container">
          <h2 className="room-title">{room}</h2>
          <section className="messages">
            {messages.map((msg, i) => {
              const rawDate = msg.created_at || msg.__createdtime__;
              const formattedDate = new Date(rawDate).toLocaleString('ru-RU');

              return (
                <div key={i} className={`message ${msg.username === username ? 'sent' : 'received'}`}>
                  <div className="message-content">
                    <span className="username">{msg.username}: </span>
                    <span className="text">{msg.message}</span>
                  </div>
                  <span className="time">{formattedDate}</span>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </section>
          <section className="input-area">
            <input
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Введите сообщение..."
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            />
            <button onClick={sendMessage}>Отправить</button>
          </section>
        </div>
      </main>
      
      <Footer />
    </>
  );
};

export default Chat;