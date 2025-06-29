import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import EmojiPicker from 'emoji-picker-react';
import { 
  Download, 
  Image, 
  File, 
  MoreHorizontal,
  Smile
} from 'lucide-react';

const QUICK_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '😡'];

function MessageList({ messages, currentUser, onReaction, isPrivate = false }) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(null);
  const [showReactionMenu, setShowReactionMenu] = useState(null);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return formatDistanceToNow(date, { addSuffix: true });
  };

  const handleReaction = (messageId, reaction) => {
    if (onReaction) {
      onReaction(messageId, reaction);
    }
    setShowReactionMenu(null);
    setShowEmojiPicker(null);
  };

  const handleEmojiClick = (messageId, emojiData) => {
    handleReaction(messageId, emojiData.emoji);
  };

  const renderFileMessage = (fileInfo) => {
    if (!fileInfo) return null;

    const isImage = fileInfo.mimetype?.startsWith('image/');
    
    return (
      <div style={{ marginTop: '8px' }}>
        {isImage ? (
          <div>
            <img 
              src={fileInfo.url} 
              alt={fileInfo.originalname}
              style={{
                maxWidth: '300px',
                maxHeight: '200px',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
              onClick={() => window.open(fileInfo.url, '_blank')}
            />
            <div style={{ 
              fontSize: '0.875rem', 
              color: '#6c757d', 
              marginTop: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <Image size={14} />
              {fileInfo.originalname}
            </div>
          </div>
        ) : (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 12px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '8px',
            marginTop: '4px'
          }}>
            <File size={16} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.875rem' }}>{fileInfo.originalname}</div>
              <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>
                {(fileInfo.size / 1024).toFixed(1)} KB
              </div>
            </div>
            <a 
              href={fileInfo.url}
              download={fileInfo.originalname}
              style={{
                color: 'inherit',
                textDecoration: 'none',
                padding: '4px'
              }}
            >
              <Download size={16} />
            </a>
          </div>
        )}
      </div>
    );
  };

  const renderReactions = (message) => {
    if (!message.reactions || message.reactions.size === 0) return null;

    return (
      <div className="message-reactions">
        {Array.from(message.reactions.entries()).map(([reaction, users]) => {
          if (users.size === 0) return null;
          
          const isActive = users.has(currentUser?.id);
          
          return (
            <div
              key={reaction}
              className={`reaction ${isActive ? 'active' : ''}`}
              onClick={() => handleReaction(message.id, reaction)}
            >
              {reaction} {users.size}
            </div>
          );
        })}
      </div>
    );
  };

  const renderMessage = (message, index) => {
    const isOwnMessage = message.sender.id === currentUser?.id;
    const showReactions = showReactionMenu === message.id;
    const showEmoji = showEmojiPicker === message.id;

    return (
      <div
        key={message.id}
        className={`message ${isOwnMessage ? 'own' : 'other'}`}
        style={{ 
          position: 'relative',
          marginBottom: '15px'
        }}
      >
        <div className="message-header">
          <strong>{message.sender.username}</strong>
          <span className="message-time">
            {formatTime(message.timestamp)}
          </span>
        </div>
        
        <div className="message-content">
          {message.content}
          {renderFileMessage(message.fileInfo)}
        </div>

        {renderReactions(message)}

        {/* Message Actions */}
        {!isPrivate && (
          <div style={{
            position: 'absolute',
            top: '8px',
            right: isOwnMessage ? 'auto' : '8px',
            left: isOwnMessage ? '8px' : 'auto',
            opacity: 0,
            transition: 'opacity 0.2s',
            display: 'flex',
            gap: '4px'
          }}
          className="message-actions"
          >
            <button
              onClick={() => setShowReactionMenu(showReactions ? null : message.id)}
              className="emoji-button"
              title="Add reaction"
            >
              <Smile size={16} />
            </button>
          </div>
        )}

        {/* Quick Reaction Menu */}
        {showReactions && (
          <div style={{
            position: 'absolute',
            top: '-40px',
            right: isOwnMessage ? 'auto' : '0',
            left: isOwnMessage ? '0' : 'auto',
            background: 'white',
            border: '1px solid #e9ecef',
            borderRadius: '20px',
            padding: '4px 8px',
            display: 'flex',
            gap: '4px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            zIndex: 10
          }}>
            {QUICK_REACTIONS.map(reaction => (
              <button
                key={reaction}
                onClick={() => handleReaction(message.id, reaction)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '50%',
                  fontSize: '1.2rem',
                  transition: 'transform 0.1s'
                }}
                onMouseEnter={(e) => e.target.style.transform = 'scale(1.2)'}
                onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
              >
                {reaction}
              </button>
            ))}
            <button
              onClick={() => {
                setShowEmojiPicker(message.id);
                setShowReactionMenu(null);
              }}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '50%',
                color: '#6c757d'
              }}
            >
              <MoreHorizontal size={16} />
            </button>
          </div>
        )}

        {/* Emoji Picker */}
        {showEmoji && (
          <div style={{
            position: 'absolute',
            top: '-350px',
            right: isOwnMessage ? 'auto' : '0',
            left: isOwnMessage ? '0' : 'auto',
            zIndex: 20
          }}>
            <EmojiPicker
              onEmojiClick={(emojiData) => handleEmojiClick(message.id, emojiData)}
              width={300}
              height={300}
            />
            <button
              onClick={() => setShowEmojiPicker(null)}
              style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                background: 'white',
                border: '1px solid #e9ecef',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px'
              }}
            >
              ×
            </button>
          </div>
        )}
      </div>
    );
  };

  // Close menus when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => {
      setShowReactionMenu(null);
      setShowEmojiPicker(null);
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div style={{ flex: 1 }}>
      {messages.map((message, index) => renderMessage(message, index))}
      
      <style jsx>{`
        .message:hover .message-actions {
          opacity: 1 !important;
        }
      `}</style>
    </div>
  );
}

export default MessageList;
