import {
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
} from 'class-validator';

@ValidatorConstraint({ async: false })
export class IsMatchWithConstraint implements ValidatorConstraintInterface {
  constructor(private readonly field: string) {}

  validate(value: any, validationArguments?: ValidationArguments): boolean {
    return value === validationArguments.object[this.field];
  }

  defaultMessage(_validationArguments?: ValidationArguments): string {
    return `$property must match with ${this.field}`;
  }
}

export function IsMatchWith(
  field: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: new IsMatchWithConstraint(field),
      async: true,
      name: 'isMatchWith',
    });
  };
}
