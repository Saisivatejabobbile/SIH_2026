# useAudioProcessor Hook

## Overview

The `useAudioProcessor` hook manages AudioWorklet-based real-time audio processing for VoiceShield's voice analysis feature. It extracts PCM audio data from a remote WebRTC stream, performs Voice Activity Detection (VAD), and sends audio chunks to the backend analysis WebSocket.

**Requirements Implemented:** 11.1, 11.2, 11.5, 11.7

## Architecture

```
Remote MediaStream
       ↓
MediaStreamSource
       ↓
AudioWorkletNode (voiceshield-audio-processor)
       ↓
  Destination
       ↓
PCM Extraction + VAD
       ↓
Analysis WebSocket
```

## API

### Function Signature

```javascript
useAudioProcessor(remoteStream, callId, sendAudioChunk)
```

### Parameters

- **remoteStream** (`MediaStream | null`): The remote audio stream from WebRTC peer connection
- **callId** (`string | null`): Unique identifier for the current call
- **sendAudioChunk** (`function`): Callback to send audio data to analysis WebSocket
  - Signature: `(callId: string, pcmData: number[], sampleRate: number) => void`

### Return Value

```javascript
{
  isProcessing: boolean,  // Whether audio processing is active
  cleanup: function        // Manual cleanup function (usually not needed)
}
```

## Usage Examples

### Basic Integration with WebRTC

```javascript
import { useAudioProcessor } from './hooks/useAudioProcessor';
import { useWebSocket } from './hooks/useWebSocket';

function ActiveCallPage() {
  const [remoteStream, setRemoteStream] = useState(null);
  const [callId] = useState('call-123');
  
  // Connect to analysis WebSocket
  const token = localStorage.getItem('access_token');
  const analysisWS = useWebSocket(
    `${import.meta.env.VITE_WS_URL}/ws/analysis`,
    token
  );
  
  // Function to send audio chunks
  const sendAudioChunk = useCallback((callId, pcmData, sampleRate) => {
    if (analysisWS.isConnected) {
      analysisWS.sendMessage({
        type: 'audio_chunk',
        call_id: callId,
        pcm_data: pcmData,
        sample_rate: sampleRate,
        timestamp: Date.now(),
      });
    }
  }, [analysisWS]);
  
  // Initialize audio processor
  const { isProcessing } = useAudioProcessor(
    remoteStream,
    callId,
    sendAudioChunk
  );
  
  // Handle remote stream from WebRTC
  useEffect(() => {
    // When peer connection receives remote stream
    peerConnection.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
    };
  }, []);
  
  return (
    <div>
      <audio ref={audioRef} autoPlay />
      {isProcessing && <p>Audio analysis active</p>}
    </div>
  );
}
```

### Complete Example with Risk Dashboard

```javascript
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useAudioProcessor } from './hooks/useAudioProcessor';
import { useWebSocket } from './hooks/useWebSocket';
import RiskDashboard from './components/RiskDashboard';

function ActiveCallPage({ callId, callerInfo }) {
  const [remoteStream, setRemoteStream] = useState(null);
  const [riskData, setRiskData] = useState(null);
  const audioRef = useRef(null);
  
  // Get auth token
  const token = localStorage.getItem('access_token');
  
  // Connect to analysis WebSocket
  const analysisWS = useWebSocket(
    `${import.meta.env.VITE_WS_URL}/ws/analysis`,
    token
  );
  
  // Handle risk updates
  useEffect(() => {
    const unsubscribe = analysisWS.onMessage('risk_update', (message) => {
      if (message.call_id === callId) {
        setRiskData({
          riskLevel: message.risk_level,
          riskScore: message.risk_score,
          confidence: message.model_confidence,
          recommendation: message.recommendation,
          timestamp: message.timestamp,
        });
      }
    });
    
    return unsubscribe;
  }, [analysisWS, callId]);
  
  // Send audio chunks to backend
  const sendAudioChunk = useCallback((callId, pcmData, sampleRate) => {
    if (analysisWS.isConnected) {
      analysisWS.sendMessage({
        type: 'audio_chunk',
        call_id: callId,
        pcm_data: pcmData,
        sample_rate: sampleRate,
        timestamp: Date.now(),
      });
    }
  }, [analysisWS]);
  
  // Initialize audio processor
  const { isProcessing } = useAudioProcessor(
    remoteStream,
    callId,
    sendAudioChunk
  );
  
  // Play remote audio
  useEffect(() => {
    if (audioRef.current && remoteStream) {
      audioRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);
  
  return (
    <div className="active-call-page">
      <audio ref={audioRef} autoPlay />
      
      <RiskDashboard
        callId={callId}
        callerInfo={callerInfo}
        riskData={riskData}
        isAnalyzing={isProcessing}
      />
    </div>
  );
}

export default ActiveCallPage;
```

## AudioWorklet Processor

The hook loads the AudioWorklet processor from `/public/audioProcessor.js`:

```javascript
// public/audioProcessor.js
class VoiceShieldAudioProcessor extends AudioWorkletProcessor {
  process(inputs, outputs, parameters) {
    // Extract PCM data
    // Perform VAD
    // Send to main thread
    this.port.postMessage({
      type: 'pcm_chunk',
      data: Int16Array,      // PCM samples
      timestamp: number,     // Current time
      hasSpeech: boolean     // VAD result
    });
  }
}

registerProcessor('voiceshield-audio-processor', VoiceShieldAudioProcessor);
```

## Audio Processing Pipeline

### 1. AudioContext Creation
- Creates Web Audio API context
- Sample rate determined by browser (typically 48kHz)

### 2. AudioWorklet Module Loading
- Loads processor from `/audioProcessor.js`
- Runs in separate audio thread (non-blocking)

