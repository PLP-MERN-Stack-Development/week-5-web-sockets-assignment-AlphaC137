import { createContext, useContext } from 'react';
import { useSocket } from '../socket/socket';

const SocketContext = createContext();

export const useSocketContext = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const socket = useSocket();

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
