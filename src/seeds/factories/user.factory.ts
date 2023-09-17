import { UserEntity, UserRole } from '@entities/postgres-entities/user.entity';
import { define } from '@seeds/core';
import * as Faker from 'faker';

define(UserEntity, (faker: typeof Faker, context: any) => {
  const user = new UserEntity();
  user.email = faker.internet.email();
  user.password = faker.internet.password();
  user.username = faker.internet.userName();
  user.name = `${faker.name.firstName()} ${faker.name.lastName()}`;
  user.avatarUrl = faker.image.avatar();
  user.bio = faker.lorem.sentence();
  user.location = faker.address.city();
  user.role = UserRole.User;

  Object.assign(user, context);

  return user;
});
