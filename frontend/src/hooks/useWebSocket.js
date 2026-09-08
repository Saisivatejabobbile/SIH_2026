import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * useWebSocket Hook
 * 
 * Manages WebSocket connections with reconnection logic.
 * Requirements: 1.1, 1.5, 9.4
 */
export const useWebSocket = (url, token) => {
  const [connectionState, setConnectionState] = useState('disconnected');
  const [isConnected, setIsConnected] = useState(false);
  
  const wsRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef(null);
  const messageHandlersRef = useRef(new Map());
  
  const maxReconnectAttempts = 5;
  const baseReconnectDelay = 2000; // 2 seconds
  
  /**
   * Register message handler
   */
  const onMessage = useCallback((messageType, handler) => {
    if (!messageHandlersRef.current.has(messageType)) {
      messageHandlersRef.current.set(messageType, []);
    }
    messageHandlersRef.current.get(messageType).push(handler);
    
    // Return cleanup function
    return () => {
      const handlers = messageHandlersRef.current.get(messageType);
      if (handlers) {
        const index = handlers.indexOf(handler);
        if (index > -1) {
          handlers.splice(index, 1);
        }
      }
    };
  }, []);
  
  /**
   * Handle incoming WebSocket messages
   */
  const handleMessage = useCallback((event) => {
    try {
      const message = JSON.parse(event.data);
      const { type } = message;
      
      console.log(`WebSocket received: ${type}`, message);
      
      // Call registered handlers for this message type
      const handlers = messageHandlersRef.current.get(type) || [];
      handlers.forEach(handler => {
        try {
          handler(message);
        } catch (error) {
          console.error(`Error in message handler for ${type}:`, error);
        }
      });
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
    }
  }, []);
  
  /**
   * Send message through WebSocket
   */
  const sendMessage = useCallback((message) => {
    if (wsRef.current && isConnected) {
      const jsonMessage = JSON.stringify(message);
      wsRef.current.send(jsonMessage);
      console.log(`WebSocket sent: ${message.type}`, message);
    } else {
      console.error('WebSocket not connected, cannot send message');
    }
  }, [isConnected]);
  
  /**
   * Attempt reconnection with exponential backoff
   */
  const attemptReconnect = useCallback(() => {
    if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      setConnectionState('failed');
      return;
    }
    
    reconnectAttemptsRef.current += 1;
    const delay = baseReconnectDelay * reconnectAttemptsRef.current;
    
    console.log(
      `Attempting reconnect ${reconnectAttemptsRef.current}/${maxReconnectAttempts} in ${delay}ms...`
    );
    
    setConnectionState('reconnecting');
    
    reconnectTimeoutRef.current = setTimeout(() => {
      connect();
    }, delay);
  }, []);
  
  /**
   * Connect to WebSocket
   */
  const connect = useCallback(() => {
    if (!url || !token) {
      console.warn('WebSocket URL or token not provided');
      return;
    }
    
    // Clear any existing reconnect timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    setConnectionState('connecting');
    
    try {
      const wsUrl = `${url}?token=${token}`;
      console.log(`WebSocket connecting to: ${url}`);
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log(`WebSocket connected: ${url}`);
        setConnectionState('connected');
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;
      };
      
      ws.onmessage = handleMessage;
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
      
      ws.onclose = () => {
        console.log(`WebSocket closed: ${url}`);
        setConnectionState('disconnected');
        setIsConnected(false);
        
        // Attempt reconnection
        attemptReconnect();
      };
      
      wsRef.current = ws;
      
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      setConnectionState('disconnected');
      attemptReconnect();
    }
  }, [url, token, handleMessage, attemptReconnect]);
  
  /**
   * Disconnect WebSocket
   */
  const disconnect = useCallback(() => {
    console.log('WebSocket disconnecting...');
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    setIsConnected(false);
    setConnectionState('disconnected');
    reconnectAttemptsRef.current = 0;
  }, []);
  
  /**
   * Auto-connect on mount and when URL/token changes
   */
  useEffect(() => {
    if (url && token) {
      connect();
    }
    
    return () => {
      disconnect();
    };
  }, [url, token]);
  
  return {
    isConnected,
    connectionState,
    sendMessage,
    onMessage,
    connect,
    disconnect,
  };
};

export default useWebSocket;
