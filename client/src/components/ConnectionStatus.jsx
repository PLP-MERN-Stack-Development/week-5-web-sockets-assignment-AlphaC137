import React from 'react';
import { useChat } from '../context/ChatContext';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

function ConnectionStatus() {
  const { isConnected, socket } = useChat();

  const handleReconnect = () => {
    if (socket && !isConnected) {
      socket.connect();
    }
  };

  if (isConnected) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 8px',
        background: '#d4edda',
        color: '#155724',
        borderRadius: '12px',
        fontSize: '0.75rem',
        border: '1px solid #c3e6cb'
      }}>
        <Wifi size={12} />
        <span>Connected</span>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      padding: '4px 8px',
      background: '#f8d7da',
      color: '#721c24',
      borderRadius: '12px',
      fontSize: '0.75rem',
      border: '1px solid #f5c6cb'
    }}>
      <WifiOff size={12} />
      <span>Disconnected</span>
      <button
        onClick={handleReconnect}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'inherit',
          padding: '2px',
          display: 'flex',
          alignItems: 'center'
        }}
        title="Reconnect"
      >
        <RefreshCw size={10} />
      </button>
    </div>
  );
}

export default ConnectionStatus;
