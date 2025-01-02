import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PriceService } from './price.service';
import { PriceController } from './price.controller';
import { Alert } from './entities/alert.entity';
import { Price } from './entities/price.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Alert, Price])],
  controllers: [PriceController],
  providers: [PriceService],
})
export class PriceModule {}
