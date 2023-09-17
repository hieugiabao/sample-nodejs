import { UserEntity } from '@entities/postgres-entities/user.entity';
import { Factory, Seeder } from './core';

export default class CreateUsersSeed implements Seeder {
  public async run(factory: Factory) {
    // common user
    await factory(UserEntity)({
      role: 'admin',
    }).create();
  }
}
