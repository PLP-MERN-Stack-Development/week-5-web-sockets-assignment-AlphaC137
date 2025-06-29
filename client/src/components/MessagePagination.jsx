import React, { useState, useCallback } from 'react';
import { useChat } from '../context/ChatContext';
import { ChevronUp, RefreshCw } from 'lucide-react';

function MessagePagination({ currentRoom }) {
  const { socket, messages, dispatch } = useChat();
  const [isLoading, setIsLoading] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [page, setPage] = useState(1);

  const loadMoreMessages = useCallback(async () => {
    if (isLoading || !hasMoreMessages || !currentRoom) return;

    setIsLoading(true);
    
    // Simulate API call for older messages
    // In a real app, this would be an actual API call
    setTimeout(() => {
      // For demo purposes, we'll just show a loading state
      // In a real implementation, you'd emit a socket event to get older messages
      socket.emit('get older messages', {
        roomId: currentRoom.id,
        page: page + 1,
        limit: 20
      });
      
      setPage(prev => prev + 1);
      setIsLoading(false);
      
      // Simulate reaching the end of messages after 3 pages
      if (page >= 3) {
        setHasMoreMessages(false);
      }
    }, 1000);
  }, [isLoading, hasMoreMessages, currentRoom, socket, page]);

  if (!currentRoom || messages.length < 10) {
    return null; // Don't show pagination if there are few messages
  }

  return (
    <div style={{
      padding: '12px 20px',
      borderBottom: '1px solid #e9ecef',
      background: '#f8f9fa',
      textAlign: 'center'
    }}>
      {hasMoreMessages ? (
        <button
          onClick={loadMoreMessages}
          disabled={isLoading}
          style={{
            background: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '20px',
            padding: '8px 16px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.875rem',
            margin: '0 auto',
            opacity: isLoading ? 0.6 : 1,
            transition: 'opacity 0.2s'
          }}
        >
          {isLoading ? (
            <>
              <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} />
              Loading older messages...
            </>
          ) : (
            <>
              <ChevronUp size={14} />
              Load older messages
            </>
          )}
        </button>
      ) : (
        <p style={{
          margin: 0,
          color: '#6c757d',
          fontSize: '0.875rem',
          fontStyle: 'italic'
        }}>
          You've reached the beginning of this conversation
        </p>
      )}
      
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default MessagePagination;
