import { useRef, useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { useSocketContext } from '../context/SocketContext';

function MessageList({ messages, typingUsers }) {
  const { user } = useAuth();
  const { messageReactions, addReaction, markMessageRead, loadOlderMessages } = useSocketContext();
  const messagesEndRef = useRef(null);
  const messagesStartRef = useRef(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(null); // Message ID that has emoji picker open
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Observer for infinite scroll (load more messages when scrolling to top)
  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1,
    };

    const observer = new IntersectionObserver(handleObserver, options);
    if (messagesStartRef.current) {
      observer.observe(messagesStartRef.current);
    }

    return () => {
      if (messagesStartRef.current) {
        observer.unobserve(messagesStartRef.current);
      }
    };
  }, [messages]);

  // Handle intersection observer events for infinite scrolling
  const handleObserver = (entries) => {
    const [entry] = entries;
    if (entry.isIntersecting && !isLoading && hasMore) {
      loadMoreMessages();
    }
  };

  // Load more messages function
  const loadMoreMessages = async () => {
    if (isLoading || !hasMore) return;
    
    setIsLoading(true);
    const nextPage = page + 1;
    
    try {
      const hasMoreMessages = await loadOlderMessages(nextPage);
      setPage(nextPage);
      setHasMore(hasMoreMessages);
    } catch (error) {
      console.error('Error loading older messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Scroll to bottom when messages change and mark new messages as read
  useEffect(() => {
    // Only auto-scroll if we're not loading older messages
    if (!isLoading) {
      scrollToBottom();
    }
    
    // Mark any new messages from others as read
    messages.forEach(message => {
      if (!message.system && message.senderId !== user?.id) {
        markMessageRead(message.id);
      }
    });
  }, [messages, user?.id, markMessageRead, isLoading]);

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
  
  // Format absolute time for hover tooltip
  const formatAbsoluteTime = (timestamp) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString('en-US', {
        weekday: 'short',
        month: 'short', 
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
      });
    } catch (error) {
      return '';
    }
  };
  
  // Check if messages are from same sender to group them
  const shouldGroupMessages = (curr, prev) => {
    if (!prev || !curr || curr.system || prev.system) return false;
    
    return (
      curr.senderId === prev.senderId &&
      // Messages less than 2 minutes apart
      Math.abs(new Date(curr.timestamp) - new Date(prev.timestamp)) < 1000 * 60 * 2
    );
  };
  
  // Toggle emoji picker
  const toggleEmojiPicker = (messageId) => {
    setShowEmojiPicker(prev => prev === messageId ? null : messageId);
  };

  return (
    <div className="messages-container">
      {/* Loading indicator and reference element for infinite scroll */}
      <div ref={messagesStartRef} className="message-scroll-ref">
        {isLoading && (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <span>Loading older messages...</span>
          </div>
        )}
        {!isLoading && !hasMore && messages.length > 0 && (
          <div className="no-more-messages">
            No more messages to load
          </div>
        )}
      </div>
      
      {messages.map((message, index) => {
        const isPreviousFromSameSender = shouldGroupMessages(message, messages[index - 1]);
          return (
          <div 
            key={message.id}
            data-message-id={message.id}
            className={`message ${message.system ? 'system-message' : 
              message.senderId === user?.id ? 'message-sent' : 'message-received'} 
              ${isPreviousFromSameSender ? 'message-grouped' : ''}`}
          >
            {!message.system && !isPreviousFromSameSender && (
              <div className="message-header">
                {message.senderId !== user?.id && <span className="message-sender">{message.sender}</span>}
              </div>
            )}            <div className="message-content" title={formatAbsoluteTime(message.timestamp)}>
              {typeof message.message === 'object' && message.message.attachment ? (
                <div className="message-attachment">
                  {message.message.attachment.type.startsWith('image/') ? (
                    <div className="image-attachment">
                      <img 
                        src={message.message.attachment.data} 
                        alt={message.message.attachment.name} 
                        onClick={() => window.open(message.message.attachment.data, '_blank')}
                      />
                      <div className="attachment-name">{message.message.attachment.name}</div>
                    </div>
                  ) : (
                    <div className="file-attachment">
                      <a href={message.message.attachment.data} download={message.message.attachment.name} target="_blank" rel="noreferrer">
                        <div className="file-icon">📄</div>
                        <div className="file-details">
                          <div className="file-name">{message.message.attachment.name}</div>
                          <div className="file-size">{(message.message.attachment.size / 1024).toFixed(1)} KB</div>
                        </div>
                      </a>
                    </div>
                  )}
                  <div className="attachment-text">{message.message.text}</div>
                </div>
              ) : (
                message.message
              )}
            </div>
            {!message.system && (
              <div className="message-meta">
                {formatTime(message.timestamp)}
                {message.isPrivate && <span className="message-private" title="This is a private message"> • Private</span>}
                
                {/* Read receipts */}
                {message.senderId === user?.id && message.readBy && message.readBy.length > 0 && (
                  <span className="message-read" title={`Read by: ${message.readBy.join(', ')}`}> 
                    • Read by {message.readBy.length}
                  </span>
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
                    {/* Quick reaction buttons */}
                    <button onClick={() => addReaction(message.id, '👍')} className="reaction-button" title="Like">👍</button>
                    <button onClick={() => addReaction(message.id, '❤️')} className="reaction-button" title="Love">❤️</button>
                    <button onClick={() => addReaction(message.id, '😄')} className="reaction-button" title="Smile">😄</button>
                    
                    {/* More reactions button */}
                    <button 
                      onClick={() => toggleEmojiPicker(message.id)} 
                      className={`reaction-button ${showEmojiPicker === message.id ? 'active' : ''}`} 
                      title="More reactions"
                    >
                      +
                    </button>
                    
                    {/* Extended emoji picker */}
                    {showEmojiPicker === message.id && (
                      <div className="emoji-picker">
                        <button onClick={() => addReaction(message.id, '🎉')} className="emoji-option" title="Celebrate">🎉</button>
                        <button onClick={() => addReaction(message.id, '👏')} className="emoji-option" title="Clap">👏</button>
                        <button onClick={() => addReaction(message.id, '🔥')} className="emoji-option" title="Fire">🔥</button>
                        <button onClick={() => addReaction(message.id, '😂')} className="emoji-option" title="Laugh">😂</button>
                        <button onClick={() => addReaction(message.id, '😮')} className="emoji-option" title="Wow">😮</button>
                        <button onClick={() => addReaction(message.id, '😢')} className="emoji-option" title="Sad">😢</button>
                        <button onClick={() => addReaction(message.id, '🤔')} className="emoji-option" title="Thinking">🤔</button>
                        <button onClick={() => addReaction(message.id, '👎')} className="emoji-option" title="Dislike">👎</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
      
      {typingUsers.length > 0 && (
        <div className="typing-indicator">
          {typingUsers.length === 1 
            ? `${typingUsers[0]} is typing...` 
            : `${typingUsers.join(', ')} are typing...`}
        </div>
      )}
      
      <div ref={messagesEndRef} />
      
      {/* Loader for pagination */}
      {isLoading && (
        <div className="loader">
          Loading more messages...
        </div>
      )}
    </div>
  );
}

export default MessageList;
