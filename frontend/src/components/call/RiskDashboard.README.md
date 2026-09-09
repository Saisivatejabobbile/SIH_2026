# RiskDashboard Component

## Overview

The `RiskDashboard` component displays real-time voice authenticity risk indicators during active calls. It subscribes to the analysis WebSocket to receive risk updates and visualizes them with color-coded indicators, progress bars, and historical timeline.

## Implementation Status

✅ **Task 8.1**: Create component structure with WebSocket subscription
✅ **Task 8.2**: Add risk level indicator with color coding (GREEN/YELLOW/RED)
✅ **Task 8.3**: Add risk score and confidence display with progress bars
✅ **Task 8.4**: Add recommendation display
✅ **Task 8.5**: Add optional indicators display (acoustic/prosody)
✅ **Task 8.6**: Add risk history timeline visualization
✅ **Task 8.7**: Add privacy notice and caller info display

## Requirements Fulfilled

- **Requirement 14.1**: Display current risk level with color-coded indicators
- **Requirement 14.2**: Show caller information including name and phone number
- **Requirement 14.3**: Update display within 500ms of receiving risk updates
- **Requirement 15.5**: Display acoustic and prosody indicators when available

## Props

```typescript
interface RiskDashboardProps {
  callId: string;              // Unique call identifier for WebSocket subscription
  callerInfo: {
    name: string;              // Caller's name
    avatar?: string;           // Optional avatar URL
    phoneNumber?: string;      // Optional phone number
  };
  isAnalyzing: boolean;        // Whether AI analysis is currently active
}
```

## Usage

```jsx
import { RiskDashboard } from '../components/call';

function ActiveCallPage() {
  const { currentCall, isAnalyzing } = useCall();
  
  return (
    <div>
      {/* Other call UI elements */}
      
      <RiskDashboard
        callId={currentCall.id}
        callerInfo={{
          name: currentCall.contact.full_name,
          phoneNumber: currentCall.contact.phone_number
        }}
        isAnalyzing={isAnalyzing}
      />
    </div>
  );
}
```

## Features

### 1. Real-time WebSocket Integration (Task 8.1)

- Automatically subscribes to analysis WebSocket on mount
- Listens for `risk_update` messages matching the current call ID
- Updates all state variables when new risk data arrives
- Appends risk history entries for timeline visualization
- Properly cleans up WebSocket subscriptions on unmount

### 2. Risk Level Indicator (Task 8.2)

Three color-coded risk levels:

- **🟢 LOW (0-30)**: Green - Voice appears natural
- **🟡 MEDIUM (31-70)**: Yellow - Moderate synthetic indicators
- **🔴 HIGH (71-100)**: Red - Possible synthetic voice detected

Each level has:
- Distinct color scheme (text, background, border)
- Emoji indicator for quick visual recognition
- Animated pulse effect
- Large, prominent display

### 3. Progress Bars (Task 8.3)

Two animated progress bars with smooth transitions:

**Risk Score (0-100)**:
- Full-width progress bar
- Color-coded based on risk level
- Displays numeric score prominently
- Animated updates with 500ms transition

**Model Confidence (0-100%)**:
- Blue-themed progress bar
- Shows AI model's confidence in its assessment
- Helps users understand reliability of the analysis

### 4. Recommendation Display (Task 8.4)

Context-aware user guidance based on risk level:

- **LOW**: "Voice appears natural. Continue call normally."
- **MEDIUM**: "Moderate synthetic indicators detected. Stay alert and verify caller identity if needed."
- **HIGH**: "Possible synthetic voice detected. Perform independent caller verification before sharing sensitive information."

Displayed in a prominent card with:
- Color-coded styling matching risk level
- Icon indicator
- Easy-to-read text formatting

### 5. Optional Indicators (Task 8.5)

When AI model provides detailed analysis, displays:

**Acoustic Indicators** 🎵:
- Spectral anomaly
- Harmonic distortion
- Other acoustic features

**Prosody Indicators** 🎙️:
- Rhythm consistency
- Pitch naturalness
- Speech pattern metrics

Each indicator:
- Displayed in separate card
- Formatted as percentage or appropriate unit
- Uses readable key names (underscores replaced with spaces)

### 6. Risk History Timeline (Task 8.6)

Visual timeline showing risk level changes during the call:

- Displays up to 60 data points (5 minutes at 5-second intervals)
- Color-coded bars matching risk level at each point
- Height proportional to risk score
- "Start" and "Current" labels
- Smooth bar transitions
- Helpful tooltips showing exact values

### 7. Privacy Notice (Task 8.7)

Clear privacy assurance:
- 🔒 Lock icon for security
- "Audio processed transiently • Not stored • Privacy protected"
- Positioned at bottom of dashboard
- Subtle but visible styling

### 8. Caller Information Display (Task 8.7)

Displays caller details:
- Avatar with name initials
- Full name prominently shown
- Phone number (if available)
- Analysis status badge when active

## State Management

The component maintains the following state:

```javascript
const [riskLevel, setRiskLevel] = useState('LOW');           // 'LOW' | 'MEDIUM' | 'HIGH'
const [riskScore, setRiskScore] = useState(0);               // 0-100
const [confidence, setConfidence] = useState(0);             // 0-100
const [recommendation, setRecommendation] = useState('');    // String message
const [indicators, setIndicators] = useState({               // Optional indicators
  acoustic: null,
  prosody: null
});
const [riskHistory, setRiskHistory] = useState([]);          // Array of history entries
```

## WebSocket Message Format

The component expects `risk_update` messages in this format:

```javascript
{
  type: 'risk_update',
  call_id: 'call-123456',
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH',
  risk_score: 0-100,
  model_confidence: 0-100,
  recommendation: 'String message',
  acoustic_indicators: {            // Optional
    spectral_anomaly: 0.15,
    harmonic_distortion: 0.23
  },
  prosody_indicators: {             // Optional
    rhythm_consistency: 0.92,
    pitch_naturalness: 0.88
  },
  timestamp: '2024-01-15T10:30:00Z'
}
```

## Styling

The component uses:
- Tailwind CSS utility classes
- Dark theme with transparent backgrounds
- Backdrop blur effects
- Smooth transitions and animations
- Color-coded visual hierarchy
- Responsive grid layouts

Color scheme:
- Success (LOW): Green tones
- Warning (MEDIUM): Yellow/amber tones
- Danger (HIGH): Red tones
- Info/Confidence: Blue tones
- Background: Dark gray tones

## Performance

- Efficient state updates only on relevant WebSocket messages
- Limited history to 60 entries (prevents memory growth)
- Optimized timeline rendering with downsampling
- Proper cleanup to prevent memory leaks

## Accessibility

- Semantic HTML structure
- Color-coded with emoji backup for colorblind users
- Clear text labels for all indicators
- Readable font sizes
- High contrast ratios

## Testing Recommendations

1. **Unit Tests**:
   - Component renders with all props
   - State updates correctly on WebSocket messages
   - History entries are appended correctly
   - Timeline visualization renders properly

2. **Integration Tests**:
   - WebSocket subscription and cleanup
   - Message filtering by call ID
   - Real-time updates during active call

3. **Visual Tests**:
   - All three risk levels display correctly
   - Progress bars animate smoothly
   - Timeline updates in real-time
   - Responsive layout on different screen sizes

## Future Enhancements

- [ ] Export risk history to CSV
- [ ] Configurable risk thresholds
- [ ] Sound alerts for HIGH risk detection
- [ ] More detailed acoustic analysis visualizations
- [ ] Comparison with previous calls from same contact
