import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar, ViewType } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './views/DashboardView';
import { ProjectsView } from './views/ProjectsView';
import { DuplicateDetectionView } from './views/DuplicateDetectionView';
import { AlertCenterView } from './views/AlertCenterView';
import { PredictiveAnalyticsView } from './views/PredictiveAnalyticsView';
import { GeospatialMapView } from './views/GeospatialMapView';
import { AnalyticsView } from './views/AnalyticsView';
import { AiInsightsView } from './views/AiInsightsView';
import { AssistantView } from './views/AssistantView';
import { DataManagementView } from './views/DataManagementView';
import { AuditLogsView } from './views/AuditLogsView';
import { LoginView } from './views/LoginView';

const MainLayout: React.FC = () => {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');

  if (!user) {
    return <LoginView />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView />;
      case 'projects':
        return <ProjectsView />;
      case 'duplicates':
        return <DuplicateDetectionView />;
      case 'alerts':
        return <AlertCenterView />;
      case 'predictive':
        return <PredictiveAnalyticsView />;
      case 'geospatial':
        return <GeospatialMapView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'insights':
        return <AiInsightsView />;
      case 'assistant':
        return <AssistantView />;
      case 'datamgmt':
        return <DataManagementView />;
      case 'audit':
        return <AuditLogsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <Sidebar currentView={currentView} onSelectView={setCurrentView} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 overflow-y-auto">
          {renderView()}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}
