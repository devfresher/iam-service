import { IsDateString, IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { IsTimeString } from 'src/common/decorators/is-time-string.decorator';

export class CreateAppointmentDto {
  @IsNotEmpty()
  @IsString()
  title!: string;

  @IsNotEmpty()
  @IsString()
  description!: string;

  @IsNotEmpty()
  @IsDateString()
  date!: string;

  @IsNotEmpty()
  @IsTimeString({ format: '12' })
  time!: string;

  @IsNotEmpty()
  @IsUUID()
  healthId!: string;
}
