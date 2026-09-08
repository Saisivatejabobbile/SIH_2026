import { useEffect, useRef, useCallback } from 'react';

/**
 * useAudioProcessor Hook
 * 
 * Manages AudioWorklet for real-time audio processing.
 * Processes remote audio stream, extracts PCM data, and sends to analysis WebSocket.
 * 
 * Requirements: 11.1, 11.2, 11.5, 11.7
 */
export const useAudioProcessor = (remoteStream, callId, sendAudioChunk) => {
  const audioContextRef = useRef(null);
  const workletNodeRef = useRef(null);
  const sourceNodeRef = useRef(null);
  
  /**
   * Initialize AudioWorklet and connect audio pipeline
   */
  const initializeAudioProcessor = useCallback(async () => {
    if (!remoteStream || !callId) {
      console.log('Cannot initialize audio processor: missing remoteStream or callId');
      return;
    }
    
    try {
      console.log('Initializing AudioWorklet processor...');
      
      // Create AudioContext
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioContext;
      
      // Load AudioWorklet module
      await audioContext.audioWorklet.addModule('/audioProcessor.js');
      console.log('AudioWorklet module loaded');
      
      // Create MediaStreamSource from remote stream
      const source = audioContext.createMediaStreamSource(remoteStream);
      sourceNodeRef.current = source;
      
      // Create AudioWorkletNode
      const workletNode = new AudioWorkletNode(
        audioContext,
        'voiceshield-audio-processor'
      );
      workletNodeRef.current = workletNode;
      
      // Handle messages from AudioWorklet (PCM chunks)
      workletNode.port.onmessage = (event) => {
        const { type, data, timestamp, hasSpeech } = event.data;
        
        if (type === 'pcm_chunk') {
          console.log(
            `Audio chunk: ${data.length} samples, ` +
            `speech=${hasSpeech}, ` +
            `time=${timestamp.toFixed(2)}s`
          );
          
          // Send to analysis WebSocket if speech detected
          if (hasSpeech && sendAudioChunk) {
            sendAudioChunk(callId, Array.from(data), 16000);
          }
        }
      };
      
      // Connect audio pipeline: source → worklet → destination
      source.connect(workletNode);
      workletNode.connect(audioContext.destination);
      
      console.log('AudioWorklet pipeline connected');
      
    } catch (error) {
      console.error('Failed to initialize AudioWorklet:', error);
      
      // Check for AudioWorklet support
      if (!window.AudioWorklet) {
        console.warn('AudioWorklet not supported in this browser');
      }
    }
  }, [remoteStream, callId, sendAudioChunk]);
  
  /**
   * Cleanup audio processor
   */
  const cleanup = useCallback(() => {
    console.log('Cleaning up AudioWorklet processor...');
    
    // Disconnect nodes
    if (workletNodeRef.current) {
      workletNodeRef.current.disconnect();
      workletNodeRef.current = null;
    }
    
    if (sourceNodeRef.current) {
      sourceNodeRef.current.disconnect();
      sourceNodeRef.current = null;
    }
    
    // Close AudioContext
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    console.log('AudioWorklet cleanup complete');
  }, []);
  
  /**
   * Initialize when remoteStream is available, cleanup on unmount
   */
  useEffect(() => {
    if (remoteStream && callId) {
      initializeAudioProcessor();
    }
    
    return () => {
      cleanup();
    };
  }, [remoteStream, callId, initializeAudioProcessor, cleanup]);
  
  return {
    isProcessing: !!audioContextRef.current,
    cleanup,
  };
};

export default useAudioProcessor;
