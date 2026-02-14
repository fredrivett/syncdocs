/**
 * Types for symbol extraction
 */

export interface SymbolInfo {
  name: string;
  kind: 'function' | 'class' | 'const' | 'method';
  filePath: string;
  params: string;
  body: string;
  fullText: string;
  startLine: number;
  endLine: number;
}

export interface CallSite {
  name: string;
  expression: string;
}

export interface ExtractionResult {
  symbols: SymbolInfo[];
  errors: string[];
}
