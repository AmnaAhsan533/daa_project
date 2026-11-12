import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';

export default function ClosestPairVisualizer({ data, filename }) {
  const [stepIdx, setStepIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(500);
  const canvasRef = useRef(null);

  const steps = data.steps;
  const currentStep = steps[stepIdx];

  useEffect(() => {
    let timer = null;
    if (isPlaying) {
      timer = setInterval(() => {
        setStepIdx((prev) => {
          if (prev < steps.length - 1) return prev + 1;
          setIsPlaying(false);
          return prev;
        });
      }, speed);
    }
    return () => clearInterval(timer);
  }, [isPlaying, speed, steps.length]);

  useEffect(() => {
    setStepIdx(0);
    setIsPlaying(false);
  }, [data]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    const padding = 45;
    const xs = data.points.map((p) => p.x);
    const ys = data.points.map((p) => p.y);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys);

    const scaleX = (x) => padding + ((x - minX) / (maxX - minX || 1)) * (width - 2 * padding);
    const scaleY = (y) => height - (padding + ((y - minY) / (maxY - minY || 1)) * (height - 2 * padding));

    // Subtle Grid Lines
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 1;
    for (let i = 1; i < 10; i++) {
      ctx.beginPath();
      ctx.moveTo((width / 10) * i, 0);
      ctx.lineTo((width / 10) * i, height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, (height / 10) * i);
      ctx.lineTo(width, (height / 10) * i);
      ctx.stroke();
    }

    // Draw Central Strip Region
    if (currentStep?.type === 'strip' && currentStep.d) {
      const leftX = scaleX(currentStep.mid_x - currentStep.d);
      const rightX = scaleX(currentStep.mid_x + currentStep.d);
      ctx.fillStyle = 'rgba(250, 204, 21, 0.22)';
      ctx.fillRect(leftX, 0, rightX - leftX, height);
    }

    // Draw Vertical Dividing Line
    if (currentStep?.mid_x !== undefined) {
      const midCanvasX = scaleX(currentStep.mid_x);
      ctx.beginPath();
      ctx.setLineDash([6, 6]);
      ctx.moveTo(midCanvasX, 0);
      ctx.lineTo(midCanvasX, height);
      ctx.strokeStyle = '#2563eb';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw All Points
    data.points.forEach((p) => {
      ctx.beginPath();
      ctx.arc(scaleX(p.x), scaleY(p.y), 3.8, 0, 2 * Math.PI);
      ctx.fillStyle = '#64748b';
      ctx.fill();
    });

    // Highlight Current Minimum Pair
    if (currentStep?.pair && currentStep.pair[0] && currentStep.pair[1]) {
      const [p1, p2] = currentStep.pair;
      const x1 = scaleX(p1.x), y1 = scaleY(p1.y);
      const x2 = scaleX(p2.x), y2 = scaleY(p2.y);

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 3;
      ctx.stroke();

      [p1, p2].forEach((p) => {
        ctx.beginPath();
        ctx.arc(scaleX(p.x), scaleY(p.y), 6.5, 0, 2 * Math.PI);
        ctx.fillStyle = '#dc2626';
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();
      });
    }
  }, [stepIdx, data, currentStep]);

  const btnBase = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    borderRadius: '8px',
    fontWeight: '600',
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 360px', gap: '24px', alignItems: 'start' }}>
      
      {/* LEFT STAGE: 2D VISUALIZATION CANVAS */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
          padding: '20px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', color: '#0f172a' }}>2D Coordinate Plane</h2>
            <span style={{ fontSize: '13px', color: '#64748b' }}>
              File: <strong>{filename}</strong> • Total Points: <strong>{data.points.length}</strong>
            </span>
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', gap: '14px', fontSize: '12px', color: '#475569' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#64748b', display: 'inline-block' }} /> Point
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '12px', height: '2px', background: '#2563eb', display: 'inline-block' }} /> Split Line
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '10px', height: '10px', background: 'rgba(250, 204, 21, 0.5)', border: '1px solid #eab308', display: 'inline-block' }} /> Strip
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '12px', height: '3px', background: '#ef4444', display: 'inline-block' }} /> Closest Pair
            </span>
          </div>
        </div>

        <canvas
          ref={canvasRef}
          width={860}
          height={520}
          style={{
            width: '100%',
            height: '520px',
            borderRadius: '10px',
            border: '1px solid #e2e8f0',
            background: '#ffffff',
          }}
        />
      </div>

      {/* RIGHT SIDEBAR: PLAYBACK CONTROLS & LIVE TELEMETRY */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'sticky', top: '88px' }}>
        
        {/* Playback Card */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '14px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
            padding: '20px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.04em' }}>
              Execution Controls
            </span>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#2563eb', background: '#eff6ff', padding: '4px 10px', borderRadius: '20px' }}>
              Step {stepIdx + 1} / {steps.length}
            </span>
          </div>

          {/* Primary Play / Reset Buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
            <button
              onClick={() => {
                if (stepIdx === steps.length - 1) setStepIdx(0);
                setIsPlaying(!isPlaying);
              }}
              style={{
                ...btnBase,
                padding: '10px',
                border: 'none',
                fontWeight: '700',
                fontSize: '14px',
                cursor: 'pointer',
                background: isPlaying ? '#dc2626' : '#16a34a',
                color: '#ffffff',
              }}
            >
              {isPlaying ? <><Pause size={16} /> Pause</> : <><Play size={16} /> Play</>}
            </button>
            <button
              onClick={() => {
                setIsPlaying(false);
                setStepIdx(0);
              }}
              style={{
                ...btnBase,
                padding: '10px',
                border: '1px solid #cbd5e1',
                fontSize: '14px',
                cursor: 'pointer',
                background: '#f8fafc',
                color: '#334155',
              }}
            >
              <RotateCcw size={16} /> Reset
            </button>
          </div>

          {/* Prev / Next Step Buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
            <button
              disabled={stepIdx === 0 || isPlaying}
              onClick={() => setStepIdx((p) => p - 1)}
              style={{
                ...btnBase,
                padding: '9px',
                border: 'none',
                fontSize: '13px',
                cursor: stepIdx === 0 || isPlaying ? 'not-allowed' : 'pointer',
                background: stepIdx === 0 || isPlaying ? '#e2e8f0' : '#2563eb',
                color: stepIdx === 0 || isPlaying ? '#94a3b8' : '#ffffff',
              }}
            >
              <ChevronLeft size={16} /> Previous
            </button>
            <button
              disabled={stepIdx === steps.length - 1 || isPlaying}
              onClick={() => setStepIdx((p) => p + 1)}
              style={{
                ...btnBase,
                padding: '9px',
                border: 'none',
                fontSize: '13px',
                cursor: stepIdx === steps.length - 1 || isPlaying ? 'not-allowed' : 'pointer',
                background: stepIdx === steps.length - 1 || isPlaying ? '#e2e8f0' : '#2563eb',
                color: stepIdx === steps.length - 1 || isPlaying ? '#94a3b8' : '#ffffff',
              }}
            >
              Next <ChevronRight size={16} />
            </button>
          </div>

          {/* Timeline Scrubber */}
          <div style={{ marginBottom: '14px' }}>
            <input
              type="range"
              min="0"
              max={steps.length - 1}
              value={stepIdx}
              onChange={(e) => {
                setIsPlaying(false);
                setStepIdx(Number(e.target.value));
              }}
              style={{ width: '100%' }}
            />
          </div>

          {/* Speed Selector */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>Playback Speed</label>
            <select
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              style={{
                padding: '6px 10px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                fontWeight: '600',
                color: '#1e293b',
              }}
            >
              <option value={1000}>0.5x (Slow)</option>
              <option value={500}>1.0x (Normal)</option>
              <option value={200}>2.0x (Fast)</option>
              <option value={50}>5.0x (Turbo)</option>
            </select>
          </div>
        </div>

        {/* Active Step Status Card */}
        <div
          style={{
            background: '#eff6ff',
            borderRadius: '14px',
            border: '1px solid #bfdbfe',
            padding: '18px',
          }}
        >
          <div style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: '#1d4ed8', marginBottom: '6px' }}>
            Current Operation (Depth {currentStep?.depth ?? 0})
          </div>
          <div style={{ fontSize: '14px', color: '#1e3a8a', lineHeight: '1.5' }}>
            {currentStep?.desc}
          </div>
        </div>

        {/* Final Answer Summary Card */}
        <div
          style={{
            background: '#f0fdf4',
            borderRadius: '14px',
            border: '1px solid #bbf7d0',
            padding: '18px',
          }}
        >
          <div style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: '#15803d', marginBottom: '6px' }}>
            Global Minimum Distance
          </div>
          <div style={{ fontSize: '22px', fontWeight: '800', color: '#14532d', fontFamily: 'monospace' }}>
            {data.final_d?.toFixed(6)}
          </div>
          {data.best_pair?.length === 2 && (
            <div style={{ fontSize: '12px', color: '#166534', marginTop: '6px', fontFamily: 'monospace' }}>
              P1: ({data.best_pair[0].x}, {data.best_pair[0].y})<br />
              P2: ({data.best_pair[1].x}, {data.best_pair[1].y})
            </div>
          )}
        </div>

      </div>
    </div>
  );
}