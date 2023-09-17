import { ApiError } from '@models/api-error';
import { AuthUserDto } from '@models/auth/auth-user.dto';
import { ResponseCodeEnum } from '@models/enums/response-code.enum';
import { UpdateUserDto } from '@models/user/update-user.dto';
import { UserInformationDto } from '@models/user/user-information.dto';
import { UserRepository } from '@repositories/user/user.repository';
import { StatusCodes } from 'http-status-codes';
import { UserService } from './user.service';

describe('UserService', () => {
  let userService: UserService;
  let userRepository: UserRepository;

  beforeEach(() => {
    userRepository = new UserRepository(null);
    userService = new UserService(userRepository);
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      const user: AuthUserDto = { id: 1 } as any;
      const expectedProfile: UserInformationDto = {
        id: 1,
        name: 'John Doe',
        email: 'john.doe@example.com',
      } as any;
      jest
        .spyOn(userRepository, 'getProfile')
        .mockResolvedValue(expectedProfile);

      const profile = await userService.getProfile(user);

      expect(profile).toEqual(expectedProfile);
      expect(userRepository.getProfile).toHaveBeenCalledWith(user);
    });
  });

  describe('updateProfile', () => {
    it('should update user profile', async () => {
      const user: AuthUserDto = { id: 1 } as any;
      const dataBody: UpdateUserDto = { name: 'Jane Doe' };
      const expectedProfile: UserInformationDto = {
        id: 1,
        name: 'Jane Doe',
        email: 'john.doe@example.com',
      } as any;
      jest.spyOn(userRepository, 'update').mockResolvedValue(expectedProfile);

      const profile = await userService.updateProfile(user, dataBody);

      expect(profile).toEqual(expectedProfile);
      expect(userRepository.update).toHaveBeenCalledWith(user, dataBody);
    });

    it('should throw ApiError with NOT_FOUND status code if user is not found', async () => {
      const user: AuthUserDto = { id: 1 } as any;
      const dataBody: UpdateUserDto = { name: 'Jane Doe' };
      jest.spyOn(userRepository, 'update').mockResolvedValue(null);

      await expect(userService.updateProfile(user, dataBody)).rejects.toThrow(
        new ApiError(
          StatusCodes.NOT_FOUND,
          ResponseCodeEnum.C0001,
          'User not found',
        ),
      );
      expect(userRepository.update).toHaveBeenCalledWith(user, dataBody);
    });

    it('should throw ApiError with INTERNAL_SERVER_ERROR status code if an error occurs', async () => {
      const user: AuthUserDto = { id: 1 } as any;
      const dataBody: UpdateUserDto = { name: 'Jane Doe' };
      jest.spyOn(userRepository, 'update').mockRejectedValue(new Error());

      await expect(userService.updateProfile(user, dataBody)).rejects.toThrow();
      expect(userRepository.update).toHaveBeenCalledWith(user, dataBody);
    });
  });

  describe('deleteAccount', () => {
    it('should delete user account', async () => {
      const user: AuthUserDto = { id: 1 } as any;
      jest.spyOn(userRepository, 'deleteAccount').mockResolvedValue(true);

      const result = await userService.deleteAccount(user);

      expect(result).toBe(true);
      expect(userRepository.deleteAccount).toHaveBeenCalledWith(user);
    });
  });
});
