# WebRTC Integration Guide

## Overview
VoiceShield uses WebRTC for peer-to-peer voice calls with real-time AI voice analysis. This document explains the complete call flow and integration.

## Architecture

### Components
1. **WebRTC Manager** (`services/webrtc.js`) - Handles peer connections and media streams
2. **Signaling WebSocket** (`services/websocket.js`) - Exchanges call control messages
3. **Analysis WebSocket** (`services/websocket.js`) - Sends audio data for AI analysis
4. **Audio Processor** (`services/audioProcessor.js`) - Extracts PCM data from remote stream
5. **Call Context** (`context/CallContext.jsx`) - Orchestrates all services

## Call Flow

### Outgoing Call Flow
```
1. User clicks "Call" button on ContactsPage
   ↓
2. CallContext.startCall(contact) is called
   ↓
3. WebRTC Manager creates peer connection
   ↓
4. Request microphone permission
   ↓
5. Get local media stream (audio only)
   ↓
6. Add local stream to peer connection
   ↓
7. Create WebRTC offer (SDP)
   ↓
8. Send offer via Signaling WebSocket to backend
   ↓
9. Backend forwards offer to remote user
   ↓
10. Remote user accepts and creates answer
    ↓
11. Answer received via Signaling WebSocket
    ↓
12. WebRTC sets remote description (answer)
    ↓
13. ICE candidates exchanged (both directions)
    ↓
14. Peer connection established
    ↓
15. Remote stream received (ontrack event)
    ↓
16. Audio Processor initialized with remote stream
    ↓
17. PCM data extracted from remote audio
    ↓
18. PCM chunks sent to backend via Analysis WebSocket
    ↓
19. Backend AI analyzes voice patterns
    ↓
20. Risk updates received in real-time
    ↓
21. UI displays risk level and recommendations
```

### Incoming Call Flow
```
1. Backend sends incoming_call message via Signaling WebSocket
   ↓
2. CallContext receives event and sets incomingCall state
   ↓
3. IncomingCallModal appears on screen
   ↓
4. User clicks "Accept" button
   ↓
5. CallContext.acceptCall() is called
   ↓
6. Send call_accepted message via Signaling WebSocket
   ↓
7. WebRTC Manager initializes peer connection
   ↓
8. Request microphone permission
   ↓
9. Get local media stream
   ↓
10. Receive offer from remote user
    ↓
11. Set remote description (offer)
    ↓
12. Create answer
    ↓
13. Send answer via Signaling WebSocket
    ↓
14. ICE candidates exchanged
    ↓
15. Connection established
    ↓
16. Audio analysis begins (same as outgoing)
```

## Key Services

### WebRTC Manager
**Location**: `src/services/webrtc.js`

**Responsibilities**:
- Create and manage RTCPeerConnection
- Handle local/remote media streams
- Create offers and answers
- Exchange ICE candidates
- Monitor connection state
- Control microphone mute/unmute

**Key Methods**:
```javascript
const webrtc = getWebRTCManager();

// Create offer (caller)
await webrtc.createOffer();

// Create answer (receiver)
await webrtc.createAnswer(offer);

// Handle remote answer
await webrtc.handleAnswer(answer);

// Add ICE candidate
await webrtc.addIceCandidate(candidate);

// Toggle microphone
webrtc.toggleMute();

// End call
webrtc.endCall();

// Event handlers
webrtc.onRemoteStream((stream) => { /* handle remote stream */ });
webrtc.onIceCandidate((candidate) => { /* send to remote */ });
webrtc.onConnectionStateChange((state) => { /* update UI */ });
```

### Signaling WebSocket
**Location**: `src/services/websocket.js`

**Purpose**: Exchange call control messages between peers

**Messages Sent**:
- `call_initiate` - Start outgoing call
- `call_accept` - Accept incoming call
- `call_reject` - Reject incoming call
- `offer` - WebRTC offer (SDP)
- `answer` - WebRTC answer (SDP)
- `ice_candidate` - ICE candidate
- `hangup` - End call

**Messages Received**:
- `incoming_call` - New call from remote user
- `call_accepted` - Remote user accepted call
- `call_rejected` - Remote user rejected call
- `offer` - WebRTC offer from remote
- `answer` - WebRTC answer from remote
- `ice_candidate` - ICE candidate from remote
- `hangup` - Remote user ended call

**Usage**:
```javascript
const signalingWS = getSignalingWebSocket();

// Connect
await signalingWS.connect(token);

// Send offer
signalingWS.sendOffer(callId, recipientId, offer);

// Send answer
signalingWS.sendAnswer(callId, recipientId, answer);

// Listen for events
signalingWS.on('incoming_call', (message) => {
  // Handle incoming call
});
```

