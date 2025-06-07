import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

export const useSocket = () => {
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io('http://localhost:8000');

    socketRef.current.on('connect', () => {
      console.log('✅ Connected to socket server');
    });

    socketRef.current.on('disconnect', () => {
      console.log('❌ Disconnected from socket server');
    });

    // socketRef.current.on('transcoding-completed', (data) => {
    //   console.log('Transcoding complete:', data);
    // });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  return socketRef;
};
