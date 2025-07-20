import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUUID,
} from 'class-validator';
import { Gender } from '../../../common/enums/gender.enum';

export class CreateHealthDto {
  @IsNotEmpty()
  @IsUUID()
  authId!: string;

  @IsNotEmpty()
  @IsString()
  fullName!: string;

  @IsOptional()
  @IsPhoneNumber('NG')
  phone?: string;

  @IsNotEmpty()
  @IsDateString()
  dob!: string;

  @IsNotEmpty()
  @IsEnum(Gender, { message: 'Gender must be Male, Female, or Not Specified' })
  gender!: Gender;
}
