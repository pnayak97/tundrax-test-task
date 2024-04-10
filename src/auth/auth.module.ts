import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { PassportModule } from "@nestjs/passport";
import { JwtModule, JwtService } from "@nestjs/jwt";
import Config from "../configuration";
import { JwtStrategy } from "./jwt.strategy";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthController } from "../auth/auth.controller";
import { Repository } from "typeorm";
import { UserModule } from "../users/users.module";
import { UserService } from "../users/users.service";
import { User } from "../entities/User.entity";
import { Cat } from "../entities/Cat.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Cat]),
    PassportModule.register({
      defaultStrategy: "jwt",
    }),
    JwtModule.register({
      secret: Config().keys.jwtServerSecret,
      signOptions: {
        expiresIn: Config().Constants.lifetime,
      },
    }),
    UserModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, UserService, JwtStrategy, Repository, JwtService],
})
export class AuthModule {}
