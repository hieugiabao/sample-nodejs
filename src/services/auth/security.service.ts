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
import { MailService } from '@services/mail/mail.service';
import { VerifyCodeRepository } from '@repositories/verify-code/verify-code.repository';

@Service()
export class SecurityService {
  constructor(
    private readonly authService: AuthService,
    private readonly userRepository: UserRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly verifyCodeRepository: VerifyCodeRepository,
    private readonly mailService: MailService,
  ) {}

  async login(dataBody: LoginRequest): Promise<TokenResultDto> {
    const user = await this.userRepository.findByUsername(dataBody.username);

    if (user === null) {
      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        ResponseCodeEnum.C0004,
        'Username or password is incorrect',
      );
    }
    if (!(await this.verify(user.password, dataBody.password))) {
      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        ResponseCodeEnum.C0004,
        'Username or password is incorrect',
      );
    }

    try {
      return await this.authService.createToken(user);
    } catch (error) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        error._errorCode || ResponseCodeEnum.C0006,
      );
    }
  }

  async register(params: RegisterRequest): Promise<void> {
    params.password = await this.hash(params.password);
    await this.userRepository.createUser(params);
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

  async changePassword(
    user: AuthUserDto,
    oldPassword: string,
    newPassword: string,
  ): Promise<boolean> {
    const userEntity = await this.userRepository.findByUsername(user.username);
    if (!(await this.verify(userEntity.password, oldPassword))) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        ResponseCodeEnum.C0005,
        'Old password is incorrect',
      );
    }

    await this.userRepository.update(user, {
      password: await this.hash(newPassword),
    });
    return true;
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.userRepository.findByEmail(email);
    if (user !== null) {
      const verifyCode = await this.verifyCodeRepository.createVerifyCode(
        user.id,
        email,
      );
      const isSuccess = await this.mailService.sendMail({
        to: {
          name: user.username,
          address: email,
        },
        subject: 'Reset your password',
        template: 'forgot-password',
        replacements: {
          username: user.username,
          email: email,
          code: verifyCode.code,
          codeHash: await this.hash(verifyCode.code),
        },
      });

      if (!isSuccess) {
        throw new ApiError(
          StatusCodes.INTERNAL_SERVER_ERROR,
          ResponseCodeEnum.C0000,
          'Some error occurred while sending email',
        );
      }
    }
  }

  async resetPassword(
    email: string,
    code: string,
    newPassword: string,
  ): Promise<void> {
    const verifyCode = await this.verifyCodeRepository.getVerifyCode(
      code,
      email,
    );
    if (verifyCode === null) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        ResponseCodeEnum.C0001,
        'Verify code not found or expired',
      );
    }

    const user = await this.userRepository.findByEmail(email);
    if (user === null) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        ResponseCodeEnum.C0001,
        'User not found',
      );
    }

    await this.userRepository.update(user, {
      password: await this.hash(newPassword),
    });

    await this.verifyCodeRepository.deleteVerifyCode(email, code);

    // await this.mailService.sendMail({
    //   to: {
    //     name: user.username,
    //     address: email,
    //   },
    //   subject: 'Reset password success',
    //   template: 'reset-password-success',
    //   replacements: {
    //     username: user.username,
    //     email: email,
    //   },
    // });
  }

  private async verify(
    hashPassword: string,
    rawPassword: string,
  ): Promise<boolean> {
    return await compare(rawPassword, hashPassword);
  }

  private async hash(password: string): Promise<string> {
    const salt = await genSalt(config.jwt_salt);
    return await hash(password, salt);
  }
}
