/**
 * Matcher registry
 *
 * Exports all available framework matchers.
 * To add a new framework, create a matcher file and add it here.
 */

import { inngestMatcher } from './inngest.js';
import { nextjsMatcher } from './nextjs.js';
import { triggerDevMatcher } from './trigger-dev.js';
import type { FrameworkMatcher } from './types.js';

export const matchers: FrameworkMatcher[] = [nextjsMatcher, inngestMatcher, triggerDevMatcher];

export type {
  EntryPointMatch,
  FrameworkMatcher,
  ResolvedConnection,
  RuntimeConnection,
} from './types.js';
