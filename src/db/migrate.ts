import { sqliteDb } from "./client";
import fs from "fs";
import path from "path";

interface Migration {
  id: number;
  name: string;
  sql: string;
}

export function runMigrations() {
  // Ensure data directory exists
  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Create migrations tracking table
  sqliteDb.exec(`
    CREATE TABLE IF NOT EXISTS migrations (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      executed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Get executed migrations
  const executedMigrations = sqliteDb
    .prepare("SELECT id FROM migrations ORDER BY id")
    .all() as { id: number }[];

  const executedIds = new Set(executedMigrations.map((m) => m.id));

  // Load migration files
  const migrationsDir = path.join(__dirname, "migrations");
  const migrationFiles = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith(".sql"))
    .sort();

  const migrations: Migration[] = migrationFiles.map((file) => {
    const id = parseInt(file.split("_")[0]);
    const name = file.replace(".sql", "");
    const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");
    return { id, name, sql };
  });

  // Run pending migrations
  let executed = 0;
  const transaction = sqliteDb.transaction(() => {
    for (const migration of migrations) {
      if (!executedIds.has(migration.id)) {
        console.log(`Running migration: ${migration.name}`);
        sqliteDb.exec(migration.sql);

        // Record migration as executed
        sqliteDb
          .prepare("INSERT INTO migrations (id, name) VALUES (?, ?)")
          .run(migration.id, migration.name);

        executed++;
      }
    }
  });

  transaction();
  console.log(`Migrations complete. ${executed} migrations executed.`);
}
