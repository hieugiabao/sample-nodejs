import {
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
} from 'class-validator';
import Container from 'typedi';
import { DataSource, EntityTarget, FindOptionsWhere } from 'typeorm';

type ObjectLiteral = { [key: string]: any };

@ValidatorConstraint({ async: true })
export class IsNotExistConstraint<Entity extends ObjectLiteral>
  implements ValidatorConstraintInterface
{
  constructor(private readonly entity: EntityTarget<Entity>) {}

  async validate(
    value: any,
    validationArguments?: ValidationArguments,
  ): Promise<boolean> {
    const dataSource = Container.get(DataSource);
    if (!dataSource.isInitialized) {
      throw new Error(`Connection should be initialized!`);
    }

    const repository = dataSource.getRepository(this.entity);
    const where = {
      [validationArguments.property]: value,
    } as FindOptionsWhere<Entity>;
    return !(await repository.exist({
      where,
    }));
  }

  defaultMessage(validationArguments?: ValidationArguments): string {
    return `Field ${validationArguments.property} with value $value already exist`;
  }
}

export function IsNotExist(
  entity: Function,
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: new IsNotExistConstraint(entity),
      async: true,
      name: 'isNotExist',
    });
  };
}
