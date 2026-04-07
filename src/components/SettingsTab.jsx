import React, { useState, useEffect } from 'react';
import { Globe, RefreshCw, Trash2, ChevronRight } from 'lucide-react';
import './SettingsTab.css';

const SettingsTab = () => {
  const [settings, setSettings] = useState({
    language: 'kr',
    rotationMode: 'group' // 'group' or 'random'
  });

  useEffect(() => {
    const saved = localStorage.getItem('behalf_settings');
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  }, []);

  const updateSetting = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem('behalf_settings', JSON.stringify(newSettings));
  };

  const handleResetData = () => {
    const confirmMessage = "모든 기록과 멤버 데이터가 영구적으로 삭제됩니다.\n초기화하시겠습니까?";
    if (window.confirm(confirmMessage)) {
      localStorage.removeItem('behalf_members_v2');
      localStorage.removeItem('behalf_today_prayer');
      localStorage.removeItem('behalf_history');
      localStorage.removeItem('behalf_settings');
      alert('데이터가 초기화되었습니다. 앱이 처음 상태로 돌아갑니다.');
      window.location.reload();
    }
  };

  return (
    <div className="settings-tab-container">
      <header className="screen-header">
        <h1 className="screen-title">설정</h1>
      </header>

      <div className="settings-list">
        {/* Language Setting */}
        <div className="settings-group">
          <div className="settings-item">
            <div className="settings-item-info">
              <div className="settings-icon-wrapper text-blue">
                <Globe size={20} />
              </div>
              <div className="settings-text">
                <h3 className="settings-item-title">언어 / Language</h3>
                <p className="settings-item-desc">앱의 언어를 설정합니다.</p>
              </div>
            </div>
            <div className="settings-control">
              <select 
                className="minimal-select"
                value={settings.language}
                onChange={(e) => updateSetting('language', e.target.value)}
              >
                <option value="kr">한국어</option>
                <option value="en">English (지원 예정)</option>
              </select>
              <ChevronRight size={16} className="chevron" />
            </div>
          </div>
        </div>

        {/* Rotation Logic Setting */}
        <div className="settings-group">
          <div className="settings-item">
            <div className="settings-item-info">
              <div className="settings-icon-wrapper text-green">
                <RefreshCw size={20} />
              </div>
              <div className="settings-text">
                <h3 className="settings-item-title">기도 대상자 순환 방식</h3>
                <p className="settings-item-desc">투데이 화면 멤버 배정 규칙을 선택합니다.</p>
              </div>
            </div>
            <div className="settings-control">
              <select 
                className="minimal-select"
                value={settings.rotationMode}
                onChange={(e) => updateSetting('rotationMode', e.target.value)}
              >
                <option value="group">요일별 그룹 순환</option>
                <option value="random">무작위 배정</option>
              </select>
              <ChevronRight size={16} className="chevron" />
            </div>
          </div>
        </div>

        {/* Data Reset */}
        <div className="settings-group danger-group">
          <div className="settings-item" onClick={handleResetData} role="button" tabIndex={0}>
            <div className="settings-item-info">
              <div className="settings-icon-wrapper text-red">
                <Trash2 size={20} />
              </div>
              <div className="settings-text">
                <h3 className="settings-item-title text-red">데이터 초기화</h3>
                <p className="settings-item-desc">모든 멤버와 기도 기록을 삭제합니다.</p>
              </div>
            </div>
            <div className="settings-control">
              <ChevronRight size={16} className="chevron text-red" />
            </div>
          </div>
        </div>
      </div>
      
      <div className="app-version">
        Behalf v1.0.0
      </div>
    </div>
  );
};

export default SettingsTab;
