import "dotenv/config";
import { db } from "../src/lib/db";

(async function main() {
  try {
    const rows = await db.feedback.findMany({
      where: { deletedAt: null },
      take: 1,
    });
    console.log("ok", rows.length);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("error", message);
    console.error(error);
    process.exit(1);
  }
})();
