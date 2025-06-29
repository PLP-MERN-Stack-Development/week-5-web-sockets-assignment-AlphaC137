import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../context/ChatContext';
import { Send, Paperclip, Image, Smile } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';

function MessageInput({ onSendMessage, currentRoom, isPrivate = false, recipientName = '' }) {
  const { socket, user } = useChat();
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    // Send message with acknowledgment
    socket.emit('message', {
      content: message,
      roomId: currentRoom?.id,
      type: 'text'
    }, (response) => {
      if (response.success) {
        console.log('Message delivered:', response.messageId);
      } else {
        console.error('Message delivery failed:', response.error);
      }
    });

    setMessage('');
    handleStopTyping();
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleTyping = () => {
    if (!isTyping && socket && !isPrivate) {
      setIsTyping(true);
      socket.emit('typing', { roomId: currentRoom?.id });
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      handleStopTyping();
    }, 2000);
  };

  const handleStopTyping = () => {
    if (isTyping && socket && !isPrivate) {
      setIsTyping(false);
      socket.emit('stop typing', { roomId: currentRoom?.id });
    }
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  };

  const handleInputChange = (e) => {
    setMessage(e.target.value);
    handleTyping();
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://localhost:8000/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const fileInfo = await response.json();
      
      // Send message with file
      onSendMessage(
        file.type.startsWith('image/') 
          ? `📷 ${file.name}` 
          : `📎 ${file.name}`,
        'file',
        fileInfo
      );
      
    } catch (error) {
      console.error('File upload error:', error);
      alert('Failed to upload file. Please try again.');
    } finally {
      setIsUploading(false);
      e.target.value = ''; // Clear input
    }
  };

  const handleEmojiClick = (emojiData) => {
    setMessage(prev => prev + emojiData.emoji);
    setShowEmojiPicker(false);
    textareaRef.current?.focus();
  };

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      handleStopTyping();
    };
  }, []);

  const placeholder = isPrivate 
    ? `Message ${recipientName}...`
    : `Message ${currentRoom?.name || 'room'}...`;

  return (
    <div style={{ position: 'relative' }}>
      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div style={{
          position: 'absolute',
          bottom: '100%',
          right: '0',
          zIndex: 10,
          marginBottom: '8px'
        }}>
          <EmojiPicker
            onEmojiClick={handleEmojiClick}
            width={300}
            height={300}
          />
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="input-container">
          {/* File Upload Button */}
          <div className="file-upload">
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileUpload}
              accept="image/*,.pdf,.doc,.docx,.txt"
              style={{ display: 'none' }}
              disabled={isUploading}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              style={{
                padding: '12px',
                background: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                cursor: isUploading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background-color 0.2s',
                opacity: isUploading ? 0.6 : 1
              }}
              title="Upload file"
            >
              {isUploading ? (
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid #ffffff',
                  borderTop: '2px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
              ) : (
                <Paperclip size={16} />
              )}
            </button>
          </div>

          {/* Message Input */}
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            className="message-input"
            rows={1}
            style={{
              resize: 'none',
              overflow: 'hidden'
            }}
          />

          {/* Emoji Button */}
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            style={{
              padding: '12px',
              background: showEmojiPicker ? '#007bff' : '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 0.2s'
            }}
            title="Add emoji"
          >
            <Smile size={16} />
          </button>

          {/* Send Button */}
          <button
            type="submit"
            className="send-button"
            disabled={!message.trim() || isUploading}
          >
            <Send size={16} />
          </button>
        </div>
      </form>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default MessageInput;
