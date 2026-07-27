import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import fs from "node:fs";

// Single shared SQLite connection (file-backed) for the whole app.
// Uses Node's built-in `node:sqlite` module — no native build step required.

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "store.db");

declare global {
  // eslint-disable-next-line no-var
  var __medistoreDb__: DatabaseSync | undefined;
}

function toPlainObject<T>(row: T): T {
  if (row === null || typeof row !== "object") return row;
  return { ...(row as object) } as T;
}

function wrapDatabase(database: DatabaseSync): DatabaseSync {
  const rawPrepare = database.prepare.bind(database);
  database.prepare = (sql: string) => {
    const stmt = rawPrepare(sql);
    const rawGet = stmt.get.bind(stmt);
    const rawAll = stmt.all.bind(stmt);
    stmt.get = (...params: unknown[]) => toPlainObject(rawGet(...params));
    stmt.all = (...params: unknown[]) =>
      (rawAll(...params) as unknown[]).map(toPlainObject);
    return stmt;
  };
  return database;
}

function createConnection(): DatabaseSync {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  const database = new DatabaseSync(DB_PATH);
  database.exec("PRAGMA journal_mode = WAL;");
  database.exec("PRAGMA foreign_keys = ON;");
  return wrapDatabase(database);
}

export const db: DatabaseSync = globalThis.__medistoreDb__ ?? createConnection();

if (process.env.NODE_ENV !== "production") {
  globalThis.__medistoreDb__ = db;
}

export function genId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 9)}`;
}
