import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateAppointmentDto {
  @IsBoolean()
  isActive: boolean;

  @IsOptional()
  config?: Record<string, unknown> | null;
}
