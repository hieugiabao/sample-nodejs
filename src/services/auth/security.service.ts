import { ApiError } from '@models/api-error';
import { LoginRequest } from '@models/auth/params/login.request';
import { TokenResultDto } from '@models/auth/token-result.response';
import { ResponseCodeEnum } from '@models/enums/response-code.enum';
import { UserRepository } from '@repositories/user/user.repository';
import { compare, genSalt, hash } from 'bcrypt';
import { StatusCodes } from 'http-status-codes';
import { Service } from 'typedi';
import { AuthService } from './auth.service';
import { RegisterRequest } from '@models/auth/params/register.request';
import { config } from '@config/app';
import { LogoutRequest } from '@models/auth/params/logout.request';
import { RefreshTokenRepository } from '@repositories/refresh-token/refresh-token.repository';
import { RefreshTokenRequest } from '@models/auth/params/refresh-token.request';
import { AuthUserDto } from '@models/auth/auth-user.dto';

@Service()
export class SecurityService {
  constructor(
    private readonly authService: AuthService,
    private readonly userRepository: UserRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository,
  ) {}

  async login(dataBody: LoginRequest): Promise<TokenResultDto> {
    try {
      const user = await this.userRepository.findByUsername(dataBody.username);

      if (user === null) {
        throw new ApiError(
          StatusCodes.UNAUTHORIZED,
          ResponseCodeEnum.C0004,
          'Username or password is incorrect',
        );
      }

      const isMatched = await compare(dataBody.password, user.password);
      if (!isMatched) {
        throw new ApiError(
          StatusCodes.UNAUTHORIZED,
          ResponseCodeEnum.C0004,
          'Username or password is incorrect',
        );
      }

      return await this.authService.createToken(user);
    } catch (error) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        error._errorCode || ResponseCodeEnum.C0006,
      );
    }
  }

  async register(params: RegisterRequest): Promise<void> {
    const salt = await genSalt(config.jwt_salt);
    params.password = await hash(params.password, salt);
    await this.userRepository.save(params);
  }

  async logout(params: LogoutRequest): Promise<void> {
    await this.refreshTokenRepository.deleteRefreshToken(params.refreshToken);
  }

  async refresh(
    params: RefreshTokenRequest,
    user: AuthUserDto,
  ): Promise<TokenResultDto> {
    const refreshToken = await this.refreshTokenRepository.getRefreshToken(
      params.refreshToken,
      user,
    );
    if (refreshToken === null) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        ResponseCodeEnum.C0001,
        'Refresh token not found',
      );
    }
    try {
      const userEntity = await this.userRepository.findByUsername(
        user.username,
      );
      await this.refreshTokenRepository.deleteRefreshToken(params.refreshToken);
      return await this.authService.createToken(userEntity);
    } catch (error) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        error._errorCode || ResponseCodeEnum.C0006,
      );
    }
  }
}
