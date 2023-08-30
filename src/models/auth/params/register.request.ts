import { IsEmail, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiModel, ApiModelProperty } from 'swagger-express-ts';

@ApiModel({
  description: 'Register request',
  name: 'RegisterRequest',
})
export class RegisterRequest {
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

  @ApiModelProperty({
    description: 'Username',
    required: true,
  })
  @IsEmail()
  email: string;

  @ApiModelProperty()
  @IsOptional()
  name?: string;

  @ApiModelProperty()
  @IsOptional()
  location?: string;

  @ApiModelProperty()
  @IsOptional()
  avatarUrl?: string;
}
