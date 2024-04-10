import dotenv from "dotenv";
dotenv.config();

export const config = () => ({
  keys: {
    jwtServerSecret: process.env.JWT_SERVER_SECRET,
  },
  Constants: {
    lifetime: process.env.TOKEN_LIFETIME_IN_SECONDS,
  },
  db: {
    type: (process.env.TYPE as any) ?? "postgres",
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10) ?? 5432,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME.toLowerCase(),
  },
});

export { config as default };
