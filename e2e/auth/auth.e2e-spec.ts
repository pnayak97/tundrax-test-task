import { Test, TestingModule } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { JwtModule } from "@nestjs/jwt";
import { AuthGuard } from "@nestjs/passport";
import { INestApplication } from "@nestjs/common";
import supertest from "supertest";
import { AuthModule } from "../../src/auth/auth.module";
import { User } from "../../src/entities/User.entity";
import testDbConfig from "../../src/test/db.config";
import { MockJwtAuthGuard } from "../../src/test/mock.guard";
import { CreateUserDto } from "../../src/users/dto/create-user.dto";
import { LoginUserDto } from "../../src/users/dto/login-user.dto";
import { testEmail, testPassword, testName } from "../../src/test/constants";
let app: INestApplication;
let repository: Repository<User>;
let connection: TestingModule;

beforeAll(async () => {
  connection = await Test.createTestingModule({
    imports: [
      AuthModule,
      JwtModule,
      Repository,
      TypeOrmModule.forRoot(testDbConfig),
    ],
    providers: [],
  })
    .overrideGuard(AuthGuard("jwt"))
    .useValue(MockJwtAuthGuard)
    .compile();

  repository = connection.get("UserRepository");
  // Initialize the NestJS application
  app = connection.createNestApplication();
  await app.init();
},10000);

describe("validateUser", () => {
  it("should register the user", async () => {
    const registerUserDto: CreateUserDto = {
      email: testEmail,
      password:testPassword,
      name: testName,
    };

    await supertest(app.getHttpServer())
      .post("/auth/register")
      .send(registerUserDto)
      .expect(201);
  });

  it("should give error if email already exist", async () => {
    const registerUserDto: CreateUserDto = {
      email: testEmail,
      password:testPassword,
      name: testName,
    };

    await supertest(app.getHttpServer())
      .post("/auth/register")
      .send(registerUserDto)
      .expect(201);

    const result = await supertest(app.getHttpServer())
      .post("/auth/register")
      .send(registerUserDto)
      .expect(404);

    expect(result.body).toEqual({
      message: `Email already exists`,
      statusCode: 404,
    });
  });
});

describe("loginUser", () => {
  it("should login existing user", async () => {
    const registerUserDto: CreateUserDto = {
      email: testEmail,
      password:testPassword,
      name: testName,
    };

    const loginUserDto: LoginUserDto = {
      email: testEmail,
      password:testPassword,
    };

    await supertest(app.getHttpServer())
      .post("/auth/register")
      .send(registerUserDto)
      .expect(201);

    await supertest(app.getHttpServer())
      .post(`/auth/login`)
      .send(loginUserDto)
      .expect(201);
  });

  it("should give error if user does not exists", async () => {
    const registerUserDto: CreateUserDto = {
      email: testEmail,
      password:testPassword,
      name: testName,
    };
    await supertest(app.getHttpServer())
      .post("/auth/register")
      .send(registerUserDto)
      .expect(201);

    const loginUserDto: LoginUserDto = {
      email: "john10@example.com",
      password:testPassword,
    };
    
    const loginRespone=await supertest(app.getHttpServer())
      .post(`/auth/login`)
      .send(loginUserDto)
      .expect(401);
     
      expect(loginRespone.body).toEqual({
        error: "Unauthorized",
        message: "Invalid credentials - email does not exists",
        statusCode: 401,
      });
  });

  it("should give error if password is wrong", async () => {
    const registerUserDto: CreateUserDto = {
      email: testEmail,
      password:testPassword,
      name: testName,
    };
    await supertest(app.getHttpServer())
      .post("/auth/register")
      .send(registerUserDto)
      .expect(201);

    const loginUserDto: LoginUserDto = {
      email: testEmail,
      password:"wrongPassword",
    };
    
    const loginRespone=await supertest(app.getHttpServer())
      .post(`/auth/login`)
      .send(loginUserDto)
      .expect(401);
     
      expect(loginRespone.body).toEqual({
        message: "Invalid credentials - password does not match",
        statusCode: 401,
        error: "Unauthorized"
      });
  });
});

afterEach(async () => {
  await repository.query(`Delete from user_favorites_cat`);
  await repository.query(`Delete from cat`);
  await repository.query(`Delete from "user"`);
});

afterAll(async () => {
  await connection.close();
  await app.close();
});
