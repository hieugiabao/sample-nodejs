import { Service } from 'typedi';
import VerifyCodeModel from '@entities/mongo-entities/verify-code/verify-code.entity';
import { TimeUtils } from '@common/utils/time-utils';

@Service()
export class VerifyCodeRepository {
  async createVerifyCode(accountId: number, email: string) {
    // Delete old code
    this.deleteVerifyCodes(email);

    // Generate code: 6 digits
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    const document = await VerifyCodeModel.create({
      code,
      expireIn: TimeUtils.nextSeconds(60 * 10),
      email,
      user_id: accountId,
    });

    return document;
  }

  async getVerifyCode(code: string, email: string) {
    const document = await VerifyCodeModel.findOne({
      code: code,
      email: email,
      expireIn: { $gt: TimeUtils.currentSeconds() },
    }).exec();
    return document;
  }

  async deleteVerifyCode(code: string, email: string) {
    await VerifyCodeModel.deleteOne({
      code,
      email,
    }).exec();
  }

  async deleteVerifyCodes(email: string) {
    await VerifyCodeModel.deleteMany({
      email,
    }).exec();
  }
}
