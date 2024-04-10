import { TypeOrmModule } from "@nestjs/typeorm";
import { CatsModule } from "./cats.module";
import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import supertest from "supertest";
import { Repository } from "typeorm";
import { Cat } from "../entities/Cat.entity";
import { AuthGuard } from "@nestjs/passport";
import { RolesGuard } from "../common/guards/roles.guard";

let app: INestApplication;
let repository: Repository<Cat>;
let connection;

// Define a mock class for the JwtAuthGuard
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

beforeAll(async () => {
  connection = await Test.createTestingModule({
    imports: [
      CatsModule,
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
  })
    .overrideGuard(AuthGuard("jwt"))
    .useValue(MockJwtAuthGuard)
    .overrideGuard(RolesGuard)
    .useValue(MockRolesGuard)
    .compile();

  repository = connection.get("CatRepository");
  app = connection.createNestApplication();
  await app.init();
});

describe("findAll", () => {
  it("should return an array of cats", async () => {
    const response = await supertest(app.getHttpServer())
      .get("/cats")
      .expect(200);

    expect(response.body).toBeInstanceOf(Array);
  });
});

describe("create", () => {
  it("should create a new cat", async () => {
    const createCatDto = {
      name: "Whiskers",
      age: 3,
      breed: "Siamese",
    };

    const response = await supertest(app.getHttpServer())
      .post("/cats")
      .send(createCatDto)
      .expect(201);

    expect(response.body).toHaveProperty("id");
    expect(response.body.name).toEqual(createCatDto.name);
    expect(response.body.age).toEqual(createCatDto.age);
    expect(response.body.breed).toEqual(createCatDto.breed);
  });
});

describe("findOne", () => {
  it("should return the specified cat", async () => {
    // First, create a cat
    const createCatDto = {
      name: "Felix",
      age: 4,
      breed: "Maine Coon",
    };

    const createResponse = await supertest(app.getHttpServer())
      .post("/cats")
      .send(createCatDto)
      .expect(201);
    const catId = createResponse.body.id;

    // Then, try to find the created cat
    const findResponse = await supertest(app.getHttpServer())
      .get(`/cats/${catId}`)
      .expect(200);
    expect(findResponse.body.name).toEqual(createResponse.body.name);
    expect(findResponse.body.age).toEqual(createResponse.body.age);
    expect(findResponse.body.breed).toEqual(createResponse.body.breed);
  });
});

describe("deleteCatById", () => {
  it("should delete the specified cat", async () => {
    // First, create a cat
    const createCatDto = {
      name: "Garfield",
      age: 5,
      breed: "Persian",
    };

    const createResponse = await supertest(app.getHttpServer())
      .post("/cats")
      .send(createCatDto)
      .expect(201);

    const catId = createResponse.body.id;

    // Then, try to delete the created cat
    const deleteResponse = await supertest(app.getHttpServer())
      .delete(`/cats/${catId}`)
      .expect(200);

    expect(deleteResponse.body).toEqual({
      message: `Successfully delete Cat with ${catId}`,
      status: 200,
    });

    // Verify that the cat has been deleted by trying to find it again
    await supertest(app.getHttpServer()).get(`/cats/${catId}`).expect(400); //  400 is returned when the cat is not found
  });
});

describe("updateCatById", () => {
  it("should update the specified cat", async () => {
    // First, create a cat
    const createCatDto = {
      name: "Tom",
      age: 3,
      breed: "Siamese",
    };

    const createResponse = await supertest(app.getHttpServer())
      .post("/cats")
      .send(createCatDto)
      .expect(201);

    const catId = createResponse.body.id;

    // Then, update the created cat
    const updateCatDto = {
      name: "Whiskers",
      age: 4,
      breed: "Siamese",
    };

    const updateResponse = await supertest(app.getHttpServer())
      .put(`/cats/${catId}`)
      .send(updateCatDto)
      .expect(200);

    expect(updateResponse.body).toHaveProperty("id", catId);
    expect(updateResponse.body.name).toEqual(updateCatDto.name);
    expect(updateResponse.body.age).toEqual(updateCatDto.age);
    expect(updateResponse.body.breed).toEqual(updateCatDto.breed);
  });
});

afterAll(async () => {
  // Close the database connection and drop the test database
  await repository.query(`Delete from cat`);
  // await connection.close();
  await app.close();
});
