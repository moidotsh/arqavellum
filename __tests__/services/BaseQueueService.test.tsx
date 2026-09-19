// __tests__/services/BaseQueueService.test.tsx
//
// Pure service tests for the abstract queue base — NO React. A tiny
// concrete subclass supplies the storageKey + logContext stubs.
//   - addToQueue adds to the in-memory queue and persists through
//     zustandStorage (which reads/writes window.localStorage on web)
//   - ready() resolves after the initial load; stored items surface then
//   - loadQueue is merge-aware: items added during the load window survive
//     and in-memory items win id collisions
//   - subscribe/notify fires listeners; the unsubscribe stops them
//   - removeFromQueue / updateItem / reset maintain both queue + persistence

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BaseQueueService } from '../../services/base/BaseQueueService';
import type { LogContext } from '../../utils/logger';

interface Item {
  id: string;
  label?: string;
}

const KEY = 'test-queue';

// The base defers its initial load by one microtask (so subclass FIELD
// initializers — `storageKey = '...'` — exist before the read) and
// chains pre-load persists behind the load (so an early enqueue can't
// clobber the previous session's blob before it merges). The getter
// below would also work as a plain field initializer — both subclass
// shapes load from the real key.
class TestQueueService extends BaseQueueService<Item> {
  protected get storageKey(): string {
    return KEY;
  }
  protected logContext: LogContext = 'offlineQueue';
}

function readStored(): Item[] {
  const raw = window.localStorage.getItem(KEY);
  return raw ? (JSON.parse(raw) as Item[]) : [];
}

describe('BaseQueueService — enqueue + persistence', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('addToQueue adds the item and persists it via zustandStorage (localStorage)', async () => {
    const svc = new TestQueueService();
    await svc.ready();

    svc.addToQueue({ id: 'a', label: 'Alpha' });

    expect(svc.getAll()).toHaveLength(1);
    expect(svc.getById('a')?.label).toBe('Alpha');
    expect(svc.hasItem('a')).toBe(true);

    // persistQueue is fire-and-forget async — wait for it to land.
    await vi.waitFor(() => {
      expect(readStored().map((i) => i.id)).toEqual(['a']);
    });
  });

  it('ready() resolves after the initial load — seeded storage surfaces then', async () => {
    window.localStorage.setItem(KEY, JSON.stringify([{ id: 'seed-1' }, { id: 'seed-2' }]));

    const svc = new TestQueueService();
    // The constructor kicks off an async load — before it settles the
    // in-memory queue is still empty.
    expect(svc.getAll()).toEqual([]);

    await expect(svc.ready()).resolves.toBeUndefined();
    expect(svc.getAll().map((i) => i.id)).toEqual(['seed-1', 'seed-2']);
  });

  it('loadQueue is merge-aware: items added during the load window survive and win collisions', async () => {
    window.localStorage.setItem(
      KEY,
      JSON.stringify([
        { id: 'disk', label: 'from disk' },
        { id: 'dupe', label: 'from disk' },
      ]),
    );

    const svc = new TestQueueService();
    // Added synchronously after construction — the constructor's async
    // load is still awaiting its microtask, so this lands mid-window.
    svc.addToQueue({ id: 'dupe', label: 'in memory' });
    await svc.ready();

    const all = svc.getAll();
    expect(all).toHaveLength(2);
    // In-memory item wins the id collision; stored non-duplicates append.
    expect(svc.getById('dupe')?.label).toBe('in memory');
    expect(svc.getById('disk')?.label).toBe('from disk');
  });
});

describe('BaseQueueService — subscribe / notify', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('notifies subscribers on queue changes and stops after unsubscribe', async () => {
    const svc = new TestQueueService();
    await svc.ready();

    const listener = vi.fn();
    const unsubscribe = svc.subscribe(listener);

    svc.addToQueue({ id: 'a' });
    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();
    svc.addToQueue({ id: 'b' });
    expect(listener).toHaveBeenCalledTimes(1);
  });
});

describe('BaseQueueService — mutations', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('removeFromQueue drops the item, persists the remainder, and reports misses', async () => {
    const svc = new TestQueueService();
    await svc.ready();
    svc.addToQueue({ id: 'a' });
    svc.addToQueue({ id: 'b' });

    expect(svc.removeFromQueue('a')).toBe(true);
    expect(svc.removeFromQueue('missing')).toBe(false);
    expect(svc.getAll().map((i) => i.id)).toEqual(['b']);

    await vi.waitFor(() => {
      expect(readStored().map((i) => i.id)).toEqual(['b']);
    });
  });

  it('updateItem merges partial updates in place and reports misses', async () => {
    const svc = new TestQueueService();
    await svc.ready();
    svc.addToQueue({ id: 'a', label: 'before' });

    expect(svc.updateItem('a', { label: 'after' })).toBe(true);
    expect(svc.getById('a')).toEqual({ id: 'a', label: 'after' });
    expect(svc.updateItem('missing', { label: 'x' })).toBe(false);

    await vi.waitFor(() => {
      expect(readStored()[0].label).toBe('after');
    });
  });

  it('reset wipes the queue and persists the empty array', async () => {
    const svc = new TestQueueService();
    await svc.ready();
    svc.addToQueue({ id: 'a' });

    svc.reset();
    expect(svc.getAll()).toEqual([]);

    await vi.waitFor(() => {
      expect(window.localStorage.getItem(KEY)).toBe('[]');
    });
  });
});
