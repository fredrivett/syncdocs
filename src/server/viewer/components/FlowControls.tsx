import type { ChangeEvent } from 'react';
import type { GraphNode } from '../types';

interface FlowControlsProps {
  entryPoints: GraphNode[];
  selectedEntry: string | null;
  onSelectEntry: (nodeId: string | null) => void;
  searchQuery: string;
  onSearch: (query: string) => void;
  nodeCount: number;
  edgeCount: number;
}

export function FlowControls({
  entryPoints,
  selectedEntry,
  onSelectEntry,
  searchQuery,
  onSearch,
  nodeCount,
  edgeCount,
}: FlowControlsProps) {
  const entryTypeLabels: Record<string, string> = {
    'api-route': 'API',
    page: 'Page',
    'inngest-function': 'Inngest',
    'trigger-task': 'Trigger',
    middleware: 'MW',
    'server-action': 'Action',
  };

  return (
    <div
      style={{
        background: '#ffffff',
        borderRight: '1px solid #e5e7eb',
        padding: 16,
        width: 280,
        minWidth: 280,
        height: '100%',
        overflow: 'auto',
      }}
    >
      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12, color: '#111827' }}>
        Syncdocs Flow Graph
      </div>

      <input
        type="text"
        placeholder="Search nodes..."
        value={searchQuery}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onSearch(e.target.value)}
        style={{
          width: '100%',
          padding: '8px 10px',
          border: '1px solid #e5e7eb',
          borderRadius: 6,
          fontSize: 13,
          outline: 'none',
          marginBottom: 12,
        }}
      />

      <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 12 }}>
        {nodeCount} nodes, {edgeCount} edges
      </div>

      {entryPoints.length > 0 && (
        <>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
            Entry Points
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {selectedEntry && (
              <button
                type="button"
                onClick={() => onSelectEntry(null)}
                style={{
                  padding: '6px 10px',
                  border: '1px solid #e5e7eb',
                  borderRadius: 6,
                  background: '#f9fafb',
                  cursor: 'pointer',
                  fontSize: 12,
                  textAlign: 'left',
                  color: '#6b7280',
                }}
              >
                Show all nodes
              </button>
            )}
            {entryPoints.map((ep) => {
              const isSelected = selectedEntry === ep.id;
              const typeLabel = ep.entryType ? entryTypeLabels[ep.entryType] || ep.entryType : '';
              const detail = ep.metadata?.httpMethod
                ? `${ep.metadata.httpMethod} ${ep.metadata.route || ''}`
                : ep.metadata?.eventTrigger || ep.metadata?.taskId || '';

              return (
                <button
                  type="button"
                  key={ep.id}
                  onClick={() => onSelectEntry(isSelected ? null : ep.id)}
                  style={{
                    padding: '6px 10px',
                    border: isSelected ? '1px solid #3b82f6' : '1px solid #e5e7eb',
                    borderRadius: 6,
                    background: isSelected ? '#eff6ff' : '#ffffff',
                    cursor: 'pointer',
                    fontSize: 12,
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                    overflow: 'hidden',
                    width: '100%',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    {typeLabel && (
                      <span style={{ fontWeight: 600, color: '#6b7280' }}>{typeLabel}</span>
                    )}
                    <span style={{ fontWeight: 500, color: '#1f2937' }}>{ep.name}</span>
                  </div>
                  {detail && (
                    <div
                      style={{
                        fontSize: 11,
                        color: '#9ca3af',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {detail}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
