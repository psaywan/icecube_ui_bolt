import { useState } from 'react';
import {
  Cloud,
  Server,
  Search,
  BookOpen,
  Database,
  Briefcase,
  Users,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
  Lock,
  Unlock,
  Home,
  FolderOpen,
  GitBranch
} from 'lucide-react';
import { useAuth } from '../../contexts/RDSAuthContext';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: any;
  route?: string;
  children?: {
    label: string;
    route: string;
  }[];
}

const menuItems: MenuItem[] = [
  {
    id: 'home',
    label: 'Home',
    icon: Home,
    route: 'home'
  },
  {
    id: 'workspaces',
    label: 'Workspaces',
    icon: FolderOpen,
    route: 'workspaces'
  },
  {
    id: 'cloud-profiles',
    label: 'Cloud Profiles',
    icon: Cloud,
    children: [
      { label: 'Create Profile', route: 'cloud-profiles' },
      { label: 'AWS Profile', route: 'cloud-profiles-aws' },
      { label: 'GCP Profile', route: 'cloud-profiles-gcp' },
      { label: 'Azure Profile', route: 'cloud-profiles-azure' },
      { label: 'Profile Store', route: 'cloud-profiles-store' }
    ]
  },
  {
    id: 'compute',
    label: 'Compute',
    icon: Server,
    route: 'compute'
  },
  {
    id: 'query',
    label: 'Query',
    icon: Search,
    children: [
      { label: 'Query Editor', route: 'query-editor' },
      { label: 'Query Results', route: 'query-results' },
      { label: 'Query Stored', route: 'query-stored' }
    ]
  },
  {
    id: 'notebook',
    label: 'Notebook',
    icon: BookOpen,
    children: [
      { label: 'Notebook', route: 'notebooks' },
      { label: 'Scripts', route: 'notebook-script' },
      { label: 'Notebook Store', route: 'notebook-store' }
    ]
  },
  {
    id: 'repository',
    label: 'Repository',
    icon: GitBranch,
    children: [
      { label: 'Connected Repos', route: 'repositories' },
      { label: 'Connect GitHub', route: 'repository-github' },
      { label: 'Connect GitLab', route: 'repository-gitlab' },
      { label: 'Connect Bitbucket', route: 'repository-bitbucket' },
      { label: 'Generic Git', route: 'repository-git' }
    ]
  },
  {
    id: 'data',
    label: 'Data',
    icon: Database,
    children: [
      { label: 'Catalogs', route: 'data-catalog' },
      { label: 'Data Source', route: 'data-source' },
      { label: 'Delta Lake', route: 'data-delta' },
      { label: 'Data Ingest', route: 'data-ingest' },
      { label: 'Data Maintenance', route: 'data-maintenance' },
      { label: 'Data Products', route: 'data-products' },
      { label: 'Data Quality', route: 'data-quality' },
      { label: 'Data Lineage', route: 'data-lineage' }
    ]
  },
  {
    id: 'jobs',
    label: 'Jobs',
    icon: Briefcase,
    children: [
      { label: 'Pipelines', route: 'pipelines' },
      { label: 'IGO ETL', route: 'igo-etl' },
      { label: 'Job Monitor', route: 'jobs' },
      { label: 'Job Logs', route: 'job-logs' },
      { label: 'Job Triggers', route: 'job-triggers' }
    ]
  },
  {
    id: 'data-collab',
    label: 'Data Collab',
    icon: Users,
    route: 'data-collab'
  },
  {
    id: 'admin',
    label: 'Admin',
    icon: Settings,
    children: [
      { label: 'User Management', route: 'admin-users' },
      { label: 'Roles & Permissions', route: 'admin-roles' },
      { label: 'Platform Settings', route: 'admin-settings' }
    ]
  },
];

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const { signOut } = useAuth();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [isLocked, setIsLocked] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  const isExpanded = isLocked || isHovered;

  const toggleExpand = (itemId: string) => {
    setExpandedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleItemClick = (item: MenuItem) => {
    if (item.children) {
      toggleExpand(item.id);
    } else if (item.route) {
      onTabChange(item.route);
    }
  };

  return (
    <div
      className={`bg-gradient-to-b from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900 text-white flex flex-col h-screen transition-all duration-300 ${
        isExpanded ? 'w-64' : 'w-20'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`p-6 border-b border-slate-700 ${isExpanded ? '' : 'px-4'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-xl font-bold">IC</span>
            </div>
            {isExpanded && (
              <div>
                <h1 className="text-xl font-bold">Icecube</h1>
                <p className="text-xs text-slate-400">Data Platform</p>
              </div>
            )}
          </div>
          {isExpanded && (
            <button
              onClick={() => setIsLocked(!isLocked)}
              className="p-1.5 hover:bg-slate-700 rounded transition"
              title={isLocked ? 'Unlock sidebar' : 'Lock sidebar'}
            >
              {isLocked ? (
                <Lock className="w-4 h-4 text-slate-400" />
              ) : (
                <Unlock className="w-4 h-4 text-slate-400" />
              )}
            </button>
          )}
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isItemExpanded = expandedItems.includes(item.id);
          const isActive = item.route === activeTab ||
            item.children?.some(child => child.route === activeTab);

          return (
            <div key={item.id}>
              <button
                onClick={() => handleItemClick(item)}
                className={`w-full flex items-center ${isExpanded ? 'justify-between' : 'justify-center'} px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/50'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
                title={!isExpanded ? item.label : ''}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {isExpanded && <span className="font-medium">{item.label}</span>}
                </div>
                {isExpanded && item.children && (
                  isItemExpanded ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )
                )}
              </button>

              {isExpanded && item.children && isItemExpanded && (
                <div className="mt-1 ml-4 space-y-1">
                  {item.children.map((child) => (
                    <button
                      key={child.route}
                      onClick={() => onTabChange(child.route)}
                      className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
                        activeTab === child.route
                          ? 'bg-cyan-500 text-white'
                          : 'text-slate-400 hover:bg-slate-700 hover:text-white'
                      }`}
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                      <span>{child.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-700 space-y-1">
        <button
          onClick={signOut}
          className={`w-full flex items-center ${isExpanded ? 'space-x-3' : 'justify-center'} px-4 py-3 rounded-lg text-slate-300 hover:bg-red-600 hover:text-white transition-all duration-200`}
          title={!isExpanded ? 'Sign Out' : ''}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {isExpanded && <span className="font-medium">Sign Out</span>}
        </button>
      </div>
    </div>
  );
}
