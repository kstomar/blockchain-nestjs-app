import { Test, TestingModule } from '@nestjs/testing';
import { AlertController } from './alert.controller';
import { AlertService } from './alert.service';

describe('AlertController', () => {
  let controller: AlertController;
  let service: AlertService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AlertController],
      providers: [
        {
          provide: AlertService,
          useValue: {
            setAlert: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AlertController>(AlertController);
    service = module.get<AlertService>(AlertService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('setAlert', () => {
    it('should call setAlert on the service', async () => {
      const mockAlert = { id: 1, chain: 'ethereum', targetPrice: 1500, email: 'test@example.com', timestamp: new Date() };
      jest.spyOn(service, 'setAlert').mockResolvedValue(mockAlert);

      const result = await controller.setAlert(mockAlert);
      expect(result).toEqual(mockAlert);
    });
  });
});
