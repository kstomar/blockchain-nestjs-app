import { Test, TestingModule } from '@nestjs/testing';
import { AlertService } from './alert.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Alert } from './alert.entity';
import axios from 'axios';
import * as nodemailer from 'nodemailer';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

jest.mock('nodemailer');
const mockedNodemailer = nodemailer as jest.Mocked<typeof nodemailer>;

const mockAlertRepo = {
  find: jest.fn(),
  save: jest.fn(),
  create: jest.fn().mockImplementation((dto) => dto),
  remove: jest.fn(),
};

describe('AlertService', () => {
  let service: AlertService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AlertService,
        { provide: getRepositoryToken(Alert), useValue: mockAlertRepo },
      ],
    }).compile();

    service = module.get<AlertService>(AlertService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('checkAlerts', () => {
    it('should send email if target price is met', async () => {
      mockAlertRepo.find.mockResolvedValue([
        { chain: 'ethereum', targetPrice: 2000, email: 'test@example.com' },
      ]);

      service['currentPrices'] = { ethereum: 2050 };

      const sendMailMock = jest.fn();
      mockedNodemailer.createTransport.mockReturnValue({
        sendMail: sendMailMock,
      });

      await service.checkAlerts();

      expect(sendMailMock).toHaveBeenCalledWith({
        from: process.env.EMAIL_USER,
        to: 'test@example.com',
        subject: 'Crypto Price Alert',
        text: 'ethereum reached target price of 2000',
      });

      expect(mockAlertRepo.remove).toHaveBeenCalledWith({
        chain: 'ethereum',
        targetPrice: 2000,
        email: 'test@example.com',
      });
    });
  });

  describe('setAlert', () => {
    it('should create and save a new alert', async () => {
      const alert = { chain: 'ethereum', targetPrice: 2000, email: 'test@example.com' };

      await service.setAlert(alert.chain, alert.targetPrice, alert.email);

      expect(mockAlertRepo.create).toHaveBeenCalledWith(alert);
      expect(mockAlertRepo.save).toHaveBeenCalledWith(alert);
    });
  });
});