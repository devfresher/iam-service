import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  emailOrUsername!: string;

  @IsNotEmpty()
  @IsString()
  password!: string;
}
