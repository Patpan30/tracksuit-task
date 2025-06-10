import { log } from "./deps.ts";

// setup logger
await log.setup({
  handlers: {
    console: new log.ConsoleHandler("DEBUG", {
      formatter: (rec) =>
        ` ${rec.datetime.toISOString()} ${rec.levelName} ${rec.msg}`,
    }),
    file: new log.RotatingFileHandler("INFO", {
      filename: "./logs/app.log",
      maxBytes: 10 * 1024 * 1024, // 10 MB
      maxBackupCount: 5,
      formatter: ({ levelName, datetime, msg }) =>
        `${datetime.toISOString()} [${levelName}] ${msg}`,
    }),
  },

  loggers: {
    default: {
      level: "INFO",
      handlers: ["console", "file"],
    },
  },
});
