import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import axios from 'axios';
import { Alert } from './alert.entity';

const nodemailer = require('nodemailer');

@Injectable()
export class AlertService {
  private currentPrices = {};

  constructor(
    @InjectRepository(Alert) private alertRepo: Repository<Alert>,
  ) {}

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
}
