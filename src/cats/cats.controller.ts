import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  Delete,
  Put,
} from "@nestjs/common";
import { Roles } from "../common/decorators/roles.decorator";
import { RolesGuard } from "../common/guards/roles.guard";
import { ParseIntPipe } from "../common/pipes/parse-int.pipe";
import { CatsService } from "./cats.service";
import { CreateCatDto, UpdateCatDto } from "./dto/create-cat.dto";
import { AuthGuard } from "@nestjs/passport";
import { Cat } from "../entities/Cat.entity";
import { IResponse } from "../common/interfaces/response";
import { UserRole } from "../users/enums/user-role.enum";

@Controller("cats")
export class CatsController {
  constructor(private readonly catsService: CatsService) {}

  @Get()
  @UseGuards(AuthGuard("jwt"))
  public async findAll(): Promise<Cat[]> {
    return this.catsService.findAll();
  }

  @Post()
  @Roles([UserRole.Admin, UserRole.SuperAdmin])
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  public async create(@Body() createCatDto: CreateCatDto): Promise<Cat> {
    return this.catsService.create(createCatDto);
  }

  @UseGuards(AuthGuard("jwt"))
  @Get(":id")
  public async findOne(
    @Param("id", new ParseIntPipe())
    id: number,
  ): Promise<Cat> {
    return this.catsService.getCatById(id);
  }

  @Roles([UserRole.Admin, UserRole.SuperAdmin])
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Delete(":id")
  async deleteCatById(
    @Param("id", new ParseIntPipe())
    id: number,
  ): Promise<IResponse> {
    return this.catsService.deleteCatById(id);
  }

  @Roles([UserRole.Admin, UserRole.SuperAdmin])
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Put(":id")
  async updateCatById(
    @Param("id", new ParseIntPipe()) id: number,
    @Body() updateCatDto: UpdateCatDto,
  ): Promise<Cat> {
    return this.catsService.updateCatById(id, updateCatDto);
  }
}
