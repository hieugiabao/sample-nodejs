import { RefreshTokenRepository } from './refresh-token.repository';
import { AuthUserDto } from '@models/auth/auth-user.dto';
import { IRefreshToken } from '@entities/mongo-entities/refresh-token/refresh-token.interface';
import { TimeUtils } from '@common/utils/time-utils';
import { config } from '@config/app';
import RefreshTokenModel from '@entities/mongo-entities/refresh-token/refresh-token.entity';
import { UserRole } from '@entities/postgres-entities/user.entity';

jest.mock('@entities/mongo-entities/refresh-token/refresh-token.entity');

describe('RefreshTokenRepository', () => {
  let refreshTokenRepository: RefreshTokenRepository;

  beforeEach(() => {
    refreshTokenRepository = new RefreshTokenRepository();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('createRefreshToken', () => {
    it('should create a new refresh token document', async () => {
      const user: AuthUserDto = {
        id: 1,
        username: 'testuser',
        role: UserRole.User,
      } as any;

      const createSpy = jest.spyOn(RefreshTokenModel, 'create');

      const result = await refreshTokenRepository.createRefreshToken(user);

      expect(result).toBeDefined();
      expect(result).toEqual(expect.any(String));
      expect(createSpy).toHaveBeenCalledWith({
        token: result,
        TTL: TimeUtils.nextSeconds(
          Number(config.refresh_expires_in || 24 * 3600),
        ),
        authenticationId: `${user.id}:${user.username}:${user.role}`,
      });
    });
  });

  describe('updateRefreshToken', () => {
    it('should update the TTL of a refresh token document', async () => {
      const refreshToken = 'abc123';

      const findOneAndUpdateSpy = jest.spyOn(
        RefreshTokenModel,
        'findOneAndUpdate',
      );

      // mock the return value of findOneAndUpdate
      (findOneAndUpdateSpy as any).mockReturnValueOnce({
        exec: jest.fn().mockResolvedValueOnce(null),
      });

      await refreshTokenRepository.updateRefreshToken(refreshToken);

      expect(findOneAndUpdateSpy).toHaveBeenCalledWith(
        { token: refreshToken },
        {
          TTL: TimeUtils.nextSeconds(
            Number(config.refresh_expires_in || 24 * 3600),
          ),
        },
      );
    });
  });

  describe('getRefreshToken', () => {
    it('should return a refresh token document that matches the token and user', async () => {
      const token = 'abc123';
      const user: AuthUserDto = {
        id: 1,
        username: 'testuser',
        role: UserRole.User,
      } as any;
      const refresh: IRefreshToken = {
        token,
        TTL: TimeUtils.nextSeconds(
          Number(config.refresh_expires_in || 24 * 3600),
        ).toString(),
        authenticationId: `${user.id}:${user.username}:${user.role}`,
      } as any;

      const findOneSpy = jest
        .spyOn(RefreshTokenModel, 'findOne')
        .mockReturnValueOnce({
          exec: jest.fn().mockResolvedValueOnce(refresh),
        } as any);

      const result = await refreshTokenRepository.getRefreshToken(token, user);

      expect(findOneSpy).toHaveBeenCalledWith({
        token,
        TTL: { $gt: TimeUtils.currentSeconds() },
        authenticationId: `${user.id}:${user.username}:${user.role}`,
      });
      expect(result).toEqual(refresh);
    });

    it('should return null if no refresh token document is found', async () => {
      const token = 'abc123';
      const user: AuthUserDto = {
        id: 1,
        username: 'testuser',
        role: UserRole.User,
      } as any;

      const findOneSpy = jest
        .spyOn(RefreshTokenModel, 'findOne')
        .mockReturnValueOnce({
          exec: jest.fn().mockResolvedValueOnce(null),
        } as any);

      const result = await refreshTokenRepository.getRefreshToken(token, user);

      expect(findOneSpy).toHaveBeenCalledWith({
        token,
        TTL: { $gt: TimeUtils.currentSeconds() },
        authenticationId: `${user.id}:${user.username}:${user.role}`,
      });
      expect(result).toBeNull();
    });
  });

  describe('deleteRefreshToken', () => {
    it('should delete a refresh token document that matches the token', async () => {
      const token = 'abc123';

      const deleteOneSpy = jest.spyOn(RefreshTokenModel, 'deleteOne');

      // mock the return value of deleteOne
      (deleteOneSpy as any).mockReturnValueOnce({
        exec: jest.fn().mockResolvedValueOnce(null),
      });

      await refreshTokenRepository.deleteRefreshToken(token);

      expect(deleteOneSpy).toHaveBeenCalledWith({
        token,
      });
    });
  });

  describe('generateAuthenticationId', () => {
    it('should generate an authentication ID string based on the user', () => {
      const user: AuthUserDto = {
        id: 1,
        username: 'testuser',
        role: UserRole.User,
      } as any;

      const result = refreshTokenRepository.generateAuthenticationId(user);

      expect(result).toEqual(`${user.id}:${user.username}:${user.role}`);
    });

    it('should return "Anonymous" if no user is provided', () => {
      const result = refreshTokenRepository.generateAuthenticationId(null);

      expect(result).toEqual('Anonymous');
    });
  });
});
