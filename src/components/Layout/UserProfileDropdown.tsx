import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { User, LogOut, Settings, Copy, Check, Sun, Moon, Monitor } from 'lucide-react';

export function UserProfileDropdown() {
  const { profile, account, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCopyAccountId = async () => {
    if (account?.account_id) {
      await navigator.clipboard.writeText(account.account_id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const displayName = profile?.full_name || profile?.email?.split('@')[0] || 'User';
  const initials = getInitials(profile?.full_name);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
      >
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
          {initials}
        </div>
        <div className="hidden md:block text-left">
          <div className="text-sm font-semibold text-slate-900 dark:text-white">{displayName}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">{profile?.email}</div>
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-semibold">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-slate-900 dark:text-white truncate">{displayName}</div>
                <div className="text-sm text-slate-500 dark:text-slate-400 truncate">{profile?.email}</div>
              </div>
            </div>

            {account && (
              <div className="bg-cyan-50 dark:bg-cyan-900/20 rounded-lg p-3 border border-cyan-200 dark:border-cyan-800">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-5 h-5 rounded bg-cyan-600 dark:bg-cyan-500 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">ID</span>
                  </div>
                  <span className="text-xs font-semibold text-cyan-900 dark:text-cyan-100">iceCube Account ID</span>
                </div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-3 py-2 bg-white dark:bg-slate-900 text-cyan-700 dark:text-cyan-300 rounded font-mono text-sm border border-cyan-300 dark:border-cyan-700">
                    {account.account_id}
                  </code>
                  <button
                    onClick={handleCopyAccountId}
                    className="px-3 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded font-medium text-sm flex items-center gap-2 transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy
                      </>
                    )}
                  </button>
                </div>
                <p className="text-xs text-cyan-700 dark:text-cyan-300 mt-2 flex items-start gap-1">
                  <span>💡</span>
                  <span>Use this unique ID for Cloud Profile setup and cloud integrations</span>
                </p>
              </div>
            )}
          </div>

          <div className="p-2">
            <div className="px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Theme</div>
            <button
              onClick={() => {
                setTheme('light');
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                theme === 'light'
                  ? 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-300'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              <Sun className="w-5 h-5" />
              <span className="font-medium">Light</span>
              {theme === 'light' && <Check className="w-4 h-4 ml-auto" />}
            </button>
            <button
              onClick={() => {
                setTheme('dark');
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                theme === 'dark'
                  ? 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-300'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              <Moon className="w-5 h-5" />
              <span className="font-medium">Dark</span>
              {theme === 'dark' && <Check className="w-4 h-4 ml-auto" />}
            </button>
            <button
              onClick={() => {
                setTheme('system');
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                theme === 'system'
                  ? 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-300'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              <Monitor className="w-5 h-5" />
              <span className="font-medium">System</span>
              {theme === 'system' && <Check className="w-4 h-4 ml-auto" />}
            </button>
          </div>

          <div className="p-2 border-t border-slate-200 dark:border-slate-700">
            <button className="w-full flex items-center gap-3 px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors">
              <Settings className="w-5 h-5" />
              <span className="font-medium">Profile Settings</span>
            </button>
            <button
              onClick={signOut}
              className="w-full flex items-center gap-3 px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
