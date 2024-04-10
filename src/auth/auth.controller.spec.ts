import { Test, TestingModule } from "@nestjs/testing";
import { AuthController } from "./auth.controller";
import { TypeOrmModule, getRepositoryToken } from "@nestjs/typeorm";
import { User } from "../entities/User.entity";
import { Repository } from "typeorm";
import { JwtModule } from "@nestjs/jwt";
import { CreateUserDto } from "../users/dto/create-user.dto";
import { LoginUserDto } from "../users/dto/login-user.dto";
import { AuthGuard } from "@nestjs/passport";
import { INestApplication } from "@nestjs/common";
import { AuthModule } from "./auth.module";
import testDbConfig from "../test/db.config";
import supertest from "supertest";
import { MockJwtAuthGuard } from "../test/mock.guard";

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
});

describe("validateUser", () => {
  it("should register the user", async () => {
    const registerUserDto: CreateUserDto = {
      email: "john18780@example.com",
      password: "password123",
      name: "john",
    };

    const result = await supertest(app.getHttpServer())
      .post("/auth/register")
      .send(registerUserDto)
      .expect(201);
  });

  it("should give error if email already exist", async () => {
    const registerUserDto: CreateUserDto = {
      email: "john18780@example.com",
      password: "password123",
      name: "john",
    };

    await supertest(app.getHttpServer())
      .post("/auth/register")
      .send(registerUserDto)
      .expect(201);

    const result = await supertest(app.getHttpServer())
      .post("/auth/register")
      .send(registerUserDto)
      .expect(400);
    
      // expect(result.body).toEqual({
      //   message: `User Already Exists`,
      //   statusCode: 404,
      // });
  });
});

describe("loginUser", () => {
  it("should login existing user", async () => {
    const registerUserDto: CreateUserDto = {
      email: "john18780@example.com",
      password: "password123",
      name: "john",
    };

    const loginUserDto: LoginUserDto = {
      email: "john18780@example.com",
      password: "password123",
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

  it("should give error if user not exists", async () => {
    const loginUserDto: LoginUserDto = {
      email: "john10@example.com",
      password: "password123",
    };
    
    const result=await supertest(app.getHttpServer())
    .post(`/auth/login`)
    .send(loginUserDto)
    .expect(401);
    
    // expect(result.body).toEqual({
    //     message: ` User Does Not Exists`,
    //     statusCode: 404,
    //   });
});
});

afterEach(async () => {
  // Close the database connection and drop the test database
  await repository.query(`Delete from user_favorites_cat`);
  await repository.query(`Delete from cat`);
  await repository.query(`Delete from "user"`);
});

afterAll(async () => {
  await connection.close();
  await app.close();
});
