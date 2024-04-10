import { Module } from "@nestjs/common";
import { UserController } from "./users.controller";
import { UserService } from "./users.service";
import { Repository } from "typeorm";
import { User } from "../entities/User.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Cat } from "../entities/Cat.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Cat, User])],
  controllers: [UserController],
  providers: [UserService, Repository],
})
export class UserModule {}
