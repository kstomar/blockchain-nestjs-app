import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import axios from 'axios';
import * as cron from 'node-cron';
import { Price } from './price.entity';
import { AlertService } from './../alert/alert.service';

@Injectable()
export class PriceService implements OnModuleInit {
  private currentPrices = {};

  constructor(
    @InjectRepository(Price) private priceRepo: Repository<Price>,
    private readonly alertRepo: AlertService,
  ) {}

  async fetchPrices() {
    try {
      const moralisApiKey = process.env.MORALIS_API_KEY;
      const headers = { 'X-API-Key': moralisApiKey };

      // The list of token addresses for Ethereum and Polygon
      const tokens = [
        { token_address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2' },
        { token_address: '0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0' }
      ];

      // Post request to fetch token prices
      const response = await axios.post(
        'https://deep-index.moralis.io/api/v2.2/erc20/prices',
        {
          tokens,
          chain: 'eth', // Ethereum Chain
          include: 'percent_change', // Optional: Include percent change data
        },
        { headers }
      );
      const ethPrice = response.data[0]?.usdPrice;
      const polygonPrice = response.data[1]?.usdPrice;
      
      // If prices are available, update the currentPrices object
      if (ethPrice && polygonPrice) {
        this.currentPrices = {
          ethereum: ethPrice,
          polygon: polygonPrice,
        };

        // Save to the database
        await this.priceRepo.save({ chain: 'ethereum', price: ethPrice });
        await this.priceRepo.save({ chain: 'polygon', price: polygonPrice });
        [{ chain: 'ethereum', price: ethPrice }, { chain: 'polygon', price: polygonPrice }].forEach(async ({chain, price}) => {
          
          const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
          const previousPrice = await this.priceRepo.findOne({
            where: { chain, timestamp: LessThan(oneHourAgo) },
            order: { timestamp: 'DESC' },
          });

          if (previousPrice) {
            const percentageChange = ((price - previousPrice.price) / previousPrice.price) * 100;
            if (percentageChange > 3) {
              await this.alertRepo.sendEmail('hyperhire_assignment@hyperhire.in', `${chain} price increased by ${percentageChange.toFixed(2)}%`);
            }
          }
        })

      } else {
        console.error('Error: Price data is missing');
      }
    } catch (error) {
      console.error('Error fetching prices:', error.message);
    }
  }

  async getHourlyPrices(chain: string) {
    const result = await this.priceRepo
      .createQueryBuilder('price')
      .where('price.chain = :chain', { chain })
      .andWhere('price.timestamp >= NOW() - INTERVAL \'1 day\'')
      .orderBy('price.timestamp', 'ASC')
      .getMany();
  
    // The result from getMany() is already an array of Price instances.
    return result;
  }

  onModuleInit() {
    // Schedule periodic tasks
    cron.schedule('*/5 * * * *', async () => {
      await this.fetchPrices();
      await this.alertRepo.checkAlerts();
    });
  }
}
