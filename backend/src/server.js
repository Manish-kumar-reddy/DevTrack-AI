const app = require("./app");
const env = require("./config/env");
const { sequelize } = require("./models");

async function start() {
  try {
    await sequelize.authenticate();
    console.log("Database connection established.");

    await sequelize.sync();
    console.log("Database models synchronized.");

    app.listen(env.port, () => {
      console.log(`DevTrack AI backend listening on port ${env.port} (${env.nodeEnv})`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

start();
