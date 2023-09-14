import Container, { Constructable, ContainerInstance } from 'typedi';
import {
  DataSource,
  MongoRepository,
  Repository,
  TreeRepository,
} from 'typeorm';

export function InjectRepository(entityType: Function): CallableFunction {
  return (
    object: Object,
    propertyName: string | symbol,
    index?: number,
  ): void => {
    let repositoryType: Function;

    if (Reflect?.getOwnMetadata == undefined) {
      throw new Error(
        'Reflect.getOwnMetadata is not defined. Make sure to import the `reflect-metadata` package!',
      );
    }

    if (index !== undefined) {
      /** The decorator has been applied to a constructor parameter. */
      const paramTypes: Function[] | undefined = Reflect.getOwnMetadata(
        'design:paramtypes',
        object,
        propertyName,
      );

      if (!paramTypes?.[index]) {
        throw new Error(
          `Cannot get reflected type for a property "${String(
            propertyName,
          )}" of ${object.constructor.name} class. ` +
            `Make sure you have turned on an "emitDecoratorMetadata": true, option in tsconfig.json ` +
            `and that you have imported "reflect-metadata" on top of the main entry file in your application.` +
            `And make sure that you have annotated the property type correctly with: ` +
            `Repository, MongoRepository, TreeRepository or custom repository class type.`,
        );
      }

      repositoryType = paramTypes[index];
    } else {
      /** The decorator has been applied to a class property. */
      const propertyType: Function | undefined = Reflect.getOwnMetadata(
        'design:type',
        object,
        propertyName,
      );

      if (!propertyType) {
        throw new Error(
          `Cannot get reflected type for a property "${String(
            propertyName,
          )}" of ${object.constructor.name} class. ` +
            `Make sure you have turned on an "emitDecoratorMetadata": true, option in tsconfig.json ` +
            `and that you have imported "reflect-metadata" on top of the main entry file in your application.` +
            `And make sure that you have annotated the property type correctly with: ` +
            `Repository, MongoRepository, TreeRepository or custom repository class type.`,
        );
      }

      repositoryType = propertyType;
    }

    Container.registerHandler({
      object: object as Constructable<unknown>,
      index: index,
      propertyName: propertyName as string,
      value: (containerInstance) =>
        getRepositoryHelper(repositoryType, entityType, containerInstance),
    });
  };
}

function getRepositoryHelper(
  repositoryType: Function,
  entityType: Function,
  containerInstance: ContainerInstance,
): any {
  const dataSource = containerInstance.get(DataSource);
  if (!dataSource.isInitialized) {
    throw new Error();
  }

  switch (repositoryType) {
    case Repository:
      return dataSource.getRepository(entityType);
    case MongoRepository:
      return dataSource.getMongoRepository(entityType);
    case TreeRepository:
      return dataSource.getTreeRepository(entityType);
    default:
      /** If the requested type is not well-known, then it must be a custom repository. */
      return undefined;
  }
}
