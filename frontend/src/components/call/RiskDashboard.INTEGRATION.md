# RiskDashboard Integration Guide

## Quick Start

### 1. Import the Component

```jsx
import { RiskDashboard } from '../components/call';
// or
import RiskDashboard from '../components/call/RiskDashboard';
```

### 2. Add to ActiveCallPage

Here's how to integrate RiskDashboard into the ActiveCallPage component:

```jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { SimpleLayout } from '../components/layout/Layout';
import { RiskDashboard } from '../components/call';
import { useCall } from '../context/CallContext';

export default function ActiveCallPage() {
  const navigate = useNavigate();
  const { callId } = useParams();
  const { currentCall, isAnalyzing, callState, endCall } = useCall();

  // Redirect if no active call
  useEffect(() => {
    if (callState === 'idle' || callState === 'ended') {
      navigate('/dashboard');
    }
  }, [callState, navigate]);

  if (!currentCall || callState !== 'connected') {
    return <div>Connecting...</div>;
  }

  return (
    <SimpleLayout>
      <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950 p-6">
        <div className="max-w-6xl mx-auto">
          
          {/* Main Call Interface */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Left Column: Call Controls */}
            <div className="space-y-6">
              {/* Your existing call UI: avatar, duration, controls, etc. */}
              <div className="bg-dark-900 rounded-2xl p-8">
                {/* Call controls, avatar, waveform, etc. */}
              </div>
            </div>

            {/* Right Column: Risk Dashboard */}
            <div>
              <RiskDashboard
                callId={currentCall.id}
                callerInfo={{
                  name: currentCall.contact.full_name,
                  phoneNumber: currentCall.contact.phone_number,
                  avatar: currentCall.contact.avatar_url
                }}
                isAnalyzing={isAnalyzing}
              />
            </div>
          </div>
        </div>
      </div>
    </SimpleLayout>
  );
}
```

## Layout Options

### Option 1: Side-by-Side (Recommended for Desktop)

```jsx
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  {/* Call UI */}
  <div>...</div>
  
  {/* Risk Dashboard */}
  <RiskDashboard {...props} />
</div>
```

### Option 2: Stacked (Better for Mobile)

```jsx
<div className="space-y-6">
  {/* Call UI */}
  <div>...</div>
  
  {/* Risk Dashboard */}
  <RiskDashboard {...props} />
</div>
```

### Option 3: Collapsible Panel

```jsx
const [showRiskDashboard, setShowRiskDashboard] = useState(true);

return (
  <div>
    <button onClick={() => setShowRiskDashboard(!showRiskDashboard)}>
      {showRiskDashboard ? 'Hide' : 'Show'} Risk Analysis
    </button>
    
    {showRiskDashboard && (
      <RiskDashboard {...props} />
    )}
  </div>
);
```

## Props from CallContext

The `useCall()` hook provides all the data needed:

```jsx
const {
  currentCall,      // Contains call ID and contact info
  isAnalyzing,      // Boolean indicating if analysis is active
  riskData,         // Risk data (already handled by RiskDashboard internally)
} = useCall();
```

## Data Flow

```
Backend Analysis WebSocket
         ↓
   (risk_update message)
         ↓
   RiskDashboard Component
         ↓
   Internal State Update
         ↓
   UI Re-render with new data
```

The component handles all WebSocket subscription logic internally, so you just need to:
1. Pass the correct `callId`
2. Pass caller information
3. Pass the `isAnalyzing` flag

## Troubleshooting

### Component Not Receiving Updates

**Problem**: RiskDashboard shows "Initializing..." but never updates.

**Solutions**:
1. Check that `callId` prop matches the WebSocket message `call_id`
2. Verify analysis WebSocket is connected (check browser console)
3. Ensure backend is sending `risk_update` messages

```jsx
// Add debug logging
useEffect(() => {
  console.log('RiskDashboard mounted with callId:', callId);
}, [callId]);
```

### WebSocket Connection Issues

**Problem**: WebSocket connection fails.

**Solutions**:
1. Check that token is valid in localStorage
2. Verify backend WebSocket endpoint is running
3. Check browser console for connection errors

```jsx
// In CallContext or component
const ws = getAnalysisWebSocket();
ws.onConnection((isConnected) => {
  console.log('Analysis WebSocket connected:', isConnected);
});
```

### Timeline Not Updating

**Problem**: Risk history timeline stays empty.

**Solutions**:
1. Verify `risk_update` messages are being received
2. Check that messages contain valid `risk_level` and `risk_score`
3. Wait at least 5 seconds for first update (backend sends every 5s)

### Wrong Call Data Displayed

**Problem**: Risk data from previous call shows up.

**Solution**: Ensure component unmounts and remounts between calls:

```jsx
// Use key prop to force remount
<RiskDashboard
  key={currentCall.id}  // Force new instance per call
  callId={currentCall.id}
  {...otherProps}
/>
```

## Styling Customization

### Override Colors

```jsx
// In your Tailwind config or custom CSS
.risk-dashboard-low {
  @apply bg-green-900/20 text-green-400;
}

.risk-dashboard-medium {
  @apply bg-yellow-900/20 text-yellow-400;
}

.risk-dashboard-high {
  @apply bg-red-900/20 text-red-400;
}
```

### Adjust Sizing

```jsx
// Wrap in custom container
<div className="max-w-xl mx-auto">
  <RiskDashboard {...props} />
</div>
```

## Testing

### Mock Data for Development

```jsx
// Create a mock WebSocket for testing
const mockRiskUpdate = {
  type: 'risk_update',
  call_id: 'test-call-123',
  risk_level: 'MEDIUM',
  risk_score: 45,
  model_confidence: 87,
  recommendation: 'Test recommendation message',
  acoustic_indicators: {
    spectral_anomaly: 0.35,
    harmonic_distortion: 0.42
  },
  prosody_indicators: {
    rhythm_consistency: 0.78,
    pitch_naturalness: 0.82
  }
};

// Trigger update manually for testing
const ws = getAnalysisWebSocket();
ws.handleMessage(mockRiskUpdate);
```

### Visual Testing

```jsx
// Create a test page with all risk levels
<div className="space-y-6">
  <RiskDashboard 
    callId="test-low"
    callerInfo={{ name: "Test User (LOW)" }}
    isAnalyzing={true}
  />
  
  <RiskDashboard 
    callId="test-medium"
    callerInfo={{ name: "Test User (MEDIUM)" }}
    isAnalyzing={true}
  />
  
  <RiskDashboard 
    callId="test-high"
    callerInfo={{ name: "Test User (HIGH)" }}
    isAnalyzing={true}
  />
</div>
```

## Performance Tips

1. **Avoid Re-renders**: Pass stable props (use useMemo if needed)
2. **Conditional Rendering**: Only render when call is connected
3. **Cleanup**: Component handles cleanup automatically on unmount

```jsx
// Good: Stable props
const callerInfo = useMemo(() => ({
  name: contact.full_name,
  phoneNumber: contact.phone_number
}), [contact.full_name, contact.phone_number]);

// Good: Conditional rendering
{callState === 'connected' && (
  <RiskDashboard {...props} />
)}
```

## Complete Example

See `RiskDashboard.README.md` for full component documentation and examples.
