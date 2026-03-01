import "dotenv/config";
import { setDefaultResultOrder } from "dns";

// Fix Windows terminal encoding
if (process.platform === "win32") {
  process.stdout.setEncoding("utf8");
  process.stderr.setEncoding("utf8");
}

import { NameStore } from "./store/NameStore.js";
import { Generator } from "./generation/Generator.js";
import { logger } from "./core/Logger.js";
import { THEMES } from "../config/themes.js";

const args = process.argv.slice(2);

const store = new NameStore();
store.load();

if (args.includes("--stats")) {
  const counts = store.countByTheme();
  logger.info(`Total names: ${store.size()}`);
  for (const theme of THEMES) {
    const count = counts[theme.name] ?? 0;
    logger.info(`  ${theme.name}: ${count}/${theme.target}`);
  }
  process.exit(0);
}

const generator = new Generator();

const shutdown = () => {
  logger.info("Shutting down, saving...");
  generator.stop();
  store.save();
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

generator.run(store).catch(err => {
  logger.error(err);
  store.save();
  process.exit(1);
});
