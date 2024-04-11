import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import dotenv from "dotenv";
dotenv.config();

const testDbConfig: TypeOrmModuleOptions = {
  type: (process.env.TYPE as any) ?? "postgres",
  host: process.env.TEST_DB_HOST,
  port: 5432,
  username: process.env.TEST_DB_USERNAME,
  password: process.env.TEST_DB_PASSWORD,
  database: process.env.TEST_DB_NAME.toLowerCase(),
  entities: ["./**/*.entity.ts"],
  synchronize: true,
};

export default testDbConfig;
