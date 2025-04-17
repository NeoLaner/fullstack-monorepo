import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../../src/server/db/schema";

const conn = postgres("postgresql://postgres:001@localhost:8085");
export const db = drizzle(conn, { schema, casing: "snake_case" });
