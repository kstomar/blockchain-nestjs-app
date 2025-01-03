import { Controller, Get, Query } from '@nestjs/common';
import { SwapService } from './swap.service';

@Controller('swap')
export class SwapController {
  constructor(private readonly swapService: SwapService) {}

  @Get('/')
  async getSwapRate(@Query('ethAmount') ethAmount: number) {
    return await this.swapService.getSwapRate(ethAmount);
  }
}
