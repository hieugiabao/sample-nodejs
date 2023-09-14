import { IsMatchWith } from '@common/decorators/validators/is-match-with.decorator';
import { IsNotExist } from '@common/decorators/validators/is-not-exist.decorator';
import { UserEntity } from '@entities/postgres-entities/user.entity';
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
  @IsNotExist(UserEntity)
  username: string;

  @ApiModelProperty({
    description: 'Password',
    required: true,
  })
  @IsNotEmpty()
  password: string;

  @ApiModelProperty({
    description: 'Confirm password',
    required: true,
  })
  @IsNotEmpty()
  @IsMatchWith('password')
  confirmPassword: string;

  @ApiModelProperty({
    description: 'Username',
    required: true,
  })
  @IsEmail()
  @IsNotExist(UserEntity)
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
