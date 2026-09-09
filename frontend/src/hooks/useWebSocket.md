# useWebSocket Hook Documentation

## Overview

The `useWebSocket` hook provides a robust WebSocket connection manager with automatic reconnection logic and exponential backoff for React applications.

**Requirements:** 1.1, 1.5, 9.4

## Features

✅ **WebSocket Connection Management**
- Automatic connection on mount
- Graceful disconnection on unmount
- Token-based authentication via query parameter

✅ **Connection State Tracking**
- States: `connecting`, `connected`, `disconnected`, `reconnecting`, `failed`
- Boolean `isConnected` flag for quick checks

✅ **Automatic Reconnection**
- Exponential backoff algorithm (2s, 4s, 6s, 8s, 10s)
- Maximum 5 reconnection attempts
- Automatic cleanup after max attempts

✅ **Message Handling**
- JSON message serialization/deserialization
- Type-based message routing
- Multiple handlers per message type
- Handler cleanup/unsubscribe support

✅ **Error Handling**
- Error logging via `onerror` handler
- Graceful degradation on connection failures
- Safe message sending (checks connection state)

## API Reference

### Hook Signature

```javascript
const {
  isConnected,
  connectionState,
  sendMessage,
  onMessage,
  connect,
  disconnect
} = useWebSocket(url, token);
```

### Parameters

- **url** (string): WebSocket endpoint URL (e.g., `ws://localhost:8000/ws/signaling`)
- **token** (string): JWT authentication token

### Return Values

| Property | Type | Description |
|----------|------|-------------|
| `isConnected` | boolean | True when WebSocket is open and ready |
| `connectionState` | string | Current state: 'connecting', 'connected', 'disconnected', 'reconnecting', 'failed' |
| `sendMessage` | function | Send JSON message through WebSocket |
| `onMessage` | function | Register message handler by type (returns cleanup function) |
| `connect` | function | Manually trigger connection (usually auto-connects) |
| `disconnect` | function | Manually close connection |

## Usage Examples

### Basic Connection

```javascript
import { useWebSocket } from './hooks/useWebSocket';

function MyComponent() {
  const { isConnected, connectionState, sendMessage, onMessage } = useWebSocket(
    'ws://localhost:8000/ws/signaling',
    userToken
  );
  
  return (
    <div>
      <p>Status: {connectionState}</p>
      <p>Connected: {isConnected ? 'Yes' : 'No'}</p>
    </div>
  );
}
```

### Sending Messages

```javascript
function CallComponent() {
  const { sendMessage, isConnected } = useWebSocket(url, token);
  
  const initiateCall = (contactId) => {
    if (isConnected) {
      sendMessage({
        type: 'call_initiate',
        to: contactId,
        call_id: generateCallId()
      });
    }
  };
  
  return <button onClick={() => initiateCall('user123')}>Call</button>;
}
```

### Receiving Messages

```javascript
function SignalingComponent() {
  const { onMessage } = useWebSocket(url, token);
  
  useEffect(() => {
    // Register handler for incoming call offers
    const cleanup = onMessage('offer', (message) => {
      console.log('Received offer:', message);
      handleIncomingOffer(message);
    });
    
    // Cleanup handler on unmount
    return cleanup;
  }, [onMessage]);
  
  return <div>Waiting for calls...</div>;
}
```

### Multiple Message Handlers

```javascript
function WebRTCComponent() {
  const { onMessage } = useWebSocket(url, token);
  
  useEffect(() => {
    const cleanupOffer = onMessage('offer', handleOffer);
    const cleanupAnswer = onMessage('answer', handleAnswer);
    const cleanupIceCandidate = onMessage('ice_candidate', handleIceCandidate);
    const cleanupHangup = onMessage('hangup', handleHangup);
    
    return () => {
      cleanupOffer();
      cleanupAnswer();
      cleanupIceCandidate();
      cleanupHangup();
    };
  }, [onMessage]);
  
  return <div>WebRTC Call Manager</div>;
}
```

### Connection State Monitoring

```javascript
function ConnectionStatus() {
  const { connectionState, isConnected, connect } = useWebSocket(url, token);
  
  return (
    <div className="connection-status">
      {connectionState === 'connecting' && (
        <span>🔄 Connecting...</span>
      )}
      {connectionState === 'connected' && (
        <span>✅ Connected</span>
      )}
      {connectionState === 'disconnected' && (
        <span>❌ Disconnected</span>
      )}
      {connectionState === 'reconnecting' && (
        <span>🔄 Reconnecting...</span>
      )}
      {connectionState === 'failed' && (
        <div>
          <span>⚠️ Connection Failed</span>
          <button onClick={connect}>Retry</button>
        </div>
      )}
    </div>
  );
}
```

## Implementation Details

### Connection Flow

1. **Initialization**: Hook receives `url` and `token` parameters
2. **Auto-Connect**: `useEffect` triggers connection on mount
3. **URL Construction**: Appends token as query parameter: `${url}?token=${token}`
4. **WebSocket Creation**: Creates new WebSocket instance
5. **Event Handlers**: Sets up `onopen`, `onmessage`, `onerror`, `onclose`
6. **State Updates**: Updates `connectionState` and `isConnected` based on events

### Reconnection Logic

```
Attempt 1: Wait 2000ms (2 * 1)
Attempt 2: Wait 4000ms (2 * 2)
Attempt 3: Wait 6000ms (2 * 3)
Attempt 4: Wait 8000ms (2 * 4)
Attempt 5: Wait 10000ms (2 * 5)
After 5 attempts: Set state to 'failed', stop reconnecting
```

