import { useEffect, useRef, useState } from 'react';
import Avatar from '../common/Avatar';
import Button from '../common/Button';

// Incoming Call Modal Component
export default function IncomingCallModal({ 
  caller, 
  onAccept, 
  onReject,
  isOpen 
}) {
  const audioRef = useRef(null);
  const [audioReady, setAudioReady] = useState(false);

  // Initialize audio on first user interaction (when component mounts)
  useEffect(() => {
    // Create a simple beep sound using data URL
    const audioElement = new Audio();
    audioElement.loop = true;
    audioElement.volume = 0.3;
    
    // Create a simple ringtone using Web Audio API and convert to blob
    const createRingtone = async () => {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const sampleRate = audioContext.sampleRate;
      const duration = 2; // 2 seconds
      const numSamples = sampleRate * duration;
      const buffer = audioContext.createBuffer(1, numSamples, sampleRate);
      const data = buffer.getChannelData(0);
      
      // Generate ring pattern: 0.5s on, 0.5s off, 0.5s on, 0.5s off
      for (let i = 0; i < numSamples; i++) {
        const time = i / sampleRate;
        const segment = Math.floor(time / 0.5) % 4;
        
        if (segment === 0 || segment === 2) {
          // Ring tone (480Hz and 620Hz mixed)
          data[i] = 0.3 * (Math.sin(2 * Math.PI * 480 * time) + Math.sin(2 * Math.PI * 620 * time));
        } else {
          // Silence
          data[i] = 0;
        }
      }
      
      // Convert buffer to WAV blob
      const wav = audioBufferToWav(buffer);
      const blob = new Blob([wav], { type: 'audio/wav' });
      const url = URL.createObjectURL(blob);
      
      audioElement.src = url;
      setAudioReady(true);
    };
    
    createRingtone().catch(console.error);
    audioRef.current = audioElement;
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  // Play/stop ringtone based on modal state
  useEffect(() => {
    if (isOpen && caller && audioReady && audioRef.current) {
      console.log('?? Incoming call from:', caller?.full_name);
      console.log('?? Playing ringtone...');
      
      // Play audio (with promise handling for autoplay policy)
      audioRef.current.play()
        .then(() => {
          console.log('? Ringtone playing successfully');
        })
        .catch((error) => {
          console.warn('?? Autoplay blocked by browser:', error);
          console.log('?? Tip: Click anywhere on the page to enable audio');
        });
    } else if (!isOpen && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      console.log('?? Ringtone stopped');
    }
  }, [isOpen, caller, audioReady]);

  // Helper function to stop ringtone before calling callbacks
  const handleAccept = () => {
    console.log('? Call accepted - stopping ringtone');
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    onAccept();
  };

  const handleReject = () => {
    console.log('? Call rejected - stopping ringtone');
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    onReject();
  };

  if (!isOpen || !caller) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      
      {/* Modal Content */}
      <div className="relative bg-dark-900 border border-dark-700 rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 animate-bounce-slow">
        {/* Caller Avatar */}
        <div className="flex flex-col items-center">
          <Avatar 
            name={caller.full_name} 
            src={caller.avatar}
            size="2xl" 
            className="mb-6 ring-4 ring-primary-600/50 animate-pulse"
          />
          
          {/* Caller Name */}
          <h2 className="text-2xl font-bold text-white mb-2">
            {caller.full_name}
          </h2>
          
          {/* Caller Email */}
          <p className="text-gray-400 mb-1">{caller.email}</p>
          
          {/* Caller Phone Number (if available) */}
          {caller.phone_number && (
            <p className="text-gray-400 mb-1">{caller.phone_number}</p>
          )}
          
          {/* Call Status */}
          <div className="flex items-center gap-2 mb-8">
            <div className="w-2 h-2 bg-primary-600 rounded-full animate-pulse" />
            <p className="text-primary-400 text-sm font-medium">
              Incoming audio call...
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            variant="danger"
            size="lg"
            onClick={handleReject}
            className="flex-1 py-4"
          >
            <div className="flex flex-col items-center">
              <svg className="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" />
              </svg>
              <span className="font-semibold">Decline</span>
            </div>
          </Button>
          
          <Button
            variant="success"
            size="lg"
            onClick={handleAccept}
            className="flex-1 py-4 animate-pulse"
          >
            <div className="flex flex-col items-center">
              <svg className="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span className="font-semibold">Accept</span>
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
}

// Helper function to convert AudioBuffer to WAV
function audioBufferToWav(buffer) {
  const length = buffer.length * buffer.numberOfChannels * 2 + 44;
  const arrayBuffer = new ArrayBuffer(length);
  const view = new DataView(arrayBuffer);
  const channels = [];
  let offset = 0;
  let pos = 0;

  // Write WAV header
  const setUint16 = (data) => {
    view.setUint16(pos, data, true);
    pos += 2;
  };
  const setUint32 = (data) => {
    view.setUint32(pos, data, true);
    pos += 4;
  };

  // "RIFF" chunk descriptor
  setUint32(0x46464952); // "RIFF"
  setUint32(length - 8); // file length - 8
  setUint32(0x45564157); // "WAVE"

  // "fmt " sub-chunk
  setUint32(0x20746d66); // "fmt "
  setUint32(16); // size of fmt chunk
  setUint16(1); // audio format (1 = PCM)
  setUint16(buffer.numberOfChannels);
  setUint32(buffer.sampleRate);
  setUint32(buffer.sampleRate * 2 * buffer.numberOfChannels); // byte rate
  setUint16(buffer.numberOfChannels * 2); // block align
  setUint16(16); // bits per sample

  // "data" sub-chunk
  setUint32(0x61746164); // "data"
  setUint32(length - pos - 4); // chunk length

  // Write interleaved data
  for (let i = 0; i < buffer.numberOfChannels; i++) {
    channels.push(buffer.getChannelData(i));
  }

  while (pos < length) {
    for (let i = 0; i < buffer.numberOfChannels; i++) {
      let sample = Math.max(-1, Math.min(1, channels[i][offset]));
      sample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
      view.setInt16(pos, sample, true);
      pos += 2;
    }
    offset++;
  }

  return arrayBuffer;
}
