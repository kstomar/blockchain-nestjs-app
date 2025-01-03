import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class SwapService {

  async getSwapRate(ethAmount: number) {
    const moralisApiKey = process.env.MORALIS_API_KEY;
    const headers = { 'X-API-Key': moralisApiKey };
    try {
      const ethResponse = await axios.get(
        'https://deep-index.moralis.io/api/v2.2/erc20/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2/price?chain=eth',
        { headers },
      );
      const ethPrice = ethResponse.data.usdPrice;
      console.log("--------",ethPrice);
  
      const btcResponse = await axios.get(
        'https://deep-index.moralis.io/api/v2.2/erc20/0x2260fac5e5542a773aa44fbcfedf7c193bc2c599/price?chain=eth',
        { headers },
      );
  
      const btcPrice = btcResponse.data.usdPrice;
      console.log(ethPrice, btcPrice);
      const btcAmount = (ethAmount * ethPrice) / btcPrice;
  
      const fee = ethAmount * 0.03;
      console.log(btcAmount, fee);
      return {
        btcAmount,
        feeInEth: fee,
        feeInUsd: fee * ethPrice,
      };
    } catch (error: Error | any) {
      console.error('Error fetching swap rate:', error.message);
      throw new Error('Unable to fetch swap rate');
    }
  }
}