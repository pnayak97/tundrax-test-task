import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "../entities/User.entity";
import { Cat } from "../entities/Cat.entity";
import { IUser } from "./interface/user.interface";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Cat)
    private readonly catRepository: Repository<Cat>,
  ) {}

  public async getUserById(userId: number): Promise<IUser> {
    const result = await this.userRepository.findOne({
      select: { id: true, name: true, email: true, favorites: true },
      where: { id: userId },
    });

    if (!result) {
      throw new HttpException("User not found", HttpStatus.NOT_FOUND);
    }

    const { id, name, email, favorites } = result;
    return {
      id,
      name,
      email,
      favorites,
    };
  }

  public async markCatAsFavorite(
    userId: number,
    catId: number,
  ): Promise<IUser> {
    const user = await this.findUserByIdWithFavorites(userId);
    const cat = await this.findCatById(catId);

    if (this.isCatInFavorites(user, cat)) {
      return this.formatUserDetails(user);
    }

    user.favorites.push(cat);
    const updatedUserDetails = await this.userRepository.save(user);
    const { id, name, email, favorites } = updatedUserDetails;

    return {
      id,
      name,
      email,
      favorites,
    };
  }

  private async findUserByIdWithFavorites(userId: number): Promise<User> {
    const user = await this.userRepository.findOne({
      select: { id: true, name: true, email: true, favorites: true },
      where: { id: userId },
      relations: ["favorites"],
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    return user;
  }

  private async findCatById(catId: number): Promise<Cat> {
    const cat = await this.catRepository.findOne({ where: { id: catId } });

    if (!cat) {
      throw new NotFoundException("Cat not found");
    }

    return cat;
  }

  private isCatInFavorites(user: User, cat: Cat): boolean {
    return user.favorites.some((favCat) => favCat.id === cat.id);
  }

  private formatUserDetails(user: User): IUser {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      favorites: user.favorites,
    };
  }

  public async getUserFavoriteCats(userId: number): Promise<Cat[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ["favorites"],
    });
    if (!user) {
      throw new NotFoundException("User not found");
    }
    return user.favorites;
  }
}
