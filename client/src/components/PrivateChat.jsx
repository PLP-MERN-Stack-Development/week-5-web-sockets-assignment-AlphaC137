import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../context/ChatContext';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { ArrowLeft, User, MessageCircle } from 'lucide-react';

function PrivateChat({ selectedUser, onBack }) {
  const { 
    user, 
    privateMessages, 
    socket 
  } = useChat();

  const messagesEndRef = useRef(null);
  const conversationId = user && selectedUser 
    ? [user.id, selectedUser.id].sort().join('-')
    : null;
  
  const messages = conversationId ? privateMessages.get(conversationId) || [] : [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (selectedUser && socket) {
      // Get conversation history when starting a private chat
      socket.emit('get conversation history', selectedUser.id);
    }
  }, [selectedUser, socket]);

  const handleSendMessage = (content, type = 'text', fileInfo = null) => {
    if (!content.trim() && !fileInfo) return;

    socket.emit('private message', {
      content: content.trim(),
      recipientId: selectedUser.id,
      type,
      fileInfo
    });
  };

  if (!selectedUser) {
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
          <MessageCircle size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
          <p>Select a user to start a private conversation</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Private Chat Header */}
      <div className="chat-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={onBack}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px',
              borderRadius: '50%',
              color: '#6c757d'
            }}
            title="Back to rooms"
          >
            <ArrowLeft size={20} />
          </button>
          <User size={20} />
          <div>
            <h2 style={{ margin: 0, fontSize: '1.25rem' }}>{selectedUser.username}</h2>
            <p style={{ 
              margin: 0, 
              fontSize: '0.875rem', 
              color: '#28a745',
              fontWeight: '500'
            }}>
              Online
            </p>
          </div>
        </div>
        <div style={{
          padding: '6px 12px',
          background: '#007bff',
          color: 'white',
          borderRadius: '16px',
          fontSize: '0.875rem',
          fontWeight: '500'
        }}>
          Private Chat
        </div>
      </div>

      {/* Messages Area */}
      <div className="chat-messages">
        {messages.length === 0 ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: '#6c757d',
            fontSize: '1rem',
            textAlign: 'center'
          }}>
            <div>
              <MessageCircle size={32} style={{ marginBottom: '12px', opacity: 0.5 }} />
              <p>Start a conversation with {selectedUser.username}</p>
              <p style={{ fontSize: '0.875rem', marginTop: '8px' }}>
                This is the beginning of your private conversation.
              </p>
            </div>
          </div>
        ) : (
          <MessageList 
            messages={messages}
            currentUser={user}
            isPrivate={true}
          />
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="chat-input">
        <MessageInput 
          onSendMessage={handleSendMessage}
          isPrivate={true}
          recipientName={selectedUser.username}
        />
      </div>
    </div>
  );
}

export default PrivateChat;
