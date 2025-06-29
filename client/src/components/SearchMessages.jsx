import React, { useState } from 'react';
import { useChat } from '../context/ChatContext';
import { Search, X } from 'lucide-react';

function SearchMessages() {
  const { searchQuery, dispatch } = useChat();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSearch = (query) => {
    dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
  };

  const clearSearch = () => {
    handleSearch('');
    setIsExpanded(false);
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 16px',
      background: '#f8f9fa',
      borderBottom: '1px solid #e9ecef'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        flex: isExpanded ? 1 : 'none',
        transition: 'flex 0.2s ease'
      }}>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#6c757d'
          }}
        >
          <Search size={16} />
        </button>
        
        {isExpanded && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            flex: 1,
            position: 'relative'
          }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search messages..."
              style={{
                flex: 1,
                padding: '8px 32px 8px 12px',
                border: '1px solid #e9ecef',
                borderRadius: '20px',
                fontSize: '0.875rem',
                outline: 'none'
              }}
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                style={{
                  position: 'absolute',
                  right: '8px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#6c757d',
                  padding: '4px'
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>
        )}
      </div>
      
      {searchQuery && !isExpanded && (
        <div style={{
          fontSize: '0.875rem',
          color: '#6c757d',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span>Searching: "{searchQuery}"</span>
          <button
            onClick={clearSearch}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#6c757d',
              padding: '4px'
            }}
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

export default SearchMessages;
