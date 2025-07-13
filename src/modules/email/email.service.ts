import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as pug from 'pug';
import { EmailDataInterface } from './interfaces/emailData.interface';
@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('EMAIL_HOST'),
      port: this.configService.get<number>('EMAIL_PORT'),
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
      from: data.from ?? 'noreply@example.com',
      ...data,
    });
  }
}
