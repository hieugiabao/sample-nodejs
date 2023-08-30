import { Expose } from 'class-transformer';
import { ApiModel, ApiModelProperty } from 'swagger-express-ts';

@ApiModel({
  description: 'User information',
  name: 'UserInformationDto',
})
export class UserInformationDto {
  @ApiModelProperty({
    description: 'User id',
    required: true,
  })
  @Expose()
  id: number;

  @ApiModelProperty({
    description: 'Username',
    required: true,
  })
  @Expose()
  username: string;

  @ApiModelProperty({
    description: 'Email',
    required: true,
  })
  @Expose()
  email: string;

  @ApiModelProperty({
    description: 'Display name',
  })
  @Expose()
  name?: string;

  @ApiModelProperty()
  @Expose()
  avatarUrl?: string;

  @ApiModelProperty()
  @Expose()
  bio?: string;

  @ApiModelProperty()
  @Expose()
  location?: string;
}
