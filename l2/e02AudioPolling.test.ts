/// <mls fileReference="_102025_/l2/e02AudioPolling.test.ts" enhancement="_blank" />

import test from 'node:test';
import assert from 'node:assert/strict';
import { E02AudioPollingSession, type E02AudioPollScheduler } from './e02AudioPolling.js';

class ControlledScheduler implements E02AudioPollScheduler {
  private nextId = 1;
  readonly pending = new Map<number, () => void>();

  schedule(callback: () => void): unknown {
    const id = this.nextId++;
    this.pending.set(id, callback);
    return id;
  }

  cancel(token: unknown): void { this.pending.delete(token as number); }

  async runNext(): Promise<boolean> {
    const entry = this.pending.entries().next().value as [number, () => void] | undefined;
    if (!entry) return false;
    this.pending.delete(entry[0]);
    entry[1]();
    await Promise.resolve();
    await Promise.resolve();
    return true;
  }
}

void test('active responses consume one fixed budget and never issue a 21st poll', async () => {
  const scheduler = new ControlledScheduler();
  let calls = 0;
  const session = new E02AudioPollingSession(20, 2_000, async () => { calls++; session.start(); return true; }, scheduler);

  session.start();
  while (await scheduler.runNext()) { /* drain the controlled timer queue */ }

  assert.equal(calls, 20);
  assert.equal(session.pollsRemaining, 0);
  assert.equal(session.active, false);
  assert.equal(scheduler.pending.size, 0);
});

void test('session identity change cancels the pending timer before another query', async () => {
  const scheduler = new ControlledScheduler();
  let calls = 0;
  const session = new E02AudioPollingSession(20, 2_000, async () => { calls++; return true; }, scheduler);

  session.start();
  session.stop();

  assert.equal(await scheduler.runNext(), false);
  assert.equal(calls, 0);
  assert.equal(scheduler.pending.size, 0);
});

void test('component disconnect semantics cancel a chain already between ticks', async () => {
  const scheduler = new ControlledScheduler();
  let calls = 0;
  const session = new E02AudioPollingSession(20, 2_000, async () => { calls++; return true; }, scheduler);

  session.start();
  assert.equal(await scheduler.runNext(), true);
  assert.equal(calls, 1);
  assert.equal(scheduler.pending.size, 1);

  session.stop();

  assert.equal(await scheduler.runNext(), false);
  assert.equal(calls, 1);
  assert.equal(scheduler.pending.size, 0);
});
