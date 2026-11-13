import { openDb } from './store.js';

/** Local single-project daily cap, persisted across review-server restarts. */
export function createVoiceBudget(name, dailySeconds = 1800) {
  const limit = Number(dailySeconds);
  if (!Number.isFinite(limit) || limit < 0) throw new Error('Voice daily seconds must be a non-negative number.');
  const db = openDb(name);
  db.exec('CREATE TABLE IF NOT EXISTS voice_usage (day TEXT PRIMARY KEY, seconds INTEGER NOT NULL)');
  return {
    reserve(seconds) {
      const day = new Date().toISOString().slice(0, 10);
      db.exec('BEGIN IMMEDIATE');
      try {
        const used = db.prepare('SELECT seconds FROM voice_usage WHERE day = ?').get(day)?.seconds || 0;
        if (used + seconds > limit) { db.exec('ROLLBACK'); return false; }
        db.prepare('INSERT INTO voice_usage(day,seconds) VALUES (?,?) ON CONFLICT(day) DO UPDATE SET seconds=excluded.seconds').run(day, used + seconds);
        db.exec('COMMIT'); return true;
      } catch (error) { db.exec('ROLLBACK'); throw error; }
    },
  };
}
