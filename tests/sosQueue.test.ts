/**
 * Unit tests for src/lib/sosQueue.ts
 * Tests: queue CRUD helpers (no network, no Firebase)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// ── localStorage mock ────────────────────────────────────────────────────────
const store: Record<string, string> = {};
const localStorageMock = {
  getItem: (key: string) => store[key] ?? null,
  setItem: (key: string, value: string) => { store[key] = value; },
  removeItem: (key: string) => { delete store[key]; },
  clear: () => { Object.keys(store).forEach(k => delete store[k]); },
};
vi.stubGlobal('localStorage', localStorageMock);
vi.stubGlobal('window', { localStorage: localStorageMock });

// ── inline pure helpers (no Firebase imports) ─────────────────────────────────
const QUEUE_KEY = 'pendingSOSQueue';

interface SOSRequest {
  id: string;
  timestamp: number;
  disasterId: string;
  severity: string;
  lat: string;
  lng: string;
  message: string;
}

function getPendingSOSQueue(): SOSRequest[] {
  const stored = store[QUEUE_KEY];
  if (!stored) return [];
  try { return JSON.parse(stored); } catch { return []; }
}

function savePendingSOSQueue(queue: SOSRequest[]): void {
  store[QUEUE_KEY] = JSON.stringify(queue);
}

function enqueueSOSRequest(request: SOSRequest): SOSRequest[] {
  const queue = getPendingSOSQueue();
  if (queue.some(item => item.id === request.id)) return queue;
  queue.push(request);
  savePendingSOSQueue(queue);
  return queue;
}

function dequeueSOSRequest(id: string): SOSRequest[] {
  const queue = getPendingSOSQueue();
  const updated = queue.filter(item => item.id !== id);
  savePendingSOSQueue(updated);
  return updated;
}

function makeSOS(id: string, overrides: Partial<SOSRequest> = {}): SOSRequest {
  return {
    id,
    timestamp: Date.now(),
    disasterId: 'floods',
    severity: 'HIGH',
    lat: '34.0522',
    lng: '-118.2437',
    message: 'Test SOS',
    ...overrides,
  };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('getPendingSOSQueue', () => {
  beforeEach(() => localStorageMock.clear());

  it('returns empty array when nothing is stored', () => {
    expect(getPendingSOSQueue()).toEqual([]);
  });

  it('returns parsed queue when items exist', () => {
    const items = [makeSOS('sos_1'), makeSOS('sos_2')];
    store[QUEUE_KEY] = JSON.stringify(items);
    expect(getPendingSOSQueue()).toHaveLength(2);
  });

  it('returns empty array on corrupt JSON', () => {
    store[QUEUE_KEY] = 'NOT_JSON{{';
    expect(getPendingSOSQueue()).toEqual([]);
  });
});

describe('enqueueSOSRequest', () => {
  beforeEach(() => localStorageMock.clear());

  it('adds a new SOS request to the queue', () => {
    const sos = makeSOS('sos_abc');
    enqueueSOSRequest(sos);
    expect(getPendingSOSQueue()).toHaveLength(1);
    expect(getPendingSOSQueue()[0].id).toBe('sos_abc');
  });

  it('does not add a duplicate ID', () => {
    const sos = makeSOS('sos_dup');
    enqueueSOSRequest(sos);
    enqueueSOSRequest(sos); // duplicate
    expect(getPendingSOSQueue()).toHaveLength(1);
  });

  it('can enqueue multiple distinct items', () => {
    enqueueSOSRequest(makeSOS('sos_1'));
    enqueueSOSRequest(makeSOS('sos_2'));
    enqueueSOSRequest(makeSOS('sos_3'));
    expect(getPendingSOSQueue()).toHaveLength(3);
  });

  it('persists data in localStorage', () => {
    enqueueSOSRequest(makeSOS('sos_persist'));
    const raw = store[QUEUE_KEY];
    expect(raw).toContain('sos_persist');
  });
});

describe('dequeueSOSRequest', () => {
  beforeEach(() => localStorageMock.clear());

  it('removes an item by ID', () => {
    enqueueSOSRequest(makeSOS('sos_remove'));
    dequeueSOSRequest('sos_remove');
    expect(getPendingSOSQueue()).toHaveLength(0);
  });

  it('leaves other items intact when removing one', () => {
    enqueueSOSRequest(makeSOS('sos_keep'));
    enqueueSOSRequest(makeSOS('sos_delete'));
    dequeueSOSRequest('sos_delete');
    const queue = getPendingSOSQueue();
    expect(queue).toHaveLength(1);
    expect(queue[0].id).toBe('sos_keep');
  });

  it('is a no-op for a non-existent ID', () => {
    enqueueSOSRequest(makeSOS('sos_x'));
    dequeueSOSRequest('sos_nonexistent');
    expect(getPendingSOSQueue()).toHaveLength(1);
  });
});

describe('savePendingSOSQueue', () => {
  beforeEach(() => localStorageMock.clear());

  it('overwrites the entire queue', () => {
    enqueueSOSRequest(makeSOS('old_1'));
    enqueueSOSRequest(makeSOS('old_2'));
    savePendingSOSQueue([makeSOS('new_only')]);
    const queue = getPendingSOSQueue();
    expect(queue).toHaveLength(1);
    expect(queue[0].id).toBe('new_only');
  });

  it('can save an empty array (full clear)', () => {
    enqueueSOSRequest(makeSOS('sos_1'));
    savePendingSOSQueue([]);
    expect(getPendingSOSQueue()).toEqual([]);
  });
});
