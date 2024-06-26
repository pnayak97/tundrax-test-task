import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from "@nestjs/common";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { Cat } from "../entities/Cat.entity";
import { CreateCatDto, UpdateCatDto } from "./dto/create-cat.dto";
import { IResponse } from "src/common/interfaces/response";

@Injectable()
export class CatsService {
  constructor(
    @InjectRepository(Cat)
    private readonly catRepository: Repository<Cat>
  ) {}

  async create(cat: CreateCatDto): Promise<Cat> {
    const result = await this.catRepository.save(cat);
    if (!result) throw new HttpException("Error in creating cat", 500);
    return result;
  }

  async findAll(): Promise<Cat[]> {
    const result = await this.catRepository.find();
    if (!result) throw new BadRequestException("Cats not Found");
    return result;
  }

  async deleteCatById(id: number): Promise<IResponse> {
    try {
      const cat = await this.catRepository.findOne({
        where: { id },
        relations: ["users"],
      });
      if (!cat) {
        throw new BadRequestException("Cat not found");
      }

      // Get all userIds associated with this cat Id in favorites
      const userIds = cat.users.map((user) => user.id);

      // Remove associations from the join table
      await this.catRepository
        .createQueryBuilder()
        .relation(Cat, "users")
        .of(id)
        .remove(userIds);

      const result = await this.catRepository.delete(id);
      if (result?.affected == 0) {
        throw new HttpException("Error in deleting records", 500);
      }
      return {
        message: `Successfully delete Cat with id ${id}`,
        status: HttpStatus.OK,
      } as IResponse;
    } catch (e) {
      throw new HttpException("Error in deleting cat records", 500);
    }
  }

  async getCatById(id: number): Promise<Cat> {
    const result = await this.catRepository.findOne({ where: { id } });
    if (!result) throw new BadRequestException("Cat not Found");
    return result;
  }

  async updateCatById(
    id: number,
    updateCatDto: Partial<UpdateCatDto>
  ): Promise<Cat> {
    const cat = await this.catRepository.findOne({
      where: { id },
    });
    if (!cat) throw new BadRequestException("Cat not Found");

    // check if custom error is thrown and cat updating properly
    Object.assign(cat, updateCatDto);
    await this.catRepository.save(cat);
    return cat;
  }
}
