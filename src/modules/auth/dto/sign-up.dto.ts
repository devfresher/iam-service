import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Match } from 'src/common/decorators/match.decorator';
import { IsCustomStrongPassword } from 'src/common/decorators/strong-password.decorator';

export class SignupDto {  
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  username?: string;

  @IsNotEmpty()
  @IsCustomStrongPassword()
  password!: string;

  @IsNotEmpty()
  @Match('password', { message: 'Passwords do not match' })
  confirmPassword!: string;
}
