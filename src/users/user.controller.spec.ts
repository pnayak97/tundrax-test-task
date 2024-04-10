import { Test, TestingModule } from "@nestjs/testing";
import { UserService } from "./users.service";
import { UserController } from "./users.controller";

describe("UserController", () => {
  let controller: UserController;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            markCatAsFavorite: jest.fn(),
            getUserFavoriteCats: jest.fn(),
          
          },
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  describe("markCatAsFavorite", () => {
    it("should mark a cat as favorite for the user", async () => {
      const mockUser = {
        name: "John",
        id: 1,
        favorites: [],
        email: "John@gmail.com",
      };
      jest.spyOn(userService, "markCatAsFavorite").mockResolvedValue(mockUser);

      const request = { user: { id: 1,name:"John", roles:["user"]}};
      const result = await controller.markCatAsFavorite(1, request );

      expect(result).toEqual(mockUser);
    });
  });

  describe("getFavoriteCats", () => {
    it("should return favorite cats for the user", async () => {
      const mockUser = [{ id: 1, name: "cat", breed: "testBreed", age: 10 }];
      jest
        .spyOn(userService, "getUserFavoriteCats")
        .mockResolvedValue(mockUser);

        const request = { user: { id: 1,name:"John", roles:["user"]}};
      const result = await controller.getFavoriteCats(request);

      expect(result).toEqual(mockUser);
    });
  });
});
