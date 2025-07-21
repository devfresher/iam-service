// is-time-string.decorator.ts
import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

type TimeFormat = '12' | '24' | 'any';

interface IsTimeStringOptions {
  format?: TimeFormat;
}

export function IsTimeString(
  options: IsTimeStringOptions = {},
  validationOptions?: ValidationOptions,
) {
  const format: TimeFormat = options.format || 'any';

  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isTimeString',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (typeof value !== 'string') return false;

          const time24HrRegex = /^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/;
          const time12HrRegex =
            /^(0?[1-9]|1[0-2]):([0-5]\d)(:[0-5]\d)?\s?(AM|PM)$/i;

          if (format === '24') return time24HrRegex.test(value);
          if (format === '12') return time12HrRegex.test(value);

          return time24HrRegex.test(value) || time12HrRegex.test(value);
        },
        defaultMessage(_args: ValidationArguments) {
          if (format === '24')
            return '$property must be a valid 24-hour time (HH:mm[:ss])';
          if (format === '12')
            return '$property must be a valid 12-hour time (hh:mm[:ss] AM/PM)';
          return '$property must be a valid 12-hour or 24-hour time string';
        },
      },
    });
  };
}
