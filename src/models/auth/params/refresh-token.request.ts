import { IsNotEmpty } from 'class-validator';
import { ApiModel, ApiModelProperty } from 'swagger-express-ts';

@ApiModel({
  description: 'Refresh token request',
  name: 'RefreshTokenRequest',
})
export class RefreshTokenRequest {
  @IsNotEmpty()
  @ApiModelProperty({
    description: 'Refresh token',
    required: true,
  })
  refreshToken: string;
}
