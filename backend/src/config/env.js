require("dotenv").config();

function required(name, fallback) {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT || "5000", 10),
  jwtSecret: required("JWT_SECRET"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173",
  db: {
    host: required("DB_HOST", "127.0.0.1"),
    port: parseInt(process.env.DB_PORT || "3306", 10),
    name: required("DB_NAME"),
    user: required("DB_USER"),
    password: process.env.DB_PASSWORD ?? "",
  },
};

module.exports = env;
