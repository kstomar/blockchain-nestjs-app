import { Controller, Post, Body } from '@nestjs/common';
import { AlertService } from './alert.service';

@Controller('alert')
export class AlertController {
  constructor(private readonly AlertService: AlertService) {}

  @Post('/')
  async setAlert(
    @Body() { chain, targetPrice, email }: { chain: string; targetPrice: number; email: string },
  ) {
    return this.AlertService.setAlert(chain, targetPrice, email);
  }
}
