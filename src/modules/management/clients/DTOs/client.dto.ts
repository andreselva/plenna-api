import { 
  IsString, 
  IsNotEmpty, 
  IsEmail, 
  IsOptional, 
  IsEnum, 
  IsInt
} from "class-validator";
import { ClientStatus } from "src/enum/client-status.enum";

export default class ClientDTO {
  @IsString()
  @IsNotEmpty({ message: 'O nome do cliente é obrigatório' })
  clientName: string;

  @IsEmail({}, { message: 'Forneça um e-mail válido' })
  @IsNotEmpty()
  clientEmail: string;

  @IsString()
  @IsNotEmpty()
  document: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  number: string;

  @IsString()
  @IsOptional()
  complement: string;

  @IsString()
  @IsNotEmpty()
  neighborhood: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  state: string;

  @IsString()
  @IsNotEmpty()
  zipCode: string;

  @IsEnum(ClientStatus, { message: 'Status fornecido é inválido' })
  @IsNotEmpty()
  status: ClientStatus;

  @IsString({ message: 'A data deve ser válida (padrão ISO8601)' })
  @IsOptional()
  trialEndsAt: string;

  @IsOptional()
  @IsInt({message: 'Invalid ID!'})
  id: number;
}