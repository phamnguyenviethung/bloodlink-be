import * as nodemailer from 'nodemailer';
import * as pug from 'pug';

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { EmailDataInterface } from './interfaces/emailData.interface';
import { ThankYouDonorEmailData } from './interfaces/thankYouDonorEmailData.interface';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('EMAIL_PASS'),
      },
    });
  }

  public convertToHTML(template: string, context: object): string {
    const html = pug.renderFile(`src/templates/${template}.pug`, context);
    return html;
  }

  async sendEmail(data: EmailDataInterface): Promise<void> {
    await this.transporter.sendMail({
      from: data.from ?? 'noreply@bloodlink.site',
      ...data,
    });
  }

  async sendThankYouDonorEmail(
    donorEmail: string,
    data: ThankYouDonorEmailData,
  ): Promise<void> {
    const html = this.convertToHTML('blood-unit/thankYouDonor', data);

    await this.sendEmail({
      to: donorEmail,
      subject: 'BloodLink - Máu của bạn đã cứu sống một người! 🚨',
      html,
    });
  }
}
