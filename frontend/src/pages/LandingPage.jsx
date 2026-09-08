import { Link } from 'react-router-dom';
import { SimpleLayout } from '../components/layout/Layout';
import Logo from '../components/layout/Logo';
import Button from '../components/common/Button';
import { ROUTES } from '../constants';
import { SearchIcon, LockIcon, ZapIcon } from '../utils/icons';

export default function LandingPage() {
  const features = [
    {
      icon: <SearchIcon className="w-12 h-12" />,
      title: 'Real-time Detection',
      description: 'Detect AI-generated voices in real-time during calls',
    },
    {
      icon: <LockIcon className="w-12 h-12" />,
      title: 'Your Privacy Our Priority',
      description: 'No audio retention. All processing is transient and secure',
    },
    {
      icon: <ZapIcon className="w-12 h-12" />,
      title: 'Safe in a Later Timeline',
      description: 'Stay protected from voice impersonation and fraud',
    },
  ];

  return (
    <SimpleLayout>
      {/* Navigation */}
      <nav className="bg-dark-900 border-b border-dark-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Logo />
            
            <div className="flex items-center gap-4">
              <Link to={ROUTES.LOGIN}>
                <Button variant="ghost" size="sm">
                  Login
                </Button>
              </Link>
              <Link to={ROUTES.SIGN_UP}>
                <Button variant="primary" size="sm">
                  Sign Up
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/20 to-transparent" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            {/* Hero Title */}
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="text-white">Safer Calls</span>
              <br />
              <span className="text-gradient">Smarter Conversations</span>
            </h1>
            
            {/* Hero Description */}
            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              Detect AI-generated voices in real-time.
              Stay one step ahead of fraud.
            </p>
            
            {/* CTA Button */}
            <Link to={ROUTES.SIGN_UP}>
              <Button variant="primary" size="lg" className="px-8">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="card p-6 text-center hover:shadow-glow transition-all duration-200"
            >
              <div className="flex justify-center text-primary-400 mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-dark-800 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Logo size="sm" />
              <span className="text-gray-400 text-sm">
                © 2026 VoiceShield. Privacy-first voice security.
              </span>
            </div>
            <div className="flex gap-6">
              <Link to="/privacy" className="text-gray-400 hover:text-white text-sm">
                Privacy
              </Link>
              <Link to={ROUTES.ABOUT} className="text-gray-400 hover:text-white text-sm">
                About
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </SimpleLayout>
  );
}
