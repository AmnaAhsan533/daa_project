import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

export default function KaratsubaVisualizer({ data, filename }) {
  const [stepIdx, setStepIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(500);

  const steps = data.steps;
  const curr = steps[stepIdx];

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

  const wrapStyle = {
    fontFamily: 'monospace',
    wordBreak: 'break-all',
    overflowWrap: 'anywhere',
    lineHeight: '1.6',
  };

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
      
      {/* LEFT STAGE: KARATSUBA RECURSION STEP CARDS */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
          padding: '24px',
        }}
      >
        <div style={{ marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid #f1f5f9' }}>
          <h2 style={{ margin: '0 0 4px 0', fontSize: '18px', color: '#0f172a' }}>{curr?.title}</h2>
          <span style={{ fontSize: '13px', color: '#64748b' }}>
            File: <strong>{filename}</strong> • Input Size: <strong>{data.num1.length} digits</strong>
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Step 1: Split */}
          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', borderLeft: '4px solid #3b82f6' }}>
            <div style={{ fontSize: '12px', textTransform: 'uppercase', color: '#64748b', fontWeight: '700', marginBottom: '8px' }}>
              Step 1: Divide Inputs (at {curr?.half} digits)
            </div>
            <div style={{ ...wrapStyle, fontSize: '13.5px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <strong>X ({curr?.x?.length} digits):</strong> {curr?.x}
                <div style={{ paddingLeft: '12px', color: '#1e3a8a', marginTop: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                    <ArrowRight size={14} style={{ marginTop: '4px', flexShrink: 0 }} />
                    <span><strong>a =</strong> {curr?.a}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                    <ArrowRight size={14} style={{ marginTop: '4px', flexShrink: 0 }} />
                    <span><strong>b =</strong> {curr?.b}</span>
                  </div>
                </div>
              </div>
              <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '10px' }}>
                <strong>Y ({curr?.y?.length} digits):</strong> {curr?.y}
                <div style={{ paddingLeft: '12px', color: '#1e3a8a', marginTop: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                    <ArrowRight size={14} style={{ marginTop: '4px', flexShrink: 0 }} />
                    <span><strong>c =</strong> {curr?.c}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                    <ArrowRight size={14} style={{ marginTop: '4px', flexShrink: 0 }} />
                    <span><strong>d =</strong> {curr?.d}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: 3 Sub-Products */}
          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', borderLeft: '4px solid #8b5cf6' }}>
            <div style={{ fontSize: '12px', textTransform: 'uppercase', color: '#64748b', fontWeight: '700', marginBottom: '8px' }}>
              Step 2: Conquer (3 Recursive Sub-Products)
            </div>
            <div style={{ ...wrapStyle, fontSize: '13.5px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div>• <strong>P1 (a x c):</strong> <span style={{ color: '#059669', fontWeight: '700' }}>{curr?.ac}</span></div>
              <div>• <strong>P2 (b x d):</strong> <span style={{ color: '#059669', fontWeight: '700' }}>{curr?.bd}</span></div>
              <div>• <strong>P3 ((a+b)(c+d) - P1 - P2):</strong> <span style={{ color: '#059669', fontWeight: '700' }}>{curr?.ad_plus_bc}</span></div>
            </div>
          </div>

          {/* Step 3: Shift & Combine */}
          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', borderLeft: '4px solid #10b981' }}>
            <div style={{ fontSize: '12px', textTransform: 'uppercase', color: '#64748b', fontWeight: '700', marginBottom: '8px' }}>
              Step 3: Combine with Powers of 10
            </div>
            <div style={{ ...wrapStyle, fontSize: '13px', color: '#334155', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div><strong>Formula:</strong> (P1 × 10<sup>{2 * (curr?.half || 0)}</sup>) + (P3 × 10<sup>{curr?.half || 0}</sup>) + P2</div>
              <div>• <strong>Term 1:</strong> {curr?.term1}</div>
              <div>• <strong>Term 2:</strong> {curr?.term2}</div>
              <div>• <strong>Term 3:</strong> {curr?.term3}</div>
            </div>
          </div>

          {/* Step 4: Combined Result */}
          <div style={{ background: '#f0fdf4', padding: '16px', borderRadius: '10px', border: '1px solid #bbf7d0' }}>
            <div style={{ fontSize: '12px', textTransform: 'uppercase', color: '#15803d', fontWeight: '700', marginBottom: '6px' }}>
              Step Result ({curr?.result?.length} digits)
            </div>
            <div style={{ ...wrapStyle, fontSize: '14.5px', fontWeight: '700', color: '#14532d' }}>
              {curr?.result}
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDEBAR: PLAYBACK CONTROLS & FINAL PRODUCT */}
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
            Current Operation (Level {curr?.depth ?? 0})
          </div>
          <div style={{ fontSize: '14px', color: '#1e3a8a', lineHeight: '1.5' }}>
            {curr?.desc}
          </div>
        </div>

        {/* Verified Final Product Card */}
        <div
          style={{
            background: '#f0fdf4',
            borderRadius: '14px',
            border: '1px solid #bbf7d0',
            padding: '18px',
          }}
        >
          <div style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: '#15803d', marginBottom: '6px' }}>
            Verified Final Product ({data.final_product.length} digits)
          </div>
          <div style={{ ...wrapStyle, fontSize: '12.5px', fontWeight: '700', color: '#14532d', maxHeight: '140px', overflowY: 'auto' }}>
            {data.final_product}
          </div>
        </div>

      </div>
    </div>
  );
}