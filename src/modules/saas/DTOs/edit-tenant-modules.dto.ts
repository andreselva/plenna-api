import { IsArray, ValidateNested, IsNumber, IsOptional, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class EditModuleDTO {
  @IsNumber()
  moduleId: number;

  @IsOptional()
  @IsBoolean()
  hasSubmodules?: boolean;
}

export class EditTenantModulesDTO {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EditModuleDTO)
  enabled: EditModuleDTO[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EditModuleDTO)
  disabled: EditModuleDTO[];
}