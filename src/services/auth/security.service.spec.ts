import { ApiError } from '@models/api-error';
import { LoginRequest } from '@models/auth/params/login.request';
import { RegisterRequest } from '@models/auth/params/register.request';
import { LogoutRequest } from '@models/auth/params/logout.request';
import { RefreshTokenRequest } from '@models/auth/params/refresh-token.request';
import { TokenResultDto } from '@models/auth/token-result.response';
import { AuthUserDto } from '@models/auth/auth-user.dto';
import { ResponseCodeEnum } from '@models/enums/response-code.enum';
import { UserRepository } from '@repositories/user/user.repository';
import { RefreshTokenRepository } from '@repositories/refresh-token/refresh-token.repository';
import { VerifyCodeRepository } from '@repositories/verify-code/verify-code.repository';
import { AuthService } from './auth.service';
import { MailService } from '@services/mail/mail.service';
import { SecurityService } from './security.service';
import { StatusCodes } from 'http-status-codes';

describe('SecurityService', () => {
  let authService: AuthService;
  let userRepository: UserRepository;
  let refreshTokenRepository: RefreshTokenRepository;
  let verifyCodeRepository: VerifyCodeRepository;
  let mailService: MailService;
  let securityService: SecurityService;

  beforeEach(() => {
    userRepository = new UserRepository(null);
    refreshTokenRepository = new RefreshTokenRepository();
    authService = new AuthService(null, userRepository, refreshTokenRepository);
    verifyCodeRepository = new VerifyCodeRepository();
    mailService = new MailService();
    securityService = new SecurityService(
      authService,
      userRepository,
      refreshTokenRepository,
      verifyCodeRepository,
      mailService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should throw an error if the user is not found', async () => {
      // Arrange
      const dataBody: LoginRequest = {
        username: 'nonexistentuser',
        password: 'password',
      };
      jest.spyOn(userRepository, 'findByUsername').mockResolvedValueOnce(null);

      // Act & Assert
      await expect(securityService.login(dataBody)).rejects.toThrow(
        new ApiError(
          StatusCodes.UNAUTHORIZED,
          ResponseCodeEnum.C0004,
          'Username or password is incorrect',
        ),
      );
    });

    it('should throw an error if the password is incorrect', async () => {
      // Arrange
      const dataBody: LoginRequest = {
        username: 'existinguser',
        password: 'wrongpassword',
      };
      const user = { username: 'existinguser', password: 'incorrectpassword' };
      jest
        .spyOn(userRepository, 'findByUsername')
        .mockResolvedValueOnce(user as any);
      jest
        .spyOn(SecurityService.prototype as any, 'verify')
        .mockReturnValueOnce(false);

      // Act & Assert
      await expect(securityService.login(dataBody)).rejects.toThrow(
        new ApiError(
          StatusCodes.UNAUTHORIZED,
          ResponseCodeEnum.C0004,
          'Username or password is incorrect',
        ),
      );
    });

    it('should return a token if the username and password are correct', async () => {
      // Arrange
      const dataBody: LoginRequest = {
        username: 'existinguser',
        password: 'correctpassword',
      };
      const user = { username: 'existinguser', password: 'correctpassword' };
      const tokenResult: TokenResultDto = {
        token: 'access_token',
        refreshToken: 'refresh_token',
        expiresIn: 3600,
        tokenType: 'Bearer',
        user: { username: 'existinguser' } as any,
      };
      jest
        .spyOn(userRepository, 'findByUsername')
        .mockResolvedValueOnce(user as any);
      jest
        .spyOn(SecurityService.prototype as any, 'verify')
        .mockResolvedValueOnce(true);
      jest.spyOn(authService, 'createToken').mockResolvedValueOnce(tokenResult);

      // Act
      const result = await securityService.login(dataBody);

      // Assert
      expect(result).toEqual(tokenResult);
      expect(authService.createToken).toHaveBeenCalledWith(user);
    });
  });

  describe('register', () => {
    it('should hash the password and create a new user', async () => {
      // Arrange
      const params: RegisterRequest = {
        username: 'newuser',
        password: 'password',
        email: 'newuser@example.com',
        confirmPassword: 'password',
      };
      jest
        .spyOn(SecurityService.prototype as any, 'hash')
        .mockResolvedValueOnce('hashedpassword');
      jest.spyOn(userRepository, 'createUser').mockResolvedValueOnce({
        ...params,
        password: 'hashedpassword',
      } as any);

      // Act
      await securityService.register(params);

      // Assert
      // expect(securityService.hash).toHaveBeenCalledWith(params.password);
      expect(userRepository.createUser).toHaveBeenCalledWith({
        ...params,
        password: 'hashedpassword',
      });
    });
  });

  describe('logout', () => {
    it('should delete the refresh token', async () => {
      // Arrange
      const params: LogoutRequest = { refreshToken: 'refresh_token' };
      jest
        .spyOn(refreshTokenRepository, 'deleteRefreshToken')
        .mockResolvedValueOnce();

      // Act
      await securityService.logout(params);

      // Assert
      expect(refreshTokenRepository.deleteRefreshToken).toHaveBeenCalledWith(
        params.refreshToken,
      );
    });
  });

  describe('refresh', () => {
    it('should throw an error if the refresh token is not found', async () => {
      // Arrange
      const params: RefreshTokenRequest = { refreshToken: 'refresh_token' };
      const user: AuthUserDto = { username: 'existinguser' } as any;
      jest
        .spyOn(refreshTokenRepository, 'getRefreshToken')
        .mockResolvedValueOnce(null);

      // Act & Assert
      await expect(securityService.refresh(params, user)).rejects.toThrow(
        new ApiError(
          StatusCodes.NOT_FOUND,
          ResponseCodeEnum.C0001,
          'Refresh token not found',
        ),
      );
    });

    it('should delete the refresh token and return a new token', async () => {
      // Arrange
      const params: RefreshTokenRequest = { refreshToken: 'refresh_token' };
      const user: AuthUserDto = { username: 'existinguser' } as any;
      const refreshToken = { id: 1, token: 'refresh_token', user };
      const userEntity = {
        username: 'existinguser',
        password: 'correctpassword',
      };
      const tokenResult: TokenResultDto = {
        token: 'access_token',
        refreshToken: 'new_refresh_token',
        expiresIn: 3600,
        tokenType: 'Bearer',
        user: { username: 'existinguser' } as any,
      };
      jest
        .spyOn(refreshTokenRepository, 'getRefreshToken')
        .mockResolvedValueOnce(refreshToken as any);
      jest
        .spyOn(userRepository, 'findByUsername')
        .mockResolvedValueOnce(userEntity as any);
      jest.spyOn(authService, 'createToken').mockResolvedValueOnce(tokenResult);
      jest
        .spyOn(refreshTokenRepository, 'deleteRefreshToken')
        .mockResolvedValueOnce();

      // Act
      const result = await securityService.refresh(params, user);

      // Assert
      expect(userRepository.findByUsername).toHaveBeenCalledWith(user.username);
      expect(refreshTokenRepository.deleteRefreshToken).toHaveBeenCalledWith(
        params.refreshToken,
      );
      expect(refreshTokenRepository.getRefreshToken).toHaveBeenCalledWith(
        params.refreshToken,
        user,
      );
      expect(authService.createToken).toHaveBeenCalledWith(userEntity);
      expect(result).toEqual(tokenResult);
    }, 10000);
  });

  describe('changePassword', () => {
    it('should throw an error if the old password is incorrect', async () => {
      // Arrange
      const user: AuthUserDto = { username: 'existinguser' } as any;
      const oldPassword = 'wrongpassword';
      const newPassword = 'newpassword';
      const userEntity = {
        username: 'existinguser',
        password: 'correctpassword',
      };
      jest
        .spyOn(userRepository, 'findByUsername')
        .mockResolvedValueOnce(userEntity as any);
      jest
        .spyOn(SecurityService.prototype as any, 'verify')
        .mockResolvedValueOnce(false);

      // Act & Assert
      await expect(
        securityService.changePassword(user, oldPassword, newPassword),
      ).rejects.toThrow(
        new ApiError(
          StatusCodes.BAD_REQUEST,
          ResponseCodeEnum.C0005,
          'Old password is incorrect',
        ),
      );
    });

    it('should update the password if the old password is correct', async () => {
      // Arrange
      const user: AuthUserDto = { username: 'existinguser' } as any;
      const oldPassword = 'correctpassword';
      const newPassword = 'newpassword';
      const userEntity = {
        username: 'existinguser',
        password: 'correctpassword',
      };
      jest
        .spyOn(userRepository, 'findByUsername')
        .mockResolvedValueOnce(userEntity as any);
      const verifySpy = jest
        .spyOn(SecurityService.prototype as any, 'verify')
        .mockResolvedValueOnce(true);
      const hashSpy = jest
        .spyOn(SecurityService.prototype as any, 'hash')
        .mockResolvedValueOnce('hashedpassword');
      jest.spyOn(userRepository, 'update').mockResolvedValueOnce({
        ...userEntity,
      } as any);

      // Act
      const result = await securityService.changePassword(
        user,
        oldPassword,
        newPassword,
      );

      // Assert
      expect(verifySpy).toHaveBeenCalledWith(userEntity.password, oldPassword);
      expect(hashSpy).toHaveBeenCalledWith(newPassword);
      expect(userRepository.update).toHaveBeenCalledWith(user, {
        password: 'hashedpassword',
      });
      expect(result).toBe(true);
    });
  });

  describe('forgotPassword', () => {
    it('should send email with verify code if user exists', async () => {
      const email = 'test@example.com';
      const user = { id: 1, username: 'testuser' };
      const verifyCode = { code: '123456' };
      const hash = 'hash123';

      jest.spyOn(userRepository, 'findByEmail').mockResolvedValue(user as any);
      jest
        .spyOn(verifyCodeRepository, 'createVerifyCode')
        .mockResolvedValue(verifyCode as any);
      const hashSpy = jest
        .spyOn(SecurityService.prototype as any, 'hash')
        .mockResolvedValue(hash);
      jest.spyOn(mailService, 'sendMail').mockResolvedValue(true);

      await securityService.forgotPassword(email);

      expect(userRepository.findByEmail).toHaveBeenCalledWith(email);
      expect(verifyCodeRepository.createVerifyCode).toHaveBeenCalledWith(
        user.id,
        email,
      );
      expect(hashSpy).toHaveBeenCalledWith(verifyCode.code);
      expect(mailService.sendMail).toHaveBeenCalledWith({
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
          codeHash: hash,
        },
      });
    });

    it('should not send email if user does not exist', async () => {
      const email = 'test@example.com';

      jest.spyOn(userRepository, 'findByEmail').mockResolvedValue(null);
      jest.spyOn(verifyCodeRepository, 'createVerifyCode');
      const hashSpy = jest.spyOn(SecurityService.prototype as any, 'hash');
      jest.spyOn(mailService, 'sendMail');

      await securityService.forgotPassword(email);

      expect(userRepository.findByEmail).toHaveBeenCalledWith(email);
      expect(verifyCodeRepository.createVerifyCode).not.toHaveBeenCalled();
      expect(hashSpy).not.toHaveBeenCalled();
      expect(mailService.sendMail).not.toHaveBeenCalled();
    });

    it('should throw an error if sending email fails', async () => {
      const email = 'test@example.com';
      const user = { id: 1, username: 'testuser' };
      const verifyCode = { code: '123456' };

      jest.spyOn(userRepository, 'findByEmail').mockResolvedValue(user as any);
      jest
        .spyOn(verifyCodeRepository, 'createVerifyCode')
        .mockResolvedValue(verifyCode as any);
      jest
        .spyOn(SecurityService.prototype as any, 'hash')
        .mockResolvedValue('hash123');
      jest.spyOn(mailService, 'sendMail').mockResolvedValue(false);

      await expect(securityService.forgotPassword(email)).rejects.toThrow();
    });
  });

  describe('resetPassword', () => {
    it('should reset the user password', async () => {
      // Arrange
      const email = 'test@example.com';
      const code = '123456';
      const newPassword = 'newPassword';

      // Mock the verifyCodeRepository to return a valid verify code
      verifyCodeRepository.getVerifyCode = jest.fn().mockResolvedValue({
        code,
        email,
        createdAt: new Date(),
      });

      // Mock the userRepository to return a valid user
      userRepository.findByEmail = jest.fn().mockResolvedValue({
        id: 1,
        username: 'testuser',
        email,
        password: 'oldPassword',
      });

      // Mock the userRepository update method to return a success
      userRepository.update = jest.fn().mockResolvedValue(true);

      // Mock the verifyCodeRepository deleteVerifyCode method to return a success
      verifyCodeRepository.deleteVerifyCode = jest.fn().mockResolvedValue(true);

      // Mock the hash method to return a hashed password
      const hashSpy = jest
        .spyOn(SecurityService.prototype as any, 'hash')
        .mockResolvedValue('hashedPassword');

      // Act
      await securityService.resetPassword(email, code, newPassword);

      // Assert
      expect(verifyCodeRepository.getVerifyCode).toHaveBeenCalledWith(
        code,
        email,
      );
      expect(userRepository.findByEmail).toHaveBeenCalledWith(email);
      expect(userRepository.update).toHaveBeenCalledWith(
        { id: 1, username: 'testuser', email, password: 'oldPassword' },
        { password: 'hashedPassword' }, // Ensure that the password has been updated
      );
      expect(verifyCodeRepository.deleteVerifyCode).toHaveBeenCalledWith(
        code,
        email,
      );
      expect(hashSpy).toHaveBeenCalledWith(newPassword);
    });

    it('should throw an error if the verify code is not found or expired', async () => {
      // Arrange
      const email = 'test@example.com';
      const code = '123456';
      const newPassword = 'newPassword';

      // Mock the verifyCodeRepository to return null
      verifyCodeRepository.getVerifyCode = jest.fn().mockResolvedValue(null);

      // Act and Assert
      await expect(
        securityService.resetPassword(email, code, newPassword),
      ).rejects.toThrowError('Verify code not found or expired');
    });

    it('should throw an error if the user is not found', async () => {
      // Arrange
      const email = 'test@example.com';
      const code = '123456';
      const newPassword = 'newPassword';

      // Mock the verifyCodeRepository to return a valid verify code
      verifyCodeRepository.getVerifyCode = jest.fn().mockResolvedValue({
        code,
        email,
        createdAt: new Date(),
      });

      // Mock the userRepository to return null
      userRepository.findByEmail = jest.fn().mockResolvedValue(null);

      // Act and Assert
      await expect(
        securityService.resetPassword(email, code, newPassword),
      ).rejects.toThrowError('User not found');
    });
  });
});
