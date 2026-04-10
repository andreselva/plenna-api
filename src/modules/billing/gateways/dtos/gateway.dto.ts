import { IsBoolean, IsNotEmpty, IsString } from "class-validator";
import { GatewayEnum } from "src/enum/gateway.enum";

export class GatewayConfigDTO {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    gateway: GatewayEnum;

    @IsNotEmpty()
    config: any;
    
    @IsBoolean()
    @IsNotEmpty()
    isActive: boolean;
}