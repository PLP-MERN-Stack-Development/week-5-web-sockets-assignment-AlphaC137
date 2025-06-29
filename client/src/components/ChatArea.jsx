import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../context/ChatContext';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import SearchMessages from './SearchMessages';
import MessagePagination from './MessagePagination';
import ConnectionStatus from './ConnectionStatus';
import { Users, Hash, Settings } from 'lucide-react';

function ChatArea() {
  const { 
    currentRoom, 
    messages, 
    filteredMessages,
    searchQuery,
    onlineUsers, 
    typingUsers, 
    user,
    socket 
  } = useChat();

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (content, type = 'text', fileInfo = null) => {
    if (!content.trim() && !fileInfo) return;

    socket.emit('message', {
      content: content.trim(),
      roomId: currentRoom?.id,
      type,
      fileInfo
    });
  };

  const handleReaction = (messageId, reaction) => {
    socket.emit('message reaction', {
      messageId,
      roomId: currentRoom?.id,
      reaction
    });
  };

  const markMessagesAsRead = () => {
    if (currentRoom && messages.length > 0) {
      const messageIds = messages
        .filter(msg => msg.sender.id !== user?.id)
        .map(msg => msg.id);
      
      if (messageIds.length > 0) {
        socket.emit('mark messages read', {
          roomId: currentRoom.id,
          messageIds
        });
      }
    }
  };

  useEffect(() => {
    markMessagesAsRead();
  }, [currentRoom, messages]);

  if (!currentRoom) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        color: '#6c757d',
        fontSize: '1.1rem'
      }}>
        <div style={{ textAlign: 'center' }}>
          <Hash size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
          <p>Select a room to start chatting</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Chat Header */}
      <div className="chat-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Hash size={20} />
          <div>
            <h2 style={{ margin: 0, fontSize: '1.25rem' }}>{currentRoom.name}</h2>
            <p style={{ 
              margin: 0, 
              fontSize: '0.875rem', 
              color: '#6c757d' 
            }}>
              {currentRoom.members?.size || 0} members • {onlineUsers.length} online
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '6px',
            color: '#6c757d',
            fontSize: '0.875rem'
          }}>
            <Users size={16} />
            <span>{onlineUsers.length}</span>
          </div>
          <ConnectionStatus />
        </div>
      </div>

      {/* Search Bar */}
      <SearchMessages />

      {/* Messages Area */}
      <div className="chat-messages">
        <MessagePagination currentRoom={currentRoom} />
        
        <MessageList 
          messages={searchQuery ? filteredMessages : messages}
          currentUser={user}
          onReaction={handleReaction}
        />
        
        {searchQuery && filteredMessages.length === 0 && (
          <div style={{
            textAlign: 'center',
            color: '#6c757d',
            fontSize: '0.875rem',
            padding: '20px'
          }}>
            No messages found for "{searchQuery}"
          </div>
        )}
        
        {/* Typing Indicators */}
        {Array.from(typingUsers).length > 0 && (
          <div className="typing-indicator">
            {Array.from(typingUsers)
              .filter(indicator => indicator.includes(currentRoom.id))
              .map(indicator => indicator.split(' (')[0])
              .join(', ')} {Array.from(typingUsers).length === 1 ? 'is' : 'are'} typing...
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="chat-input">
        <MessageInput 
          onSendMessage={handleSendMessage}
          currentRoom={currentRoom}
        />
      </div>
    </div>
  );
}

export default ChatArea;
