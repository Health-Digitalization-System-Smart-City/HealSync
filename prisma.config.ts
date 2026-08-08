// Prisma 7 configuration (replaces package.json#prisma and the
// datasource `url` inside schema.prisma).
//
// Docs: https://www.prisma.io/docs/orm/reference/prisma-config-reference
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
