import Database from "better-sqlite3";
import { Kysely, SqliteDialect } from "kysely";
import path from "path";

export interface AppSubmissionTable {
  id: string;
  name: string;
  description: string;
  status: string;
  submitted_at: string;
  updated_at: string;
  developer_id: string;
  developer_name: string;
  developer_email: string;
  category: string;
  version: string;
  downloads: number;
  rating: number;
  file_size: number;
}

export interface DatabaseSchema {
  app_submissions: AppSubmissionTable;
}

const dbPath = path.join(process.cwd(), "data", "appstore.db");
const sqliteDb = new Database(dbPath);

sqliteDb.pragma("journal_mode = WAL");
sqliteDb.pragma("synchronous = NORMAL");
sqliteDb.pragma("cache_size = 1000");
sqliteDb.pragma("temp_store = memory");

export const db = new Kysely<DatabaseSchema>({
  dialect: new SqliteDialect({
    database: sqliteDb,
  }),
});

process.on("exit", () => {
  sqliteDb.close();
});

process.on("SIGINT", () => {
  sqliteDb.close();
  process.exit(0);
});

export { sqliteDb };
