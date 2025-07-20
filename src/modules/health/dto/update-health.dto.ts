import {
  IsEmail,
  IsNotEmpty,
  IsPhoneNumber,
  IsEnum,
  IsOptional,
  IsString,
  IsDate,
  IsDateString,
} from 'class-validator';
import { Gender } from 'src/modules/health/enums/gender.enum';

export class UpdateHealthDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsPhoneNumber('NG')
  phone?: string;

  @IsNotEmpty()
  @IsDateString()
  dob?: string;

  @IsOptional()
  @IsEnum(Gender, { message: 'Gender must be Male, Female, or Not Specified' })
  gender?: Gender;
}
