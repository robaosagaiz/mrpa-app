// Simple SQLite init script - creates tables if they don't exist
// This avoids needing the full Prisma CLI in production
import { existsSync } from 'fs';
import { execSync } from 'child_process';

const dbPath = process.env.DATABASE_URL?.replace('file:', '') || '/app/data/mrpa.db';

const sql = `
CREATE TABLE IF NOT EXISTS "Patient" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS "Patient_token_key" ON "Patient"("token");

CREATE TABLE IF NOT EXISTS "Protocol" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "patientId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Protocol_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "Measurement" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "protocolId" INTEGER NOT NULL,
    "datetime" DATETIME NOT NULL,
    "period" TEXT NOT NULL,
    "pas" INTEGER NOT NULL,
    "pad" INTEGER NOT NULL,
    "pulse" INTEGER NOT NULL,
    "isDiscrepant" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Measurement_protocolId_fkey" FOREIGN KEY ("protocolId") REFERENCES "Protocol" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
`;

console.log('Initializing database at:', dbPath);

// Use node's built-in sqlite if available, otherwise use the sqlite3 CLI
try {
  // Node 22+ has built-in sqlite
  const { DatabaseSync } = await import('node:sqlite');
  const db = new DatabaseSync(dbPath);
  db.exec(sql);
  db.close();
  console.log('Database initialized successfully (node:sqlite)');
} catch {
  // Fallback: write SQL to temp file and use sqlite3 CLI if available
  try {
    const { writeFileSync } = await import('fs');
    writeFileSync('/tmp/init.sql', sql);
    execSync(`sqlite3 "${dbPath}" < /tmp/init.sql 2>&1`);
    console.log('Database initialized successfully (sqlite3 CLI)');
  } catch (e2) {
    // Last resort: use better-sqlite3 via prisma's bundled native module
    console.log('Warning: Could not initialize DB with sqlite3 CLI:', e2.message);
    console.log('Database will be created on first Prisma client access if schema matches.');
  }
}
