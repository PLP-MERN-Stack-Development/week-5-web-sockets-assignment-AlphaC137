import { useRef, useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { useSocketContext } from '../context/SocketContext';

function MessageList({ messages, typingUsers }) {
  const { user } = useAuth();
  const { messageReactions, addReaction, markMessageRead } = useSocketContext();
  const messagesEndRef = useRef(null);

  // Scroll to bottom when messages change and mark new messages as read
  useEffect(() => {
    scrollToBottom();
    
    // Mark any new messages from others as read
    messages.forEach(message => {
      if (!message.system && message.senderId !== user?.id) {
        markMessageRead(message.id);
      }
    });
  }, [messages, user?.id, markMessageRead]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (timestamp) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (error) {
      return '';
    }
  };

  return (
    <div className="messages-container">
      {messages.map((message) => (
        <div 
          key={message.id} 
          className={`message ${message.system ? 'system-message' : message.senderId === user?.id ? 'message-sent' : 'message-received'}`}
        >
          {!message.system && (
            <div className="message-header">
              {message.senderId !== user?.id && <span className="message-sender">{message.sender}</span>}
            </div>
          )}
          <div className="message-content">
            {message.message}
          </div>
          {!message.system && (
            <div className="message-meta">
              {formatTime(message.timestamp)}
              {message.isPrivate && <span className="message-private"> • Private</span>}
              
              {/* Read receipts */}
              {message.senderId === user?.id && message.readBy && message.readBy.length > 0 && (
                <span className="message-read"> • Read by {message.readBy.length}</span>
              )}
              
              {/* Message reactions */}
              <div className="message-reactions">
                {messageReactions[message.id]?.map((reaction, index) => (
                  <span key={index} className="reaction" title={`${reaction.username}`}>
                    {reaction.reaction}
                  </span>
                ))}
              </div>
              
              {/* Reaction buttons */}
              {!message.system && (
                <div className="reaction-buttons">
                  <button onClick={() => addReaction(message.id, '👍')} className="reaction-button">👍</button>
                  <button onClick={() => addReaction(message.id, '❤️')} className="reaction-button">❤️</button>
                  <button onClick={() => addReaction(message.id, '😄')} className="reaction-button">😄</button>
                  <button onClick={() => addReaction(message.id, '🎉')} className="reaction-button">🎉</button>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
      
      {typingUsers.length > 0 && (
        <div className="typing-indicator">
          {typingUsers.length === 1 
            ? `${typingUsers[0]} is typing...` 
            : `${typingUsers.join(', ')} are typing...`}
        </div>
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );
}

export default MessageList;
