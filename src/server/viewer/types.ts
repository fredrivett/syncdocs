/**
 * Types shared between viewer components.
 * Mirrors the graph types from the backend.
 */

export interface GraphNode {
  id: string;
  name: string;
  kind: 'function' | 'class' | 'const' | 'method';
  filePath: string;
  entryType?: string;
  isAsync: boolean;
  hash: string;
  lineRange: [number, number];
  metadata?: {
    httpMethod?: string;
    route?: string;
    eventTrigger?: string;
    taskId?: string;
  };
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: string;
  label?: string;
  condition?: string;
  isAsync: boolean;
  order?: number;
}

export interface FlowGraph {
  version: string;
  generatedAt: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
}
