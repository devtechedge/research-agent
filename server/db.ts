/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from 'fs';
import path from 'path';
import { LymeEntity, DailyDigest, SystemStatus, ResearchQuery } from '../src/types';

const DB_FILE = path.join(process.cwd(), 'lyme_database.json');

interface DatabaseSchema {
  entities: LymeEntity[];
  digests: DailyDigest[];
  queries: ResearchQuery[];
  settings: {
    targetEmail: string;
    discoveredRPM: number;
    discoveredTPM: number;
    discoveredRPDRemaining: number;
    budgetTier: 'rich' | 'lean' | 'strict';
    lastRunDate: string | null;
  };
  logs: string[];
}

const DEFAULT_DB: DatabaseSchema = {
  entities: [
    // Pre-populate with some foundational entities to show in the UI immediately
    {
      id: 'd1',
      name: 'Disulfiram',
      type: 'drug',
      evidenceGrade: 'Moderate',
      credibilityScore: 82,
      lastSeen: '2026-07-15',
      evidenceCount: 4,
      details: 'Repurposed alcohol-abuse drug; found to inhibit Borrelia burgdorferi in vitro and shown clinical promise in persistent Lyme symptoms.',
      mechanism: 'Inhibition of essential bacterial enzymes and cell division; potential heavy metal chelator.'
    },
    {
      id: 'd2',
      name: 'Doxycycline',
      type: 'drug',
      evidenceGrade: 'High',
      credibilityScore: 98,
      lastSeen: '2026-07-18',
      evidenceCount: 42,
      details: 'Standard first-line tetracycline antibiotic for acute Lyme disease. Also researched in combination protocols for chronic symptoms.',
      mechanism: 'Binds to the 30S ribosomal subunit, inhibiting bacterial protein synthesis.'
    },
    {
      id: 'h1',
      name: 'Japanese Knotweed',
      type: 'herb',
      evidenceGrade: 'Moderate',
      credibilityScore: 78,
      lastSeen: '2026-07-17',
      evidenceCount: 12,
      details: 'Rich in resveratrol; foundational herb in the Buhner Protocol. Exhibited active anti-Borrelia effects in preclinical trials.',
      latinName: 'Polygonum cuspidatum',
      traditionalUse: 'Antioxidant, anti-inflammatory, and microcirculation enhancer; protects vascular endothelium.'
    },
    {
      id: 'h2',
      name: 'Cat\'s Claw',
      type: 'herb',
      evidenceGrade: 'Moderate',
      credibilityScore: 75,
      lastSeen: '2026-07-16',
      evidenceCount: 9,
      details: 'Immune modulator; standard inclusion in Zhang and Cowden protocols for persistent Lyme disease.',
      latinName: 'Uncaria tomentosa',
      traditionalUse: 'Immune stimulant, anti-inflammatory, and joint protector.'
    },
    {
      id: 't1',
      name: 'NCT05934522 (Tetracycline Combination)',
      type: 'trial',
      evidenceGrade: 'High',
      credibilityScore: 92,
      lastSeen: '2026-07-10',
      evidenceCount: 3,
      details: 'Phase 2 randomized trial investigating combination antibiotic therapy (Doxycycline + Rifampin) in persistent Lyme symptoms.',
      nctId: 'NCT05934522',
      status: 'Recruiting',
      condition: 'Post-Treatment Lyme Disease Syndrome (PTLDS)'
    },
    {
      id: 'r1',
      name: 'Dr. Richard Horowitz',
      type: 'researcher',
      evidenceGrade: 'High',
      credibilityScore: 90,
      lastSeen: '2026-07-14',
      evidenceCount: 15,
      details: 'Infectious disease specialist and author of the MSIDS (Multiple System Infectious Disease Syndrome) questionnaire. Active in clinical combination studies.',
      affiliation: 'Hudson Valley Healing Arts Center'
    }
  ],
  digests: [],
  queries: [],
  settings: {
    targetEmail: 'devayanmandal@gmail.com', // Updated target email as requested!
    discoveredRPM: 5,
    discoveredTPM: 250000,
    discoveredRPDRemaining: 20,
    budgetTier: 'strict',
    lastRunDate: null
  },
  logs: [
    'System initialized with standard entity catalog.',
    'Target email verified and configured to: devayanmandal@gmail.com.'
  ]
};

