import { DatabaseSync } from 'node:sqlite';
import path from 'path';

// Node's built-in SQLite (Node 22.13+): nothing to compile, so it installs anywhere Node runs.
const dbPath = path.join(process.cwd(), 'calendar.db');
const db = new DatabaseSync(dbPath);

// Initialize the database
db.exec(`
  CREATE TABLE IF NOT EXISTS drawings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    period_start_date TEXT NOT NULL,
    url_hash TEXT NOT NULL,
    data_json TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(period_start_date, url_hash)
  )
`);

export interface Drawing {
  id: number;
  period_start_date: string;
  url_hash: string;
  data_json: string;
  created_at: string;
}

export function getDrawing(periodStartDate: string, urlHash: string): Drawing | undefined {
  const stmt = db.prepare('SELECT * FROM drawings WHERE period_start_date = ? AND url_hash = ?');
  return stmt.get(periodStartDate, urlHash) as unknown as Drawing | undefined;
}

export function saveDrawing(periodStartDate: string, urlHash: string, dataJson: string): void {
  const stmt = db.prepare(`
    INSERT INTO drawings (period_start_date, url_hash, data_json)
    VALUES (?, ?, ?)
    ON CONFLICT(period_start_date, url_hash) DO UPDATE SET
      data_json = excluded.data_json,
      created_at = CURRENT_TIMESTAMP
  `);
  stmt.run(periodStartDate, urlHash, dataJson);
}

export default db;
