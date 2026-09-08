import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { ROUTES } from '../constants';
import { 
  UserIcon, 
  LockIcon, 
  PhoneIcon, 
  BellIcon, 
  MicIcon,
  ShieldIcon,
  AlertIcon,
  ChartIcon,
  HistoryIcon,
  InfoIcon,
  SettingsIcon
} from '../utils/icons';

// Setting Row Component with toggle or chevron
function SettingRow({ icon: Icon, title, description, value, onChange, type = 'toggle', onClick }) {
  if (type === 'link') {
    return (
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between p-4 hover:bg-dark-800 transition-colors rounded-lg group"
      >
        <div className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 bg-dark-800 rounded-lg flex items-center justify-center group-hover:bg-dark-700 transition-colors">
            <Icon className="w-5 h-5 text-gray-400" />
          </div>
          <div className="text-left">
            <p className="text-white font-medium">{title}</p>
            {description && <p className="text-gray-400 text-sm">{description}</p>}
          </div>
        </div>
        <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    );
  }

  if (type === 'info') {
    return (
      <div className="flex items-start gap-3 p-4 bg-dark-800 rounded-lg">
        <div className="w-10 h-10 bg-dark-700 rounded-lg flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5 text-gray-400" />
        </div>
        <div className="flex-1">
          <p className="text-white font-medium mb-1">{title}</p>
          {description && <p className="text-gray-400 text-sm">{description}</p>}
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
          value === 'OFF' 
            ? 'bg-danger-dark/20 text-danger-light' 
            : 'bg-success-dark/20 text-success-light'
        }`}>
          {value}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-4 hover:bg-dark-800 transition-colors rounded-lg">
      <div className="flex items-center gap-3 flex-1">
        <div className="w-10 h-10 bg-dark-800 rounded-lg flex items-center justify-center">
          <Icon className="w-5 h-5 text-gray-400" />
        </div>
        <div>
          <p className="text-white font-medium">{title}</p>
          {description && <p className="text-gray-400 text-sm">{description}</p>}
        </div>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={value}
          onChange={(e) => onChange?.(e.target.checked)}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-dark-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
      </label>
    </div>
  );
}

// Section Header Component
function SectionHeader({ title }) {
  return (
    <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-1">
      {title}
    </h2>
  );
}

export default function SettingsPage() {
  const navigate = useNavigate();

  // Call Settings
  const [allowIncomingCalls, setAllowIncomingCalls] = useState(true);
  const [incomingCallNotifications, setIncomingCallNotifications] = useState(true);
  const [callSpeakerDefault, setCallSpeakerDefault] = useState(true);

  // AI Voice Protection
  const [realtimeDetection, setRealtimeDetection] = useState(true);
  const [highRiskAlerts, setHighRiskAlerts] = useState(true);
  const [showRiskScore, setShowRiskScore] = useState(true);
  const [showRiskHistory, setShowRiskHistory] = useState(true);

  // Privacy
  const [saveCallHistory, setSaveCallHistory] = useState(true);

  // Notifications
  const [securityAlerts, setSecurityAlerts] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);

  const handleProfileClick = () => {
    // Navigate to profile edit or open modal
    alert('Profile editing coming soon');
  };

  const handlePasswordClick = () => {
    alert('Change password coming soon');
  };

  const handleMicPermission = () => {
    alert('Microphone permissions managed by browser');
  };

  const handleActiveSessions = () => {
    alert('Active sessions management coming soon');
  };

  const handleLogoutAll = () => {
    if (confirm('Logout from all devices?')) {
      alert('Logout functionality coming soon');
    }
  };

  const handleAbout = () => {
    navigate(ROUTES.ABOUT);
  };

  const handlePrivacyPolicy = () => {
    alert('Privacy policy coming soon');
  };

  const handleHelp = () => {
    alert('Help & support coming soon');
  };

  return (
    <Layout>
      <div>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
          <p className="text-gray-400">
            Manage your account and application preferences
          </p>
        </div>

        <div className="space-y-8">
          {/* ACCOUNT */}
          <div>
            <SectionHeader title="ACCOUNT" />
            <div className="card p-2 space-y-1">
              <SettingRow
                icon={UserIcon}
                title="Profile Information"
                description="Name, email"
                type="link"
                onClick={handleProfileClick}
              />
              <SettingRow
                icon={LockIcon}
                title="Change Password"
                type="link"
                onClick={handlePasswordClick}
              />
            </div>
          </div>

          {/* CALL SETTINGS */}
          <div>
            <SectionHeader title="CALL SETTINGS" />
            <div className="card p-2 space-y-1">
              <SettingRow
                icon={PhoneIcon}
                title="Allow Incoming Calls"
                value={allowIncomingCalls}
                onChange={setAllowIncomingCalls}
              />
              <SettingRow
                icon={BellIcon}
                title="Incoming Call Notifications"
                value={incomingCallNotifications}
                onChange={setIncomingCallNotifications}
              />
              <SettingRow
                icon={PhoneIcon}
                title="Call Speaker by Default"
                value={callSpeakerDefault}
                onChange={setCallSpeakerDefault}
              />
              <SettingRow
                icon={MicIcon}
                title="Microphone Permission"
                type="link"
                onClick={handleMicPermission}
              />
            </div>
          </div>

          {/* AI VOICE PROTECTION */}
          <div>
            <SectionHeader title="AI VOICE PROTECTION" />
            <div className="card p-2 space-y-1">
              <SettingRow
                icon={ShieldIcon}
                title="Real-Time Voice Detection"
                value={realtimeDetection}
                onChange={setRealtimeDetection}
              />
              <SettingRow
                icon={AlertIcon}
                title="High-Risk Alerts"
                value={highRiskAlerts}
                onChange={setHighRiskAlerts}
              />
              <SettingRow
                icon={ChartIcon}
                title="Show Risk Score"
                value={showRiskScore}
                onChange={setShowRiskScore}
              />
              <SettingRow
                icon={HistoryIcon}
                title="Show Risk History"
                value={showRiskHistory}
                onChange={setShowRiskHistory}
              />
            </div>
          </div>

          {/* PRIVACY */}
          <div>
            <SectionHeader title="PRIVACY" />
            <div className="card p-2 space-y-1">
              <SettingRow
                icon={LockIcon}
                title="Raw Audio Retention"
                description="Voice recordings are not stored."
                value="OFF"
                type="info"
              />
              <SettingRow
                icon={HistoryIcon}
                title="Save Call History"
                description="Saves call metadata only, not audio."
                value={saveCallHistory}
                onChange={setSaveCallHistory}
              />
              <SettingRow
                icon={LockIcon}
                title="Save Transcripts"
                description="No call transcripts are stored."
                value="OFF"
                type="info"
              />
            </div>
          </div>

          {/* NOTIFICATIONS */}
          <div>
            <SectionHeader title="NOTIFICATIONS" />
            <div className="card p-2 space-y-1">
              <SettingRow
                icon={AlertIcon}
                title="Security Alerts"
                value={securityAlerts}
                onChange={setSecurityAlerts}
              />
              <SettingRow
                icon={BellIcon}
                title="Email Notifications"
                value={emailNotifications}
                onChange={setEmailNotifications}
              />
            </div>
          </div>

          {/* SECURITY */}
          <div>
            <SectionHeader title="SECURITY" />
            <div className="card p-2 space-y-1">
              <SettingRow
                icon={SettingsIcon}
                title="Active Sessions"
                type="link"
                onClick={handleActiveSessions}
              />
              <SettingRow
                icon={LockIcon}
                title="Logout from All Devices"
                type="link"
                onClick={handleLogoutAll}
              />
            </div>
          </div>

          {/* ABOUT */}
          <div>
            <SectionHeader title="ABOUT" />
            <div className="card p-2 space-y-1">
              <SettingRow
                icon={InfoIcon}
                title="About VoiceShield"
                type="link"
                onClick={handleAbout}
              />
              <SettingRow
                icon={LockIcon}
                title="Privacy Policy"
                type="link"
                onClick={handlePrivacyPolicy}
              />
              <SettingRow
                icon={InfoIcon}
                title="Help & Support"
                type="link"
                onClick={handleHelp}
              />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
