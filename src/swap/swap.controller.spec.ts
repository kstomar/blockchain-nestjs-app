import { Test, TestingModule } from '@nestjs/testing';
import { SwapController } from './swap.controller';
import { SwapService } from './swap.service';

describe('SwapController', () => {
  let controller: SwapController;
  let service: SwapService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SwapController],
      providers: [
        {
          provide: SwapService,
          useValue: {
            getSwapRate: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<SwapController>(SwapController);
    service = module.get<SwapService>(SwapService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
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