### Analysis WebSocket
**Location**: `src/services/websocket.js`

**Purpose**: Send audio data to backend for AI analysis

**Messages Sent**:
- `audio_chunk` - PCM audio data (Int16Array)

**Messages Received**:
- `risk_update` - Real-time risk analysis results
- `analysis_status` - Analysis state changes

**Usage**:
```javascript
const analysisWS = getAnalysisWebSocket();

// Connect with call ID
await analysisWS.connectWithCallId(token, callId);

// Send audio data
analysisWS.sendAudioChunk(callId, pcmData);

// Listen for risk updates
analysisWS.on('risk_update', (data) => {
  // Update UI with risk data
});
```

### Audio Processor
**Location**: `src/services/audioProcessor.js`

**Purpose**: Extract PCM data from remote audio stream

**Process**:
1. Create AudioContext with 16kHz sample rate
2. Create MediaStreamSource from remote stream
3. Create AnalyserNode for visualization
4. Create ScriptProcessorNode for PCM extraction
5. Convert Float32 audio to Int16 PCM format
6. Detect voice activity (threshold-based)
7. Send PCM chunks via callback

**Usage**:
```javascript
const processor = new AudioProcessor();

// Initialize with remote stream
await processor.initialize(remoteStream);

// Set audio data handler
processor.onAudioData((pcmData) => {
  // Send to backend
  analysisWS.sendAudioChunk(callId, pcmData);
});

// Start processing
processor.start();

// Get volume for visualization
const volume = processor.getVolumeLevel(); // 0-100

// Check voice activity
const isActive = processor.hasVoiceActivity(); // threshold = 10

// Cleanup
processor.cleanup();
```

## Call Context Integration

### State Management
The CallContext manages all call-related state:

```javascript
const {
  currentCall,      // Current active call object
  incomingCall,     // Incoming call waiting for response
  callState,        // IDLE, CALLING, RINGING, ACCEPTED, CONNECTED, ENDED
  isMuted,          // Microphone mute state
  isSpeakerOn,      // Speaker state (UI only)
  riskData,         // Latest risk analysis results
  isAnalyzing,      // Whether AI analysis is active
  
  // Actions
  startCall,        // Start outgoing call
  acceptCall,       // Accept incoming call
  rejectCall,       // Reject incoming call
  endCall,          // End current call
  toggleMute,       // Toggle microphone
  toggleSpeaker,    // Toggle speaker (UI state)
  getAudioVolume,   // Get current audio volume (0-100)
} = useCall();
```

### Starting a Call
```javascript
// From ContactsPage or any component
import { useCall } from '../context/CallContext';

function ContactCard({ contact }) {
  const { startCall } = useCall();
  
  const handleCall = () => {
    startCall(contact);
    // User will be navigated to /call/:callId automatically
  };
  
  return (
    <button onClick={handleCall}>Call</button>
  );
}
```

### Accepting/Rejecting Incoming Calls
```javascript
// IncomingCallModal component
import { useCall } from '../context/CallContext';

function IncomingCallModal() {
  const { incomingCall, acceptCall, rejectCall } = useCall();
  
  if (!incomingCall) return null;
  
  return (
    <Modal>
      <p>{incomingCall.contact.full_name} is calling...</p>
      <button onClick={acceptCall}>Accept</button>
      <button onClick={rejectCall}>Reject</button>
    </Modal>
  );
}
```

### During Active Call
```javascript
// ActiveCallPage component
import { useCall } from '../context/CallContext';

function ActiveCallPage() {
  const { 
    currentCall, 
    riskData, 
    isAnalyzing,
    isMuted,
    isSpeakerOn,
    toggleMute,
    toggleSpeaker,
    endCall,
    getAudioVolume,
  } = useCall();
  
  return (
    <div>
      <h2>{currentCall.contact.full_name}</h2>
      
      {/* Risk display */}
      {riskData && (
        <RiskStatusCard riskData={riskData} />
      )}
      
      {/* Waveform with volume */}
      <WaveformAnimation 
        isActive={!isMuted}
        volume={getAudioVolume()}
      />
      
      {/* Controls */}
      <button onClick={toggleMute}>
        {isMuted ? 'Unmute' : 'Mute'}
      </button>
      <button onClick={toggleSpeaker}>
        {isSpeakerOn ? 'Speaker Off' : 'Speaker On'}
      </button>
      <button onClick={endCall}>End Call</button>
    </div>
  );
}
```

## Mock Mode vs Production

### Mock Mode (Development)
When `VITE_MOCK_MODE=true` in `.env`:

- **Signaling WebSocket**: Connects to mock endpoint, messages logged but not sent
- **Analysis WebSocket**: Connects to mock endpoint, no real analysis
- **Risk Data**: Generated randomly every 5 seconds on ActiveCallPage
- **Audio Processing**: Still works (good for testing permissions)
- **WebRTC**: Real peer connection (can test locally with two tabs)

