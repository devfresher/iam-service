import { IsStrongPassword } from 'class-validator';

export function IsCustomStrongPassword(validationOptions?: Parameters<typeof IsStrongPassword>[1]) {
  return IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    },
    {
      message:
        'Password must be at least 8 characters long and contain at least one lowercase letter, one uppercase letter, one number, and one special character.',
      ...validationOptions,
    },
  );
}
