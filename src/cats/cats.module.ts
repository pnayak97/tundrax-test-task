import { Module } from "@nestjs/common";
import { CatsController } from "./cats.controller";
import { CatsService } from "./cats.service";
import { Cat } from "../entities/Cat.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@Module({
  imports: [TypeOrmModule.forFeature([Cat])],
  controllers: [CatsController],
  providers: [CatsService, Repository],
})
export class CatsModule {}
