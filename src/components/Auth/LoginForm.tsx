import { useState } from 'react';
import { useAuth } from '../../contexts/RDSAuthContext';
import { LogIn, Loader2 } from 'lucide-react';
import { Github } from 'lucide-react';

interface LoginFormProps {
  onToggleMode: () => void;
}

export function LoginForm({ onToggleMode }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [ssoLoading, setSsoLoading] = useState<string | null>(null);
  const { signIn, signInWithSSO } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      setError(error);
      setLoading(false);
    }
  };

  const handleSSOLogin = async (provider: 'google' | 'github' | 'azure' | 'microsoft') => {
    setError('');
    setSsoLoading(provider);

    const { error } = await signInWithSSO(provider);

    if (error) {
      setError(error);
      setSsoLoading(null);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl mb-4">
            <span className="text-3xl font-bold text-white">IC</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Icecube</h1>
          <p className="text-gray-600 mt-2">Multi-Cloud Data Platform</p>
        </div>

        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg text-sm mb-6">
          <p className="font-medium">Demo Credentials:</p>
          <p className="mt-1">Email: admin@icecube.com</p>
          <p>Password: admin123</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-700 transition duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                <span>Sign In</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              onClick={() => handleSSOLogin('google')}
              disabled={ssoLoading !== null}
              className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {ssoLoading === 'google' ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span className="text-sm font-medium text-gray-700">Google</span>
                </>
              )}
            </button>

            <button
              onClick={() => handleSSOLogin('github')}
              disabled={ssoLoading !== null}
              className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {ssoLoading === 'github' ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Github className="w-5 h-5 mr-2 text-gray-900" />
                  <span className="text-sm font-medium text-gray-700">GitHub</span>
                </>
              )}
            </button>

            <button
              onClick={() => handleSSOLogin('microsoft')}
              disabled={ssoLoading !== null}
              className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {ssoLoading === 'microsoft' ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 23 23">
                    <path fill="#f35325" d="M0 0h11v11H0z"/>
                    <path fill="#81bc06" d="M12 0h11v11H12z"/>
                    <path fill="#05a6f0" d="M0 12h11v11H0z"/>
                    <path fill="#ffba08" d="M12 12h11v11H12z"/>
                  </svg>
                  <span className="text-sm font-medium text-gray-700">Microsoft</span>
                </>
              )}
            </button>

            <button
              onClick={() => handleSSOLogin('azure')}
              disabled={ssoLoading !== null}
              className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {ssoLoading === 'azure' ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 96 96">
                    <defs>
                      <linearGradient id="azure-grad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#114A8B"/>
                        <stop offset="100%" stopColor="#0669BC"/>
                      </linearGradient>
                    </defs>
                    <path fill="url(#azure-grad)" d="M46.09.002h23.615l-32.232 91.996L0 82.196zm5.034 44.956h44.864L73.796 96H19.922z"/>
                  </svg>
                  <span className="text-sm font-medium text-gray-700">Azure AD</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={onToggleMode}
            className="text-cyan-600 hover:text-cyan-700 font-medium text-sm transition"
          >
            Don't have an account? Sign up
          </button>
        </div>
      </div>
    </div>
  );
}
