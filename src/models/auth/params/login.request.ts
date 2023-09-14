import { IsNotEmpty } from 'class-validator';
import { ApiModel, ApiModelProperty } from 'swagger-express-ts';

@ApiModel({
  description: 'Login request',
  name: 'LoginRequest',
})
export class LoginRequest {
  @ApiModelProperty({
    description: 'Username',
    required: true,
  })
  @IsNotEmpty()
  username: string;

  @ApiModelProperty({
    description: 'Password',
    required: true,
  })
  @IsNotEmpty()
  password: string;
}
