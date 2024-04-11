import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "../entities/User.entity";
import { Cat } from "../entities/Cat.entity";
import { HttpException, HttpStatus, NotFoundException } from "@nestjs/common";
import { UserService } from "./users.service";

describe("UserService", () => {
  let service: UserService;
  let userRepository: Repository<User>;
  let catRepository: Repository<Cat>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Cat),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    catRepository = module.get<Repository<Cat>>(getRepositoryToken(Cat));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("getUserById", () => {
    it("should throw NotFoundException if user not found", async () => {
      jest.spyOn(userRepository, "findOne").mockResolvedValue(undefined);

      await expect(service.getUserById(1)).rejects.toThrow(HttpException);
    });
  });

  describe("markCatAsFavorite", () => {
    it("should throw NotFoundException if user not found", async () => {
      jest.spyOn(userRepository, "findOne").mockResolvedValue(null);
      await expect(service.markCatAsFavorite(1, 1)).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe("getUserFavoriteCats", () => {
    it("should return favorite cats for the user", async () => {
      const mockUser = {
        id: 1,
        favorites: [{ id: 1, name: "Whiskers", breed: "Siamese", age: 3 }],
      } as User;
      jest.spyOn(userRepository, "findOne").mockResolvedValue(mockUser);

      const result = await service.getUserFavoriteCats(1);

      expect(result).toEqual(mockUser.favorites);
    });

    it("should throw NotFoundException if user not found", async () => {
      jest.spyOn(userRepository, "findOne").mockResolvedValue(undefined);

      await expect(service.getUserFavoriteCats(1)).rejects.toThrow(
        NotFoundException
      );
    });
  });
});
