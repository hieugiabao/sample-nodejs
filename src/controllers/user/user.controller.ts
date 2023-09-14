import { ApiError } from '@models/api-error';
import { AuthUserDto } from '@models/auth/auth-user.dto';
import { ApiEnum } from '@models/enums/api-category.enum';
import { ResponseCodeEnum } from '@models/enums/response-code.enum';
import { UpdateUserDto } from '@models/user/update-user.dto';
import { UserService } from '@services/user/user.service';
import { StatusCodes } from 'http-status-codes';
import {
  Authorized,
  Body,
  CurrentUser,
  Get,
  JsonController,
  OnNull,
  Put,
} from 'routing-controllers';
import { ApiOperationGet, ApiOperationPut, ApiPath } from 'swagger-express-ts';
import { Service } from 'typedi';

@Service()
@JsonController('/user')
@ApiPath({
  path: '/user',
  name: 'User',
  security: { BearerAuth: [] },
})
@Authorized()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(ApiEnum.PROFILE)
  @ApiOperationGet({
    path: ApiEnum.PROFILE,
    description: 'Get user profile',
    summary: 'Get user profile',
    responses: {
      200: {
        description: 'OK',
        model: 'UserInformationDto',
      },
    },
  })
  @OnNull(() => {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      ResponseCodeEnum.C0001,
      'User not found',
    );
  })
  async getProfile(@CurrentUser({ required: true }) user: AuthUserDto) {
    return await this.userService.getProfile(user);
  }

  @Put(ApiEnum.UPDATE_PROFILE)
  @ApiOperationPut({
    path: ApiEnum.UPDATE_PROFILE,
    description: 'Update user profile',
    summary: 'Update user profile',
    parameters: {
      body: {
        model: 'UpdateUserDto',
      },
    },
    responses: {
      200: {
        description: 'OK',
        model: 'UserInformationDto',
      },
    },
  })
  async updateProfile(
    @CurrentUser({ required: true }) user: AuthUserDto,
    @Body() body: UpdateUserDto,
  ) {
    return await this.userService.updateProfile(user, body);
  }
}