### 3. MediaStreamSource Creation
- Connects remote WebRTC stream to Web Audio graph
- Extracts audio samples for processing

### 4. AudioWorklet Node
- Processes audio in 128-sample quantums
- Accumulates to 4096-sample chunks
- Resamples to 16kHz for AI model
- Converts stereo to mono if needed

### 5. Voice Activity Detection
- Energy-based VAD with configurable threshold
- Only sends audio when speech detected
- Reduces network traffic and processing

### 6. PCM Conversion
- Converts Float32 samples to Int16 PCM
- Clamps values to [-1, 1] range
- Scales to 16-bit integer range [-32768, 32767]

### 7. WebSocket Transmission
- Sends PCM chunks to backend via WebSocket
- Includes call ID, sample rate, timestamp
- Only when `hasSpeech` is true

## Configuration

### Environment Variables

```env
# WebSocket URL for analysis
VITE_WS_URL=ws://localhost:8000
```

### AudioWorklet Parameters

In `public/audioProcessor.js`:

```javascript
this.bufferSize = 4096;        // Samples per chunk
this.targetSampleRate = 16000; // Target sample rate (Hz)
this.vadThreshold = 0.01;      // VAD energy threshold
```

## Cleanup and Memory Management

The hook automatically handles cleanup:

1. **On Component Unmount:**
   - Disconnects AudioWorklet node
   - Disconnects MediaStreamSource
   - Closes AudioContext
   - Releases all audio resources

2. **On remoteStream Change:**
   - Cleans up old processor
   - Initializes new processor with new stream

3. **Manual Cleanup:**
   ```javascript
   const { cleanup } = useAudioProcessor(remoteStream, callId, sendAudioChunk);
   
   // Manually trigger cleanup if needed
   cleanup();
   ```

## Error Handling

### Browser Compatibility

The hook checks for AudioWorklet support:

```javascript
if (!window.AudioWorklet) {
  console.warn('AudioWorklet not supported in this browser');
  // Gracefully degrades - no audio analysis
}
```

### Initialization Errors

```javascript
try {
  await audioContext.audioWorklet.addModule('/audioProcessor.js');
} catch (error) {
  console.error('Failed to initialize AudioWorklet:', error);
  // Hook continues but isProcessing remains false
}
```

## Performance Considerations

### Latency
- AudioWorklet runs in real-time audio thread
- Processing latency: < 50ms per chunk
- Network latency depends on WebSocket connection

### Memory
- Bounded in-memory buffer (4096 samples)
- No persistent audio storage
- Automatic cleanup on call end

### CPU Usage
- AudioWorklet runs in separate thread
- Minimal impact on main thread
- Efficient VAD algorithm

### Network Bandwidth
- Only sends audio when speech detected
- 16kHz sample rate reduces bandwidth
- ~32 KB/s when speaking continuously

## Security and Privacy

### No Persistent Storage
- Audio processed in-memory only
- No disk writes or caching
- Buffers cleared on cleanup

### Transient Processing
- Audio sent to backend is transient
- Backend processes without storing
- Only metadata (risk scores) persisted

### Secure WebSocket
- Uses authenticated WebSocket connection
- JWT token required
- Encrypted in production (WSS)

## Debugging

### Console Logs

The hook logs key events:

```
Initializing AudioWorklet processor...
AudioProcessor initialized: 48000Hz → 16000Hz, buffer=4096, VAD=0.01
AudioWorklet module loaded
AudioWorklet pipeline connected
Audio chunk: 4096 samples, speech=true, time=1.50s
Cleaning up AudioWorklet processor...
AudioWorklet cleanup complete
```

### Checking Status

```javascript
const { isProcessing } = useAudioProcessor(remoteStream, callId, sendAudioChunk);

console.log('Audio processing:', isProcessing);
```

### Verifying Audio Flow

1. Check browser console for AudioWorklet logs
2. Verify WebSocket connection is active
3. Monitor network tab for WebSocket messages
4. Check backend logs for received audio chunks

## Browser Support

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome 66+ | ✅ | Full support |
| Firefox 76+ | ✅ | Full support |
| Safari 14.1+ | ✅ | Full support |
| Edge 79+ | ✅ | Chromium-based |
| Opera 53+ | ✅ | Full support |

AudioWorklet is widely supported in modern browsers. For unsupported browsers, the hook gracefully degrades without crashing.

## Related Documentation

- [AudioWorklet Processor](../public/audioProcessor.js)
- [WebRTC Integration Guide](../WEBRTC_INTEGRATION.md)
- [Risk Dashboard Component](../components/RiskDashboard.jsx)
- [Analysis WebSocket API](../../backend/app/websockets/analysis.py)

## Troubleshooting

### Audio processor not starting

**Problem:** `isProcessing` remains `false`

**Solutions:**
1. Check that `remoteStream` is not null
2. Check that `callId` is not null
3. Verify `/audioProcessor.js` is accessible
4. Check browser console for errors

### No audio chunks sent to backend

**Problem:** WebSocket receives no messages

**Solutions:**
1. Verify WebSocket connection is active
2. Check that `sendAudioChunk` callback is provided
3. Ensure VAD threshold is appropriate (try lowering)
4. Check that remote audio stream has active tracks

### Audio quality issues

**Problem:** Distorted or choppy audio

**Solutions:**
1. Check network bandwidth
2. Verify sample rate conversion is working
3. Test with different buffer sizes
4. Monitor CPU usage

## Future Enhancements

Potential improvements for future versions:

1. **Adaptive VAD:** Adjust threshold based on ambient noise
2. **Noise Reduction:** Pre-process audio before sending
3. **Compression:** Compress PCM data before transmission
4. **Buffering Strategy:** Implement adaptive buffering
5. **Quality Metrics:** Monitor audio quality in real-time
