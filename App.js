import React, { useEffect, useState, useRef } from 'react';
import './App.css';

const clientId = Math.random().toString(36).substr(2, 9);

function App() {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    const ws = new WebSocket('ws://192.168.1.132:3001');
    console.log('📡 Connecting to ws://YOUR_IP:3001');

    ws.onopen = () => console.log('✅ WebSocket OPEN');
    ws.onmessage = e => {
      console.log('📥 Received:', e.data);
      const { type, data } = JSON.parse(e.data);
      if (type === 'message') setMessages(prev => [...prev, data]);
    };
    ws.onerror = e => console.error('⚠ WS Error', e);
    ws.onclose = () => console.log('❌ WebSocket Closed');

    setSocket(ws);
    return () => ws.close();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (socket?.readyState === WebSocket.OPEN && input.trim()) {
      const msg = { type:'message', data:{ sender: clientId, text: input }};
      console.log('📤 Sending:', msg);
      socket.send(JSON.stringify(msg));
      setInput('');
    } else {
      console.warn('⚠ Socket not open or no text');
    }
  };

  return (
    <div className="chat-container">
      <h2>💬 Chat</h2>
      <div className="chat-box">
        {messages.map((msg, i) => (
          <div key={i} className={`chat-msg ${msg.sender === clientId ? 'me' : 'other'}`}>
            {msg.text}
          </div>
        ))}
        <div ref={bottomRef}></div>
      </div>
      <div className="chat-input">
        <input
          value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()} placeholder="Type..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

export default App;
