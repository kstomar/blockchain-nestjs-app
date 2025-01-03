import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SwapService } from './swap.service';
import { SwapController } from './swap.controller';
import { SwapDTO } from './swap.dto';

@Module({
  imports: [TypeOrmModule.forFeature([SwapDTO])],
  providers: [SwapService],
  controllers: [SwapController],
})
export class SwapModule {}