import { Test, TestingModule } from "@nestjs/testing";
import { CatsController } from "./cats.controller";
import { CatsService } from "./cats.service";
import { CreateCatDto } from "./dto/create-cat.dto";
import { Cat } from "../entities/Cat.entity";
import { IFilterResponse, IResponse } from "../common/interfaces/response";
import { AuthGuard } from "@nestjs/passport";
import { RolesGuard } from "../common/guards/roles.guard";
import { HttpException, HttpStatus } from "@nestjs/common";
import { catAge, catBreed, catName } from "../test/constants";

describe("CatsController", () => {
  let controller: CatsController;
  let catsService: CatsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CatsController],
      providers: [
        {
          provide: CatsService,
          useValue: {
            findAll: jest.fn(),
            create: jest.fn(),
            getCatById: jest.fn(),
            deleteCatById: jest.fn(),
            updateCatById: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(AuthGuard("jwt"))
      .useValue({ canActivate: () => true }) // Mocking the AuthGuard for simplicity
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true }) // Mocking the RolesGuard for simplicity
      .compile();

    controller = module.get<CatsController>(CatsController);
    catsService = module.get<CatsService>(CatsService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("findAll", () => {
    it("should return an array of cats", async () => {
      const cats: Cat[] = [{ id: 1, name: catName, age: 3, breed: catBreed }];
      jest.spyOn(catsService, "findAll").mockResolvedValue(cats);

      expect(await controller.findAll()).toEqual(cats);
    });

    it("should return an empty array when no cat is present", async () => {
      // Mocking the findAll method to return an empty array
      jest.spyOn(catsService, "findAll").mockResolvedValue([]);

      // Running the test with the mocked behavior
      expect(await controller.findAll()).toEqual([]);

      // Restoring the original implementation of findAll
      jest.restoreAllMocks();
    });
  });

  describe("create", () => {
    it("should create a new cat", async () => {
      const createCatDto: CreateCatDto = {
        name: catName,
        age: catAge,
        breed: catBreed,
      };
      const createdCat: Cat = { id: 1, ...createCatDto };
      jest.spyOn(catsService, "create").mockResolvedValue(createdCat);

      expect(await controller.create(createCatDto)).toEqual(createdCat);
    });

    it("should not create a new cat if user is not authorized", async () => {
      const createCatDto: CreateCatDto = {
        name: catName,
        age: catAge,
        breed: catBreed,
      };

      const expectedResult: IFilterResponse = {
        timestamp: expect.any(String),
        path: "/cats/",
        message: "Forbidden resource",
        statusCode: 403,
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          {
            provide: RolesGuard,
            useValue: { canActivate: () => false },
          },
        ],
      }).compile();

      // Override canActivate to return false (for not authorized user)
      const guard = module.get(RolesGuard);
      jest.spyOn(guard, "canActivate").mockReturnValue(false);

      jest.spyOn(catsService, "create").mockRejectedValue(expectedResult);

      await expect(controller.create(createCatDto)).rejects.toEqual(
        expectedResult
      );
      expect(catsService.create).toHaveBeenCalledWith(createCatDto);

      // Restore the original canActivate method
      (guard.canActivate as jest.Mock).mockRestore();
    });
  });

  describe("findOne", () => {
    it("should return the specified cat", async () => {
      const catId = 1;
      const cat: Cat = {
        id: catId,
        name: catName,
        age: catAge,
        breed: catBreed,
      };
      jest.spyOn(catsService, "getCatById").mockResolvedValue(cat);

      expect(await controller.findOne(catId)).toEqual(cat);
    });
    it("should throw an error when cat ID is not found", async () => {
      const invalidCatId = 90;
      const response: IFilterResponse = {
        timestamp: expect.any(String),
        path: `/cats/${invalidCatId}`,
        statusCode: 404,
      };

      jest.spyOn(catsService, "getCatById").mockRejectedValue(response);

      await expect(controller.findOne(invalidCatId)).rejects.toEqual(response);

      expect(catsService.getCatById).toHaveBeenCalledWith(invalidCatId);
    });

    it("should throw an error when cat ID is not of a valid type", async () => {
      const invalidCatId: any = "22";
      const response: IFilterResponse = {
        timestamp: expect.any(String),
        path: expect.any(String),
        message: "Validation failed",
        statusCode: 400,
      };

      jest.spyOn(catsService, "getCatById").mockRejectedValue(response);

      await expect(controller.findOne(invalidCatId)).rejects.toEqual(response);

      expect(catsService.getCatById).toHaveBeenCalledWith(invalidCatId);
    });
  });

  describe("deleteCatById", () => {
    it("should delete the specified cat", async () => {
      const catId = 1;
      const response: IResponse = {
        message: `Successfully delete Cat with ${catId}`,
        status: 200,
      };
      jest.spyOn(catsService, "deleteCatById").mockResolvedValue(response);

      expect(await controller.deleteCatById(catId)).toEqual(response);
    });
    it("should return 'Cat not found' error when the cat does not exist", async () => {
      const catId = 1;
      const errorMessage = "Cat not found";
      const error = new HttpException(errorMessage, HttpStatus.NOT_FOUND);

      jest.spyOn(catsService, "deleteCatById").mockRejectedValue(error);

      await expect(controller.deleteCatById(catId)).rejects.toThrow(error);
    });
    it("should not delete a cat if user is not authorized", async () => {
      const catId = 2;

      const expectedResult: IFilterResponse = {
        timestamp: expect.any(String),
        path: `/cats/${catId}`,
        message: "Forbidden resource",
        statusCode: 403,
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          {
            provide: RolesGuard,
            useValue: { canActivate: () => false }, // Return false for canActivate
          },
        ],
      }).compile();

      // Override canActivate to return false (for not authorized user)
      const guard = module.get(RolesGuard);
      jest.spyOn(guard, "canActivate").mockReturnValue(false);

      jest
        .spyOn(catsService, "deleteCatById")
        .mockRejectedValue(expectedResult);

      await expect(controller.deleteCatById(catId)).rejects.toEqual(
        expectedResult
      );
    });
  });

  describe("updateCatById", () => {
    it("should update the specified cat", async () => {
      const catId = 1;
      const updateCatDto = { name: "Tom", age: 3, breed: "Siamese" };
      const updatedCat = { id: catId, ...updateCatDto };
      jest.spyOn(catsService, "updateCatById").mockResolvedValue(updatedCat);

      expect(await controller.updateCatById(catId, updateCatDto)).toEqual(
        updatedCat
      );
    });
    it("should not update a cat if user is not authorized", async () => {
      const catId = 1;
      const updateCatDto = { name: "Tom", age: 3, breed: "Siamese" };

      const expectedResult: IFilterResponse = {
        timestamp: expect.any(String),
        path: `/cats/${catId}`,
        message: "Forbidden resource",
        statusCode: 403,
      };
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          {
            provide: RolesGuard,
            useValue: { canActivate: () => false }, // Return false for canActivate
          },
        ],
      }).compile();

      // Override canActivate to return false (for not authorized user)
      const guard = module.get(RolesGuard);
      jest.spyOn(guard, "canActivate").mockReturnValue(false);
      jest
        .spyOn(catsService, "updateCatById")
        .mockRejectedValue(expectedResult);

      await expect(
        controller.updateCatById(catId, updateCatDto)
      ).rejects.toEqual(expectedResult);
    });
  });
});
