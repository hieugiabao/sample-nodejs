import { DataSource, ObjectType, SaveOptions } from 'typeorm';
import * as Faker from 'faker';
import { logger } from '@common/logger';
import { isPromiseLike } from '../utils/factory.util';
import Container from 'typedi';
import { EntityProperty, FactoryFunction } from '.';

export class EntityFactory<Entity, Context> {
  private mapFunction: (entity: Entity) => Promise<Entity>;

  constructor(
    public name: string,
    public entity: ObjectType<Entity>,
    private factory: FactoryFunction<Entity, Context>,
    private context?: Context,
  ) {}

  /**
   * This function is used to alter the generated values of entity, before it
   * is persist into the database
   */
  public map(
    mapFunction: (entity: Entity) => Promise<Entity>,
  ): EntityFactory<Entity, Context> {
    this.mapFunction = mapFunction;
    return this;
  }

  /**
   * Make a new entity, but does not persist it
   */
  public async make(
    overrideParams: EntityProperty<Entity> = {},
  ): Promise<Entity> {
    return this.makeEntity(overrideParams, false);
  }

  /**
   * Create makes a new entity and does persist it
   */
  public async create(
    overrideParams: EntityProperty<Entity> = {},
    saveOptions?: SaveOptions,
  ): Promise<Entity> {
    const dataSource = Container.get(DataSource);
    if (dataSource && dataSource.isInitialized) {
      const em = dataSource.createEntityManager();
      try {
        let entity = await this.makeEntity(overrideParams, true);
        return await em.save<Entity>(entity as Entity, saveOptions);
      } catch (error) {
        const message = 'Could not save entity';
        logger.error(message, error);
        throw new Error(message);
      }
    } else {
      const message = 'No db connection is given';
      logger.error(message);
      throw new Error(message);
    }
  }

  public async makeMany(
    amount: number,
    overrideParams: EntityProperty<Entity> = {},
  ): Promise<Entity[]> {
    const list = [];
    for (let index = 0; index < amount; index++) {
      list[index] = await this.make(overrideParams);
    }
    return list;
  }

  public async createMany(
    amount: number,
    overrideParams: EntityProperty<Entity> = {},
    saveOptions?: SaveOptions,
  ): Promise<Entity[]> {
    const list = [];
    for (let index = 0; index < amount; index++) {
      list[index] = await this.create(overrideParams, saveOptions);
    }
    return list;
  }

  private async makeEntity(
    overrideParams: EntityProperty<Entity> = {},
    isSeeding = false,
  ): Promise<Entity> {
    if (!this.factory) {
      throw new Error('Could not found entity');
    }

    let entity: Entity = await this.resolveEntity(
      this.factory(Faker, this.context),
      isSeeding,
    );
    if (this.mapFunction) {
      entity = await this.mapFunction(entity);
    }

    for (const key in overrideParams) {
      if (overrideParams.hasOwnProperty(key)) {
        entity[key] = overrideParams[key];
      }
    }

    return entity;
  }

  private async resolveEntity(
    entity: Entity,
    isSeeding = false,
  ): Promise<Entity> {
    for (const attribute in entity) {
      if (!entity.hasOwnProperty(attribute)) {
        continue;
      }
      if (isPromiseLike(entity[attribute])) {
        entity[attribute] = await entity[attribute];
      }
      if (
        entity[attribute] &&
        typeof entity[attribute] === 'object' &&
        entity[attribute].constructor.name === EntityFactory.name
      ) {
        const subEntityFactory = entity[attribute];
        try {
          if (isSeeding) {
            entity[attribute] = await (subEntityFactory as any).create();
          } else {
            entity[attribute] = await (subEntityFactory as any).make();
          }
        } catch (error) {
          const message = `Could not make ${(subEntityFactory as any).name}`;
          logger.error(message, error);
          throw new Error(message);
        }
      }
    }
    return entity;
  }
}
