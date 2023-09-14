import { logger } from '@common/logger';
import { config } from '@config/app';
import { readFileSync } from 'fs';
import { compile } from 'handlebars';
import { SendMailOptions, Transporter, createTransport } from 'nodemailer';
import path from 'path';
import { Service } from 'typedi';

export type Options = Pick<
  SendMailOptions,
  'to' | 'cc' | 'bcc' | 'subject' | 'text'
> &
  (
    | {
        html: string;
      }
    | {
        template: string;
        replacements: Record<string, string>;
      }
  );

@Service()
export class MailService {
  private transporter: Transporter;

  constructor() {
    this.transporter = createTransport({
      host: config.email.host,
      port: Number(config.email.port),
      secure: false,
      auth: {
        user: config.email.username,
        pass: config.email.password,
      },
    });
  }

  async sendMail(options: Options): Promise<boolean> {
    try {
      let msg: SendMailOptions = {
        from: config.email.sender,
      };
      if ('html' in options) {
        msg = {
          ...msg,
          ...options,
        };
      } else {
        const htmlFile = readFileSync(
          path.join(
            __dirname,
            `../../../resources/email-templates/${options.template}.html`,
          ),
          {
            encoding: 'utf-8',
          },
        );
        if (!htmlFile) logger.error('HTML template not found');

        const template = compile(htmlFile);
        const htmlToSend = template(options.replacements);
        msg = {
          ...msg,
          to: options.to,
          subject: options.subject,
          cc: options.cc,
          bcc: options.bcc,
          text: options.text,
          html: htmlToSend,
        };
      }

      await this.transporter.sendMail(msg);
      logger.info(`An email has been send to`, options.to);
      return true;
    } catch (error) {
      logger.error('Error when sending email', JSON.stringify(error));
      return false;
    }
  }
}
