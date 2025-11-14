import { useState } from 'react';
import { Sidebar } from './Layout/Sidebar';
import { HomeTab } from './Home/HomeTab';
import { CloudProfilesTab } from './CloudProfiles/CloudProfilesTab';
import { ComputeClustersTab } from './Compute/ComputeClustersTab';
import { WorkspacesTab } from './Workspaces/WorkspacesTab';
import { DataCatalogTab } from './DataCatalog/DataCatalogTab';
import { NotebooksTab } from './Notebooks/NotebooksTab';
import { JobsTab } from './Jobs/JobsTab';
import { PipelinesTab } from './Pipelines/PipelinesTab';
import { MonitoringTab } from './Monitoring/MonitoringTab';
import { QueryEditorTab } from './Query/QueryEditorTab';
import DataSourcesTab from './DataSources/DataSourcesTab';

function PlaceholderTab({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
      <p className="text-gray-600 mb-8">{description}</p>
      <div className="bg-white rounded-xl shadow-md p-12 text-center border border-gray-200">
        <div className="w-16 h-16 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">🚧</span>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Coming Soon</h3>
        <p className="text-gray-600">This feature is under development and will be available soon.</p>
      </div>
    </div>
  );
}

export function Dashboard() {
  const [activeTab, setActiveTab] = useState('home');

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomeTab />;

      case 'cloud-profiles':
      case 'cloud-profiles-aws':
      case 'cloud-profiles-gcp':
      case 'cloud-profiles-azure':
      case 'cloud-profiles-store':
        return <CloudProfilesTab />;

      case 'compute':
        return <ComputeClustersTab />;

      case 'query-editor':
        return <QueryEditorTab />;
      case 'query-results':
        return <PlaceholderTab title="Query Results" description="View your query execution results" />;
      case 'query-stored':
        return <PlaceholderTab title="Stored Queries" description="Access your saved queries" />;

      case 'notebooks':
        return <NotebooksTab />;
      case 'notebook-script':
        return <PlaceholderTab title="Python Scripts" description="Manage your Python scripts" />;
      case 'notebook-store':
        return <PlaceholderTab title="Notebook Store" description="Browse and access all notebooks" />;

      case 'data-catalog':
        return <DataCatalogTab />;
      case 'data-source':
        return <DataSourcesTab />;
      case 'data-delta':
        return <PlaceholderTab title="Delta Lake" description="Delta Lake table management" />;
      case 'data-ingest':
        return <PlaceholderTab title="Data Ingest" description="Configure data ingestion pipelines" />;
      case 'data-maintenance':
        return <PlaceholderTab title="Data Maintenance" description="Optimize and maintain your data" />;
      case 'data-products':
        return <PlaceholderTab title="Data Products" description="Manage your data products" />;
      case 'data-quality':
        return <PlaceholderTab title="Data Quality" description="Monitor and ensure data quality" />;
      case 'data-lineage':
        return <PlaceholderTab title="Data Lineage" description="Track data lineage and dependencies" />;

      case 'jobs':
        return <JobsTab />;
      case 'job-logs':
        return <PlaceholderTab title="Job Logs" description="View detailed job execution logs" />;
      case 'job-triggers':
        return <PlaceholderTab title="Job Triggers" description="Configure job triggers and schedules" />;

      case 'pipelines':
        return <PipelinesTab />;

      case 'data-collab':
        return <PlaceholderTab title="Data Collaboration" description="Collaborate with your team on data projects" />;

      case 'admin-users':
        return <PlaceholderTab title="User Management" description="Manage platform users and access" />;
      case 'admin-roles':
        return <PlaceholderTab title="Roles & Permissions" description="Configure roles and permissions" />;
      case 'admin-settings':
        return <PlaceholderTab title="Platform Settings" description="Configure platform-wide settings" />;

      case 'workspaces':
        return <WorkspacesTab />;
      case 'monitoring':
        return <MonitoringTab />;

      default:
        return <HomeTab />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-8 py-8">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
