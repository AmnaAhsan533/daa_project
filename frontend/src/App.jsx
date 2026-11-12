import React, { useState, useEffect } from 'react';
import { Crosshair, Calculator, AlertTriangle } from 'lucide-react';
import ClosestPairVisualizer from './components/ClosestPairVisualizer';
import KaratsubaVisualizer from './components/KaratsubaVisualizer';
import icon from './assets/algo-icon.png';
import './App.css';

export default function App() {
  const [problemType, setProblemType] = useState('closest_pair');
  const [files, setFiles] = useState({ closest_pair: [], integer_mul: [] });
  const [selectedFile, setSelectedFile] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/files')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch file list');
        return res.json();
      })
      .then((fileData) => {
        setFiles(fileData);
        if (fileData.closest_pair?.length > 0) {
          setSelectedFile(fileData.closest_pair[0]);
        }
      })
      .catch(() => setError('Backend server is offline. Run "python backend.py" first.'));
  }, []);

  useEffect(() => {
    if (!selectedFile) return;
    setLoading(true);
    setError('');

    const endpoint =
      problemType === 'closest_pair'
        ? `http://127.0.0.1:8000/api/closest-pair/${selectedFile}`
        : `http://127.0.0.1:8000/api/integer-mul/${selectedFile}`;

    fetch(endpoint)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load dataset trace');
        return res.json();
      })
      .then((resData) => {
        setData(resData);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [problemType, selectedFile]);

  const handleProblemChange = (type) => {
    setProblemType(type);
    const available = type === 'closest_pair' ? files.closest_pair : files.integer_mul;
    setSelectedFile(available.length > 0 ? available[0] : '');
    setData(null);
  };

  const fileList = problemType === 'closest_pair' ? files.closest_pair : files.integer_mul;

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          {icon && <img src={icon} alt="Logo" className="brand-mark" />}
          <div>
            <div className="brand-title">Divide &amp; Conquer</div>
            <div className="brand-subtitle">Algorithm Execution Visualizer</div>
          </div>
        </div>

        <nav className="algorithm-switcher" aria-label="Algorithm switcher">
          <button
            onClick={() => handleProblemChange('closest_pair')}
            className={problemType === 'closest_pair' ? 'active' : ''}
            type="button"
          >
            <Crosshair size={16} />
            Closest Pair of Points
          </button>
          <button
            onClick={() => handleProblemChange('integer_mul')}
            className={problemType === 'integer_mul' ? 'active' : ''}
            type="button"
          >
            <Calculator size={16} />
            Karatsuba Multiplication
          </button>
        </nav>

        <div className="dataset-picker">
          <label htmlFor="dataset-select">Dataset</label>
          <select
            id="dataset-select"
            value={selectedFile}
            onChange={(e) => setSelectedFile(e.target.value)}
            className="dataset-select"
          >
            {fileList.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>
      </header>

      <main className="workspace">
        {error && (
          <div className="status-banner" role="alert">
            <AlertTriangle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* <div className="workspace-header">
          <div>
            <h1 className="workspace-title">
              {problemType === 'closest_pair' ? 'Closest Pair Explorer' : 'Karatsuba Visualizer'}
            </h1>
            <div className="workspace-subtitle">
              {problemType === 'closest_pair'
                ? 'Trace the recursive divide-and-conquer flow over a coordinate set.'
                : 'Follow the breakdown of large integer multiplication step by step.'}
            </div>
          </div>
        </div> */}

        {/* <div className="metric-grid">
          <div className="metric-card">
            <span className="metric-label">Problem</span>
            <div className="metric-value" data-accent="blue">
              {problemType === 'closest_pair' ? 'Closest Pair' : 'Karatsuba'}
            </div>
          </div>
          <div className="metric-card">
            <span className="metric-label">Dataset</span>
            <div className="metric-value" data-accent="purple">
              {selectedFile || 'Waiting'}
            </div>
          </div>
          <div className="metric-card">
            <span className="metric-label">Status</span>
            <div className="metric-value" data-accent="green">
              {loading ? 'Running' : data ? 'Ready' : 'Idle'}
            </div>
          </div>
        </div> */}

        {loading && (
          <div className="status-banner success">
            <span>Running algorithm and building execution trace...</span>
          </div>
        )}

        {!loading && data && (
          <div className="visualizer-wrap">
            {problemType === 'closest_pair' ? (
              <ClosestPairVisualizer data={data} filename={selectedFile} />
            ) : (
              <KaratsubaVisualizer data={data} filename={selectedFile} />
            )}
          </div>
        )}
      </main>
    </div>
  );
}