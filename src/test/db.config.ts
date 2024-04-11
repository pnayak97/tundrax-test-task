import { TypeOrmModuleOptions } from "@nestjs/typeorm";

const testDbConfig: TypeOrmModuleOptions = {
  type: "postgres",
  host: "localhost",
  port: 5434,
  username: "user",
  password: "password",
  database: "tundrax_test_db",
  entities: ["./**/*.entity.ts"],
  synchronize: true,
};

export default testDbConfig;
