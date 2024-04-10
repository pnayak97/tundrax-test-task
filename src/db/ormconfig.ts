import { DataSourceOptions, DataSource } from "typeorm";
import config from "src/configuration";

const {
  db: { type, username, host, port, password, database },
} = config();

export const dataSourceOptions: DataSourceOptions = {
  type,
  host,
  port,
  username,
  password,
  database,
  synchronize: true,
  bigNumberStrings: true,
  multipleStatements: true,
  logging: true,
  entities: ["**/*.entity{ .ts,.js}"],
  migrations: ["src/migrations/*{.ts,.js}"],
  migrationsRun: true,
};

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;
