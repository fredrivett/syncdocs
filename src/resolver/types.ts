/**
 * Types for AI-powered connection discovery
 */

import type { SymbolInfo } from '../extractor/types.js';

/**
 * A runtime connection discovered by AI analysis.
 * type is a free-form string — the AI can return any type.
 * Verification dispatches to known verifiers; unknown types are discarded.
 */
export interface DiscoveredConnection {
  type: string;
  targetHint: string;
  reason: string;
}

/**
 * A connection that has been verified against the codebase.
 */
export interface VerifiedConnection {
  sourceSymbol: SymbolInfo;
  connection: DiscoveredConnection;
  targetSymbol: SymbolInfo;
  targetFilePath: string;
}
