/**
 * AI-powered discovery of runtime dispatch connections
 */

import type { SymbolInfo } from '../extractor/types.js';
import type { AIClient } from '../generator/ai-client.js';
import type { DiscoveredConnection } from './types.js';

/**
 * Build the discovery prompt for a symbol.
 * Framework-agnostic — gives diverse examples so it works beyond just Trigger.dev.
 */
export function buildDiscoveryPrompt(symbol: SymbolInfo): string {
  return `Analyze this TypeScript code and identify runtime dispatch calls — connections to other code that are made via string identifiers rather than direct function imports.

Examples of what to look for:
- Task/job queue dispatches: tasks.trigger("task-id"), queue.add("job-name"), worker.dispatch(...)
- Event emissions: emit("event-name"), eventBus.publish("topic")
- Internal API calls: fetch("/api/..."), axios.post("/api/...")
- Dynamic routing: router.push("/path"), navigate("/path")

Do NOT include:
- Direct function/method calls (handled by static analysis)
- Calls to external third-party APIs (Stripe, Supabase, AWS, etc.)

Source code of \`${symbol.name}\` (${symbol.kind}) from \`${symbol.filePath}\`:

\`\`\`typescript
${symbol.fullText}
\`\`\`

Respond with ONLY a JSON array. Each item needs "type", "targetHint", and "reason".
Return [] if no runtime dispatches found.`;
}

/**
 * Parse the AI response into structured connections.
 * Handles malformed JSON gracefully — returns [] on any failure.
 */
export function parseDiscoveryResponse(response: string): DiscoveredConnection[] {
  let cleaned = response.trim();

  // Strip markdown code fences if present
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  }

  try {
    const parsed = JSON.parse(cleaned);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (c: any) =>
        typeof c.type === 'string' &&
        typeof c.targetHint === 'string' &&
        typeof c.reason === 'string',
    );
  } catch {
    return [];
  }
}

/**
 * Discover runtime connections in a symbol using AI analysis.
 */
export async function discoverConnections(
  aiClient: AIClient,
  symbol: SymbolInfo,
): Promise<DiscoveredConnection[]> {
  const prompt = buildDiscoveryPrompt(symbol);
  const response = await aiClient.sendPrompt(prompt, 1024);
  return parseDiscoveryResponse(response);
}
