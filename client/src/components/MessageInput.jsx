import { useState, useEffect, useRef } from 'react';

function MessageInput({ onSendMessage, onTyping }) {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() !== '') {
      onSendMessage(message);
      setMessage('');
      // Stop typing indicator when message is sent
      if (isTyping) {
        setIsTyping(false);
        onTyping(false);
      }
    }
  };

  const handleChange = (e) => {
    setMessage(e.target.value);
    
    // Handle typing indicator
    if (!isTyping) {
      setIsTyping(true);
      onTyping(true);
    }
    
    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new timeout to stop typing indicator after 2 seconds
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      onTyping(false);
    }, 2000);
  };

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      // Make sure to turn off typing indicator when component unmounts
      if (isTyping) {
        onTyping(false);
      }
    };
  }, [isTyping, onTyping]);
  return (
    <div className="message-input-container">
      <form onSubmit={handleSubmit} className="message-form">
        <div className="message-input-wrapper">
          <input
            type="text"
            value={message}
            onChange={handleChange}
            placeholder="Type your message..."
            className="form-control"
            autoFocus
          />
          {isTyping && (
            <div className="typing-badge">Typing...</div>
          )}
        </div>
        <button type="submit" className="btn btn-primary" disabled={!message.trim()}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
          Send
        </button>
      </form>
    </div>
  );
}

export default MessageInput;
