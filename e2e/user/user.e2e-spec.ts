import { TypeOrmModule } from "@nestjs/typeorm";
import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import supertest from "supertest";
import { Repository } from "typeorm";
import { Cat } from "../../src/entities/Cat.entity";
import { RolesGuard } from "../../src/common/guards/roles.guard";
import { AuthModule } from "../../src/auth/auth.module";
import { CatsModule } from "../../src/cats/cats.module";
import { MockRolesGuard } from "../../src/test/mock.guard";
import testDbConfig from "../../src/test/db.config";
import { UserModule } from "../../src/users/users.module";
import { CreateUserDto } from "../../src/users/dto/create-user.dto";
import { LoginUserDto } from "../../src/users/dto/login-user.dto";
import { testEmail, testPassword, testName, catName, catAge, catBreed } from "../../src/test/constants";

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
},10000);

describe("Mark cat as favorite", () => {

  it("should mark cat as favorite", async () => {
    const registerUserDto: CreateUserDto = {
      email:testEmail,
      password:testPassword,
      name:testName,
    };

    await supertest(app.getHttpServer())
      .post("/auth/register")
      .send(registerUserDto)
      .expect(201);

    const loginUserDto: LoginUserDto = {
      email:testEmail,
      password:testPassword,
    };

    const responseLogin = await supertest(app.getHttpServer())
      .post(`/auth/login`)
      .send(loginUserDto)
      .expect(201);

    const token = JSON.parse(responseLogin.text).data.accessToken;
    const createCatDto = {
      name: catName,
      age: catAge,
      breed: catBreed,
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
  it("should get user details", async () => {
    const registerUserDto: CreateUserDto = {
      email:testEmail,
      password:testPassword,
      name:testName,
    };

    await supertest(app.getHttpServer())
      .post("/auth/register")
      .send(registerUserDto)
      .expect(201);

    const loginUserDto: LoginUserDto = {
      email:testEmail,
      password:testPassword,
    };

    const responseLogin = await supertest(app.getHttpServer())
      .post(`/auth/login`)
      .send(loginUserDto)
      .expect(201);

      const token = JSON.parse(responseLogin.text).data.accessToken;

    await supertest(app.getHttpServer())
      .get(`/user`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);
  });
});

afterEach(async () => {
  await repository.query(`Delete from user_favorites_cat`);
  await repository.query(`Delete from cat`);
  await repository.query(`Delete from "user"`);
});

afterAll(async () => {
  // Close the database connection 
  await connection.close();
  await app.close();
});
