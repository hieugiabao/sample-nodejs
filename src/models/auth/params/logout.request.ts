import { IsNotEmpty } from 'class-validator';
import { ApiModel, ApiModelProperty } from 'swagger-express-ts';

@ApiModel({
  description: 'Logout request',
  name: 'LogoutRequest',
})
export class LogoutRequest {
  @IsNotEmpty()
  @ApiModelProperty({
    description: 'Refresh token',
    required: true,
  })
  refreshToken: string;
}
