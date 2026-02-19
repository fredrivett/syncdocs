import { type ChangeEvent, useState } from 'react';

export interface LayoutOptions {
  'elk.algorithm': string;
  'elk.direction': string;
  'elk.spacing.nodeNode': string;
  'elk.layered.spacing.nodeNodeBetweenLayers': string;
  'elk.layered.crossingMinimization.strategy': string;
  'elk.layered.nodePlacement.strategy': string;
  'elk.layered.edgeRouting': string;
}

export const defaultLayoutOptions: LayoutOptions = {
  'elk.algorithm': 'layered',
  'elk.direction': 'DOWN',
  'elk.spacing.nodeNode': '40',
  'elk.layered.spacing.nodeNodeBetweenLayers': '60',
  'elk.layered.crossingMinimization.strategy': 'LAYER_SWEEP',
  'elk.layered.nodePlacement.strategy': 'BRANDES_KOEPF',
  'elk.layered.edgeRouting': 'ORTHOGONAL',
};

const algorithms = [
  { value: 'layered', label: 'Layered (hierarchical)' },
  { value: 'mrtree', label: 'Mr. Tree' },
  { value: 'force', label: 'Force-directed' },
  { value: 'stress', label: 'Stress' },
  { value: 'box', label: 'Box packing' },
];

const directions = [
  { value: 'DOWN', label: 'Down' },
  { value: 'UP', label: 'Up' },
  { value: 'RIGHT', label: 'Right' },
  { value: 'LEFT', label: 'Left' },
];

const crossingStrategies = [
  { value: 'LAYER_SWEEP', label: 'Layer sweep' },
  { value: 'INTERACTIVE', label: 'Interactive' },
];

const nodePlacementStrategies = [
  { value: 'BRANDES_KOEPF', label: 'Brandes-Koepf (compact)' },
  { value: 'LINEAR_SEGMENTS', label: 'Linear segments' },
  { value: 'NETWORK_SIMPLEX', label: 'Network simplex (balanced)' },
  { value: 'SIMPLE', label: 'Simple' },
];

const edgeRoutingOptions = [
  { value: 'ORTHOGONAL', label: 'Orthogonal (right angles)' },
  { value: 'POLYLINE', label: 'Polyline' },
  { value: 'SPLINES', label: 'Splines' },
];

const selectStyle: React.CSSProperties = {
  width: '100%',
  padding: '4px 6px',
  border: '1px solid #e5e7eb',
  borderRadius: 4,
  fontSize: 12,
  background: '#fff',
  color: '#1f2937',
};

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 500,
  color: '#6b7280',
  marginBottom: 2,
};

interface LayoutSettingsProps {
  options: LayoutOptions;
  onChange: (options: LayoutOptions) => void;
}

export function LayoutSettings({ options, onChange }: LayoutSettingsProps) {
  const [open, setOpen] = useState(false);

  const isLayered = options['elk.algorithm'] === 'layered';

  function update(key: keyof LayoutOptions, value: string) {
    onChange({ ...options, [key]: value });
  }

  return (
    <div
      style={{
        position: 'absolute',
        top: 12,
        right: 12,
        zIndex: 10,
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        style={{
          background: open ? '#1f2937' : '#ffffff',
          color: open ? '#ffffff' : '#374151',
          border: '1px solid #e5e7eb',
          borderRadius: 8,
          padding: '6px 12px',
          fontSize: 12,
          fontWeight: 600,
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        }}
      >
        Layout
      </button>

      {open && (
        <div
          style={{
            marginTop: 8,
            background: '#ffffff',
            borderRadius: 12,
            padding: 14,
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            border: '1px solid #e5e7eb',
            width: 220,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          <div>
            <div style={labelStyle}>Algorithm</div>
            <select
              style={selectStyle}
              value={options['elk.algorithm']}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => update('elk.algorithm', e.target.value)}
            >
              {algorithms.map((a) => (
                <option key={a.value} value={a.value}>
                  {a.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div style={labelStyle}>Direction</div>
            <select
              style={selectStyle}
              value={options['elk.direction']}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => update('elk.direction', e.target.value)}
            >
              {directions.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div style={labelStyle}>Node spacing</div>
            <input
              type="range"
              min="10"
              max="120"
              value={options['elk.spacing.nodeNode']}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                update('elk.spacing.nodeNode', e.target.value)
              }
              style={{ width: '100%' }}
            />
            <div style={{ fontSize: 10, color: '#9ca3af', textAlign: 'right' }}>
              {options['elk.spacing.nodeNode']}px
            </div>
          </div>

          <div>
            <div style={labelStyle}>Layer spacing</div>
            <input
              type="range"
              min="20"
              max="200"
              value={options['elk.layered.spacing.nodeNodeBetweenLayers']}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                update('elk.layered.spacing.nodeNodeBetweenLayers', e.target.value)
              }
              style={{ width: '100%' }}
            />
            <div style={{ fontSize: 10, color: '#9ca3af', textAlign: 'right' }}>
              {options['elk.layered.spacing.nodeNodeBetweenLayers']}px
            </div>
          </div>

          {isLayered && (
            <>
              <div>
                <div style={labelStyle}>Edge routing</div>
                <select
                  style={selectStyle}
                  value={options['elk.layered.edgeRouting']}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                    update('elk.layered.edgeRouting', e.target.value)
                  }
                >
                  {edgeRoutingOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div style={labelStyle}>Node placement</div>
                <select
                  style={selectStyle}
                  value={options['elk.layered.nodePlacement.strategy']}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                    update('elk.layered.nodePlacement.strategy', e.target.value)
                  }
                >
                  {nodePlacementStrategies.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div style={labelStyle}>Crossing minimization</div>
                <select
                  style={selectStyle}
                  value={options['elk.layered.crossingMinimization.strategy']}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                    update('elk.layered.crossingMinimization.strategy', e.target.value)
                  }
                >
                  {crossingStrategies.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          <button
            type="button"
            onClick={() => onChange({ ...defaultLayoutOptions })}
            style={{
              padding: '4px 8px',
              border: '1px solid #e5e7eb',
              borderRadius: 4,
              background: '#f9fafb',
              fontSize: 11,
              color: '#6b7280',
              cursor: 'pointer',
              marginTop: 2,
            }}
          >
            Reset defaults
          </button>
        </div>
      )}
    </div>
  );
}
