import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SimpleLayout } from '../components/layout/Layout';
import Avatar from '../components/common/Avatar';
import Badge from '../components/common/Badge';
import WaveformAnimation from '../components/call/WaveformAnimation';
import CallControls from '../components/call/CallControls';
import { RiskStatusCard } from '../components/analysis';
import { formatDuration } from '../utils/format';
import { ROUTES, IS_MOCK_MODE } from '../constants';
import { useCall } from '../context/CallContext';
import { BrainIcon, MaskIcon } from '../utils/icons';

export default function ActiveCallPage() {
  const navigate = useNavigate();
  const { 
    currentCall, 
    endCall, 
    toggleMute, 
    toggleSpeaker,
    isMuted,
    isSpeakerOn,
    riskData: contextRiskData,
    isAnalyzing,
    getAudioVolume
  } = useCall();
  
  const [callDuration, setCallDuration] = useState(0);
  const [mockRiskData, setMockRiskData] = useState(null);
  
  // Use risk data from context, or mock data for demo
  const riskData = contextRiskData || mockRiskData;

  // If no active call, redirect to dashboard
  useEffect(() => {
    if (!currentCall) {
      navigate(ROUTES.DASHBOARD);
    }
  }, [currentCall, navigate]);

  // Get caller from currentCall context
  const caller = currentCall?.contact || {
    id: '1',
    full_name: 'Unknown Caller',
    email: 'unknown@example.com',
    status: 'in_call',
  };

  // Call duration timer
  useEffect(() => {
    const interval = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Simulate analysis status changes and risk updates (MOCK MODE ONLY)
  useEffect(() => {
    if (!IS_MOCK_MODE || contextRiskData) return; // Skip if real data available

    // Simulate initial delay before first result
    const initialDelay = setTimeout(() => {
      simulateRiskUpdate();
    }, 3000);

    // Simulate periodic risk updates every 5 seconds
    const interval = setInterval(() => {
      simulateRiskUpdate();
    }, 5000);

    return () => {
      clearTimeout(initialDelay);
      clearInterval(interval);
    };
  }, [contextRiskData]);

  // Mock risk data simulation
  const simulateRiskUpdate = () => {
    // Generate random risk data (mock mode only)
    const syntheticConf = Math.floor(Math.random() * 100);
    const modelConf = Math.floor(80 + Math.random() * 20); // High confidence
    const riskScore = Math.floor((syntheticConf * 0.7) + (Math.random() * 20));
    
    let riskLevel = 'LOW';
    if (riskScore >= 70) riskLevel = 'HIGH';
    else if (riskScore >= 40) riskLevel = 'MEDIUM';

    const recommendations = {
      LOW: 'This voice appears to be human.',
      MEDIUM: 'Voice shows minor characteristics. Proceed with caution.',
      HIGH: 'This voice is likely AI-generated. Be cautious.',
    };

    const mockData = {
      synthetic_confidence: syntheticConf,
      model_confidence: modelConf,
      risk_score: riskScore,
      risk_level: riskLevel,
      recommendation: recommendations[riskLevel],
      timestamp: new Date().toISOString(),
    };

    setMockRiskData(mockData);
  };

  const handleMuteToggle = () => {
    toggleMute();
  };

  const handleSpeakerToggle = () => {
    toggleSpeaker();
  };

  const handleAddUser = () => {
    alert('Add user feature coming soon');
  };

  const handleEndCall = () => {
    // End call using CallContext
    endCall();
  };

  return (
    <SimpleLayout>
      <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Header - Timer and Status */}
          <div className="flex items-center justify-between mb-6">
            <div className="text-gray-400 text-sm font-mono">
              {formatDuration(callDuration)}
            </div>
            <Badge variant="success" size="sm">
              <div className="w-2 h-2 bg-success-light rounded-full mr-2 animate-pulse" />
              Live Analysis
            </Badge>
          </div>

          {/* Main Card */}
          <div className="bg-dark-900/50 backdrop-blur-sm border border-dark-700 rounded-2xl p-6 shadow-2xl">
            {/* Caller Info */}
            <div className="flex flex-col items-center mb-6">
              <Avatar 
                name={caller.full_name} 
                size="2xl" 
                status="in_call"
                className="mb-4 ring-4 ring-primary-600/20"
              />
              
              <h2 className="text-2xl font-bold text-white mb-1">
                {caller.full_name}
              </h2>
              
              <p className="text-gray-400 text-sm">
                {caller.email}
              </p>
            </div>

            {/* Waveform Visualization */}
            <div className="mb-6">
              <WaveformAnimation 
                isActive={!isMuted} 
                bars={35}
                color={
                  riskData?.risk_level === 'HIGH' ? 'danger' :
                  riskData?.risk_level === 'MEDIUM' ? 'warning' :
                  riskData?.risk_level === 'LOW' ? 'success' : 'primary'
                }
              />
              <p className="text-center text-gray-400 text-xs mt-3">
                {isMuted ? '🎙️ Microphone muted' : 'Analyzing voice in real-time...'}
              </p>
            </div>

            {/* Risk Status Card */}
            {riskData ? (
              <div className="mb-6">
                <RiskStatusCard riskData={riskData} />
              </div>
            ) : (
              <div className="mb-6 text-center py-8">
                <div className="w-16 h-16 bg-primary-600/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <BrainIcon className="w-8 h-8 text-primary-400" />
                </div>
                <p className="text-white font-medium mb-2">Analyzing Voice...</p>
                <p className="text-gray-400 text-sm">Processing audio patterns</p>
              </div>
            )}

            {/* Call Controls */}
            <CallControls
              onMuteToggle={handleMuteToggle}
              onSpeakerToggle={handleSpeakerToggle}
              onAddUser={handleAddUser}
              onEndCall={handleEndCall}
              isMuted={isMuted}
              isSpeakerOn={isSpeakerOn}
            />
          </div>

          {/* Mock Mode Notice */}
          {IS_MOCK_MODE && (
            <div className="mt-4 text-center">
              <div className="flex items-center justify-center gap-2">
                <MaskIcon className="w-4 h-4 text-gray-500" />
                <p className="text-xs text-gray-500">
                  Demo Mode: Showing simulated analysis
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </SimpleLayout>
  );
}
