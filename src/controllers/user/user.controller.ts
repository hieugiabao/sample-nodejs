import { AuthUserDto } from '@models/auth/auth-user.dto';
import { UpdateUserDto } from '@models/user/update-user.dto';
import { UserService } from '@services/user/user.service';
import {
  Authorized,
  Body,
  CurrentUser,
  Get,
  JsonController,
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

  @Get('/profile')
  @ApiOperationGet({
    path: '/profile',
    description: 'Get user profile',
    summary: 'Get user profile',
    responses: {
      200: {
        description: 'OK',
        model: 'UserInformationDto',
      },
    },
  })
  async getProfile(@CurrentUser({ required: true }) user: AuthUserDto) {
    return await this.userService.getProfile(user);
  }

  @Put('/change-profile')
  @ApiOperationPut({
    path: '/change-profile',
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