### Message Routing

1. Incoming message parsed from JSON
2. Extract `type` field from message
3. Look up registered handlers for that type
4. Call each handler with the full message object
5. Handle errors within individual handlers without crashing

### Memory Management

- Uses `useRef` to store WebSocket instance and handlers
- Cleans up timeouts on disconnect
- Unregisters handlers when components unmount
- Closes WebSocket connection on hook unmount

## Requirements Validation

| Requirement | Status | Implementation |
|-------------|--------|----------------|
| useWebSocket(url, token) hook | ✅ | Lines 8-208 |
| Token in query string | ✅ | Line 122 |
| Connection state tracking | ✅ | Lines 10-11, states: connecting/connected/disconnected/reconnecting/failed |
| onopen handler → 'connected' | ✅ | Lines 124-129 |
| onclose handler → 'disconnected' + reconnect | ✅ | Lines 135-155 |
| onerror handler with logging | ✅ | Lines 131-133 |
| sendMessage() function | ✅ | Lines 90-100 |
| Exponential backoff reconnection | ✅ | Lines 35-36, 143-149 |
| Max 5 reconnection attempts | ✅ | Line 35, 138-154 |
| Return isConnected, connectionState, sendMessage, onMessage | ✅ | Lines 202-208 |

## Integration with WebRTC Workflow

The `useWebSocket` hook is designed to work with the WebRTC signaling workflow:

1. **Signaling WebSocket**: Connect to `/ws/signaling` for call signaling
2. **Analysis WebSocket**: Connect to `/ws/analysis` for audio analysis updates
3. **Message Types**: Handle call_initiate, offer, answer, ice_candidate, hangup, risk_update, etc.

### Example: Complete WebRTC Integration

```javascript
function useWebRTCCall() {
  const signalingWs = useWebSocket('ws://localhost:8000/ws/signaling', token);
  const analysisWs = useWebSocket('ws://localhost:8000/ws/analysis', token);
  
  useEffect(() => {
    // Register signaling handlers
    const cleanupOffer = signalingWs.onMessage('offer', handleOffer);
    const cleanupAnswer = signalingWs.onMessage('answer', handleAnswer);
    const cleanupIce = signalingWs.onMessage('ice_candidate', handleIceCandidate);
    
    // Register analysis handlers
    const cleanupRisk = analysisWs.onMessage('risk_update', handleRiskUpdate);
    
    return () => {
      cleanupOffer();
      cleanupAnswer();
      cleanupIce();
      cleanupRisk();
    };
  }, [signalingWs, analysisWs]);
  
  const initiateCall = (contactId) => {
    signalingWs.sendMessage({
      type: 'call_initiate',
      to: contactId,
      call_id: generateCallId()
    });
  };
  
  return { initiateCall, /* ... */ };
}
```

## Testing

The hook includes comprehensive test coverage in `useWebSocket.test.js`:

- ✅ Initial disconnected state
- ✅ Connection with token in query string
- ✅ State transitions (connecting → connected)
- ✅ Message sending
- ✅ Message receiving and routing
- ✅ Reconnection on close
- ✅ Exponential backoff
- ✅ Max reconnection attempts
- ✅ Error handling
- ✅ Cleanup on unmount
- ✅ Handler registration and cleanup

## Security Considerations

1. **Token in Query String**: While convenient, tokens in URLs can be logged. Consider using a secure WebSocket upgrade with token in headers for production.
2. **HTTPS/WSS**: Always use `wss://` in production to encrypt WebSocket traffic.
3. **Token Expiry**: Implement token refresh logic when connection fails due to expired tokens.
4. **Message Validation**: Always validate incoming messages on the backend before processing.

## Performance Considerations

1. **Reconnection Backoff**: Exponential backoff prevents server overload during network issues.
2. **Message Handlers**: Use `useCallback` for handler functions to prevent re-registration.
3. **Memory Leaks**: Always cleanup message handlers using the returned cleanup function.
4. **Ref Usage**: WebSocket instance stored in ref to prevent unnecessary re-renders.

## Browser Compatibility

The hook relies on native WebSocket API, supported in:
- ✅ Chrome 16+
- ✅ Firefox 11+
- ✅ Safari 7+
- ✅ Edge 12+
- ✅ All modern mobile browsers

## Troubleshooting

### Connection Fails Immediately

**Symptom**: `connectionState` goes to 'failed' quickly
**Solution**: Check backend server is running and WebSocket endpoint is correct

### Messages Not Being Received

**Symptom**: `sendMessage` works but no responses
**Solution**: Verify message handler is registered before messages arrive

### Reconnection Not Working

**Symptom**: After disconnect, stays in 'disconnected' state
**Solution**: Check browser console for errors, verify reconnection attempts haven't been exhausted

### Multiple Connections Created

**Symptom**: Multiple WebSocket instances being created
**Solution**: Ensure hook is not re-rendering unnecessarily, check dependencies in parent component

## Future Enhancements

- [ ] Configurable reconnection strategy (linear, exponential, fixed)
- [ ] Heartbeat/ping-pong for connection health monitoring
- [ ] Message queue for offline messages
- [ ] Connection priority and queuing
- [ ] WebSocket connection pooling
- [ ] Binary message support (currently JSON only)

## Changelog

### Version 1.0.0 (Current)
- Initial implementation with all requirements met
- Exponential backoff reconnection
- Type-based message routing
- Comprehensive error handling
- Automatic cleanup and memory management
