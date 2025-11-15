import { useState, useEffect } from 'react';
import {
  Sparkles,
  Zap,
  Shield,
  Gauge,
  ArrowRight,
  Cloud,
  Database,
  GitBranch,
  PlayCircle,
  CheckCircle,
} from 'lucide-react';
import { LoginForm } from './Auth/LoginForm';
import { SignUpForm } from './Auth/SignUpForm';

export function LandingPage() {
  const [showLogin, setShowLogin] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHoveringCat, setIsHoveringCat] = useState(false);
  const [catMood, setCatMood] = useState<'normal' | 'happy' | 'excited'>('normal');

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const eyeLookX = Math.min(Math.max((mousePos.x - window.innerWidth / 2) / 100, -2), 2);
  const eyeLookY = Math.min(Math.max((mousePos.y - window.innerHeight / 2) / 100, -1), 1);

  if (showLogin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
        <div className="max-w-md w-full">
          <button
            onClick={() => setShowLogin(false)}
            className="text-white mb-4 hover:text-cyan-400 transition"
          >
            ← Back to Home
          </button>
          <LoginForm onToggleMode={() => {
            setShowLogin(false);
            setShowSignUp(true);
          }} />
        </div>
      </div>
    );
  }

  if (showSignUp) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
        <div className="max-w-md w-full">
          <button
            onClick={() => setShowSignUp(false)}
            className="text-white mb-4 hover:text-cyan-400 transition"
          >
            ← Back to Home
          </button>
          <SignUpForm onToggleMode={() => {
            setShowSignUp(false);
            setShowLogin(true);
          }} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-white overflow-hidden">
      <div className="snowfall-container">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="snowflake"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${10 + Math.random() * 20}s`,
              opacity: 0.3 + Math.random() * 0.5,
              fontSize: `${10 + Math.random() * 10}px`,
            }}
          >
            ❄
          </div>
        ))}
      </div>

      <div className="icecube-container" style={{ transform: `translateY(${scrollY * 0.15}px)` }}>
        <div className="icecube icecube-1"><div className="icecube-face" /></div>
        <div className="icecube icecube-2"><div className="icecube-face" /></div>
        <div className="icecube icecube-3"><div className="icecube-face" /></div>
        <div className="icecube icecube-4"><div className="icecube-face" /></div>
        <div className="icecube icecube-5"><div className="icecube-face" /></div>
        <div className="icecube icecube-6"><div className="icecube-face" /></div>
        <div className="icecube icecube-7"><div className="icecube-face" /></div>
        <div className="icecube icecube-8"><div className="icecube-face" /></div>
        <div className="icecube icecube-9"><div className="icecube-face" /></div>
        <div className="icecube icecube-10"><div className="icecube-face" /></div>
        <div className="icecube icecube-11"><div className="icecube-face" /></div>
        <div className="icecube icecube-12"><div className="icecube-face" /></div>
      </div>

      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-md border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-xl font-bold text-white">IC</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                iceCube
              </span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-700 hover:text-cyan-600 transition font-medium">
                Features
              </a>
              <a href="#pricing" className="text-gray-700 hover:text-cyan-600 transition font-medium">
                Pricing
              </a>
              <a href="#docs" className="text-gray-700 hover:text-cyan-600 transition font-medium">
                Documentation
              </a>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowLogin(true)}
                className="px-6 py-2.5 border-2 border-cyan-500 text-cyan-600 rounded-lg font-semibold hover:bg-cyan-50 transition"
              >
                Sign In
              </button>
              <button
                onClick={() => setShowSignUp(true)}
                className="px-6 py-2.5 bg-gradient-to-r from-cyan-400 to-blue-500 text-white rounded-lg font-semibold hover:from-cyan-500 hover:to-blue-600 transition shadow-lg shadow-cyan-400/30"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div
        className="fixed bottom-8 right-8 z-40 transition-all duration-500 cursor-pointer"
        style={{
          transform: `scale(${isHoveringCat ? 1.15 : 1})`,
        }}
        onMouseEnter={() => {
          setIsHoveringCat(true);
          setCatMood('excited');
        }}
        onMouseLeave={() => {
          setIsHoveringCat(false);
          setCatMood('normal');
        }}
        onClick={() => {
          setCatMood('happy');
          setTimeout(() => setCatMood('normal'), 2000);
        }}
      >
        <div className="relative">
          <svg width="160" height="160" viewBox="0 0 160 160" className="drop-shadow-2xl">
            <circle cx="80" cy="85" r="45" fill="#E8F4F8" />

            <ellipse cx="58" cy="62" rx="10" ry="16" fill="#E8F4F8" />
            <ellipse cx="102" cy="62" rx="10" ry="16" fill="#E8F4F8" />

            <circle cx="80" cy="85" r="38" fill="#F0F9FF" />

            <g className="cat-eyes">
              <circle cx="68" cy="78" r="7" fill="#1e293b" />
              <circle cx="92" cy="78" r="7" fill="#1e293b" />
              <circle
                cx={68 + eyeLookX}
                cy={78 + eyeLookY}
                r="3"
                fill="white"
                className="transition-all duration-150"
              />
              <circle
                cx={92 + eyeLookX}
                cy={78 + eyeLookY}
                r="3"
                fill="white"
                className="transition-all duration-150"
              />
              {isHoveringCat && (
                <>
                  <circle cx="63" cy="75" r="1.5" fill="white" opacity="0.8" />
                  <circle cx="87" cy="75" r="1.5" fill="white" opacity="0.8" />
                </>
              )}
            </g>

            {catMood === 'excited' && (
              <>
                <ellipse cx="68" cy="78" rx="8" ry="5" fill="none" stroke="#1e293b" strokeWidth="1.5" />
                <ellipse cx="92" cy="78" rx="8" ry="5" fill="none" stroke="#1e293b" strokeWidth="1.5" />
              </>
            )}

            <path
              d={catMood === 'excited' ? 'M 68 94 Q 80 100 92 94' : 'M 68 94 Q 80 98 92 94'}
              stroke="#94a3b8"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
              className="transition-all duration-300"
            />

            <circle cx="80" cy="88" r="3" fill="#FFB6C1" />

            <line x1="80" y1="88" x2="80" y2="94" stroke="#94a3b8" strokeWidth="2" />

            <line x1="45" y1="83" x2="25" y2="80" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
            <line x1="45" y1="88" x2="25" y2="88" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
            <line x1="45" y1="93" x2="25" y2="96" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
            <line x1="115" y1="83" x2="135" y2="80" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
            <line x1="115" y1="88" x2="135" y2="88" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
            <line x1="115" y1="93" x2="135" y2="96" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />

            <path
              d="M 68 60 Q 75 48 62 42"
              fill="#E8F4F8"
              stroke="#cbd5e1"
              strokeWidth="1.5"
            />
            <path
              d="M 92 60 Q 85 48 98 42"
              fill="#E8F4F8"
              stroke="#cbd5e1"
              strokeWidth="1.5"
            />

            <ellipse cx="60" cy="98" rx="8" ry="5" fill="#FFE4E6" opacity="0.6" />
            <ellipse cx="100" cy="98" rx="8" ry="5" fill="#FFE4E6" opacity="0.6" />

            {isHoveringCat && (
              <>
                <path d="M 50 75 Q 48 70 46 75" stroke="#fbbf24" strokeWidth="2" fill="none" opacity="0.8" className="animate-pulse" />
                <path d="M 110 75 Q 112 70 114 75" stroke="#fbbf24" strokeWidth="2" fill="none" opacity="0.8" className="animate-pulse" />
                <circle cx="40" cy="85" r="2" fill="#fbbf24" opacity="0.6" className="animate-ping" />
                <circle cx="120" cy="85" r="2" fill="#fbbf24" opacity="0.6" className="animate-ping" />
              </>
            )}
          </svg>

          {isHoveringCat && (
            <div className="absolute -top-12 -left-32 bg-white px-4 py-2 rounded-2xl shadow-xl border-2 border-cyan-300 whitespace-nowrap">
              <span className="text-base font-semibold text-cyan-600">Meow! Let's play! 🐾✨</span>
              <div className="absolute top-1/2 -right-2 w-4 h-4 bg-white border-r-2 border-b-2 border-cyan-300 transform rotate-45 -translate-y-1/2" />
            </div>
          )}

          {catMood === 'happy' && (
            <>
              <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 text-4xl animate-float-up">
                ❤️
              </div>
              <div className="absolute -top-20 left-8 text-2xl animate-float-up" style={{ animationDelay: '0.2s' }}>
                ✨
              </div>
              <div className="absolute -top-20 right-8 text-2xl animate-float-up" style={{ animationDelay: '0.4s' }}>
                💖
              </div>
            </>
          )}
        </div>
      </div>

      <section className="relative min-h-screen flex items-center justify-center pt-20">
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20" style={{ transform: `translateY(${scrollY * -0.1}px)` }}>
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-cyan-50 border border-cyan-200 rounded-full mb-8 hover:bg-cyan-100 hover:border-cyan-300 transition-all duration-300 cursor-default">
              <Sparkles className="w-4 h-4 text-cyan-600 animate-pulse" />
              <span className="text-sm font-semibold text-cyan-600">Next-Gen Data Platform</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Simplify <span className="bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">your</span>
              <br />
              Data <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">engineering</span>
              <br />
              <span className="text-gray-700">workflow</span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto">
              Data processing, pipeline automation, and analytics in one unified platform.
              <br />
              <span className="text-cyan-600 font-semibold">Build faster. Scale effortlessly.</span>
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <button
                onClick={() => setShowSignUp(true)}
                className="group flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-cyan-400 to-blue-500 text-white rounded-xl font-bold text-lg hover:from-cyan-500 hover:to-blue-600 transition-all duration-300 shadow-xl shadow-cyan-400/40 hover:shadow-cyan-500/50"
              >
                <span>Get Started</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
              </button>
              <button className="group flex items-center space-x-3 px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-bold text-lg hover:border-cyan-400 hover:text-cyan-600 transition-all duration-300 bg-white/60 backdrop-blur-sm">
                <PlayCircle className="w-5 h-5" />
                <span>Watch Demo</span>
              </button>
            </div>

            <div className="mt-16 flex items-center justify-center space-x-12 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>14-day free trial</span>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
      </section>

      <section id="features" className="py-20 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Everything you need to
              <span className="bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent"> power your data</span>
            </h2>
            <p className="text-xl text-gray-600">
              Enterprise-grade features for teams of all sizes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Cloud,
                title: 'Multi-Cloud Support',
                description: 'Deploy seamlessly across AWS, Azure, and GCP with unified management.',
                gradient: 'from-sky-400 to-cyan-500'
              },
              {
                icon: Zap,
                title: 'Lightning Fast',
                description: 'Distributed computing with Spark, Dask, and Ray for maximum performance.',
                gradient: 'from-amber-400 to-orange-500'
              },
              {
                icon: Shield,
                title: 'Enterprise Security',
                description: 'Bank-level encryption, RBAC, and compliance certifications included.',
                gradient: 'from-emerald-400 to-teal-500'
              },
              {
                icon: Database,
                title: 'Smart Data Catalog',
                description: 'Auto-discovery, lineage tracking, and intelligent metadata management.',
                gradient: 'from-violet-400 to-purple-500'
              },
              {
                icon: GitBranch,
                title: 'Pipeline Orchestration',
                description: 'Visual workflow builder with advanced scheduling and monitoring.',
                gradient: 'from-rose-400 to-pink-500'
              },
              {
                icon: Gauge,
                title: 'Real-time Monitoring',
                description: 'Comprehensive dashboards with alerts and performance insights.',
                gradient: 'from-blue-400 to-indigo-500'
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="group relative bg-white/90 backdrop-blur-sm rounded-2xl p-8 border border-gray-100 hover:border-cyan-200 hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-full blur-3xl opacity-0 group-hover:opacity-30 transition-opacity duration-500 -mr-16 -mt-16" />
                <div className={`relative w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mb-6 transition-all duration-300 shadow-lg`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="relative text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="relative text-gray-600 leading-relaxed">{feature.description}</p>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 rounded-b-2xl" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-cyan-500 to-blue-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-64 h-64 border-2 border-white rounded-full animate-pulse-slow"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${i * 1.5}s`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '10M+', label: 'Jobs Executed' },
              { value: '99.9%', label: 'Uptime SLA' },
              { value: '500+', label: 'Enterprise Customers' },
              { value: '5PB+', label: 'Data Processed' }
            ].map((stat, index) => (
              <div key={index} className="relative">
                <div className="text-5xl font-bold mb-2">{stat.value}</div>
                <div className="text-cyan-100 text-lg">{stat.label}</div>
                {index < 3 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 w-px h-16 bg-white/30 transform -translate-y-1/2" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-blue-50 to-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Ready to transform your
            <span className="bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent"> data operations?</span>
          </h2>
          <p className="text-xl text-gray-600 mb-10">
            Join thousands of data teams building on iceCube
          </p>
          <button
            onClick={() => setShowSignUp(true)}
            className="group inline-flex items-center space-x-3 px-10 py-5 bg-gradient-to-r from-cyan-400 to-blue-500 text-white rounded-xl font-bold text-xl hover:from-cyan-500 hover:to-blue-600 transition-all duration-300 shadow-xl shadow-cyan-400/40 hover:shadow-cyan-500/50"
          >
            <span>Start Free Trial</span>
            <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition" />
          </button>
        </div>
      </section>

      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-xl font-bold">IC</span>
                </div>
                <span className="text-xl font-bold">iceCube</span>
              </div>
              <p className="text-gray-400">
                The modern data platform for engineering teams
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-cyan-400 transition">Features</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition">Pricing</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition">Documentation</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-cyan-400 transition">About</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition">Blog</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition">Careers</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-cyan-400 transition">Privacy</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition">Terms</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition">Security</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2024 iceCube. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <style>{`
        .snowfall-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100vh;
          pointer-events: none;
          z-index: 1;
          overflow: hidden;
        }

        .snowflake {
          position: absolute;
          top: -20px;
          color: #60a5fa;
          user-select: none;
          animation: snowfall linear infinite;
          text-shadow: 0 0 5px rgba(255, 255, 255, 0.8);
          will-change: transform;
        }

        @keyframes snowfall {
          0% {
            transform: translateY(0) translateX(0) rotate(0deg);
          }
          100% {
            transform: translateY(calc(100vh + 100px)) translateX(30px) rotate(180deg);
          }
        }

        .icecube-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 2;
          overflow: hidden;
        }

        .icecube {
          position: absolute;
          width: 80px;
          height: 80px;
          animation: float-gentle 10s ease-in-out infinite;
          opacity: 0.8;
          transition: all 0.3s ease;
        }

        .icecube-1 { left: 8%; top: 15%; animation-delay: 0s; }
        .icecube-2 { left: 22%; top: 8%; animation-delay: 2s; width: 70px; height: 70px; }
        .icecube-3 { right: 25%; top: 12%; animation-delay: 4s; }
        .icecube-4 { right: 10%; top: 20%; animation-delay: 6s; width: 90px; height: 90px; }
        .icecube-5 { left: 5%; top: 55%; animation-delay: 1s; width: 75px; height: 75px; }
        .icecube-6 { left: 18%; top: 65%; animation-delay: 3s; }
        .icecube-7 { right: 20%; top: 60%; animation-delay: 5s; width: 85px; height: 85px; }
        .icecube-8 { right: 8%; top: 70%; animation-delay: 7s; }
        .icecube-9 { left: 45%; top: 5%; animation-delay: 2.5s; width: 65px; height: 65px; }
        .icecube-10 { left: 50%; top: 85%; animation-delay: 4.5s; width: 70px; height: 70px; }
        .icecube-11 { left: 35%; top: 75%; animation-delay: 6.5s; }
        .icecube-12 { right: 40%; top: 25%; animation-delay: 8s; width: 75px; height: 75px; }

        .icecube-face {
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, rgba(147, 197, 253, 0.25) 0%, rgba(59, 130, 246, 0.15) 50%, rgba(147, 197, 253, 0.25) 100%);
          border-radius: 10px;
          box-shadow:
            inset 0 0 25px rgba(255, 255, 255, 0.4),
            0 0 25px rgba(59, 130, 246, 0.2),
            0 5px 20px rgba(59, 130, 246, 0.15);
          backdrop-filter: blur(3px);
          border: 1.5px solid rgba(147, 197, 253, 0.35);
          position: relative;
        }

        .icecube-face::before {
          content: '';
          position: absolute;
          top: 10px;
          left: 10px;
          width: 20px;
          height: 20px;
          background: rgba(255, 255, 255, 0.5);
          border-radius: 4px;
          box-shadow: 0 2px 10px rgba(255, 255, 255, 0.3);
        }

        .icecube-face::after {
          content: '';
          position: absolute;
          bottom: 12px;
          right: 12px;
          width: 12px;
          height: 12px;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 3px;
        }

        @keyframes float-gentle {
          0%, 100% {
            transform: translateY(0) translateX(0) rotate(0deg);
          }
          25% {
            transform: translateY(-12px) translateX(8px) rotate(2deg);
          }
          50% {
            transform: translateY(-8px) translateX(-8px) rotate(-2deg);
          }
          75% {
            transform: translateY(-18px) translateX(5px) rotate(1deg);
          }
        }

        @keyframes float-up {
          0% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translateY(-60px) scale(1.5);
            opacity: 0;
          }
        }

        .animate-float-up {
          animation: float-up 2s ease-out forwards;
        }

        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }

        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.1;
            transform: scale(1);
          }
          50% {
            opacity: 0.15;
            transform: scale(1.05);
          }
        }

        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }

        .cat-eyes {
          transition: all 0.3s ease;
        }
      `}</style>
    </div>
  );
}
