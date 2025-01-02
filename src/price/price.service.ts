import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import axios from 'axios';
import * as cron from 'node-cron';
import { Price } from './entities/price.entity';
import { Alert } from './entities/alert.entity';

const nodemailer = require('nodemailer');

@Injectable()
export class PriceService implements OnModuleInit {
  private currentPrices = {};

  constructor(
    @InjectRepository(Price) private priceRepo: Repository<Price>,
    @InjectRepository(Alert) private alertRepo: Repository<Alert>,
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
              await this.sendEmail('hyperhire_assignment@hyperhire.in', `${chain} price increased by ${percentageChange.toFixed(2)}%`);
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

  async checkAlerts() {
    const alerts = await this.alertRepo.find();

    for (const alert of alerts) {
      const price = this.currentPrices[alert.chain];
      if (price && price >= alert.targetPrice) {
        // Log alert (email integration can be added here)
        console.log(
          `Email to ${alert.email}: ${alert.chain} price is $${price}, above $${alert.targetPrice}`,
        );
        await this.sendEmail(alert.email, `${alert.chain} reached target price of ${alert.targetPrice}`);
        await this.alertRepo.remove(alert);
      }
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

  async sendEmail(to, content) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject: 'Crypto Price Alert',
      text: content,
    });
  }
   

  async setAlert(chain: string, targetPrice: number, email: string) {
    console.log(chain, targetPrice, email);
    const alert = this.alertRepo.create({ chain, targetPrice, email });
    return this.alertRepo.save(alert);
  }

  async getSwapRate(ethAmount: number) {
    const moralisApiKey = process.env.MORALIS_API_KEY;
    const headers = { 'X-API-Key': moralisApiKey };
    try {
      const ethResponse = await axios.get(
        'https://deep-index.moralis.io/api/v2.2/erc20/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2/price?chain=eth',
        { headers },
      );
      const ethPrice = ethResponse.data.usdPrice;
      console.log(ethPrice);

      const btcResponse = await axios.get(
        'https://deep-index.moralis.io/api/v2.2/erc20/0x2260fac5e5542a773aa44fbcfedf7c193bc2c599/price?chain=eth',
        { headers },
      );

      const btcPrice = btcResponse.data.usdPrice;
      console.log(ethPrice, btcPrice);
      // Calculate the BTC amount
      const btcAmount = (ethAmount * ethPrice) / btcPrice;

      // Calculate the fee (3%)
      const fee = ethAmount * 0.03;

      return {
        btcAmount,
        feeInEth: fee,
        feeInUsd: fee * ethPrice,
      };
    } catch (error) {
      console.error('Error fetching swap rate:', error.message);
      throw new Error('Unable to fetch swap rate');
    }
  }

  onModuleInit() {
    // Schedule periodic tasks
    cron.schedule('*/5 * * * *', async () => {
      await this.fetchPrices();
      await this.checkAlerts();
    });
  }
}
