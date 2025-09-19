import { IsBoolean, IsNumber, IsOptional } from "class-validator";

export class UpdateAppointmentDto {
  @IsNumber()
  id: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  config?: unknown;
}