### Production Mode
When `VITE_MOCK_MODE=false`:

- **Signaling WebSocket**: Connects to real backend `/ws/signaling`
- **Analysis WebSocket**: Connects to real backend `/ws/analysis`
- **Risk Data**: Real AI analysis from backend
- **Audio Processing**: PCM data sent to backend
- **WebRTC**: Full peer-to-peer call functionality

## Configuration

### WebRTC Config
**Location**: `src/constants/index.js`

```javascript
export const WEBRTC_CONFIG = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};
```

**Note**: In production, add TURN servers for better connectivity behind NAT/firewalls.

### Audio Config
**Location**: `src/constants/index.js`

```javascript
export const AUDIO_CONFIG = {
  sampleRate: 16000,      // 16kHz for speech
  bufferSize: 4096,       // Process 4096 samples at a time
  channels: 1,            // Mono audio
};
```

## Browser Compatibility

### Required Features
- WebRTC (RTCPeerConnection)
- MediaDevices API (getUserMedia)
- WebSocket API
- Web Audio API (AudioContext)

### Supported Browsers
- ✅ Chrome 74+
- ✅ Firefox 66+
- ✅ Safari 12.1+
- ✅ Edge 79+

### Checking Support
```javascript
import WebRTCManager from './services/webrtc';
import AudioProcessor from './services/audioProcessor';

const isSupported = 
  WebRTCManager.isSupported() && 
  AudioProcessor.isSupported();

if (!isSupported) {
  alert('Your browser does not support VoiceShield calls');
}
```

## Security Considerations

### Privacy Features
1. **No Audio Storage**: Audio is processed in real-time, never stored in browser
2. **Peer-to-Peer**: Voice data flows directly between users (via WebRTC)
3. **Analysis Only**: Only PCM chunks sent to backend for analysis
4. **Encrypted**: WebRTC uses DTLS/SRTP for encryption
5. **Secure WebSocket**: Uses WSS (WebSocket Secure) protocol

### Permissions
- **Microphone**: Required for all calls
- **Browser asks automatically** when creating offer/answer
- **User must grant permission** or call will fail

### Error Handling
```javascript
try {
  await startCall(contact);
} catch (error) {
  if (error.message.includes('Permission denied')) {
    alert('Microphone access is required for calls');
  } else {
    alert('Failed to start call: ' + error.message);
  }
}
```

## Testing

### Local Testing (Two Browser Tabs)
1. Set `VITE_MOCK_MODE=true` in `.env`
2. Run `npm run dev`
3. Open two tabs: `http://localhost:5175`
4. Login with different accounts in each tab
5. Initiate call from Tab 1
6. Accept call in Tab 2
7. Verify mock risk data appears

### Production Testing
1. Set `VITE_MOCK_MODE=false`
2. Ensure backend is running
3. Test full call flow with real users
4. Verify risk analysis updates
5. Test edge cases (reject, hangup, network loss)

## Troubleshooting

### Common Issues

**1. Microphone permission denied**
- Check browser settings
- Use HTTPS (required for getUserMedia)
- Localhost is exempt from HTTPS requirement

**2. WebSocket connection failed**
- Verify backend is running
- Check WebSocket URL in constants
- Ensure token is valid

**3. No remote stream received**
- Check firewall/NAT settings
- Add TURN servers to WEBRTC_CONFIG
- Verify offer/answer exchange

**4. No risk data displayed**
- Check Analysis WebSocket connection
- Verify PCM data is being sent
- Check backend logs for errors

**5. Audio cutting out**
- Reduce AUDIO_CONFIG.bufferSize
- Check network bandwidth
- Monitor console for errors

## Future Enhancements

### Planned Features
- [ ] Group calls (multi-party)
- [ ] Screen sharing
- [ ] Call recording (with consent)
- [ ] Call quality metrics
- [ ] Adaptive bitrate
- [ ] Background noise suppression
- [ ] Echo cancellation improvements
- [ ] TURN server integration
- [ ] Call transfer
- [ ] Hold/Resume

### AI Analysis Improvements
- [ ] Real-time confidence intervals
- [ ] Voice fingerprinting
- [ ] Emotion detection
- [ ] Accent analysis
- [ ] Background audio classification
- [ ] Multi-language support

## Resources

### Documentation
- [WebRTC API](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API)
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [MediaDevices.getUserMedia()](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia)

### Backend Integration
- See `API_CONTRACT.md` for WebSocket message formats
- See `ARCHITECTURE.md` for system architecture
- See `backend/README.md` for backend setup

## Support
For issues or questions, refer to the main project README or contact the development team.
