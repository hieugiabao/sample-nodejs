import { AuthService } from './auth.service';
import { JwtService } from './jwt.service';
import { UserRepository } from '@repositories/user/user.repository';
import { RefreshTokenRepository } from '@repositories/refresh-token/refresh-token.repository';
import { UserEntity, UserRole } from '@entities/postgres-entities/user.entity';
import { TokenResultDto } from '@models/auth/token-result.response';
import { UserInformationDto } from '@models/user/user-information.dto';
import { ApiError } from '@models/api-error';
import { StatusCodes } from 'http-status-codes';
import { ResponseCodeEnum } from '@models/enums/response-code.enum';
import { AuthUserDto } from '@models/auth/auth-user.dto';

describe('AuthService', () => {
  let authService: AuthService;
  let jwtService: JwtService;
  let userRepository: UserRepository;
  let refreshTokenRepository: RefreshTokenRepository;

  beforeEach(() => {
    jwtService = new JwtService();
    userRepository = new UserRepository(null);
    refreshTokenRepository = new RefreshTokenRepository();
    authService = new AuthService(
      jwtService,
      userRepository,
      refreshTokenRepository,
    );
  });

  describe('verifyToken', () => {
    it('should return an AuthUserDto object if the token is valid', async () => {
      // Arrange
      const token = await jwtService.signAsync({ email: 'test@example.com' });
      const user = new UserEntity();
      user.email = 'test@example.com';
      userRepository.findByEmail = jest.fn().mockResolvedValue(user);

      // Act
      const result = await authService.verifyToken(token);

      // Assert
      expect(result).toBeInstanceOf(AuthUserDto);
      expect(result.email).toBe(user.email);
    });

    it('should throw an ApiError if the token is invalid', async () => {
      // Arrange
      const token = 'invalid-token';
      userRepository.findByEmail = jest.fn().mockResolvedValue(null);

      // Act & Assert
      await expect(authService.verifyToken(token)).rejects.toThrow(
        new ApiError(
          StatusCodes.UNAUTHORIZED,
          ResponseCodeEnum.C0004,
          'Invalid token',
        ),
      );
    });

    it('should throw an ApiError if the user is not found', async () => {
      // Arrange
      const token = await jwtService.signAsync({ email: 'test@example.com' });
      userRepository.findByEmail = jest.fn().mockResolvedValue(null);

      // Act & Assert
      await expect(authService.verifyToken(token)).rejects.toThrow(
        new ApiError(
          StatusCodes.UNAUTHORIZED,
          ResponseCodeEnum.C0004,
          'Invalid token',
        ),
      );
    });
  });

  describe('createToken', () => {
    it('should return a TokenResultDto object with a valid token', async () => {
      // Arrange
      const user = new UserEntity();
      user.email = 'test@example.com';
      user.username = 'testuser';
      user.role = UserRole.User;

      refreshTokenRepository.createRefreshToken = jest
        .fn()
        .mockResolvedValue('refresh-token');

      // Act
      const result = await authService.createToken(user);

      // Assert
      expect(result).toBeInstanceOf(TokenResultDto);
      expect(result.token).toBeDefined();
      expect(result.user).toBeInstanceOf(UserInformationDto);
      expect(result.user.email).toBe(user.email);
      expect(result.user.username).toBe(user.username);
      expect(result.refreshToken).toBe('refresh-token');
      expect(result.tokenType).toBe('Bearer');
      expect(result.expiresIn).toBeDefined();
    });
  });
});
