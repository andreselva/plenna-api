import { IsInt, IsNotEmpty, IsString } from "class-validator"

export default class InvoiceSettingsDTO {
    @IsString({ message: 'Invalid closing date!'})
    @IsNotEmpty({ message: 'Invalid closing date.' })
    closingDate: string

    @IsString({ message: 'Invalid due date!' })
    @IsNotEmpty({ message: 'Invalid due date.' })
    dueDate: string

    @IsInt({ message: 'Invalid account ID!' })
    @IsNotEmpty({ message: 'Invalid account ID.' })
    idAccount: number

    @IsString({ message: 'Invalid name account!' })
    @IsNotEmpty({ message: 'Invalid name account.' })
    nameAccount: string
}