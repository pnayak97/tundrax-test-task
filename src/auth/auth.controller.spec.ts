import { Test, TestingModule } from "@nestjs/testing";
import { AuthController } from "./auth.controller";
import { AuthService } from "../auth/auth.service";
import { TypeOrmModule, getRepositoryToken } from "@nestjs/typeorm";
import { User } from "../entities/User.entity";
import { Repository } from "typeorm";
import { JwtService } from "@nestjs/jwt";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { CreateUserDto } from "../users/dto/create-user.dto";
import { LoginUserDto } from "../users/dto/login-user.dto";
import bcrypt from "bcrypt";
import { AuthGuard } from "@nestjs/passport";
import { RolesGuard } from "../common/guards/roles.guard";
import { INestApplication } from "@nestjs/common";
import { AuthModule } from "./auth.module";
import { UserModule } from "../users/users.module";

let app: INestApplication;
let repository: Repository<User>;
let connection;

class MockJwtAuthGuard {
  canActivate(context): boolean {
    // Mock canActivate method to return true for testing purposes
    return true;
  }
}
class MockRolesGuard {
  canActivate(context): boolean {
    // Mock canActivate method to return true for testing purposes
    return true;
  }
}

describe("AuthController (e2e)", () => {
  let authController: AuthController;

  beforeAll(async () => {
    connection = await Test.createTestingModule({
      imports: [
        AuthModule,
        // Use the e2e_test database to run the tests
        TypeOrmModule.forRoot({
          type: "postgres",
          host: "localhost",
          port: 54320,
          username: "test_user",
          password: "test_password",
          database: "test_database",
          entities: ["./**/*.entity.ts"],
          synchronize: true,
        }),
      ],
      providers: [
        AuthService,
      
        JwtService,
        ConfigService,
      ],
    })
      // .overrideGuard(AuthGuard("jwt"))
      // .useValue(MockJwtAuthGuard)
      // .overrideGuard(RolesGuard)
      // .useValue(MockRolesGuard)
      .compile();

    repository = connection.get("UserRepository");
    app = connection.createNestApplication();
    await app.init();
  });

  it.only("should be defined", () => {
    expect(authController).toBeDefined();
  });

  // describe.only('validateUser', () => {
  //   it('should return null if user is not found', async () => {
  //     const result = await authService.validateUser('test@example.com', 'password');
  //     expect(result).toBeNull();
  //   });

  //   it('should return user if user is found and password matches', async () => {
  //     const user = new User();
  //     user.email = 'test@example.com';
  //     user.password = bcrypt.hashSync('password', 10); // Assuming password is hashed

  //     jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(user);

  //     const result = await authService.validateUser('test@example.com', 'password');
  //     expect(result).toEqual(user);
  //   });

  //   it('should return null if password does not match', async () => {
  //     const user = new User();
  //     user.email = 'test@example.com';
  //     user.password = bcrypt.hashSync('password', 10); // Assuming password is hashed

  //     jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(user);

  //     const result = await authService.validateUser('test@example.com', 'wrongpassword');
  //     expect(result).toBeNull();
  //   });
  // });

  describe("loginUser", () => {
    it("should login an existing user", async () => {
      const existingUser = await repository.save({
        name: "John",
        email: "john@example.com",
        password: "password123",
      });
      const loginUserDto: LoginUserDto = {
        email: "john@example.com",
        password: "password123",
      };

      const result = await authController.loginUser(loginUserDto);
      expect(result).toBeDefined();
      expect(result.accessToken).toBeDefined();
      expect(result.userDetails.name).toEqual(existingUser.name);
      expect(result.userDetails.email).toEqual(existingUser.email);
    });
  });
});
