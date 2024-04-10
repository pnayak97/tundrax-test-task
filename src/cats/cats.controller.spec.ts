import { Test, TestingModule } from '@nestjs/testing';
import { CatsController } from './cats.controller';
import { CatsService } from './cats.service';
import { CreateCatDto } from './dto/create-cat.dto';
import { Cat } from '../entities/Cat.entity';
import { IResponse } from '../common/interfaces/response';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../common/guards/roles.guard';

describe('CatsController', () => {
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
    .overrideGuard(AuthGuard('jwt'))
    .useValue({ canActivate: () => true }) // Mocking the AuthGuard for simplicity
    .overrideGuard(RolesGuard)
    .useValue({ canActivate: () => true }) // Mocking the RolesGuard for simplicity
    .compile();

    controller = module.get<CatsController>(CatsController);
    catsService = module.get<CatsService>(CatsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of cats', async () => {
      const cats: Cat[] = [{ id: 1, name: 'Whiskers', age: 3, breed: 'Siamese' }];
      jest.spyOn(catsService, 'findAll').mockResolvedValue(cats);

      expect(await controller.findAll()).toEqual(cats);
    });
  });

  describe('create', () => {
    it('should create a new cat', async () => {
      const createCatDto: CreateCatDto = { name: 'Garfield', age: 5, breed: 'Persian' };
      const createdCat: Cat = { id: 1, ...createCatDto };
      jest.spyOn(catsService, 'create').mockResolvedValue(createdCat);

      expect(await controller.create(createCatDto)).toEqual(createdCat);
    });
  });

  describe('findOne', () => {
    it('should return the specified cat', async () => {
      const catId = 1;
      const cat: Cat = { id: catId, name: 'Felix', age: 4, breed: 'Maine Coon' };
      jest.spyOn(catsService, 'getCatById').mockResolvedValue(cat);

      expect(await controller.findOne(catId)).toEqual(cat);
    });
  });

  describe('deleteCatById', () => {
    it('should delete the specified cat', async () => {
      const catId = 1;
      const response: IResponse = { message: `Successfully delete Cat with ${catId}`, status: 200 };
      jest.spyOn(catsService, 'deleteCatById').mockResolvedValue(response);

      expect(await controller.deleteCatById(catId)).toEqual(response);
    });
  });

  describe('updateCatById', () => {
    it('should update the specified cat', async () => {
      const catId = 1;
      const updateCatDto = { name: 'Tom', age: 3, breed: 'Siamese' };
      const updatedCat = { id: catId, ...updateCatDto };
      jest.spyOn(catsService, 'updateCatById').mockResolvedValue(updatedCat);

      expect(await controller.updateCatById(catId, updateCatDto)).toEqual(updatedCat);
    });
  });
});
