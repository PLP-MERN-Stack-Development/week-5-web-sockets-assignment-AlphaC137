import { useState } from 'react';
import './SearchMessages.css';

function SearchMessages({ messages, onResultClick }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    
    // Search through messages
    const query = searchQuery.toLowerCase();
    const results = messages.filter(message => {
      // Skip system messages
      if (message.system) return false;
      
      // Search in message content
      if (typeof message.message === 'string') {
        return message.message.toLowerCase().includes(query);
      }
      
      // Search in file attachments and text
      if (message.message && typeof message.message === 'object') {
        const hasTextMatch = message.message.text && message.message.text.toLowerCase().includes(query);
        const hasFileNameMatch = message.message.attachment && 
          message.message.attachment.name && 
          message.message.attachment.name.toLowerCase().includes(query);
          
        return hasTextMatch || hasFileNameMatch;
      }
      
      return false;
    });
    
    setSearchResults(results);
    setIsSearching(false);
  };

  const handleResultClick = (message) => {
    setSearchQuery('');
    setSearchResults([]);
    if (onResultClick) {
      onResultClick(message);
    }
  };

  return (
    <div className="search-messages">
      <form onSubmit={handleSearch}>
        <div className="search-input-wrapper">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search messages..."
            className="search-input"
          />
          <button type="submit" className="search-button" title="Search messages">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
          </button>
        </div>
      </form>
      
      {isSearching && (
        <div className="search-loading">
          <div className="spinner"></div>
          <span>Searching...</span>
        </div>
      )}
      
      {searchResults.length > 0 && (
        <div className="search-results">
          <div className="search-results-header">
            Found {searchResults.length} results
          </div>
          {searchResults.map(message => (
            <div 
              key={message.id} 
              className="search-result" 
              onClick={() => handleResultClick(message)}
            >
              <div className="search-result-sender">{message.sender}</div>
              <div className="search-result-content">
                {typeof message.message === 'string' ? (
                  message.message.length > 50 ? `${message.message.substring(0, 50)}...` : message.message
                ) : (
                  message.message.text || `Shared: ${message.message.attachment.name}`
                )}
              </div>
              <div className="search-result-time">
                {new Date(message.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {searchQuery.trim() && searchResults.length === 0 && !isSearching && (
        <div className="no-search-results">
          No messages found matching "{searchQuery}"
        </div>
      )}
    </div>
  );
}

export default SearchMessages;
