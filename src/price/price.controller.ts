import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { PriceService } from './price.service';

@Controller('prices')
export class PriceController {
  constructor(private readonly priceService: PriceService) {}

  @Get('/hourly')
  async getHourlyPrices(@Query('chain') chain: string) {
    return await this.priceService.getHourlyPrices(chain);
  }

  @Post('/alert')
  async setAlert(
    @Body() { chain, targetPrice, email }: { chain: string; targetPrice: number; email: string },
  ) {
    return this.priceService.setAlert(chain, targetPrice, email);
  }

  @Get('/swap-rate')
  async getSwapRate(@Query('amount') ethAmount: number) {
    return await this.priceService.getSwapRate(ethAmount);
  }
}
