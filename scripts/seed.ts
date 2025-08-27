#!/usr/bin/env tsx

import { runMigrations } from "../src/db/migrate";
import { insertApp } from "../src/db/queries";
import { mockApps } from "../src/lib/mock-data";

async function seed() {
  console.log("Running database migrations...");
  runMigrations();

  console.log("Seeding database with mock data...");

  for (const app of mockApps) {
    try {
      await insertApp(app);
    } catch (error) {
      // Skip duplicates
      if (!String(error).includes("UNIQUE constraint failed")) {
        console.error(`Failed to insert app ${app.id}:`, error);
      }
    }
  }

  console.log(`Database seeded with ${mockApps.length} apps`);
}

seed().catch(console.error);
