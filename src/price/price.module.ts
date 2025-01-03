import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PriceService } from './price.service';
import { AlertService } from './../alert/alert.service';
import { PriceController } from './price.controller';
import { Price } from './price.entity';
import { Alert } from 'src/alert/alert.entity';


@Module({
  imports: [TypeOrmModule.forFeature([Price, Alert])],
  controllers: [PriceController],
  providers: [PriceService, AlertService],
})
export class PriceModule {}
