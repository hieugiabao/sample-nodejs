import { ApiError } from '@models/api-error';
import { AuthUserDto } from '@models/auth/auth-user.dto';
import { ResponseCodeEnum } from '@models/enums/response-code.enum';
import { UpdateUserDto } from '@models/user/update-user.dto';
import { UserInformationDto } from '@models/user/user-information.dto';
import { UserRepository } from '@repositories/user/user.repository';
import { StatusCodes } from 'http-status-codes';
import { Service } from 'typedi';

@Service()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async getProfile(user: AuthUserDto): Promise<UserInformationDto> {
    return await this.userRepository.getProfile(user);
  }

  async updateProfile(
    user: AuthUserDto,
    dataBody: UpdateUserDto,
  ): Promise<UserInformationDto> {
    try {
      const res = await this.userRepository.update(user, dataBody);
      if (res === null) {
        throw new ApiError(
          StatusCodes.NOT_FOUND,
          ResponseCodeEnum.C0001,
          'User not found',
        );
      }
      return res;
    } catch (e) {
      throw new ApiError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        ResponseCodeEnum.C0006,
      );
    }
  }

  async deleteAccount(user: AuthUserDto): Promise<boolean> {
    return await this.userRepository.deleteAccount(user);
  }
}
