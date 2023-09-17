import { DataSource, ObjectType } from 'typeorm';
import { EntityFactory } from './entity-factory';
import { getNameOfEntity } from '../utils/factory.util';
import * as Faker from 'faker';

export type Factory = <Entity, Context>(
  entity: ObjectType<Entity>,
) => (context?: Context) => EntityFactory<Entity, Context>;

/**
 * FactoryFunction is the function, which generate a new filled entity
 */
export type FactoryFunction<Entity, Context> = (
  faker: typeof Faker,
  context?: Context,
) => Entity;

/**
 * EntityProperty defines an object whose keys and values must be properties of the given Entity.
 */
export type EntityProperty<Entity> = {
  [Property in keyof Entity]?: Entity[Property];
};

export type SeederConstructor = new () => Seeder;

export interface Seeder {
  run(factory: Factory, dataSource: DataSource): Promise<void>;
}

const entityFactories: Map<string, any> = new Map();

export const define = <Entity, Context>(
  entity: ObjectType<Entity>,
  factoryFn: FactoryFunction<Entity, Context>,
) => {
  entityFactories.set(getNameOfEntity(entity), {
    entity,
    factory: factoryFn,
  });
};

export const factory: Factory =
  <Entity, Context>(entity: ObjectType<Entity>) =>
  (context?: Context) => {
    const name = getNameOfEntity(entity);
    const entityFactory = entityFactories.get(name);
    return new EntityFactory(name, entity, entityFactory.factory, context);
  };

export const runSeeder = async (
  clazz: SeederConstructor,
  dataSource: DataSource,
) => {
  const seeder: Seeder = new clazz();

  await seeder.run(factory, dataSource);
};
