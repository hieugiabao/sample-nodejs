import { TimeUtils } from '@common/utils/time-utils';
import { config } from '@config/app';
import RefreshTokenModel from '@entities/mongo-entities/refresh-token/refresh-token.entity';
import { IRefreshToken } from '@entities/mongo-entities/refresh-token/refresh-token.interface';
import { AuthUserDto } from '@models/auth/auth-user.dto';
import { Service } from 'typedi';
import { v4 as uuid } from 'uuid';

@Service()
export class RefreshTokenRepository {
  /**
   * Create refresh token document
   */
  async createRefreshToken(user: AuthUserDto): Promise<string> {
    const authenticationId = this.generateAuthenticationId(user);
    const refreshToken = uuid();
    // await RefreshTokenModel.deleteMany({
    //   authenticationId,
    // }).exec();
    await RefreshTokenModel.create({
      token: refreshToken,
      TTL: TimeUtils.nextSeconds(
        Number(config.refresh_expires_in || 24 * 3600),
      ),
      authenticationId,
    });

    return refreshToken;
  }

  async updateRefreshToken(refreshToken: string): Promise<IRefreshToken> {
    const filter = {
      token: refreshToken,
    };

    const update = {
      TTL: TimeUtils.nextSeconds(
        Number(config.refresh_expires_in || 24 * 3600),
      ),
    };
    return await RefreshTokenModel.findOneAndUpdate(filter, update).exec();
  }

  async getRefreshToken(
    token: string,
    user: AuthUserDto,
  ): Promise<IRefreshToken> {
    const refresh = await RefreshTokenModel.findOne({
      token: token,
      TTL: { $gt: TimeUtils.currentSeconds() },
      authenticationId: this.generateAuthenticationId(user),
    }).exec();

    return refresh;
  }

  async deleteRefreshToken(token: string) {
    await RefreshTokenModel.deleteOne({
      token: token,
    }).exec();
  }

  generateAuthenticationId(user: AuthUserDto) {
    if (!user) {
      return 'Anonymous';
    }

    return `${user.id}:${user.username}:${user.role}`;
  }
}
