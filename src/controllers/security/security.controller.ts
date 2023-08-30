import { ResponseBuilder } from '@common/utils/response-builder';
import { AuthUserDto } from '@models/auth/auth-user.dto';
import { LoginRequest } from '@models/auth/params/login.request';
import { LogoutRequest } from '@models/auth/params/logout.request';
import { RefreshTokenRequest } from '@models/auth/params/refresh-token.request';
import { RegisterRequest } from '@models/auth/params/register.request';
import { TokenResultDto } from '@models/auth/token-result.response';
import { BaseResponse } from '@models/base.response';
import { SecurityService } from '@services/auth/security.service';
import {
  Authorized,
  Body,
  CurrentUser,
  JsonController,
  Post,
} from 'routing-controllers';
import {
  ApiOperationPost,
  ApiPath,
  SwaggerDefinitionConstant,
} from 'swagger-express-ts';
import { Service } from 'typedi';

@JsonController('/security')
@ApiPath({
  name: 'Security',
  path: '/security',
})
@Service()
export class SecurityController {
  constructor(private securityService: SecurityService) {}

  @Post('/login')
  @ApiOperationPost({
    path: '/login',
    description: 'Login with username and password',
    parameters: {
      body: {
        model: 'LoginRequest',
      },
    },
    responses: {
      200: {
        description: 'Success',
        type: SwaggerDefinitionConstant.Response.Type.OBJECT,
        model: 'TokenResultDto',
      },
      401: {
        description: 'Unauthorized',
        type: SwaggerDefinitionConstant.Response.Type.OBJECT,
        model: 'BaseResponse',
      },
      500: {
        description: 'Internal server error',
        type: SwaggerDefinitionConstant.Response.Type.OBJECT,
        model: 'BaseResponse',
      },
    },
  })
  async login(@Body() dto: LoginRequest): Promise<TokenResultDto> {
    return await this.securityService.login(dto);
  }

  @Post('/register')
  @ApiOperationPost({
    path: '/register',
    description: 'Register new user',
    parameters: {
      body: {
        model: 'RegisterRequest',
      },
    },
    responses: {
      200: {
        description: 'Success',
        type: SwaggerDefinitionConstant.Response.Type.OBJECT,
        model: 'BaseResponse',
      },
      400: {
        description: 'Bad request',
        type: SwaggerDefinitionConstant.Response.Type.OBJECT,
        model: 'BaseResponse',
      },
      500: {
        description: 'Internal server error',
        type: SwaggerDefinitionConstant.Response.Type.OBJECT,
        model: 'BaseResponse',
      },
    },
  })
  async register(@Body() dto: RegisterRequest): Promise<BaseResponse<string>> {
    await this.securityService.register(dto);
    return new ResponseBuilder('Register success').build();
  }

  @Authorized()
  @Post('/refresh-token')
  @ApiOperationPost({
    path: '/refresh-token',
    description: 'Refresh token',
    parameters: {
      body: {
        model: 'RefreshTokenRequest',
      },
    },
    security: {
      BearerAuth: [],
    },
    responses: {
      200: {
        description: 'Success',
        type: SwaggerDefinitionConstant.Response.Type.OBJECT,
        model: 'TokenResultDto',
      },
      400: {
        description: 'Bad request',
        type: SwaggerDefinitionConstant.Response.Type.OBJECT,
        model: 'BaseResponse',
      },
      401: {
        description: 'Unauthorized',
        type: SwaggerDefinitionConstant.Response.Type.OBJECT,
        model: 'BaseResponse',
      },
      500: {
        description: 'Internal server error',
        type: SwaggerDefinitionConstant.Response.Type.OBJECT,
        model: 'BaseResponse',
      },
    },
  })
  async refreshToken(
    @Body() dto: RefreshTokenRequest,
    @CurrentUser({ required: true }) user: AuthUserDto,
  ): Promise<TokenResultDto> {
    return await this.securityService.refresh(dto, user);
  }

  @Authorized()
  @Post('/logout')
  @ApiOperationPost({
    path: '/logout',
    description: 'Logout',
    security: {
      BearerAuth: [],
    },
    parameters: {
      body: {
        model: 'LogoutRequest',
      },
    },
    responses: {
      200: {
        description: 'Success',
        type: SwaggerDefinitionConstant.Response.Type.OBJECT,
        model: 'BaseResponse',
      },
      401: {
        description: 'Unauthorized',
        type: SwaggerDefinitionConstant.Response.Type.OBJECT,
        model: 'BaseResponse',
      },
      500: {
        description: 'Internal server error',
        type: SwaggerDefinitionConstant.Response.Type.OBJECT,
        model: 'BaseResponse',
      },
    },
  })
  async logout(@Body() dto: LogoutRequest): Promise<BaseResponse<string>> {
    await this.securityService.logout(dto);
    return new ResponseBuilder('Logout success').build();
  }
}
