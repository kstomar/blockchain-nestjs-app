import { Test, TestingModule } from '@nestjs/testing';
import { SwapService } from './swap.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('SwapService', () => {
  let service: SwapService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SwapService
      ],
    }).compile();

    service = module.get<SwapService>(SwapService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getSwapRate', () => {
    it('should calculate swap rate and fee', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: { usdPrice: 2000 } }); // ETH price
      mockedAxios.get.mockResolvedValueOnce({ data: { usdPrice: 50000 } }); // BTC price

      const result = await service.getSwapRate(1); // 1 ETH

      expect(result).toEqual({
        btcAmount: 0.04,
        feeInEth: 0.03,
        feeInUsd: 60,
      });
    });
  });
});
