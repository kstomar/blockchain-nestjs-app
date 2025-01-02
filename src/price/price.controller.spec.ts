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

  describe('setAlert', () => {
    it('should call setAlert on the service', async () => {
      const mockAlert = { id: 1, chain: 'ethereum', targetPrice: 1500, email: 'test@example.com', timestamp: new Date() };
      jest.spyOn(service, 'setAlert').mockResolvedValue(mockAlert);

      const result = await controller.setAlert(mockAlert);
      expect(result).toEqual(mockAlert);
    });
  });

  describe('getSwapRate', () => {
    it('should return swap rate', async () => {
      const mockRate = { btcAmount: 0.05, feeInEth: 0.003, feeInUsd: 6 };
      jest.spyOn(service, 'getSwapRate').mockResolvedValue(mockRate);

      const result = await controller.getSwapRate(1);
      expect(result).toEqual(mockRate);
    });
  });
});
