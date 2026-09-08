import { useEffect } from 'react';
import Avatar from '../common/Avatar';
import Button from '../common/Button';

// Incoming Call Modal Component
export default function IncomingCallModal({ 
  caller, 
  onAccept, 
  onReject,
  isOpen 
}) {
  // Play ringing sound effect (optional)
  useEffect(() => {
    if (isOpen) {
      // TODO: Add ringing sound
      console.log('Incoming call from:', caller?.full_name);
    }
  }, [isOpen, caller]);

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
          
          {/* Caller Info */}
          <p className="text-gray-400 mb-1">{caller.email}</p>
          
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
            onClick={onReject}
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
            onClick={onAccept}
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