// Ensure database file exists
export function initDB(): DatabaseSchema {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(DEFAULT_DB, null, 2), 'utf-8');
      return DEFAULT_DB;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const db = JSON.parse(raw) as DatabaseSchema;
    
    // Ensure targetEmail is set to devayanmandal@gmail.com as explicitly requested!
    if (db.settings.targetEmail !== 'devayanmandal@gmail.com') {
      db.settings.targetEmail = 'devayanmandal@gmail.com';
      fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
    }
    return db;
  } catch (error) {
    console.error('Error initializing database file, returning default schema:', error);
    return DEFAULT_DB;
  }
}

export function readDB(): DatabaseSchema {
  return initDB();
}

export function writeDB(db: DatabaseSchema): void {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to write database file:', error);
  }
}

export function getStatus(): SystemStatus {
  const db = readDB();
  return {
    targetEmail: db.settings.targetEmail,
    discoveredRPM: db.settings.discoveredRPM,
    discoveredTPM: db.settings.discoveredTPM,
    discoveredRPDRemaining: db.settings.discoveredRPDRemaining,
    budgetTier: db.settings.budgetTier,
    lastRunDate: db.settings.lastRunDate,
    rateLimitStatus: `${db.settings.discoveredRPDRemaining} RPD remaining (Discovered: ${db.settings.discoveredRPM} RPM / ${db.settings.discoveredTPM} TPM)`,
    runLogs: db.logs.slice(-100) // last 100 logs
  };
}

export function updateSettings(targetEmail: string): SystemStatus {
  const db = readDB();
  db.settings.targetEmail = targetEmail;
  db.logs.push(`[${new Date().toISOString()}] Target email updated to ${targetEmail}`);
  writeDB(db);
  return getStatus();
}

export function addLog(message: string): void {
  const db = readDB();
  db.logs.push(`[${new Date().toISOString()}] ${message}`);
  writeDB(db);
}

export function getEntities(): LymeEntity[] {
  return readDB().entities;
}

export function upsertEntity(entity: Omit<LymeEntity, 'id' | 'evidenceCount' | 'lastSeen'>): LymeEntity {
  const db = readDB();
  const existing = db.entities.find(e => e.name.toLowerCase() === entity.name.toLowerCase());
  const nowStr = new Date().toISOString().split('T')[0];
  
  if (existing) {
    existing.evidenceCount += 1;
    existing.lastSeen = nowStr;
    existing.details = entity.details || existing.details;
    existing.credibilityScore = entity.credibilityScore || existing.credibilityScore;
    existing.evidenceGrade = entity.evidenceGrade || existing.evidenceGrade;
    if (existing.type === 'drug' && entity.type === 'drug') {
      existing.mechanism = (entity as any).mechanism || existing.mechanism;
    } else if (existing.type === 'herb' && entity.type === 'herb') {
      existing.latinName = (entity as any).latinName || existing.latinName;
      existing.traditionalUse = (entity as any).traditionalUse || existing.traditionalUse;
    } else if (existing.type === 'trial' && entity.type === 'trial') {
      existing.status = (entity as any).status || existing.status;
    } else if (existing.type === 'researcher' && entity.type === 'researcher') {
      existing.affiliation = (entity as any).affiliation || existing.affiliation;
    }
    writeDB(db);
    return existing;
  } else {
    const newEntity: LymeEntity = {
      ...entity,
      id: 'ent_' + Math.random().toString(36).substr(2, 9),
      evidenceCount: 1,
      lastSeen: nowStr
    } as LymeEntity;
    db.entities.push(newEntity);
    writeDB(db);
    return newEntity;
  }
}

export function addDigest(digest: DailyDigest): void {
  const db = readDB();
  db.digests.unshift(digest); // Add new digests to the front
  db.settings.lastRunDate = digest.date;
  db.settings.discoveredRPDRemaining = digest.runManifest.discoveredLimits.rpdRemainingAfter;
  db.settings.budgetTier = digest.runManifest.budgetTier;
  db.logs.push(`[${new Date().toISOString()}] Daily research run completed and digest compiled.`);
  writeDB(db);
}

export function getDigests(): DailyDigest[] {
  return readDB().digests;
}

export function saveQuery(query: ResearchQuery): void {
  const db = readDB();
  db.queries.unshift(query);
  writeDB(db);
}

export function getQueries(): ResearchQuery[] {
  return readDB().queries;
}
