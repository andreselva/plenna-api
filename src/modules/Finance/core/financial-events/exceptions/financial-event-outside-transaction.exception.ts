import { InternalServerErrorException } from '@nestjs/common';

export class FinancialEventOutsideTransactionException extends InternalServerErrorException {
    constructor(msg: string) {
        super(msg);
    }
}
