import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsDateString,
  Min,
} from 'class-validator';
import { ExpenseStatus } from '../Types/expense.status.type';

export class ExpenseDTO {
  @IsString({ message: 'O nome da despesa deve ser uma string.' })
  @IsNotEmpty({ message: 'O nome da despesa não pode estar vazio.' })
  name: string;

  @IsOptional()
  @IsString({ message: 'A descrição deve ser uma string.' })
  description: string;

  @IsNumber({}, { message: 'O valor da despesa deve ser um número válido.' })
  @IsNotEmpty({ message: 'O valor da despesa não pode estar vazio.' })
  @Min(0, { message: 'O valor da despesa deve ser um número positivo.' })
  value: number;

  @IsDateString({}, { message: 'A data de vencimento deve ser uma string de data válida (ex: "YYYY-MM-DD").' })
  @IsNotEmpty({ message: 'A data de vencimento não pode estar vazia.' })
  invoiceDueDate: string;

  @IsInt({ message: 'O ID da categoria deve ser um número inteiro.' })
  @IsNotEmpty({ message: 'O ID da categoria não pode estar vazio.' })
  idCategory: number;

  @IsOptional()
  @IsInt({ message: 'O ID do cartão de crédito deve ser um número inteiro.' })
  idCreditCard: number;

  @IsOptional()
  @IsInt({ message: 'O número de parcelas deve ser um inteiro.' })
  installments: number;

  @IsString({ message: 'O tipo de parcelamento deve ser uma string.' })
  @IsNotEmpty({ message: 'Invalid argumento type of installment.' })
  typeOfInstallment: string;

  @IsOptional()
  @IsInt({ message: 'O ID da conta de origem deve ser um número inteiro.' })
  sourceAccountId: number;

  @IsBoolean({ message: 'O valor de "hasInstallments" deve ser um booleano.' })
  @IsNotEmpty({ message: 'Invalid argumento has installments.' })
  hasInstallments: boolean;

  @IsOptional()
  @IsBoolean({ message: 'O valor de "updateInstallments" deve ser um booleano.' })
  updateInstallments: boolean;

  @IsOptional()
  @IsBoolean({ message: 'O valor de "linkToInvoice" deve ser um booleano.' })
  linkToInvoice: boolean;

  @IsOptional()
  @IsInt({ message: 'O ID da fatura deve ser um número inteiro.' })
  idInvoice: number;

  @IsEnum(ExpenseStatus, { message: 'O status da despesa é inválido.' })
  @IsNotEmpty({ message: 'Invalid argument status.' })
  status: ExpenseStatus;

  @IsOptional()
  @IsInt({ message: 'O ID da despesa deve ser um número inteiro.' })
  id: number;

  @IsOptional()
  @IsNumber({}, { message: 'O valor total pago é inválido.' })
  @Min(0, { message: 'O valor total pago deve ser um número positivo.' })
  totalPaid: number;

  @IsOptional()
  @IsDateString({}, { message: 'Data de pagamento inválida.' })
  paymentDate: string;
}