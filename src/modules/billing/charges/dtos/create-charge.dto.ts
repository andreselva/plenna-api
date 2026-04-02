import { IsEnum, IsNotEmpty, IsNumber } from "class-validator";
import { ChargeEntityType } from "src/enum/charge-entity-type.enum";

export class CreateChargeDto {
    @IsNotEmpty({ message: 'entityId cannot be empty' })
    @IsNumber({}, { message: 'entityId must be a number' })
    entityId: number;

    @IsNotEmpty({ message: 'type cannot be empty' })
    @IsEnum(ChargeEntityType, { message: 'type must be a valid charge entity type' })
    type: ChargeEntityType;
}