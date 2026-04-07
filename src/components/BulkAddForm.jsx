import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import './BulkAddForm.css';

const BulkAddForm = ({ groups = ["교회 목장", "회사", "지인"], onSave, onCancel }) => {
  const [text, setText] = useState('');
  const [group, setGroup] = useState(groups[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/parse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text })
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`서버/API 오류: ${res.status} - ${errorText}`);
      }

      const parsedData = await res.json();

      if (!Array.isArray(parsedData) || parsedData.length === 0) {
        throw new Error("추출된 멤버 데이터가 없습니다. 양식을 다시 확인해주세요.");
      }

      onSave(parsedData, group);
    } catch (err) {
      console.error(err);
      setError(err.message || '텍스트 파싱 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bulk-overlay">
      <div className="bulk-container form-animation-rise">
        <header className="bulk-header">
          <h2 className="bulk-title">기도제목 일괄 파싱</h2>
          <button className="icon-button" onClick={onCancel} aria-label="Cancel">
            <X size={20} />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="bulk-form">
          <div className="bulk-body">
            <div className="bulk-group">
              <label className="bulk-label">기본 반영 그룹</label>
              <select 
                className="bulk-select" 
                value={group}
                onChange={e => setGroup(e.target.value)}
              >
                {groups.map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            <div className="bulk-group" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <label className="bulk-label">텍스트 붙여넣기</label>
              <p className="bulk-help">
                형식 예제:<br/>
                홍길동<br/>
                - 건강 회복<br/>
                - 이직 준비<br/>
                <br/>
                김영희<br/>
                - 자녀 학업 일정
              </p>
              <textarea 
                className="bulk-textarea"
                placeholder="여기에 텍스트를 붙여넣어 주세요..."
                value={text}
                onChange={e => setText(e.target.value)}
                required
              />
            </div>
            
            {error && <div className="bulk-error">{error}</div>}
          </div>

          <div className="bulk-actions">
            <button type="button" className="btn-cancel" onClick={onCancel} disabled={loading}>
              취소
            </button>
            <button type="submit" className="btn-save" disabled={!text.trim() || loading}>
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" style={{ marginRight: '8px' }} />
                  파싱 중...
                </>
              ) : (
                '분석 및 추가'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BulkAddForm;
