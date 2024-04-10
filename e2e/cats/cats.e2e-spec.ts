import { TypeOrmModule } from "@nestjs/typeorm";
import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import supertest from "supertest";
import { Repository } from "typeorm";
import { AuthGuard } from "@nestjs/passport";
import { CatsModule } from "../../src/cats/cats.module";
import { RolesGuard } from "../../src/common/guards/roles.guard";
import { Cat } from "../../src/entities/Cat.entity";
import testDbConfig from "../../src/test/db.config";
import { MockJwtAuthGuard, MockRolesGuard } from "../../src/test/mock.guard";

let app: INestApplication;
let repository: Repository<Cat>;
let connection:TestingModule;

beforeAll(async () => {
  connection = await Test.createTestingModule({
    imports: [
      CatsModule,
      // Use the e2e_test database to run the tests
      TypeOrmModule.forRoot(testDbConfig),
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

describe("Create cat", () => {
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

describe("Find cat by ID", () => {
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

  it("should give error if the cat does not exist", async () => {
    const catId = 100;
    // try to find the created cat
    await supertest(app.getHttpServer()).get(`/cats/${catId}`).expect(404);
  });
});

describe("find all cats", () => {
  it("should return an array of cats", async () => {
    const response = await supertest(app.getHttpServer())
      .get("/cats")
      .expect(200);

    expect(response.body).toBeInstanceOf(Array);
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
      message: `Successfully deleted cat with id ${catId}`,
      status: 200,
    });

    // Verify that the cat has been deleted by trying to find it again
    await supertest(app.getHttpServer()).get(`/cats/${catId}`).expect(404); 
  });

  it("should give error if the cat does not exist", async () => {
    const catId = 100;
    const catResponse = await supertest(app.getHttpServer())
      .delete(`/cats/${catId}`)
      .expect(404);

    expect(catResponse.body).toEqual({
      message: `Cat not found`,
      statusCode: 404,
    });
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

  it("should give error if the cat does not exist", async () => {
    const catId = 100;
    const updateCatDto = {
      name: "Whiskers",
      age: 4,
      breed: "Siamese",
    };

    await supertest(app.getHttpServer())
      .put(`/cats/${catId}`)
      .send(updateCatDto)
      .expect(404);
  });
});

afterAll(async () => {
  // Close the database connection
  await repository.query(`Delete from user_favorites_cat`);
  await repository.query(`Delete from cat`);
  await connection.close();
  await app.close();
});
