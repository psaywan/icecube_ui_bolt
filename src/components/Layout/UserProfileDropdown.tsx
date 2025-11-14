import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { LogOut, Settings, Copy, Check, Sun, Moon, Monitor } from 'lucide-react';

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
        <div className="absolute right-0 mt-2 w-80 bg-slate-800 rounded-lg shadow-2xl border border-slate-700 overflow-hidden z-50">
          <div className="px-5 py-4 border-b border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-semibold">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-white truncate">{displayName}</div>
                <div className="text-sm text-slate-400 truncate">{profile?.email}</div>
              </div>
            </div>
          </div>

          {account && (
            <div className="px-5 py-3 border-b border-slate-700">
              <div className="text-xs font-medium text-slate-400 mb-2">Account ID</div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 flex-1">
                  <Copy className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <code className="text-white font-mono text-sm font-medium">
                    {account.account_id}
                  </code>
                </div>
                <button
                  onClick={handleCopyAccountId}
                  className="p-1.5 hover:bg-slate-700 rounded transition-colors flex-shrink-0"
                  title="Copy Account ID"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-cyan-400" />
                  ) : (
                    <Copy className="w-4 h-4 text-slate-400" />
                  )}
                </button>
              </div>
            </div>
          )}

          <div className="p-2 border-b border-slate-700">
            <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase">Theme</div>
            <button
              onClick={() => setTheme('light')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded transition-colors ${
                theme === 'light'
                  ? 'text-cyan-400'
                  : 'text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Sun className="w-5 h-5" />
              <span className="font-medium flex-1 text-left">Light</span>
              {theme === 'light' && <Check className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded transition-colors ${
                theme === 'dark'
                  ? 'text-cyan-400'
                  : 'text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Moon className="w-5 h-5" />
              <span className="font-medium flex-1 text-left">Dark</span>
              {theme === 'dark' && <Check className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setTheme('system')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded transition-colors ${
                theme === 'system'
                  ? 'text-cyan-400'
                  : 'text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Monitor className="w-5 h-5" />
              <span className="font-medium flex-1 text-left">System</span>
              {theme === 'system' && <Check className="w-4 h-4" />}
            </button>
          </div>

          <div className="p-2">
            <button className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-300 hover:bg-slate-700 rounded transition-colors">
              <Settings className="w-5 h-5" />
              <span className="font-medium">Profile Settings</span>
            </button>
            <button
              onClick={signOut}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-red-400 hover:bg-slate-700 rounded transition-colors"
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
