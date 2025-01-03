import { Controller, Get, Query } from '@nestjs/common';
import { PriceService } from './price.service';

@Controller('prices')
export class PriceController {
  constructor(private readonly priceService: PriceService) {}

  @Get('/hourly')
  async getHourlyPrices(@Query('chain') chain: string) {
    return await this.priceService.getHourlyPrices(chain);
  }
}
