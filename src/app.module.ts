import { Module } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { APP_FILTER } from "@nestjs/core";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CatsModule } from "./cats/cats.module";
import { CoreModule } from "./core/core.module";
import { dataSourceOptions } from "./db/ormconfig";
import { AuthModule } from "./auth/auth.module";
import { User } from "./entities/User.entity";
import { Cat } from "./entities/Cat.entity";
import { UserModule } from "./users/users.module";
import { UserService } from "./users/users.service";
import { CatsService } from "./cats/cats.service";
import { AuthService } from "./auth/auth.service";
import { CustomExceptionFilter } from "./common/filters/custom-exception.filter";
import config from "./configuration";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: "../.env",
      ignoreEnvFile: false,
      load: [config],
    }),
    TypeOrmModule.forRoot(dataSourceOptions),
    TypeOrmModule.forFeature([User, Cat]),
    CoreModule,
    CatsModule,
    UserModule,
    AuthModule,
  ],
  providers: [
    UserService,
    CatsService,
    Repository,
    AuthService,
    JwtService,
    {
      provide: APP_FILTER,
      useClass: CustomExceptionFilter,
    },
  ],
})
export class AppModule {}
