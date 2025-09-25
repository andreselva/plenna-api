import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { Recurrence } from 'src/enum/recurrence.enum';

export class UpdateAppointmentDto {
  @IsBoolean()
  isActive: boolean;

  @IsOptional()
  config?: Record<string, unknown> | null;

  @IsOptional()
  @IsEnum(Recurrence)
  recurrence?: Recurrence;

  @IsOptional()
  @IsString()
  timezone?: string | null;
}
