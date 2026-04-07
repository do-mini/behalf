import { useState } from 'react';
import { Sun, ListTodo, History, Settings } from 'lucide-react';
import TodayTab from './components/TodayTab';
import ListTab from './components/ListTab';
import HistoryTab from './components/HistoryTab';
import SettingsTab from './components/SettingsTab';
import './index.css';

function App() {
  const [activeTab, setActiveTab] = useState('today');

  const tabs = [
    { id: 'today', label: '투데이', icon: Sun },
    { id: 'list', label: '목록', icon: ListTodo },
    { id: 'history', label: '기록', icon: History },
    { id: 'settings', label: '설정', icon: Settings }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'today':
        return <TodayTab />;
      case 'list':
        return <ListTab />;
      case 'history':
        return <HistoryTab />;
      case 'settings':
        return <SettingsTab />;
      default:
        return null;
    }
  };

  return (
    <div className="app-container">
      <main className="content-area">
        {renderContent()}
      </main>
      
      <nav className="bottom-nav">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              aria-label={tab.label}
            >
              <Icon size={24} className="nav-icon" />
              <span className="nav-label">{tab.label}</span>
            </button>
          )
        })}
      </nav>
    </div>
  );
}

export default App;
