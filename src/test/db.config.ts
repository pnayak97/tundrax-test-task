import { TypeOrmModuleOptions } from "@nestjs/typeorm";

const testDbConfig: TypeOrmModuleOptions = {
  type: "postgres",
  host: "localhost",
  port: 54320,
  username: "test_user",
  password: "test_password",
  database: "test_database",
  entities: ["./**/*.entity.ts"],
  synchronize: true,
};

export default testDbConfig;
