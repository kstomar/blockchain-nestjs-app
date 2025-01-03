import { Test, TestingModule } from '@nestjs/testing';
import { PriceService } from './price.service';
import { AlertService } from './../alert/alert.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Price } from './price.entity';
import { Alert } from './../alert/alert.entity';
import axios from 'axios';
import * as nodemailer from 'nodemailer';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

jest.mock('nodemailer');
const mockedNodemailer = nodemailer as jest.Mocked<typeof nodemailer>;

const mockPriceRepo = {
  save: jest.fn(),
  findOne: jest.fn(),
  createQueryBuilder: jest.fn().mockReturnValue({
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
  }),
};
describe('PriceService', () => {
  let service: PriceService;
  let alertService: AlertService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PriceService,
        AlertService,
        { provide: getRepositoryToken(Price), useValue: mockPriceRepo },
        { provide: getRepositoryToken(Alert), useValue: {} },
      ],
    }).compile();

    service = module.get<PriceService>(PriceService);
    alertService = module.get<AlertService>(AlertService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchPrices', () => {
    it('should fetch and save prices', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: [
          { usdPrice: 2000 }, // Ethereum
          { usdPrice: 1.5 }, // Polygon
        ],
      });

      mockPriceRepo.findOne.mockResolvedValue({
        price: 1950,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      });

      await service.fetchPrices();

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://deep-index.moralis.io/api/v2.2/erc20/prices',
        {
          tokens: [
            { token_address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2' },
            { token_address: '0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0' },
          ],
          chain: 'eth',
          include: 'percent_change',
        },
        { headers: { 'X-API-Key': process.env.MORALIS_API_KEY } },
      );

      expect(mockPriceRepo.save).toHaveBeenCalledTimes(2);
      expect(mockPriceRepo.save).toHaveBeenCalledWith({ chain: 'ethereum', price: 2000 });
      expect(mockPriceRepo.save).toHaveBeenCalledWith({ chain: 'polygon', price: 1.5 });
    });

    it('should send email if price increases by more than 3%', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: [
          { usdPrice: 2050 }, // Ethereum
          { usdPrice: 1.6 }, // Polygon
        ],
      });

      mockPriceRepo.findOne.mockResolvedValue({
        price: 1950,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      });

      const sendMailMock = jest.fn();
      mockedNodemailer.createTransport.mockReturnValue({
        sendMail: sendMailMock,
      });

      await service.fetchPrices();

      expect(sendMailMock).toHaveBeenCalledWith({
        from: process.env.EMAIL_USER,
        to: 'hyperhire_assignment@hyperhire.in',
        subject: 'Crypto Price Alert',
        text: 'ethereum price increased by 5.13%',
      });
    });
  });

  describe('getHourlyPrices', () => {
    it('should retrieve hourly prices', async () => {
      const prices = [
        { chain: 'ethereum', price: 2000, timestamp: new Date() },
        { chain: 'ethereum', price: 1950, timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000) },
      ];

      mockPriceRepo.createQueryBuilder().getMany.mockResolvedValue(prices);

      const result = await service.getHourlyPrices('ethereum');

      expect(result).toEqual(prices);
      expect(mockPriceRepo.createQueryBuilder).toHaveBeenCalled();
    });
  });
});
