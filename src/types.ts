/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type EntityType = 'drug' | 'herb' | 'trial' | 'researcher';

export interface BaseEntity {
  id: string;
  name: string;
  type: EntityType;
  evidenceGrade: 'High' | 'Moderate' | 'Low';
  credibilityScore: number;
  lastSeen: string;
  evidenceCount: number;
  details: string; // Dynamic description, latin name, or mechanism
}

export interface DrugEntity extends BaseEntity {
  type: 'drug';
  mechanism?: string;
  aliases?: string[];
}

export interface HerbEntity extends BaseEntity {
  type: 'herb';
  latinName?: string;
  traditionalUse?: string;
}

export interface TrialEntity extends BaseEntity {
  type: 'trial';
  nctId?: string;
  status: string;
  condition: string;
}

export interface ResearcherEntity extends BaseEntity {
  type: 'researcher';
  affiliation?: string;
}

export type LymeEntity = DrugEntity | HerbEntity | TrialEntity | ResearcherEntity;

export interface DailyDigest {
  date: string; // YYYY-MM-DD
  conventionalMarkdown: string;
  holisticMarkdown: string;
  trialsMarkdown: string;
  watchlistMarkdown: string;
  deltasMarkdown: string;
  htmlBody: string;
  summary: string;
  runManifest: RunManifest;
}

export interface DiscoveredLimits {
  rpm: number;
  tpm: number;
  rpdRemainingBefore: number;
  rpdRemainingAfter: number;
}

export interface RunManifest {
  billingTier: string;
  modelUsed: string;
  budgetTier: 'rich' | 'lean' | 'strict';
  callsPlanned: number;
  callsActual: number;
  discoveredLimits: DiscoveredLimits;
  tierStatus: 'ok' | 'near_limit' | 'depleted';
  fallbacksTriggered: number;
  timestamp: string;
}

export interface SystemStatus {
  targetEmail: string;
  discoveredRPM: number;
  discoveredTPM: number;
  discoveredRPDRemaining: number;
  budgetTier: 'rich' | 'lean' | 'strict';
  lastRunDate: string | null;
  rateLimitStatus: string;
  runLogs: string[];
}

export interface ResearchQuery {
  id: string;
  timestamp: string;
  query: string;
  category: 'conventional' | 'holistic' | 'trials';
  response: string;
  sources: Array<{ uri: string; title: string }>;
}
