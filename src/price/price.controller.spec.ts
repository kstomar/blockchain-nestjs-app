import { Test, TestingModule } from '@nestjs/testing';
import { PriceController } from './price.controller';
import { PriceService } from './price.service';

describe('PriceController', () => {
  let controller: PriceController;
  let service: PriceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PriceController],
      providers: [
        {
          provide: PriceService,
          useValue: {
            getHourlyPrices: jest.fn(),
            setAlert: jest.fn(),
            getSwapRate: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<PriceController>(PriceController);
    service = module.get<PriceService>(PriceService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getHourlyPrices', () => {
    it('should return hourly prices', async () => {
      const mockPrices = [{ id: 1, chain: 'ethereum', price: 2000, timestamp: new Date() }];
      jest.spyOn(service, 'getHourlyPrices').mockResolvedValue(mockPrices);

      const result = await controller.getHourlyPrices('ethereum');
      expect(result).toEqual(mockPrices);
    });
  });
});
