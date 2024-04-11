import { Test, TestingModule } from "@nestjs/testing";
import { AuthController } from "./auth.controller";
import { AuthService } from "../auth/auth.service";
import { CreateUserDto } from "../users/dto/create-user.dto";
import { LoginUserDto } from "../users/dto/login-user.dto";
import { IFilterResponse, IResponse } from "src/common/interfaces/response";
import { HttpException, HttpStatus } from "@nestjs/common";
import { User } from "src/entities/User.entity";
import {
  testEmail,
  testEmail2,
  testName,
  testPassword,
  testPassword2,
} from "../test/constants";

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
        email: testEmail,
        password: testPassword,
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

    it("should throw an error when email already exists", async () => {
      const user: CreateUserDto = {
        email: testEmail,
        password: testPassword,
        name: testName,
      };

      const errorMessage = "Email already exists";
      const error = new HttpException(errorMessage, HttpStatus.NOT_FOUND);

      jest.spyOn(authService, "registerUser").mockRejectedValue(error);

      await expect(controller.registerUser(user)).rejects.toThrow(error);

      expect(authService.registerUser).toHaveBeenCalledWith(user);
    });

    it("should throw an error when email is missing", async () => {
      const user = {
        password: testPassword,
        name: testName,
      } as User;

      const response: IFilterResponse = {
        timestamp: expect.any(String),
        path: "/auth/registerUser",
        message: ["password must be a string", "password should not be empty"],
        statusCode: 400,
      };

      jest.spyOn(authService, "registerUser").mockRejectedValue(response);

      await expect(controller.registerUser(user)).rejects.toEqual(response);

      expect(authService.registerUser).toHaveBeenCalledWith(user);
    });

    it("should throw an error when password is missing", async () => {
      const user = {
        email: testEmail,
        name: testName,
      } as User;

      const response: IFilterResponse = {
        timestamp: expect.any(String),
        path: "/auth/registerUser",
        message: ["password must be a string", "password should not be empty"],
        statusCode: 400,
      };

      jest.spyOn(authService, "registerUser").mockRejectedValue(response);

      await expect(controller.registerUser(user)).rejects.toEqual(response);

      expect(authService.registerUser).toHaveBeenCalledWith(user);
    });

    it("should throw an error when name is missing", async () => {
      const user = {
        email: testEmail,
        password: testPassword,
      } as User;

      const response: IFilterResponse = {
        timestamp: expect.any(String),
        path: "/auth/registerUser",
        message: ["name must be a string", "name should not be empty"],
        statusCode: 400,
      };

      jest.spyOn(authService, "registerUser").mockRejectedValue(response);

      await expect(controller.registerUser(user)).rejects.toEqual(response);

      expect(authService.registerUser).toHaveBeenCalledWith(user);
    });
  });

  describe("registerAdminUser", () => {
    it("should call authService.registerAdminUser and return the result", async () => {
      const user: CreateUserDto = {
        email: testEmail,
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

    it("should throw an error when email already exists", async () => {
      const user: CreateUserDto = {
        email: testEmail,
        password: testPassword,
        name: testName,
      };

      const errorMessage = "Email already exists";
      const error = new HttpException(errorMessage, HttpStatus.NOT_FOUND);

      jest.spyOn(authService, "registerAdminUser").mockRejectedValue(error);

      await expect(controller.registerAdminUser(user)).rejects.toThrow(error);

      expect(authService.registerAdminUser).toHaveBeenCalledWith(user);
    });

    it("should throw an error when email is missing", async () => {
      const user = {
        password: testPassword,
        name: testName,
      } as User;

      const response: IFilterResponse = {
        timestamp: expect.any(String),
        path: "/auth/registerAdmin",
        message: ["password must be a string", "password should not be empty"],
        statusCode: 400,
      };

      jest.spyOn(authService, "registerAdminUser").mockRejectedValue(response);

      await expect(controller.registerAdminUser(user)).rejects.toEqual(
        response
      );

      expect(authService.registerAdminUser).toHaveBeenCalledWith(user);
    });
    it("should throw an error when password is missing", async () => {
      const user = {
        email: "john@example.com",
        name: testName,
      } as User;

      const response: IFilterResponse = {
        timestamp: expect.any(String),
        path: "/auth/registerAdmin",
        message: ["password must be a string", "password should not be empty"],
        statusCode: 400,
      };

      jest.spyOn(authService, "registerAdminUser").mockRejectedValue(response);

      await expect(controller.registerAdminUser(user)).rejects.toEqual(
        response
      );

      expect(authService.registerAdminUser).toHaveBeenCalledWith(user);
    });

    it("should throw an error when name is missing", async () => {
      const user = {
        email: "john@example.com",
        password: testPassword,
      } as User;

      const response: IFilterResponse = {
        timestamp: expect.any(String),
        path: "/auth/registerAdmin",
        message: ["name must be a string", "name should not be empty"],
        statusCode: 400,
      };

      jest.spyOn(authService, "registerAdminUser").mockRejectedValue(response);

      await expect(controller.registerAdminUser(user)).rejects.toEqual(
        response
      );

      expect(authService.registerAdminUser).toHaveBeenCalledWith(user);
    });
  });

  describe("loginUser", () => {
    it("should call authService.login and return the result", async () => {
      const user: LoginUserDto = {
        email: testEmail,
        password: testPassword,
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
    it("should throw an error when email does not exist", async () => {
      const user: LoginUserDto = {
        email: testEmail2,
        password: testPassword,
      };

      const response: IFilterResponse = {
        timestamp: expect.any(String),
        path: "/auth/login",
        message: "Invalid credentials - email does not exist",
        statusCode: 401,
      };

      jest.spyOn(authService, "login").mockRejectedValue(response);

      await expect(controller.loginUser(user)).rejects.toEqual(response);

      expect(authService.login).toHaveBeenCalledWith(user);
    });

    it("should throw an error when password does not match", async () => {
      const user: LoginUserDto = {
        email: testEmail,
        password: testPassword2,
      };

      const response: IFilterResponse = {
        timestamp: expect.any(String),
        path: "/auth/login",
        message: "Invalid credentials - password does not match",
        statusCode: 401,
      };

      jest.spyOn(authService, "login").mockRejectedValue(response);

      await expect(controller.loginUser(user)).rejects.toEqual(response);

      expect(authService.login).toHaveBeenCalledWith(user);
    });

    it("should throw an error when password is missing", async () => {
      const user: LoginUserDto = {
        email: testEmail,
        password: "",
      };

      const response: IFilterResponse = {
        timestamp: expect.any(String),
        path: "/auth/login",
        message: ["password must be a string", "password should not be empty"],
        statusCode: 400,
      };

      jest.spyOn(authService, "login").mockRejectedValue(response);

      await expect(controller.loginUser(user)).rejects.toEqual(response);

      expect(authService.login).toHaveBeenCalledWith(user);
    });

    it("should throw an error when email is empty", async () => {
      const user: LoginUserDto = {
        email: "",
        password: testPassword,
      };

      const response: IFilterResponse = {
        timestamp: expect.any(String),
        path: "/auth/login",
        message: ["email must be a string", "email should not be empty"],
        statusCode: 400,
      };

      jest.spyOn(authService, "login").mockRejectedValue(response);

      await expect(controller.loginUser(user)).rejects.toEqual(response);

      expect(authService.login).toHaveBeenCalledWith(user);
    });
  });
});
