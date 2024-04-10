import { Test, TestingModule } from "@nestjs/testing";
import { AuthController } from "./auth.controller";
import { AuthService } from "../auth/auth.service";
import { CreateUserDto } from "../users/dto/create-user.dto";
import { LoginUserDto } from "../users/dto/login-user.dto";
import { IResponse } from "src/common/interfaces/response";

describe("AuthController", () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            registerUser: jest.fn(),
            registerAdminUser: jest.fn(),
            login: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("registerUser", () => {
    it("should call authService.registerUser and return the result", async () => {
      const user: CreateUserDto = {
        email: "john18780@example.com",
        password: "password123",
        name: "john",
      };

      const expectedResult: IResponse = {
        message: "Successfully registered user",
        status: 200,
      };

      jest.spyOn(authService, "registerUser").mockResolvedValue(expectedResult);

      const result = await controller.registerUser(user);

      expect(authService.registerUser).toHaveBeenCalledWith(user);
      expect(result).toEqual(expectedResult);
    });
  });

  describe("registerAdminUser", () => {
    it("should call authService.registerAdminUser and return the result", async () => {
      const user: CreateUserDto = {
        email: "john18780@example.com",
        password: "password123",
        name: "john",
      };

      const expectedResult: IResponse = {
        message: "Successfully registered Admin",
        status: 200,
      };

      jest
        .spyOn(authService, "registerAdminUser")
        .mockResolvedValue(expectedResult);

      const result = await controller.registerAdminUser(user);

      expect(authService.registerAdminUser).toHaveBeenCalledWith(user);
      expect(result).toEqual(expectedResult);
    });
  });

  describe("loginUser", () => {
    it("should call authService.login and return the result", async () => {
      const user: LoginUserDto = {
        email: "john18780@example.com",
        password: "password123",
      };
      const expectedResult = {
        message: "Successfully loggedIn",
        status: 200,
        data: {
          accessToken: "ACCESS_TOKEN",
        },
      };

      jest.spyOn(authService, "login").mockResolvedValue(expectedResult);

      const result = await controller.loginUser(user);

      expect(authService.login).toHaveBeenCalledWith(user);
      expect(result).toEqual(expectedResult);
    });
  });
});
