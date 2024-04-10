import { TypeOrmModule } from "@nestjs/typeorm";
import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import supertest from "supertest";
import { Repository } from "typeorm";
import { Cat } from "../entities/Cat.entity";
import { RolesGuard } from "../common/guards/roles.guard";
import { UserModule } from "./users.module";
import { CreateUserDto } from "./dto/create-user.dto";
import { AuthModule } from "../auth/auth.module";
import { CatsModule } from "../cats/cats.module";
import { LoginUserDto } from "./dto/login-user.dto";
import { MockRolesGuard } from "../test/mock.guard";
import testDbConfig from "../test/db.config";

let app: INestApplication;
let repository: Repository<Cat>;
let connection: TestingModule;

beforeAll(async () => {
  connection = await Test.createTestingModule({
    imports: [
      UserModule,
      AuthModule,
      CatsModule,
      // Use the e2e_test database to run the tests
      TypeOrmModule.forRoot(testDbConfig),
    ],
  })
    .overrideGuard(RolesGuard)
    .useValue(MockRolesGuard)
    .compile();

  repository = connection.get("UserRepository");
  app = connection.createNestApplication();
  await app.init();
});

describe("Mark cat as favorite", () => {
  const email = "john1780@example.com";
  const password = "password123";
 
  it("should mark cat as favorite", async () => {
    const registerUserDto: CreateUserDto = {
      email,
      password,
      name: "john",
    };

    await supertest(app.getHttpServer())
      .post("/auth/register")
      .send(registerUserDto)
      .expect(201);

    const loginUserDto: LoginUserDto = {
      email,
      password,
    };

    const responseLogin = await supertest(app.getHttpServer())
      .post(`/auth/login`)
      .send(loginUserDto)
      .expect(201);

    const token = JSON.parse(responseLogin.text).data.accessToken;
    // console.log(token)
    const createCatDto = {
      name: "Whiskers",
      age: 3,
      breed: "Siamese",
    };

    const catResponse = await supertest(app.getHttpServer())
      .post("/cats")
      .send(createCatDto)
      .set("Authorization", `Bearer ${token}`)
      .expect(201);

    const catId = catResponse.body.id;

    await supertest(app.getHttpServer())
      .post(`/user/favorite-cat/${catId}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(201);
  });
});


describe("User details", () => {
  const email = "john1780@example.com";
  const password = "password123";
 
  it("should get user details", async () => {
    const registerUserDto: CreateUserDto = {
      email,
      password,
      name: "john",
    };

    await supertest(app.getHttpServer())
      .post("/auth/register")
      .send(registerUserDto)
      .expect(201);

    const loginUserDto: LoginUserDto = {
      email,
      password,
    };

    const responseLogin = await supertest(app.getHttpServer())
      .post(`/auth/login`)
      .send(loginUserDto)
      .expect(201);

    //   const token = JSON.parse(responseLogin.text).data.accessToken;

    // await supertest(app.getHttpServer())
    //   .get(`/user`)
    //   .set("Authorization", `Bearer ${token}`)
    //   .expect(200);
  });
});

afterEach(async () => {
  // Close the database connection and drop the test database
  await repository.query(`Delete from user_favorites_cat`);
  await repository.query(`Delete from cat`);
  await repository.query(`Delete from "user"`);
});

afterAll(async () => {
  // // Close the database connection and drop the test database

  await connection.close();
  await app.close();
});
