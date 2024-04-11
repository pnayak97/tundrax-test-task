import { Test, TestingModule } from "@nestjs/testing";
import { UserService } from "./users.service";
import { UserController } from "./users.controller";
import { IFilterResponse } from "src/common/interfaces/response";

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

      const request = { user: { id: 1, name: "John", roles: ["user"] } };
      const result = await controller.markCatAsFavorite(1, request);

      expect(result).toEqual(mockUser);
    });

    it("should throw an error when cat ID does not exist", async () => {
      const invalidCatId = 8;
      const response: IFilterResponse = {
        timestamp: expect.any(String),
        path: `/user/favorite-cat/${invalidCatId}`,
        message: "Cat not found",
        statusCode: 404,
      };

      jest.spyOn(userService, "markCatAsFavorite").mockRejectedValue(response);

      const request = { user: { id: 1, name: "John", roles: ["user"] } };

      await expect(
        controller.markCatAsFavorite(invalidCatId, request)
      ).rejects.toEqual(response);

      expect(userService.markCatAsFavorite).toHaveBeenCalledWith(
        request.user.id,
        invalidCatId
      );
    });

    it("should throw an error when cat ID type is not valid", async () => {
      const invalidCatId: any = "22";
      const response: IFilterResponse = {
        timestamp: expect.any(String),
        path: `/user/favorite-cat/${invalidCatId}`,
        message: "Validation failed",
        statusCode: 400,
      };

      jest.spyOn(userService, "markCatAsFavorite").mockRejectedValue(response);

      const request = { user: { id: 1, name: "John", roles: ["user"] } };

      await expect(
        controller.markCatAsFavorite(invalidCatId, request)
      ).rejects.toEqual(response);

      expect(userService.markCatAsFavorite).toHaveBeenCalledWith(
        request.user.id,
        invalidCatId
      );
    });
  });

  describe("getFavoriteCats", () => {
    it("should return favorite cats for the user", async () => {
      const mockCat = [{ id: 1, name: "cat", breed: "testBreed", age: 10 }];
      jest.spyOn(userService, "getUserFavoriteCats").mockResolvedValue(mockCat);

      const request = { user: { id: 1, name: "John", roles: ["user"] } };
      const result = await controller.getFavoriteCats(request);

      expect(result).toEqual(mockCat);
    });

    it("should return an empty array when user not have favorite cats", async () => {
      const request = { user: { id: 1, name: "John", roles: ["user"] } };
      const mockUser = { id: 1, favorites: [] };
      jest
        .spyOn(userService, "getUserFavoriteCats")
        .mockResolvedValue(mockUser.favorites);

      const result = await controller.getFavoriteCats(request);

      expect(result).toEqual([]);
    });
  });
});
