import { ApiModel, ApiModelProperty } from 'swagger-express-ts';

@ApiModel({
  description: 'Update user',
  name: 'UpdateUserDto',
})
export class UpdateUserDto {
  @ApiModelProperty({
    description: 'Display name',
  })
  name?: string;

  @ApiModelProperty()
  avatarUrl?: string;

  @ApiModelProperty()
  bio?: string;

  @ApiModelProperty()
  location?: string;
}
