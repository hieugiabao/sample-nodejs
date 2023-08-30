import { RefreshTokenRepository } from './../../repositories/refresh-token/refresh-token.repository';
import { UserEntity } from '@entities/postgres-entities/user.entity';
import { TokenResultDto } from '@models/auth/token-result.response';
import { UserInformationDto } from '@models/user/user-information.dto';
import { plainToInstance } from 'class-transformer';
import { Service } from 'typedi';
import { JwtService } from './jwt.service';
import { UserRepository } from '@repositories/user/user.repository';
import { ApiError } from '@models/api-error';
import { StatusCodes } from 'http-status-codes';
import { ResponseCodeEnum } from '@models/enums/response-code.enum';
import { AuthUserDto } from '@models/auth/auth-user.dto';
import { config } from '@config/app';

@Service()
export class AuthService {
  public constructor(
    private jwtService: JwtService,
    private readonly userRepository: UserRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository,
  ) {}

  async createToken(user: UserEntity): Promise<TokenResultDto> {
    const tokenResult = new TokenResultDto();
    tokenResult.token = await this.jwtService.signAsync({
      email: user.email,
      username: user.username,
      role: user.role,
    });
    tokenResult.user = plainToInstance(UserInformationDto, user, {
      excludeExtraneousValues: true,
    });
    tokenResult.refreshToken =
      await this.refreshTokenRepository.createRefreshToken(user);
    tokenResult.tokenType = 'Bearer';
    tokenResult.expiresIn = Number(config.jwt_expires_in);

    return tokenResult;
  }

  async verifyToken(token: string): Promise<AuthUserDto> {
    try {
      const payload = this.jwtService.verifyAsync(token);
      const user = await this.userRepository.findByEmail(payload.email);
      if (user === null) {
        throw new ApiError(
          StatusCodes.UNAUTHORIZED,
          ResponseCodeEnum.C0004,
          'Invalid token',
        );
      }
      return plainToInstance(AuthUserDto, user, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      console.log(error);
      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        ResponseCodeEnum.C0004,
        'Invalid token',
      );
    }
  }
}
