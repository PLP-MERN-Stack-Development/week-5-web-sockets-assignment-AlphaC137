import { useState, useEffect, useRef } from 'react';

function MessageInput({ onSendMessage, onTyping }) {
  const [message, setMessage] = useState('');
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const typingTimeoutRef = useRef(null);
  const inputRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const fileInputRef = useRef();

  // Common emojis for quick access
  const commonEmojis = ['😊', '😂', '👍', '❤️', '🎉', '🔥', '👋', '🙏', '😎', '🤔', '😢', '😍', '👏', '✅', '⭐'];
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const trimmedMessage = message.trim();
    
    if (!trimmedMessage && !file) return;
    
    // Handle file upload
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onload = () => {
        const fileMessage = {
          text: trimmedMessage || `Shared a file: ${file.name}`,
          attachment: {
            name: file.name,
            type: file.type,
            data: reader.result,
            size: file.size
          }
        };
        
        onSendMessage(fileMessage);
        setMessage('');
        setFile(null);
        setFilePreview(null);
        setShowFileUpload(false);
      };
    } else {
      // Regular text message
      onSendMessage(trimmedMessage);
      setMessage('');
    }
    
    // Stop typing indicator
    if (isTyping) {
      onTyping(false);
      setIsTyping(false);
    }
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setMessage(value);
    
    // Handle typing indicator
    if (!isTyping) {
      setIsTyping(true);
      onTyping(true);
    }
    
    // Reset typing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    
    const timeout = setTimeout(() => {
      onTyping(false);
      setIsTyping(false);
    }, 2000);
    
    setTypingTimeout(timeout);
  };
  
  // Add emoji to message
  const addEmoji = (emoji) => {
    setMessage(prev => prev + emoji);
    inputRef.current?.focus();
  };
  
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    
    // Check file size (limit to 5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5MB limit');
      return;
    }
    
    setFile(selectedFile);
    
    // Create preview for images
    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFilePreview(e.target.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleFileButtonClick = () => {
    setShowFileUpload(!showFileUpload);
    if (!showFileUpload) {
      setTimeout(() => {
        fileInputRef.current?.click();
      }, 100);
    }
  };

  const removeFile = () => {
    setFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle clicking outside emoji picker
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
      if (isTyping) {
        onTyping(false);
      }
    };
  }, [typingTimeout, isTyping, onTyping]);
  
  return (
    <form className="message-input-container" onSubmit={handleSubmit}>
      {filePreview && (
        <div className="file-preview">
          <img src={filePreview} alt="File preview" />
          <button type="button" className="remove-file" onClick={removeFile}>
            ×
          </button>
          <div className="file-name">{file?.name}</div>
        </div>
      )}
      
      {file && !filePreview && (
        <div className="file-info">
          <div className="file-icon">📄</div>
          <div className="file-details">
            <div className="file-name">{file.name}</div>
            <div className="file-size">{(file.size / 1024).toFixed(1)} KB</div>
          </div>
          <button type="button" className="remove-file" onClick={removeFile}>
            ×
          </button>
        </div>
      )}
      
      <div className="message-input-wrapper">
        <button 
          type="button" 
          className="file-button" 
          onClick={handleFileButtonClick} 
          title="Share a file or image"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/>
          </svg>
        </button>
        
        <input
          ref={fileInputRef}
          type="file"
          style={{ display: 'none' }}
          onChange={handleFileChange}
          accept="image/*,application/pdf,text/plain,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        />
        
        <button 
          type="button" 
          className="btn btn-icon" 
          onClick={() => setShowEmojiPicker(prev => !prev)}
          title="Add emoji"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-6c.78 2.34 2.72 4 5 4s4.22-1.66 5-4H7zm7.5-5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5.67-1.5 1.5-1.5zm-5 0c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5.67-1.5 1.5-1.5z"/>
          </svg>
        </button>
        
        <div className="message-input-wrapper">
          <input
            type="text"
            value={message}
            onChange={handleChange}
            placeholder="Type your message..."
            className="form-control"
            autoFocus
            ref={inputRef}
            onKeyDown={e => {
              // Handle Ctrl+Enter to submit
              if (e.key === 'Enter' && e.ctrlKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          {isTyping && (
            <div className="typing-badge">Typing...</div>
          )}
        </div>
        
        <button 
          type="submit" 
          className="btn btn-primary" 
          disabled={!message.trim() && !file}
          title="Send message (Ctrl+Enter)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
          Send
        </button>
        
        {/* Emoji picker */}
        {showEmojiPicker && (
          <div className="emoji-picker-container" ref={emojiPickerRef}>
            <div className="emoji-picker-content">
              {commonEmojis.map(emoji => (
                <button 
                  key={emoji}
                  type="button" 
                  className="emoji-btn" 
                  onClick={() => addEmoji(emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {isTyping && (
        <div className="typing-indicator">
          <span className="typing-badge">Typing...</span>
        </div>
      )}
    </form>
  );
}

export default MessageInput;
