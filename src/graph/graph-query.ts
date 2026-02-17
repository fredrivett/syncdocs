/**
 * Graph query utilities
 *
 * Provides graph traversal algorithms for flow tracing:
 * - Find entry points
 * - BFS from a node to find all reachable nodes
 * - Find paths between two nodes
 */

import type { FlowGraph, GraphEdge, GraphNode } from './types.js';

/**
 * Find all entry point nodes in the graph
 */
export function entryPoints(graph: FlowGraph): GraphNode[] {
  return graph.nodes.filter((node) => node.entryType !== undefined);
}

/**
 * Find all nodes reachable from a starting node via BFS.
 * Returns the subgraph (nodes + edges) reachable from the start.
 */
export function reachableFrom(
  graph: FlowGraph,
  startNodeId: string,
): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const adjacency = buildAdjacencyList(graph);
  const visited = new Set<string>();
  const queue: string[] = [startNodeId];
  visited.add(startNodeId);

  while (queue.length > 0) {
    const current = queue.shift() as string;
    const neighbors = adjacency.get(current) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }

  const nodeMap = new Map(graph.nodes.map((n) => [n.id, n]));
  const reachableNodes = [...visited]
    .map((id) => nodeMap.get(id))
    .filter((n): n is GraphNode => n !== undefined);

  const reachableEdges = graph.edges.filter((e) => visited.has(e.source) && visited.has(e.target));

  return { nodes: reachableNodes, edges: reachableEdges };
}

/**
 * Find all paths between two nodes using DFS.
 * Returns an array of paths, where each path is an array of node IDs.
 * Limits to maxPaths to avoid combinatorial explosion.
 */
export function pathsBetween(
  graph: FlowGraph,
  fromId: string,
  toId: string,
  maxPaths = 10,
): string[][] {
  const adjacency = buildAdjacencyList(graph);
  const results: string[][] = [];

  function dfs(current: string, path: string[], visited: Set<string>): void {
    if (results.length >= maxPaths) return;

    if (current === toId) {
      results.push([...path]);
      return;
    }

    const neighbors = adjacency.get(current) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        path.push(neighbor);
        dfs(neighbor, path, visited);
        path.pop();
        visited.delete(neighbor);
      }
    }
  }

  const visited = new Set<string>([fromId]);
  dfs(fromId, [fromId], visited);
  return results;
}

/**
 * Build an adjacency list from graph edges (source → [targets])
 */
function buildAdjacencyList(graph: FlowGraph): Map<string, string[]> {
  const adjacency = new Map<string, string[]>();
  for (const edge of graph.edges) {
    const neighbors = adjacency.get(edge.source) || [];
    neighbors.push(edge.target);
    adjacency.set(edge.source, neighbors);
  }
  return adjacency;
}
