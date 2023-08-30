import { UserInformationDto } from '@models/user/user-information.dto';
import { ApiModel, ApiModelProperty } from 'swagger-express-ts';

@ApiModel({
  description: 'Token result',
  name: 'TokenResultDto',
})
export class TokenResultDto {
  @ApiModelProperty({
    description: 'Token',
    required: true,
  })
  token: string;

  @ApiModelProperty({
    description: 'Refresh token',
    required: true,
  })
  refreshToken: string;

  @ApiModelProperty({
    description: 'Expires in',
    required: true,
  })
  expiresIn: number;

  @ApiModelProperty({
    description: 'Token type',
    required: true,
  })
  tokenType: string;

  @ApiModelProperty({
    description: 'User',
    required: true,
    model: 'UserInformationDto',
  })
  user: UserInformationDto;
}
