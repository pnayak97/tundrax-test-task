import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { Cat } from "../entities/Cat.entity";
import { CreateCatDto, UpdateCatDto } from "./dto/create-cat.dto";
import { IResponse } from "../common/interfaces/response";

@Injectable()
export class CatsService {
  constructor(
    @InjectRepository(Cat)
    private readonly catRepository: Repository<Cat>,
  ) {}

  async create(cat: CreateCatDto): Promise<Cat> {
    return this.catRepository.save(cat);
  }

  async findAll(): Promise<Cat[]> {
    return this.catRepository.find();
  }

  async deleteCatById(id: number): Promise<IResponse> {
    const cat = await this.catRepository.findOne({
      where: { id },
      relations: ["users"],
    });
    if (!cat) {
      throw new HttpException("Cat not found", HttpStatus.NOT_FOUND);
    }

    // Get all userIds associated with this cat Id in favorites
    const userIds = cat.users.map((user) => user.id);

    // Remove associations from the join table
    await this.catRepository
      .createQueryBuilder()
      .relation(Cat, "users")
      .of(id)
      .remove(userIds);

    await this.catRepository.delete(id);

    return {
      message: `Successfully deleted cat with id ${id}`,
      status: HttpStatus.OK,
    } as IResponse;
  }

  async getCatById(id: number): Promise<Cat> {
    const result = await this.catRepository.findOne({ where: { id } });
    if (!result) throw new HttpException("Cat not found", HttpStatus.NOT_FOUND);
    return result;
  }

  async updateCatById(
    id: number,
    updateCatDto: Partial<UpdateCatDto>,
  ): Promise<Cat> {
    const cat = await this.catRepository.findOne({
      where: { id },
    });
    if (!cat) throw new HttpException("Cat not found", HttpStatus.NOT_FOUND);

    Object.assign(cat, updateCatDto);
    await this.catRepository.save(cat);
    return cat;
  }
}
